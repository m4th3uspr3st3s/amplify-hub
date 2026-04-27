'use client'

// ===========================================================================
// Amplify Hub · LiveSessionScheduler (Client Component, admin only)
// ===========================================================================
// Formulário Dark-only para o admin agendar uma `live_sessions` associada a
// uma lesson sem sair do Hub (Lote 1 da Estação de Comando do Admin · Laudo
// de Auditoria v1.1 §1.2).
//
// Fluxo:
//   1. datetime-local é coletado no fuso do navegador (tipicamente
//      America/Sao_Paulo para o admin) e convertido para ISO UTC no submit
//      via `new Date(value).toISOString()`. O input não carrega TZ, então
//      essa conversão usa a TZ do sistema do admin — comportamento desejado.
//   2. Server Action scheduleLiveSession valida claim admin, gera o
//      stream_call_id no formato `lesson-<uuid>-<timestamp>` (atende ao
//      UNIQUE de live_sessions) e faz o INSERT (RLS de 0003 já libera).
//   3. Em sucesso, dispara revalidatePath e o feedback visual (toast).
//
// O componente NÃO confia no client para autorização — toda escrita passa
// pela Server Action. O guard isAdmin no Server Component pai apenas
// decide se o formulário é montado.
// ===========================================================================

import { useState, useTransition, type FormEvent } from 'react'
import { CalendarPlus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { scheduleLiveSession } from '@/app/trilhas/actions'
import { Surface } from '@/components/ui/Surface'
import { cn } from '@/lib/cn'

const MIN_DURATION_MIN = 15
const MAX_DURATION_MIN = 300
const DEFAULT_DURATION_MIN = 90

type Props = {
  lessonId: string
  lessonTitle: string
  lessonRoute: string
}

// Formata um Date em "YYYY-MM-DDTHH:MM" no fuso local — formato exigido pelo
// input[type="datetime-local"]. Default: amanhã às 20:00 local.
function defaultLocalDateTime(): string {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(now.getDate() + 1)
  tomorrow.setHours(20, 0, 0, 0)
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}` +
    `T${pad(tomorrow.getHours())}:${pad(tomorrow.getMinutes())}`
  )
}

export function LiveSessionScheduler({
  lessonId,
  lessonTitle,
  lessonRoute,
}: Props) {
  const [title, setTitle] = useState(`Live · ${lessonTitle}`)
  const [scheduledLocal, setScheduledLocal] = useState(defaultLocalDateTime)
  const [durationMinutes, setDurationMinutes] = useState(DEFAULT_DURATION_MIN)
  const [pending, startTransition] = useTransition()

  function reset() {
    setTitle(`Live · ${lessonTitle}`)
    setScheduledLocal(defaultLocalDateTime())
    setDurationMinutes(DEFAULT_DURATION_MIN)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      toast.error('Dê um título à mentoria antes de agendar.')
      return
    }

    if (!scheduledLocal) {
      toast.error('Defina a data e o horário da mentoria.')
      return
    }

    // datetime-local não traz TZ — Date(parse) usa a TZ do navegador, que é
    // a do admin. toISOString() converte para UTC, que é o que vai para o
    // banco (timestamptz).
    const scheduledDate = new Date(scheduledLocal)
    if (Number.isNaN(scheduledDate.getTime())) {
      toast.error('Data inválida.')
      return
    }

    // Permitimos um fudge de 5 minutos para evitar erro "no passado" causado
    // por o admin terminar de preencher 1 segundo após a hora escolhida.
    if (scheduledDate.getTime() < Date.now() - 5 * 60 * 1000) {
      toast.error('Não é possível agendar mentoria no passado.')
      return
    }

    if (
      !Number.isInteger(durationMinutes) ||
      durationMinutes < MIN_DURATION_MIN ||
      durationMinutes > MAX_DURATION_MIN
    ) {
      toast.error(
        `Duração deve estar entre ${MIN_DURATION_MIN} e ${MAX_DURATION_MIN} minutos.`,
      )
      return
    }

    startTransition(async () => {
      const result = await scheduleLiveSession({
        lessonId,
        title: trimmedTitle,
        scheduledForIso: scheduledDate.toISOString(),
        durationMinutes,
        lessonRoute,
      })

      if ('error' in result) {
        const message =
          result.error === 'forbidden'
            ? 'Apenas administradores podem agendar mentorias.'
            : result.error === 'unauthorized'
              ? 'Sessão expirada. Faça login novamente.'
              : result.error === 'invalid_payload'
                ? 'Dados da mentoria inválidos. Revise os campos.'
                : result.error === 'lesson_not_found'
                  ? 'Aula não encontrada.'
                  : 'Falha ao agendar a mentoria.'
        toast.error(message)
        return
      }

      toast.success('Mentoria agendada.')
      reset()
    })
  }

  return (
    <Surface variant="card" className="p-6 md:p-8">
      <div className="mb-5 flex items-center gap-2 font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-(--color-bronze-400)/85">
        <CalendarPlus className="size-3.5" strokeWidth={2} aria-hidden />
        Painel admin · Agendar mentoria
      </div>

      <h2 className="mb-1 font-serif text-xl font-semibold tracking-tight text-(--color-text-primary)">
        Nova live ao vivo
      </h2>
      <p className="mb-6 font-sans text-sm text-(--color-text-secondary)">
        A sessão será visível para os alunos com acesso à trilha desta aula.
        A sala é provisionada no Stream automaticamente quando alguém entrar.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label
            htmlFor="live-title"
            className="block font-sans text-xs font-semibold uppercase tracking-[0.14em] text-(--color-text-tertiary)"
          >
            Título
          </label>
          <input
            id="live-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            disabled={pending}
            maxLength={200}
            placeholder="Ex.: Live M2 — Diagnóstico Avançado"
            className="block min-h-11 w-full rounded-md border border-(--color-border-default) bg-(--color-bg-elevated) px-3 py-2.5 font-sans text-sm text-(--color-text-primary) placeholder:text-(--color-text-disabled) disabled:opacity-60"
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="live-when"
              className="block font-sans text-xs font-semibold uppercase tracking-[0.14em] text-(--color-text-tertiary)"
            >
              Data e horário
            </label>
            <input
              id="live-when"
              type="datetime-local"
              value={scheduledLocal}
              onChange={(event) => setScheduledLocal(event.target.value)}
              disabled={pending}
              className={cn(
                'block min-h-11 w-full rounded-md border border-(--color-border-default)',
                'bg-(--color-bg-elevated) px-3 py-2.5 font-sans text-sm text-(--color-text-primary)',
                'disabled:opacity-60',
                '[color-scheme:dark]',
              )}
            />
            <p className="font-sans text-[11px] text-(--color-text-muted)">
              No fuso do seu navegador. Convertido para UTC ao salvar.
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="live-duration"
              className="block font-sans text-xs font-semibold uppercase tracking-[0.14em] text-(--color-text-tertiary)"
            >
              Duração (minutos)
            </label>
            <input
              id="live-duration"
              type="number"
              value={durationMinutes}
              onChange={(event) =>
                setDurationMinutes(Number(event.target.value))
              }
              disabled={pending}
              min={MIN_DURATION_MIN}
              max={MAX_DURATION_MIN}
              step={15}
              className="block min-h-11 w-full rounded-md border border-(--color-border-default) bg-(--color-bg-elevated) px-3 py-2.5 font-sans text-sm text-(--color-text-primary) disabled:opacity-60"
            />
          </div>
        </div>

        <div className="flex items-center justify-end pt-2">
          <button
            type="submit"
            disabled={pending || !title.trim() || !scheduledLocal}
            className="btn-primary"
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Agendando…
              </>
            ) : (
              <>
                <CalendarPlus
                  className="size-4"
                  strokeWidth={1.75}
                  aria-hidden
                />
                Agendar mentoria
              </>
            )}
          </button>
        </div>
      </form>
    </Surface>
  )
}
