'use client'

// ===========================================================================
// Amplify Hub · AssetUploader (Client Component, admin only)
// ===========================================================================
// Formulário Dark-only para o admin anexar materiais a uma lesson sem sair
// do Hub. Fluxo em duas etapas:
//   1. Upload binário direto do navegador para o bucket privado `lesson-assets`
//      via createBrowserClient (RLS de INSERT da 0008 valida is_admin()).
//   2. Em sucesso, chama a Server Action registerAssetToDatabase para inserir
//      a linha em public.lesson_assets, que dispara revalidatePath e atualiza
//      a LessonAssetList ao lado.
//
// O componente NÃO confia no client para autorização — toda a validação real
// acontece via RLS no Storage (0008) + checagem de claim na Server Action.
// O guard de UI (renderizado só para isAdmin) serve apenas para UX.
// ===========================================================================

import { useState, useTransition, type FormEvent } from 'react'
import { Loader2, Plus, UploadCloud } from 'lucide-react'
import { toast } from 'sonner'
import { registerAssetToDatabase } from '@/app/trilhas/actions'
import { Surface } from '@/components/ui/Surface'
import { createClient } from '@/lib/supabase/browser'
import { cn } from '@/lib/cn'

const STORAGE_BUCKET = 'lesson-assets'
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024 // alinhado com bucket (0005)

const KIND_OPTIONS = [
  { value: 'pdf', label: 'PDF' },
  { value: 'slides', label: 'Slides' },
  { value: 'template', label: 'Template' },
  { value: 'exercise', label: 'Exercício' },
] as const

type KindValue = (typeof KIND_OPTIONS)[number]['value']

type Props = {
  lessonId: string
  lessonSlug: string
  moduleSlug: string
  trackSlug: string
  track: string
}

function slugifyFilename(raw: string): string {
  // Mantém a extensão e gera um slug ASCII-only para o nome base.
  const dotIdx = raw.lastIndexOf('.')
  const base = dotIdx > 0 ? raw.slice(0, dotIdx) : raw
  const ext = dotIdx > 0 ? raw.slice(dotIdx).toLowerCase() : ''
  const slugBase = base
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
  return `${slugBase || 'arquivo'}${ext}`
}

