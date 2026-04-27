'use client'

// ===========================================================================
// Amplify Hub · LessonBodyEditor (Client Component, admin only)
// ===========================================================================
// Editor inline de markdown para `lessons.body_md` (Lote 1 da Estação de
// Comando do Admin · Laudo de Auditoria v1.1 §1.1).
//
// Modo padrão: renderiza os children (tipicamente <MarkdownLite>) com um
// botão sutil "Editar Resumo da Aula" no topo direito.
// Modo de edição: substitui o conteúdo por um <textarea> Dark-only focado
// na digitação, com Salvar/Cancelar abaixo.
//
// O componente NÃO confia no client para autorização — toda escrita passa
// pela Server Action updateLessonBody, que checa claim de admin antes do
// UPDATE (defesa em código + RLS de 0009 como rede). O guard `isAdmin` no
// Server Component pai apenas decide se monta o editor.
// ===========================================================================

import { useState, useTransition, type ReactNode } from 'react'
import { Loader2, Pencil, Save, X } from 'lucide-react'
import { toast } from 'sonner'
import { updateLessonBody } from '@/app/trilhas/actions'
import { cn } from '@/lib/cn'

const MAX_BODY_BYTES = 16_384

type Props = {
  lessonId: string
  lessonRoute: string
  initialBody: string | null
  // Conteúdo já renderizado (MarkdownLite) para o modo de leitura.
  children: ReactNode
}

export function LessonBodyEditor({
  lessonId,
  lessonRoute,
  initialBody,
  children,
}: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(initialBody ?? '')
  const [pending, startTransition] = useTransition()

  function handleCancel() {
    setDraft(initialBody ?? '')
    setEditing(false)
  }

  function handleSave() {
    if (draft.length > MAX_BODY_BYTES) {
      toast.error('Resumo excede 16 KB. Reduza o texto antes de salvar.')
      return
    }

    startTransition(async () => {
      const result = await updateLessonBody({
        lessonId,
        bodyMd: draft,
        lessonRoute,
      })

      if ('error' in result) {
        const message =
          result.error === 'forbidden'
            ? 'Apenas administradores podem editar o resumo.'
            : result.error === 'unauthorized'
              ? 'Sessão expirada. Faça login novamente.'
              : result.error === 'invalid_payload'
                ? 'Conteúdo inválido. Revise o texto.'
                : result.error === 'not_found_or_forbidden'
                  ? 'Aula não encontrada ou sem permissão.'
                  : 'Falha ao salvar o resumo.'
        toast.error(message)
        return
      }

      toast.success('Resumo atualizado.')
      setEditing(false)
    })
  }

  if (!editing) {
    return (
      <div className="relative">
        <div className="absolute right-0 top-0 -translate-y-2 translate-x-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className={cn(
              'inline-flex min-h-9 items-center gap-1.5 rounded-md border border-(--color-border-default)',
              'bg-(--color-bg-elevated)/70 px-3 py-1.5 font-sans text-[11px] font-semibold uppercase tracking-[0.16em]',
              'text-(--color-text-tertiary) transition-colors duration-(--duration-fast) ease-(--ease-std)',
              'hover:border-(--color-bronze-400)/40 hover:text-(--color-text-primary)',
            )}
            aria-label="Editar resumo da aula"
          >
            <Pencil className="size-3.5" strokeWidth={1.75} aria-hidden />
            Editar resumo
          </button>
        </div>
        {children}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-(--color-bronze-400)/85">
        <Pencil className="size-3.5" strokeWidth={2} aria-hidden />
        Editando resumo da aula
      </div>

      <textarea
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        disabled={pending}
        rows={16}
        spellCheck
        autoFocus
        placeholder={
          '## Tema\nO que vai aprender nesta aula…\n\n**Pré-requisitos:** …'
        }
        className={cn(
          'block w-full resize-y rounded-md border border-(--color-border-default)',
          'bg-(--color-bg-elevated) px-4 py-3 font-mono text-sm leading-relaxed',
          'text-(--color-text-primary) placeholder:text-(--color-text-disabled)',
          'focus:border-(--color-border-focus) focus:outline-none',
          'disabled:opacity-60',
        )}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-sans text-[11px] text-(--color-text-muted)">
          Markdown suportado: <code>## Título</code>, <code>**negrito**</code>,
          parágrafos separados por linha em branco.
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCancel}
            disabled={pending}
            className={cn(
              'inline-flex min-h-11 items-center gap-1.5 rounded-md border border-(--color-border-default)',
              'bg-transparent px-4 py-2 font-sans text-sm text-(--color-text-secondary)',
              'transition-colors duration-(--duration-fast) ease-(--ease-std)',
              'hover:border-(--color-border-strong) hover:text-(--color-text-primary)',
              'disabled:opacity-50',
            )}
          >
            <X className="size-4" strokeWidth={1.75} aria-hidden />
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={pending}
            className="btn-primary"
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Salvando…
              </>
            ) : (
              <>
                <Save className="size-4" strokeWidth={1.75} aria-hidden />
                Salvar resumo
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
