import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

/**
 * Botão institucional Amplify (DS Universal §2.1, §2.2, §2.3).
 * Touch target 44px, sem box-shadow, elevação por borda + bg.
 */
const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 select-none',
    'font-sans font-medium tracking-tight',
    'min-h-11 px-5 rounded-md',
    'transition-[background,border-color,color] duration-150 ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-border-focus) focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-bg-base)',
    'disabled:pointer-events-none disabled:opacity-50',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-(--color-primary) text-(--color-text-primary)',
          'border border-(--color-sage-300)/20',
          'hover:bg-(--color-primary-hover)',
        ],
        ghost: [
          'bg-transparent text-(--color-text-secondary)',
          'border border-(--color-border-default)',
          'hover:border-(--color-border-strong) hover:text-(--color-text-primary)',
        ],
        destructive: [
          'bg-(--color-destructive) text-(--color-text-primary)',
          'border border-transparent',
          'hover:opacity-90',
        ],
        link: [
          'min-h-11 px-2 bg-transparent border-none rounded-none',
          'text-(--color-text-secondary) underline-offset-4 hover:underline hover:text-(--color-text-primary)',
        ],
      },
      size: {
        md: 'text-sm',
        lg: 'min-h-12 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

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
