// ===========================================================================
// Amplify Hub · Notification dispatcher
// ===========================================================================
// Lê notification_jobs pendentes (run_at <= now AND sent_at IS NULL),
// resolve destinatários via public.get_recipients_for_track(track), monta o
// template do `kind` correspondente e envia via Resend.batch.send().
//
// Concurrency: o Vercel Cron é singleton por job na nossa configuração
// (schedule "*/15 * * * *" = um único cron rodando), então omitimos
// SELECT FOR UPDATE / SKIP LOCKED por simplicidade. O custo de eventual
// duplicação se mudássemos a config é "1 email enviado 2x" — aceitável
// como pior caso, e endereçável depois com claimed_at se virar problema.
//
// Falha não-fatal: se um job individual falhar (track inexistente, Resend
// erro 4xx, etc.) registramos `error` no job e seguimos. Apenas erros
// catastróficos (ex: SUPABASE_SERVICE_ROLE_KEY ausente) jogam a exceção
// para o handler.
// ===========================================================================

import { createAdminClient } from '@/lib/supabase/admin'
import { TRACKS, type Track } from '@/lib/tracks'
import {
  getFromAddress,
  getPublicBaseUrl,
  getResend,
} from './resend'
import {
  liveReminder1hTemplate,
  liveReminder24hTemplate,
  liveScheduledTemplate,
  trackLabelFor,
  type LiveContext,
} from './templates'

const MAX_JOBS_PER_RUN = 50

type JobKind =
  | 'live_scheduled'
  | 'live_reminder_24h'
  | 'live_reminder_1h'
  | 'lesson_published'

type FlatJob = {
  id: string
  kind: JobKind
  liveSessionId: string | null
  lessonId: string | null
  liveTitle: string | null
  scheduledForIso: string | null
  durationMinutes: number | null
  lessonTitle: string | null
  moduleTitle: string | null
  trackSlug: Track | null
}

type Recipient = {
  user_id: string
  email: string
  full_name: string
}

export type DispatchSummary = {
  examined: number
  sent: number
  failed: number
  details: Array<{
    jobId: string
    kind: JobKind
    recipientCount: number
    status: 'sent' | 'skipped' | 'failed'
    error?: string
  }>
}

function isTrack(value: unknown): value is Track {
  return typeof value === 'string' && (TRACKS as readonly string[]).includes(value)
}

function flatten<T>(raw: T | T[] | null | undefined): T | null {
  if (!raw) return null
  return Array.isArray(raw) ? (raw[0] ?? null) : raw
}

function buildContext(
  job: FlatJob,
  recipient: Recipient,
  baseUrl: string,
): LiveContext {
  const trackLabel = job.trackSlug ? trackLabelFor(job.trackSlug) : 'Amplify'
  return {
    recipientFullName: recipient.full_name,
    trackLabel,
    moduleTitle: job.moduleTitle,
    lessonTitle: job.lessonTitle,
    liveTitle: job.liveTitle ?? 'Mentoria ao vivo',
    scheduledForIso: job.scheduledForIso ?? new Date().toISOString(),
    durationMinutes: job.durationMinutes ?? 90,
    liveUrl: job.liveSessionId
      ? `${baseUrl}/aulas/${job.liveSessionId}`
      : `${baseUrl}/dashboard`,
    agendaUrl: job.trackSlug
      ? `${baseUrl}/trilhas/${job.trackSlug.replace(/_/g, '-')}/agenda`
      : `${baseUrl}/dashboard`,
  }
}

function renderTemplate(
  kind: JobKind,
  ctx: LiveContext,
): { subject: string; html: string } | null {
  switch (kind) {
    case 'live_scheduled':
      return liveScheduledTemplate(ctx)
    case 'live_reminder_24h':
      return liveReminder24hTemplate(ctx)
    case 'live_reminder_1h':
      return liveReminder1hTemplate(ctx)
    case 'lesson_published':
      // Reservado para fase 2 do Lote 3. Por ora, ignoramos jobs deste tipo
      // sem error (skipped) para não acumular falhas na fila.
      return null
  }
}

