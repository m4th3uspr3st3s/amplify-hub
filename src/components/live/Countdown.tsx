'use client'

// ===========================================================================
// Amplify Hub · Countdown (Client Component)
// ===========================================================================
// Conta regressiva viva para `live_sessions.scheduled_for`. Usado no Hero do
// Lobby (dashboard), no LessonNextLiveCard e na rota /agenda.
//
// Estados (em ordem temporal):
//   · `> imminentMinutes` → "em 2d 4h 12m" (resolução por minuto)
//   · `≤ imminentMinutes` → "Entrando em 12m 45s" (precisão por segundo)
//   · `≤ 0`               → "Ao vivo agora"
//
// A fonte de "agora" vem de useNowMsEverySecond — um único setInterval
// global compartilhado entre todos os countdowns, registrado via
// useSyncExternalStore (idiomático React 19, sem violar react-hooks/purity).
// ===========================================================================

import { useNowMsEverySecond } from './useClock'

type Props = {
  targetIso: string
  // Limiar (em minutos) para alternar de "dd hh mm" para "Entrando em mm ss".
  imminentMinutes?: number
  className?: string
}

type Diff =
  | { phase: 'far'; days: number; hours: number; minutes: number }
  | { phase: 'imminent'; minutes: number; seconds: number }
  | { phase: 'live' }

function computeDiff(targetMs: number, now: number, imminentMs: number): Diff {
  const diff = targetMs - now
  if (diff <= 0) return { phase: 'live' }

  if (diff <= imminentMs) {
    const totalSec = Math.ceil(diff / 1000)
    return {
      phase: 'imminent',
      minutes: Math.floor(totalSec / 60),
      seconds: totalSec % 60,
    }
  }

  const totalMin = Math.floor(diff / 60_000)
  return {
    phase: 'far',
    days: Math.floor(totalMin / (60 * 24)),
    hours: Math.floor((totalMin % (60 * 24)) / 60),
    minutes: totalMin % 60,
  }
}

export function Countdown({
  targetIso,
  imminentMinutes = 15,
  className,
}: Props) {
  const targetMs = new Date(targetIso).getTime()
  const now = useNowMsEverySecond()
  const imminentMs = imminentMinutes * 60 * 1000

  // SSR / primeiro paint: now === 0 sinaliza que ainda não temos relógio
  // real — mostramos placeholder estável para evitar hydration mismatch.
  if (now === 0 || Number.isNaN(targetMs)) {
    return (
      <span className={className} suppressHydrationWarning>
        —
      </span>
    )
  }

  const diff = computeDiff(targetMs, now, imminentMs)

  if (diff.phase === 'live') {
    return (
      <span className={className} aria-label="Mentoria ao vivo agora">
        Ao vivo agora
      </span>
    )
  }

  if (diff.phase === 'imminent') {
    return (
      <span className={className}>
        Entrando em {diff.minutes}m {String(diff.seconds).padStart(2, '0')}s
      </span>
    )
  }

  const parts: string[] = []
  if (diff.days > 0) parts.push(`${diff.days}d`)
  if (diff.hours > 0 || diff.days > 0) parts.push(`${diff.hours}h`)
  parts.push(`${diff.minutes}m`)

  return <span className={className}>em {parts.join(' ')}</span>
}

// Helper compartilhado: janela em que o botão "Entrar na sala" abre antes
// do horário agendado.
export const ROOM_OPEN_LEAD_MS = 15 * 60 * 1000
