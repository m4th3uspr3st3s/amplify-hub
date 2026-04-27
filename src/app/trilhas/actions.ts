'use server'

// ===========================================================================
// Amplify Hub · Server Action · createAssetSignedUrl
// ===========================================================================
// Gera uma signed URL de curta duração (60s) para download de um asset do
// bucket privado `lesson-assets`.
//
// Defesa em camadas:
//   1. auth.getUser() — descarta requisição anônima.
//   2. SELECT em public.lesson_assets — RLS (0001 §8 + 0003 admin bypass)
//      bloqueia se o usuário não tem entitlement na track do módulo pai.
//      Se o select retorna null, o aluno não pode baixar — e nem ficamos
//      sabendo "qual storage_path" tentar assinar.
//   3. createSignedUrl com TTL = 60s — janela mínima de exposição se a URL
//      vazar via screenshot/log/proxy.
//
// Retornamos `{ url, filename }` em sucesso ou `{ error }` discriminado em
// falha — sem lançar exceções (UX friendly + sem quebrar o boundary do
// "use server").
// ===========================================================================

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const SIGNED_URL_TTL_SECONDS = 60
const STORAGE_BUCKET = 'lesson-assets'

const ASSET_KINDS = ['pdf', 'slides', 'template', 'exercise', 'audio'] as const
type AssetKindEnum = (typeof ASSET_KINDS)[number]

type SignedUrlResult =
  | { url: string; filename: string }
  | { error: 'unauthorized' | 'not_found' | 'sign_failed' }

export async function createAssetSignedUrl(
  assetId: string,
): Promise<SignedUrlResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'unauthorized' }
  }

  const { data: asset, error: assetError } = await supabase
    .from('lesson_assets')
    .select('id, storage_path, title')
    .eq('id', assetId)
    .maybeSingle()

  if (assetError || !asset) {
    return { error: 'not_found' }
  }

  // Extrai a extensão do storage_path para garantir que o `download` proposto
  // ao navegador preserve o tipo correto, mesmo que `title` venha sem sufixo.
  const extMatch = asset.storage_path.match(/\.[a-z0-9]+$/i)
  const extension = extMatch ? extMatch[0] : ''
  const filename =
    asset.title.toLowerCase().endsWith(extension.toLowerCase())
      ? asset.title
      : `${asset.title}${extension}`

  const { data: signed, error: signError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(asset.storage_path, SIGNED_URL_TTL_SECONDS, {
      download: filename,
    })

  if (signError || !signed) {
    return { error: 'sign_failed' }
  }

  return { url: signed.signedUrl, filename }
}

// ===========================================================================
// Server Action · registerAssetToDatabase
// ===========================================================================
// Chamada pelo AssetUploader (admin) APÓS o upload bem-sucedido para o bucket
// `lesson-assets`. Persiste os metadados em public.lesson_assets e revalida
// a rota da aula para que LessonAssetList renderize o novo arquivo na UI sem
// reload manual.
//
// Defesa em camadas:
//   1. auth.getUser() — descarta requisição anônima.
//   2. Validação de claim app_metadata.admin === true antes do INSERT
//      (defesa em código, redundante com a RLS criada na 0008).
//   3. Validação do `kind` contra o CHECK constraint da tabela.
//   4. INSERT com ON CONFLICT (lesson_id, storage_path) DO UPDATE — graças
//      ao UNIQUE da migration 0007, retries de upload (mesmo path, mesma
//      lesson) atualizam title/size_bytes em vez de duplicar a linha.
// ===========================================================================

type RegisterAssetPayload = {
  lessonId: string
  storagePath: string
  title: string
  kind: AssetKindEnum
  sizeBytes: number
  lessonRoute: string
}

type RegisterAssetResult =
  | { ok: true; assetId: string }
  | {
      error:
        | 'unauthorized'
        | 'forbidden'
        | 'invalid_payload'
        | 'insert_failed'
    }

export async function registerAssetToDatabase(
  payload: RegisterAssetPayload,
): Promise<RegisterAssetResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'unauthorized' }
  }

  const isAdmin = user.app_metadata?.admin === true
  if (!isAdmin) {
    return { error: 'forbidden' }
  }

  const { lessonId, storagePath, title, kind, sizeBytes, lessonRoute } = payload

  if (
    !lessonId ||
    !storagePath ||
    !title.trim() ||
    !ASSET_KINDS.includes(kind) ||
    !Number.isFinite(sizeBytes) ||
    sizeBytes <= 0 ||
    !lessonRoute.startsWith('/trilhas/')
  ) {
    return { error: 'invalid_payload' }
  }

  const { data: inserted, error: insertError } = await supabase
    .from('lesson_assets')
    .upsert(
      {
        lesson_id: lessonId,
        storage_path: storagePath,
        title: title.trim(),
        kind,
        size_bytes: Math.round(sizeBytes),
      },
      { onConflict: 'lesson_id,storage_path' },
    )
    .select('id')
    .single()

  if (insertError || !inserted) {
    return { error: 'insert_failed' }
  }

  revalidatePath(lessonRoute)

  return { ok: true, assetId: inserted.id }
}

// ===========================================================================
// Server Action · updateLessonBody
// ===========================================================================
// Chamada pelo LessonBodyEditor (admin) para persistir o markdown editado
// inline na página da aula. Emite revalidatePath para que o MarkdownLite
// renderize a nova versão sem reload manual.
//
// Defesa em camadas:
//   1. auth.getUser() — descarta requisição anônima.
//   2. Validação de claim app_metadata.admin === true antes do UPDATE
//      (defesa em código, redundante com a RLS criada na 0009).
//   3. Validação do payload com Zod (lessonId UUID, body em texto curto).
//   4. UPDATE com retorno do `id` para confirmar que a linha existia E que
//      o RLS permitiu — se vier vazio, sinalizamos `not_found_or_forbidden`.
// ===========================================================================

