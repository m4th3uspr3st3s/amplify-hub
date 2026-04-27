'use client'

// ===========================================================================
// Amplify Hub · EnterRoomButton (Client Component)
// ===========================================================================
// Botão que leva o aluno para /aulas/[liveSessionId]. Habilitado apenas
// quando a sala está aberta — regra T-15min ou is_active = true.
//
// O "agora" vem de useNowMsEvery15s (clock global compartilhado, atualiza
// a cada 15s — granularidade suficiente para abrir a porta na hora certa
// sem encharcar o React de renders).
// ===========================================================================

import Link from 'next/link'
import { Lock, Radio } from 'lucide-react'
import { ROOM_OPEN_LEAD_MS } from './Countdown'
import { useNowMsEvery15s } from './useClock'
import { cn } from '@/lib/cn'

type Props = {
  liveSessionId: string
  scheduledForIso: string
  isActive: boolean
  className?: string
  fullWidth?: boolean
}

export function EnterRoomButton({
  liveSessionId,
  scheduledForIso,
  isActive,
  className,
  fullWidth = false,
}: Props) {
  const targetMs = new Date(scheduledForIso).getTime()
  const now = useNowMsEvery15s()

  // SSR / primeiro paint (now === 0): renderiza desabilitado com placeholder
  // estável. Evita flash de "Entrar" se na verdade ainda falta tempo.
  const open =
    !Number.isNaN(targetMs) &&
    now > 0 &&
    (isActive || targetMs - now <= ROOM_OPEN_LEAD_MS)

  if (!open) {
    return (
      <button
        type="button"
        disabled
        className={cn(
          'btn-primary opacity-60',
          fullWidth && 'w-full',
          className,
        )}
        suppressHydrationWarning
      >
        <Lock className="size-4" aria-hidden />
        A sala abre 15 min antes
      </button>
    )
  }

  return (
    <Link
      href={`/aulas/${liveSessionId}`}
      className={cn('btn-primary', fullWidth && 'w-full', className)}
    >
      <Radio className="size-4" aria-hidden />
      Entrar na sala
    </Link>
  )
}
