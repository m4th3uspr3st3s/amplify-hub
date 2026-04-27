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
