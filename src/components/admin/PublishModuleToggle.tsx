'use client'

// ===========================================================================
// Amplify Hub · PublishModuleToggle (Client Component, admin only)
// ===========================================================================
// Botão de publicação/rascunho para `modules.published_at`. O Server
// Component pai injeta o componente apenas quando `isAdmin === true`; o
// componente NÃO confia no client para autorização — a Server Action
// toggleModulePublication checa claim de admin antes do UPDATE (defesa em
// código + RLS de 0013 como rede).
//
// Estado local `optimistic`: enquanto o transition pende, refletimos a
// intenção do clique imediatamente. Em sucesso, confiamos no
// revalidatePath para reidratar a prop `isPublished` na próxima render.
// Em erro, revertemos.
// ===========================================================================

import { useState, useTransition } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { toggleModulePublication } from '@/app/trilhas/actions'
import { cn } from '@/lib/cn'

type Props = {
  moduleId: string
  isPublished: boolean
}

export function PublishModuleToggle({ moduleId, isPublished }: Props) {
  const [optimistic, setOptimistic] = useState(isPublished)
  const [pending, startTransition] = useTransition()

  function handleClick() {
    const next = !optimistic
    setOptimistic(next)

    startTransition(async () => {
      const result = await toggleModulePublication(moduleId, next)

      if ('error' in result) {
        setOptimistic(!next)
        const message =
          result.error === 'forbidden'
            ? 'Apenas administradores podem alternar publicação.'
            : result.error === 'unauthorized'
              ? 'Sessão expirada. Faça login novamente.'
              : result.error === 'invalid_payload'
                ? 'Dados inválidos.'
                : result.error === 'not_found_or_forbidden'
                  ? 'Módulo não encontrado ou sem permissão.'
                  : 'Falha ao atualizar publicação.'
        toast.error(message)
        return
      }

      toast.success(
        next ? 'Módulo publicado para os alunos.' : 'Módulo revertido para rascunho.',
      )
    })
  }

  const Icon = optimistic ? EyeOff : Eye
  const label = optimistic ? 'Reverter para rascunho' : 'Publicar módulo'

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-pressed={optimistic}
      className={cn(
        'inline-flex min-h-9 items-center gap-1.5 rounded-md border px-3 py-1.5',
        'font-sans text-[11px] font-semibold uppercase tracking-[0.16em]',
        'transition-colors duration-(--duration-fast) ease-(--ease-std)',
        'disabled:opacity-60',
        optimistic
          ? 'border-(--color-border-default) bg-(--color-bg-elevated)/70 text-(--color-text-tertiary) hover:border-(--color-border-strong) hover:text-(--color-text-primary)'
          : 'border-(--color-bronze-400)/40 bg-(--color-bronze-400)/10 text-(--color-bronze-400) hover:border-(--color-bronze-400)/70 hover:text-(--color-text-primary)',
      )}
    >
      {pending ? (
        <Loader2 className="size-3.5 animate-spin" aria-hidden />
      ) : (
        <Icon className="size-3.5" strokeWidth={1.75} aria-hidden />
      )}
      {label}
    </button>
  )
}
