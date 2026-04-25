import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

/**
 * Input institucional. Borda 1px, sem sombra, fundo surface.
 * Touch target garantido por `min-h-11` (44px) — DS §0.1.
 */
type InputProps = InputHTMLAttributes<HTMLInputElement>

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'block w-full min-h-11 px-4 py-2 rounded-md',
        'bg-(--color-bg-surface) text-(--color-text-primary) placeholder:text-(--color-text-muted)',
        'border border-(--color-border-default)',
        'transition-colors duration-150 ease-out',
        'hover:border-(--color-border-strong)',
        'focus-visible:outline-none focus-visible:border-(--color-border-focus) focus-visible:ring-2 focus-visible:ring-(--color-border-focus) focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-bg-base)',
        'disabled:opacity-50 disabled:pointer-events-none',
        'font-sans text-sm',
        className,
      )}
      {...props}
    />
  )
}
