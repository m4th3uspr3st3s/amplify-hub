import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

/**
 * Surface / Card · DS Universal §2.4 + §3.3.
 * Elevação por borda + background — sem box-shadow estrutural (§1.5).
 *
 * Variantes:
 * - `surface`  → padrão (radius-md, border-default)
 * - `elevated` → bg elevado (radius-md, border-strong)
 * - `card`     → dashboard card (radius-lg, borda sutil, animate-card-in)
 *
 * `interactive` ativa o hover-lift (KpiCard pattern §2.11): translateY −3px,
 * borda bronze 15%, deep shadow só quando o usuário hover'a — única exceção
 * permitida ao banimento de sombras.
 */
type SurfaceProps = HTMLAttributes<HTMLDivElement> & {
  variant?: 'surface' | 'elevated' | 'card'
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
        'transition-all duration-(--duration-normal) ease-(--ease-out)',
        variant === 'surface' &&
          'rounded-md border border-(--color-border-default) bg-(--color-bg-surface)',
        variant === 'elevated' &&
          'rounded-md border border-(--color-border-strong) bg-(--color-bg-elevated)',
        variant === 'card' &&
          'rounded-xl border border-(--color-border-subtle) bg-(--color-bg-surface) animate-card-in',
        interactive &&
          'hover:-translate-y-[3px] hover:border-(--color-bronze-400)/15 hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)]',
        className,
      )}
      {...props}
    />
  )
}
