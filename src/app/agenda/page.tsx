// ===========================================================================
// Amplify Hub · /agenda — Calendário global (Lote 4)
// ===========================================================================
// Aba de navegação principal do aluno e do professor. Substitui a antiga
// /trilhas/[trackSlug]/agenda — a Agenda agora é unificada: lista TODAS
// as live_sessions visíveis ao usuário em uma única timeline.
//
// Segurança: a query NÃO filtra por track. A RLS de live_sessions
// (0001 §7) já cruza entitlements + módulos publicados, então:
//   · Aluno do Atlas vê apenas Atlas.
//   · Aluno com acesso a Atlas + Amplify vê os dois (mesclados).
//   · Admin (claim app_metadata.admin = true) vê tudo via 0003_admin_rls_bypass.
//
// Identificação visual: cada card recebe um <TrackBadge> indicando a trilha
// de origem, o que importa para usuários que veem mais de uma.
// ===========================================================================

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CalendarDays, ChevronRight, Clock, Film } from 'lucide-react'
import { TrackBadge } from '@/components/dashboard/TrackBadge'
import { TopNav } from '@/components/layout/TopNav'
import { Countdown } from '@/components/live/Countdown'
import { EnterRoomButton } from '@/components/live/EnterRoomButton'
import { Surface } from '@/components/ui/Surface'
import { createClient } from '@/lib/supabase/server'
import { cutoffIsoHoursAgo } from '@/lib/time'
import { TRACKS, type Track } from '@/lib/tracks'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Calendário de mentorias · Amplify Hub',
}

const MONTH_FMT = new Intl.DateTimeFormat('pt-BR', {
  month: 'long',
  year: 'numeric',
  timeZone: 'America/Sao_Paulo',
})

const FULL_FMT = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Sao_Paulo',
})

const DAY_FMT = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'short',
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Sao_Paulo',
})

function formatFull(iso: string) {
  return FULL_FMT.format(new Date(iso)).replace(/,\s*(\d{2}:\d{2})$/, ' · $1')
}

function formatMonthLabel(iso: string) {
  const raw = MONTH_FMT.format(new Date(iso))
  const cap = raw.charAt(0).toUpperCase() + raw.slice(1)
  return cap.replace(' de ', ' · ')
}

