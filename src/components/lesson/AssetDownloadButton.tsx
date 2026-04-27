'use client'

// ===========================================================================
// Amplify Hub · AssetDownloadButton (Client Component)
// ===========================================================================
// DS Universal §0.1 (44pt mínimo) · §1.5 (sem sombras) · §2.1 (botão sage).
// Renderiza uma "row" interativa por asset: ícone do tipo, título, metadado
// (kind + tamanho), affordance de download. Estado de loading com spinner.
// ===========================================================================

import { useTransition } from 'react'
import {
  FileText,
  Headphones,
  ListChecks,
  Loader2,
  Presentation,
  FileCode2,
  Download,
} from 'lucide-react'
import { toast } from 'sonner'
import { createAssetSignedUrl } from '@/app/trilhas/actions'
import { cn } from '@/lib/cn'

const KIND_ICONS = {
  pdf: FileText,
  slides: Presentation,
  template: FileCode2,
  exercise: ListChecks,
  audio: Headphones,
} as const

const KIND_LABELS = {
  pdf: 'PDF',
  slides: 'Slides',
  template: 'Template',
  exercise: 'Exercício',
  audio: 'Áudio',
} as const

export type AssetKind = keyof typeof KIND_ICONS

function formatBytes(bytes: number | null): string | null {
  if (!bytes || bytes <= 0) return null
  const mb = bytes / (1024 * 1024)
  if (mb >= 1) return `${mb.toFixed(1)} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

type Props = {
  assetId: string
  kind: AssetKind
  title: string
  sizeBytes: number | null
}

export function AssetDownloadButton({
  assetId,
  kind,
  title,
  sizeBytes,
}: Props) {
  const [pending, startTransition] = useTransition()
  const Icon = KIND_ICONS[kind] ?? FileText
  const sizeLabel = formatBytes(sizeBytes)
  const kindLabel = KIND_LABELS[kind] ?? 'Arquivo'

  function triggerDownload(url: string, filename: string) {
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  function handleClick() {
    startTransition(async () => {
      const result = await createAssetSignedUrl(assetId)
      if ('error' in result) {
        const message =
          result.error === 'unauthorized'
            ? 'Sessão expirada. Faça login novamente.'
            : result.error === 'not_found'
              ? 'Material indisponível neste momento.'
              : 'Não foi possível gerar o link. Tente novamente em instantes.'
        toast.error(message)
        return
      }
      triggerDownload(result.url, result.filename)
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-label={`Baixar ${title}${sizeLabel ? ` (${sizeLabel})` : ''}`}
      className={cn(
        'group flex w-full min-h-11 items-center gap-4 rounded-md',
        'border border-(--color-sage-700)/45 bg-(--color-sage-900)/35',
        'px-4 py-3 text-left',
        'font-sans text-sm text-(--color-text-primary)',
        'transition-colors duration-(--duration-fast) ease-(--ease-std)',
        'hover:border-(--color-sage-400)/70 hover:bg-(--color-sage-900)/55',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-border-focus) focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-bg-base)',
        'active:scale-[0.99]',
        'disabled:opacity-60 disabled:pointer-events-none',
      )}
    >
      <span
        aria-hidden
        className="inline-flex size-10 shrink-0 items-center justify-center rounded-sm border border-(--color-sage-700)/55 bg-(--color-sage-900)/60 text-(--color-sage-100)"
      >
        {pending ? (
          <Loader2 className="size-5 animate-spin" strokeWidth={1.5} />
        ) : (
          <Icon className="size-5" strokeWidth={1.5} />
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate font-sans text-sm font-medium text-(--color-text-primary)">
          {title}
        </span>
        <span className="mt-0.5 block font-sans text-xs uppercase tracking-[0.14em] text-(--color-text-muted)">
          {kindLabel}
          {sizeLabel ? ` · ${sizeLabel}` : ''}
        </span>
      </span>

      <span
        aria-hidden
        className="inline-flex shrink-0 items-center gap-1.5 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-(--color-sage-100) opacity-80 transition-opacity duration-(--duration-fast) ease-(--ease-std) group-hover:opacity-100"
      >
        {pending ? (
          'Gerando…'
        ) : (
          <>
            <Download className="size-4" strokeWidth={1.75} />
            Baixar
          </>
        )}
      </span>
    </button>
  )
}
