// ===========================================================================
// Amplify Hub · LessonAssetList (Server Component)
// ===========================================================================
// Carrega os assets de uma lesson (RLS já filtra por entitlement) e renderiza
// uma lista vertical de AssetDownloadButton. Estado vazio comunica que os
// materiais ainda não foram publicados.
// ===========================================================================

import { Surface } from '@/components/ui/Surface'
import { createClient } from '@/lib/supabase/server'
import {
  AssetDownloadButton,
  type AssetKind,
} from '@/components/lesson/AssetDownloadButton'

type Props = {
  lessonId: string
}

export async function LessonAssetList({ lessonId }: Props) {
  const supabase = await createClient()

  const { data: assets } = await supabase
    .from('lesson_assets')
    .select('id, kind, title, size_bytes')
    .eq('lesson_id', lessonId)
    .order('created_at', { ascending: true })

  if (!assets || assets.length === 0) {
    return (
      <Surface
        variant="surface"
        className="p-6 font-sans text-sm text-(--color-text-muted)"
      >
        Os materiais desta aula serão disponibilizados em breve.
      </Surface>
    )
  }

  return (
    <ul role="list" className="space-y-2">
      {assets.map((asset) => (
        <li key={asset.id}>
          <AssetDownloadButton
            assetId={asset.id}
            kind={asset.kind as AssetKind}
            title={asset.title}
            sizeBytes={asset.size_bytes}
          />
        </li>
      ))}
    </ul>
  )
}