function monthKey(iso: string) {
  return new Intl.DateTimeFormat('en-CA', {
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(iso))
}

function isTrack(value: unknown): value is Track {
  return (
    typeof value === 'string' && (TRACKS as readonly string[]).includes(value)
  )
}

type AgendaSession = {
  id: string
  title: string
  scheduled_for: string
  duration_minutes: number
  is_active: boolean
  recording_url: string | null
  lessons:
    | {
        title: string
        modules: { title: string; track: string } | null
      }
    | null
}

function flatten<T>(raw: T | T[] | null): T | null {
  if (!raw) return null
  return Array.isArray(raw) ? (raw[0] ?? null) : raw
}

export default async function AgendaPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const cutoffIso = cutoffIsoHoursAgo(2)

  // Sem filtro de track — RLS de live_sessions já garante o isolamento por
  // entitlement. Trazemos `modules.track` apenas para renderizar o badge.
  const [upcomingRes, pastRes] = await Promise.all([
    supabase
      .from('live_sessions')
      .select(
        'id, title, scheduled_for, duration_minutes, is_active, recording_url, lessons(title, modules(title, track))',
      )
      .gte('scheduled_for', cutoffIso)
      .order('scheduled_for', { ascending: true })
      .limit(100),
    supabase
      .from('live_sessions')
      .select(
        'id, title, scheduled_for, duration_minutes, is_active, recording_url, lessons(title, modules(title, track))',
      )
      .lt('scheduled_for', cutoffIso)
      .order('scheduled_for', { ascending: false })
      .limit(10),
  ])

  const normalize = (rows: AgendaSession[]) =>
    rows.map((row) => {
      const lesson = flatten(row.lessons)
      const moduleEntity = lesson ? flatten(lesson.modules) : null
      return {
        ...row,
        lessons: lesson ? { ...lesson, modules: moduleEntity } : null,
      }
    })

  const upcoming = normalize(
    (upcomingRes.data ?? []) as unknown as AgendaSession[],
  )
  const past = normalize((pastRes.data ?? []) as unknown as AgendaSession[])

  const grouped: Array<{
    key: string
    label: string
    items: typeof upcoming
  }> = []
  for (const session of upcoming) {
    const key = monthKey(session.scheduled_for)
    let bucket = grouped.find((g) => g.key === key)
    if (!bucket) {
      bucket = {
        key,
        label: formatMonthLabel(session.scheduled_for),
        items: [],
      }
      grouped.push(bucket)
    }
    bucket.items.push(session)
  }

  return (
    <div className="min-h-screen">
      <TopNav />

      <main className="mx-auto max-w-4xl px-5 py-10 md:px-8 md:py-14">
        <nav
          aria-label="Trilha de navegação"
          className="mb-8 flex flex-wrap items-center gap-2 font-sans text-xs uppercase tracking-[0.18em] text-(--color-text-muted)"
        >
          <Link
            href="/dashboard"
            className="min-h-11 inline-flex items-center transition-colors duration-(--duration-fast) ease-(--ease-std) hover:text-(--color-text-primary)"
          >
            Lobby
          </Link>
          <ChevronRight className="size-3.5 opacity-60" aria-hidden />
          <span className="text-(--color-text-secondary)">
            Calendário de mentorias
          </span>
        </nav>

        <header className="mb-10 space-y-3">
          <p className="label-section">Agenda</p>
          <h1 className="font-serif text-3xl font-semibold leading-snug tracking-tight md:text-4xl">
            Calendário de mentorias
          </h1>
          <p className="font-sans text-sm text-(--color-text-secondary) md:text-base">
            Todas as lives das suas trilhas em uma única visão. A sala abre 15
            minutos antes do horário.
          </p>
        </header>

        <section aria-labelledby="upcoming-heading" className="mb-12 space-y-6">
          <h2
            id="upcoming-heading"
            className="font-serif text-xl font-semibold tracking-tight"
          >
            Próximas mentorias
          </h2>

          {grouped.length === 0 ? (
            <Surface
              variant="surface"
              className="flex items-center gap-3 p-6 font-sans text-sm text-(--color-text-muted)"
            >
              <CalendarDays className="size-4" strokeWidth={1.5} aria-hidden />
              Nenhuma mentoria agendada no momento.
            </Surface>
          ) : (
            <div className="space-y-10">
              {grouped.map((bucket) => (
                <div key={bucket.key} className="space-y-4">
                  <p className="label-section">{bucket.label}</p>
                  <ol
                    role="list"
                    className="relative space-y-4 border-l border-(--color-border-subtle) pl-6"
                  >
                    {bucket.items.map((session) => {
                      const moduleTitle = session.lessons?.modules?.title
                      const lessonTitle = session.lessons?.title
                      const trackRaw = session.lessons?.modules?.track
                      const track = isTrack(trackRaw) ? trackRaw : null
                      return (
                        <li key={session.id} className="relative">
                          <span
                            aria-hidden
                            className="absolute -left-[26px] top-5 size-2.5 rounded-full bg-(--color-bronze-400) ring-2 ring-(--color-bg-base)"
                          />
                          <Surface variant="card" className="p-5 md:p-6">
                            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
                              <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  {track ? <TrackBadge track={track} /> : null}
                                  {moduleTitle || lessonTitle ? (
                                    <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-(--color-text-muted)">
                                      {[moduleTitle, lessonTitle]
                                        .filter(Boolean)
                                        .join(' · ')}
                                    </p>
                                  ) : null}
                                </div>
                                <h3 className="font-serif text-lg font-semibold tracking-tight">
                                  {session.title}
                                </h3>
                                <dl className="flex flex-wrap gap-x-6 gap-y-1.5 font-sans text-sm text-(--color-text-secondary)">
                                  <div className="flex items-center gap-2">
                                    <CalendarDays
                                      className="size-4 text-(--color-text-muted)"
                                      strokeWidth={1.5}
                                      aria-hidden
                                    />
                                    <dt className="sr-only">Quando</dt>
                                    <dd>
                                      {formatFull(session.scheduled_for)}
                                    </dd>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock
                                      className="size-4 text-(--color-text-muted)"
                                      strokeWidth={1.5}
                                      aria-hidden
                                    />
                                    <dt className="sr-only">Duração</dt>
                                    <dd>{session.duration_minutes} min</dd>
                                  </div>
                                </dl>
                                <p className="font-sans text-xs text-(--color-bronze-400)">
                                  <Countdown
                                    targetIso={session.scheduled_for}
                                  />
                                </p>
                              </div>
                              <div className="md:min-w-52">
                                <EnterRoomButton
                                  liveSessionId={session.id}
                                  scheduledForIso={session.scheduled_for}
                                  isActive={session.is_active}
                                  fullWidth
                                />
                              </div>
                            </div>
                          </Surface>
                        </li>
                      )
                    })}
                  </ol>
                </div>
              ))}
            </div>
          )}
        </section>

        {past.length > 0 ? (
          <section aria-labelledby="past-heading" className="space-y-4">
            <h2
              id="past-heading"
              className="font-serif text-lg font-semibold tracking-tight text-(--color-text-secondary)"
            >
              Últimas mentorias realizadas
            </h2>
            <details className="group">
              <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-(--color-text-tertiary) transition-colors duration-(--duration-fast) ease-(--ease-std) hover:text-(--color-text-primary)">
                <ChevronRight
                  className="size-3.5 transition-transform duration-(--duration-fast) ease-(--ease-std) group-open:rotate-90"
                  strokeWidth={1.75}
                  aria-hidden
                />
                Mostrar últimas {past.length}
              </summary>
              <ul role="list" className="mt-4 space-y-2">
                {past.map((session) => {
                  const moduleTitle = session.lessons?.modules?.title
                  const trackRaw = session.lessons?.modules?.track
                  const track = isTrack(trackRaw) ? trackRaw : null
                  return (
                    <li key={session.id}>
                      <Surface
                        variant="surface"
                        className="flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3.5"
                      >
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            {track ? <TrackBadge track={track} /> : null}
                            {moduleTitle ? (
                              <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-(--color-text-muted)">
                                {moduleTitle}
                              </p>
                            ) : null}
                          </div>
                          <p className="font-serif text-base font-semibold tracking-tight text-(--color-text-secondary)">
                            {session.title}
                          </p>
                        </div>
                        <p className="font-sans text-xs text-(--color-text-muted)">
                          {DAY_FMT.format(
                            new Date(session.scheduled_for),
                          ).replace(',', ' ·')}
                        </p>
                        {session.recording_url ? (
                          <a
                            href={session.recording_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-(--color-border-default) px-3 py-1.5 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-tertiary) transition-colors duration-(--duration-fast) ease-(--ease-std) hover:border-(--color-bronze-400)/40 hover:text-(--color-text-primary)"
                          >
                            <Film
                              className="size-3.5"
                              strokeWidth={1.75}
                              aria-hidden
                            />
                            Gravação
                          </a>
                        ) : null}
                      </Surface>
                    </li>
                  )
                })}
              </ul>
            </details>
          </section>
        ) : null}
      </main>
    </div>
  )
}