export function AssetUploader({
  lessonId,
  lessonSlug,
  moduleSlug,
  trackSlug,
  track,
}: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [kind, setKind] = useState<KindValue>('pdf')
  const [pending, startTransition] = useTransition()

  function reset() {
    setFile(null)
    setTitle('')
    setKind('pdf')
    const form = document.getElementById(
      'asset-uploader-form',
    ) as HTMLFormElement | null
    form?.reset()
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const next = event.target.files?.[0] ?? null
    if (next && next.size > MAX_FILE_SIZE_BYTES) {
      toast.error('Arquivo excede 50 MB. Comprima o PDF antes do upload.')
      event.target.value = ''
      setFile(null)
      return
    }
    setFile(next)
    // Auto-preenche o título com o nome base do arquivo, se ainda vazio.
    if (next && !title) {
      const cleaned = next.name.replace(/\.[a-z0-9]+$/i, '').replace(/[_-]+/g, ' ').trim()
      setTitle(cleaned)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!file) {
      toast.error('Selecione um arquivo para enviar.')
      return
    }
    if (!title.trim()) {
      toast.error('Dê um título ao material antes de enviar.')
      return
    }

    startTransition(async () => {
      const supabase = createClient()
      // Convenção de path (laudo §3.2 / RLS 0006):
      //   tracks/<track>/<module-slug>/<lesson-slug>/<filename>
      const filename = slugifyFilename(file.name)
      const storagePath = `tracks/${track}/${moduleSlug}/${lessonSlug}/${filename}`

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type || 'application/pdf',
        })

      if (uploadError) {
        toast.error(
          `Falha no upload: ${uploadError.message ?? 'erro desconhecido'}`,
        )
        return
      }

      const result = await registerAssetToDatabase({
        lessonId,
        storagePath,
        title,
        kind,
        sizeBytes: file.size,
        lessonRoute: `/trilhas/${trackSlug}/${moduleSlug}/${lessonSlug}`,
      })

      if ('error' in result) {
        const message =
          result.error === 'forbidden'
            ? 'Apenas administradores podem anexar materiais.'
            : result.error === 'invalid_payload'
              ? 'Dados do material inválidos. Revise os campos.'
              : result.error === 'unauthorized'
                ? 'Sessão expirada. Faça login novamente.'
                : 'Upload concluído, mas o registro no banco falhou.'
        toast.error(message)
        return
      }

      toast.success('Material publicado com sucesso.')
      reset()
    })
  }

  const accept = kind === 'pdf' ? '.pdf' : '*/*'

  return (
    <Surface variant="card" className="p-6 md:p-8">
      <div className="mb-5 flex items-center gap-2 font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-(--color-bronze-400)/85">
        <Plus className="size-3.5" strokeWidth={2} aria-hidden />
        Painel admin · Adicionar material
      </div>

      <h2 className="mb-1 font-serif text-xl font-semibold tracking-tight text-(--color-text-primary)">
        Anexar novo arquivo
      </h2>
      <p className="mb-6 font-sans text-sm text-(--color-text-secondary)">
        O upload vai direto para o bucket privado{' '}
        <code className="font-sans text-xs text-(--color-text-tertiary)">
          lesson-assets
        </code>{' '}
        e o registro é feito automaticamente nesta aula.
      </p>

      <form
        id="asset-uploader-form"
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <div className="space-y-2">
          <label
            htmlFor="asset-file"
            className="block font-sans text-xs font-semibold uppercase tracking-[0.14em] text-(--color-text-tertiary)"
          >
            Arquivo
          </label>
          <input
            id="asset-file"
            type="file"
            accept={accept}
            onChange={handleFileChange}
            disabled={pending}
            className={cn(
              'block w-full min-h-11 rounded-md border border-(--color-border-default)',
              'bg-(--color-bg-elevated) px-3 py-2.5 font-sans text-sm text-(--color-text-secondary)',
              'file:mr-4 file:rounded-sm file:border-0 file:bg-(--color-sage-900) file:px-3 file:py-1.5',
              'file:font-sans file:text-xs file:font-semibold file:uppercase file:tracking-[0.14em] file:text-(--color-sage-100)',
              'hover:file:bg-(--color-sage-700)',
              'disabled:opacity-60',
            )}
          />
          {file ? (
            <p className="font-sans text-xs text-(--color-text-muted)">
              {file.name} · {(file.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="asset-title"
            className="block font-sans text-xs font-semibold uppercase tracking-[0.14em] text-(--color-text-tertiary)"
          >
            Nome do material
          </label>
          <input
            id="asset-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            disabled={pending}
            placeholder="Ex.: Manual M1 — Fundamentos & Diagnóstico"
            maxLength={120}
            className="block w-full min-h-11 rounded-md border border-(--color-border-default) bg-(--color-bg-elevated) px-3 py-2.5 font-sans text-sm text-(--color-text-primary) placeholder:text-(--color-text-disabled) disabled:opacity-60"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="asset-kind"
            className="block font-sans text-xs font-semibold uppercase tracking-[0.14em] text-(--color-text-tertiary)"
          >
            Tipo
          </label>
          <select
            id="asset-kind"
            value={kind}
            onChange={(event) => setKind(event.target.value as KindValue)}
            disabled={pending}
            className="block w-full min-h-11 rounded-md border border-(--color-border-default) bg-(--color-bg-elevated) px-3 py-2.5 font-sans text-sm text-(--color-text-primary) disabled:opacity-60"
          >
            {KIND_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={pending || !file || !title.trim()}
            className="btn-primary"
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Enviando…
              </>
            ) : (
              <>
                <UploadCloud className="size-4" strokeWidth={1.75} aria-hidden />
                Fazer upload
              </>
            )}
          </button>
        </div>
      </form>
    </Surface>
  )
}
