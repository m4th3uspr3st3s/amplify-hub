import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

/**
 * Botão institucional Amplify · DS Universal §2.1 · §2.2 · §2.3.
 * Base de estilo vive em globals.css (.btn-primary / .btn-ghost / .btn-destructive)
 * para garantir consumo correto dos tokens semânticos e do active:scale(0.98).
 */
const buttonVariants = cva(['select-none'], {
  variants: {
    variant: {
      primary: 'btn-primary',
      ghost: 'btn-ghost',
      destructive: 'btn-destructive',
      link: [
        'inline-flex items-center justify-center gap-2',
        'min-h-11 px-2 font-sans text-sm font-medium',
        'text-(--color-text-secondary) underline-offset-4',
        'hover:underline hover:text-(--color-text-primary)',
        'focus-visible:outline-none',
        'transition-colors duration-150 ease-out',
        'disabled:pointer-events-none disabled:opacity-40',
      ],
    },
    size: {
      md: 'text-sm',
      lg: 'min-h-12 text-base',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
})

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { buttonVariants }