export async function dispatchPendingNotifications(): Promise<DispatchSummary> {
  const admin = createAdminClient()
  const baseUrl = getPublicBaseUrl()
  const fromAddress = getFromAddress()
  const summary: DispatchSummary = {
    examined: 0,
    sent: 0,
    failed: 0,
    details: [],
  }

  const nowIso = new Date().toISOString()

  // Trazemos o contexto da live + lesson + módulo num único select aninhado.
  // RLS é bypassada pelo service_role; o JOIN aqui é só para reduzir round-trips.
  const { data: rawJobs, error: jobsError } = await admin
    .from('notification_jobs')
    .select(
      `id, kind, live_session_id, lesson_id,
       live_sessions(id, title, scheduled_for, duration_minutes,
         lessons(title, modules(title, track))
       )`,
    )
    .lte('run_at', nowIso)
    .is('sent_at', null)
    .order('run_at', { ascending: true })
    .limit(MAX_JOBS_PER_RUN)

  if (jobsError) {
    throw new Error(`dispatch: erro ao ler notification_jobs — ${jobsError.message}`)
  }

  const jobs: FlatJob[] = (rawJobs ?? []).map((row: Record<string, unknown>) => {
    const live = flatten(row.live_sessions as unknown) as
      | {
          id: string
          title: string
          scheduled_for: string
          duration_minutes: number
          lessons: unknown
        }
      | null
    const lesson = live
      ? (flatten(live.lessons as unknown) as
          | { title: string; modules: unknown }
          | null)
      : null
    const moduleEntity = lesson
      ? (flatten(lesson.modules as unknown) as
          | { title: string; track: string }
          | null)
      : null
    const trackSlug = moduleEntity && isTrack(moduleEntity.track)
      ? moduleEntity.track
      : null

    return {
      id: row.id as string,
      kind: row.kind as JobKind,
      liveSessionId: (row.live_session_id as string | null) ?? null,
      lessonId: (row.lesson_id as string | null) ?? null,
      liveTitle: live?.title ?? null,
      scheduledForIso: live?.scheduled_for ?? null,
      durationMinutes: live?.duration_minutes ?? null,
      lessonTitle: lesson?.title ?? null,
      moduleTitle: moduleEntity?.title ?? null,
      trackSlug,
    }
  })

  summary.examined = jobs.length
  if (jobs.length === 0) return summary

  const resend = getResend()

  for (const job of jobs) {
    if (!job.trackSlug) {
      // Job órfão (live deletada antes do run_at). Marca como sent para sair
      // da fila com error explicativo.
      await admin
        .from('notification_jobs')
        .update({
          sent_at: new Date().toISOString(),
          recipient_count: 0,
          error: 'sem track resolvível (live deletada?)',
        })
        .eq('id', job.id)
      summary.failed += 1
      summary.details.push({
        jobId: job.id,
        kind: job.kind,
        recipientCount: 0,
        status: 'failed',
        error: 'no_track',
      })
      continue
    }

    const { data: recipients, error: rcptError } = await admin.rpc(
      'get_recipients_for_track',
      { p_track: job.trackSlug },
    )

    if (rcptError) {
      await admin
        .from('notification_jobs')
        .update({
          sent_at: new Date().toISOString(),
          error: `recipients_rpc: ${rcptError.message}`,
        })
        .eq('id', job.id)
      summary.failed += 1
      summary.details.push({
        jobId: job.id,
        kind: job.kind,
        recipientCount: 0,
        status: 'failed',
        error: rcptError.message,
      })
      continue
    }

    const recipientList = (recipients ?? []) as Recipient[]
    if (recipientList.length === 0) {
      await admin
        .from('notification_jobs')
        .update({
          sent_at: new Date().toISOString(),
          recipient_count: 0,
        })
        .eq('id', job.id)
      summary.details.push({
        jobId: job.id,
        kind: job.kind,
        recipientCount: 0,
        status: 'skipped',
      })
      continue
    }

    const batch = recipientList.flatMap((rcpt) => {
      const ctx = buildContext(job, rcpt, baseUrl)
      const tpl = renderTemplate(job.kind, ctx)
      if (!tpl) return []
      return [
        {
          from: fromAddress,
          to: [rcpt.email],
          subject: tpl.subject,
          html: tpl.html,
        },
      ]
    })

    if (batch.length === 0) {
      await admin
        .from('notification_jobs')
        .update({
          sent_at: new Date().toISOString(),
          recipient_count: 0,
          error: 'kind sem template (skip)',
        })
        .eq('id', job.id)
      summary.details.push({
        jobId: job.id,
        kind: job.kind,
        recipientCount: 0,
        status: 'skipped',
      })
      continue
    }

    const { error: sendError } = await resend.batch.send(batch)

    if (sendError) {
      await admin
        .from('notification_jobs')
        .update({
          sent_at: new Date().toISOString(),
          recipient_count: 0,
          error: `resend: ${sendError.message ?? 'erro desconhecido'}`,
        })
        .eq('id', job.id)
      summary.failed += 1
      summary.details.push({
        jobId: job.id,
        kind: job.kind,
        recipientCount: 0,
        status: 'failed',
        error: sendError.message ?? 'resend_unknown',
      })
      continue
    }

    await admin
      .from('notification_jobs')
      .update({
        sent_at: new Date().toISOString(),
        recipient_count: batch.length,
      })
      .eq('id', job.id)

    summary.sent += 1
    summary.details.push({
      jobId: job.id,
      kind: job.kind,
      recipientCount: batch.length,
      status: 'sent',
    })
  }

  return summary
}
