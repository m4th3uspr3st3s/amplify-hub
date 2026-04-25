import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

/**
 * Surface / Card institucional (DS Universal §2.4).
 * Elevação por `border + background`. Sem box-shadow estrutural.
 * Transição suave de borda no hover (uso opcional via `interactive`).
 */
type SurfaceProps = HTMLAttributes<HTMLDivElement> & {
  variant?: 'surface' | 'elevated'
  interactive?: boolean
}

export function Surface({
  className,
  variant = 'surface',
  interactive = false,
  ...props
}: SurfaceProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-(--color-border-default)',
        variant === 'surface' && 'bg-(--color-bg-surface)',
        variant === 'elevated' && 'bg-(--color-bg-elevated)',
        interactive &&
          'transition-colors duration-200 ease-out hover:border-(--color-border-strong)',
        className,
      )}
      {...props}
    />
  )
}
