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

import { createClient } from '@/lib/supabase/server'

const SIGNED_URL_TTL_SECONDS = 60
const STORAGE_BUCKET = 'lesson-assets'

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
