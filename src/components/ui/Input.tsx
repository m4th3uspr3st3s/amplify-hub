import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

/**
 * Input institucional · DS Universal §5.1.
 * Cor de fundo, borda, hover e focus ring bronze (2-layer) vêm de globals.css.
 * O componente apenas aplica sizing + tipografia + touch target 44px.
 */
type InputProps = InputHTMLAttributes<HTMLInputElement>

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'block w-full min-h-11 px-4 py-2',
        'font-sans text-sm',
        'disabled:opacity-40 disabled:pointer-events-none',
        className,
      )}
      {...props}
    />
  )
}