const UpdateLessonBodySchema = z.object({
  lessonId: z.string().uuid(),
  // body_md pode ser string vazia (admin "limpou" o resumo); cap defensivo
  // de 16 KB para evitar que um paste acidental encha o banco.
  bodyMd: z.string().max(16_384),
  lessonRoute: z.string().startsWith('/trilhas/'),
})

type UpdateLessonBodyResult =
  | { ok: true }
  | {
      error:
        | 'unauthorized'
        | 'forbidden'
        | 'invalid_payload'
        | 'not_found_or_forbidden'
        | 'update_failed'
    }

export async function updateLessonBody(
  payload: z.input<typeof UpdateLessonBodySchema>,
): Promise<UpdateLessonBodyResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'unauthorized' }
  }

  if (user.app_metadata?.admin !== true) {
    return { error: 'forbidden' }
  }

  const parsed = UpdateLessonBodySchema.safeParse(payload)
  if (!parsed.success) {
    return { error: 'invalid_payload' }
  }

  const { lessonId, bodyMd, lessonRoute } = parsed.data

  // Normaliza string vazia para null no banco — body_md é nullable e a UI
  // já trata `null` como "sem resumo".
  const nextBody = bodyMd.trim().length === 0 ? null : bodyMd

  const { data: updated, error: updateError } = await supabase
    .from('lessons')
    .update({ body_md: nextBody })
    .eq('id', lessonId)
    .select('id')
    .maybeSingle()

  if (updateError) {
    return { error: 'update_failed' }
  }

  if (!updated) {
    // Sem linha retornada significa que a RLS bloqueou ou o id não existe.
    // Não distinguimos os dois para não vazar informação sobre lessons.
    return { error: 'not_found_or_forbidden' }
  }

  revalidatePath(lessonRoute)

  return { ok: true }
}

// ===========================================================================
// Server Action · scheduleLiveSession
// ===========================================================================
// Chamada pelo LiveSessionScheduler (admin) para criar uma `live_sessions`
// associada a uma `lesson`. NÃO cria a call no Stream Video aqui — o SDK
// provisiona a call just-in-time quando o aluno entra em /aulas/[id]
// (StreamRoom). Stream cobra concurrent-minutes, não calls agendadas, então
// criar antes seria desperdício e mais um modo de falha.
//
// Convenção de stream_call_id: `lesson-<lessonId>-<timestamp>` (≤ 64 chars,
// alfanumérico + hífens — atende ao formato Stream e ao UNIQUE da tabela).
//
// Defesa em camadas:
//   1. auth.getUser() — descarta requisição anônima.
//   2. Validação de claim app_metadata.admin === true antes do INSERT
//      (defesa em código, redundante com a RLS de 0003).
//   3. Validação do payload com Zod (datetime ISO, duração 15-300 min).
//   4. INSERT em public.live_sessions com host_user_id = admin logado.
// ===========================================================================

const ScheduleLiveSessionSchema = z.object({
  lessonId: z.string().uuid(),
  title: z.string().trim().min(1).max(200),
  // datetime-local do navegador é convertido para ISO no client antes de
  // chegar aqui (ver LiveSessionScheduler).
  scheduledForIso: z.string().datetime(),
  durationMinutes: z.number().int().min(15).max(300),
  lessonRoute: z.string().startsWith('/trilhas/'),
})

type ScheduleLiveSessionResult =
  | { ok: true; liveSessionId: string }
  | {
      error:
        | 'unauthorized'
        | 'forbidden'
        | 'invalid_payload'
        | 'lesson_not_found'
        | 'insert_failed'
    }

export async function scheduleLiveSession(
  payload: z.input<typeof ScheduleLiveSessionSchema>,
): Promise<ScheduleLiveSessionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'unauthorized' }
  }

  if (user.app_metadata?.admin !== true) {
    return { error: 'forbidden' }
  }

  const parsed = ScheduleLiveSessionSchema.safeParse(payload)
  if (!parsed.success) {
    return { error: 'invalid_payload' }
  }

  const { lessonId, title, scheduledForIso, durationMinutes, lessonRoute } =
    parsed.data

  // Confirma que a lesson existe e é visível ao admin (RLS bypass de 0003).
  // Sem esta checagem, o INSERT poderia falhar silenciosamente em FK violation
  // sem um erro descritivo para o admin.
  const { data: lesson } = await supabase
    .from('lessons')
    .select('id')
    .eq('id', lessonId)
    .maybeSingle()

  if (!lesson) {
    return { error: 'lesson_not_found' }
  }

  const streamCallId = `lesson-${lessonId}-${Date.now()}`

  const { data: inserted, error: insertError } = await supabase
    .from('live_sessions')
    .insert({
      lesson_id: lessonId,
      title,
      scheduled_for: scheduledForIso,
      duration_minutes: durationMinutes,
      stream_call_id: streamCallId,
      host_user_id: user.id,
    })
    .select('id')
    .single()

  if (insertError || !inserted) {
    return { error: 'insert_failed' }
  }

  revalidatePath(lessonRoute)
  revalidatePath('/dashboard')

  return { ok: true, liveSessionId: inserted.id }
}
