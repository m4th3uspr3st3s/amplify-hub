// ===========================================================================
// Amplify Hub · TrackBadge (Server Component)
// ===========================================================================
// Etiqueta visual para identificar a trilha de uma live na agenda unificada
// (Lote 4 §2). Cores ancoradas no DS Universal:
//   · sage   → trilhas avançadas (Atlas, AmpliSquad)
//   · bronze → trilhas de fundamentos (Amplify, DMB, IMAGO)
// ===========================================================================

import { cn } from '@/lib/cn'
import { TRACK_LABELS, type Track } from '@/lib/tracks'

const TRACK_TONE: Record<Track, 'sage' | 'bronze'> = {
  protocolo_amplify: 'bronze',
  protocolo_atlas: 'sage',
  dmb: 'bronze',
  imago: 'bronze',
  amplisquad: 'sage',
}

type Props = {
  track: Track
  className?: string
}

export function TrackBadge({ track, className }: Props) {
  const tone = TRACK_TONE[track]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5',
        'font-sans text-[10px] font-semibold uppercase tracking-[0.18em]',
        tone === 'bronze' &&
          'border-(--color-bronze-400)/35 text-(--color-bronze-400)',
        tone === 'sage' && 'border-white/15 text-(--color-text-secondary)',
        className,
      )}
      style={
        tone === 'sage'
          ? {
              backgroundColor: 'rgba(138, 164, 152, 0.10)',
              borderColor: 'rgba(138, 164, 152, 0.45)',
              color: '#b6cdc1',
            }
          : undefined
      }
    >
      <span
        aria-hidden
        className="inline-block size-1.5 rounded-full"
        style={{
          background: tone === 'bronze' ? 'var(--color-bronze-400)' : '#8aa498',
        }}
      />
      {TRACK_LABELS[track]}
    </span>
  )
}
