'use client'

// ===========================================================================
// Amplify Hub · TopNav (Client Component)
// ===========================================================================
// Header sticky com identidade Liquid Glass (DS Universal §3.1, única
// exceção à proibição de shadow §1.5). Substitui o header inline que
// vivia em /dashboard antes da promoção da Agenda como rota global.
//
// Renderiza a brand + abas principais (Lobby, Calendário) com active state
// derivado de usePathname. Mantemos o botão de perfil como placeholder até
// /conta ter sua própria UI.
// ===========================================================================

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarDays, CircleUser, LayoutGrid } from 'lucide-react'
import { cn } from '@/lib/cn'

const TABS = [
  { href: '/dashboard', label: 'Lobby', Icon: LayoutGrid },
  { href: '/agenda', label: 'Calendário', Icon: CalendarDays },
] as const

export function TopNav() {
  const pathname = usePathname()

  return (
    <header
      className="sticky top-0 z-[var(--z-layout)] w-full"
      style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(28px) saturate(160%)',
        WebkitBackdropFilter: 'blur(28px) saturate(160%)',
        borderTop: '1px solid rgba(255,255,255,0.14)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        boxShadow:
          '0 1px 0 rgba(255,255,255,0.07) inset, 0 8px 32px rgba(0,0,0,0.35)',
      }}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5 md:px-8">
        <Link
          href="/dashboard"
          className="font-serif text-xl tracking-tight text-(--color-text-primary)"
        >
          Amplify Hub
        </Link>

        <nav aria-label="Navegação principal" className="flex flex-1 items-center gap-1">
          {TABS.map(({ href, label, Icon }) => {
            const isActive =
              href === '/dashboard'
                ? pathname === '/dashboard' || pathname.startsWith('/dashboard/')
                : pathname === href || pathname.startsWith(`${href}/`)
            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'inline-flex min-h-11 items-center gap-1.5 rounded-md px-3 py-1.5',
                  'font-sans text-xs font-semibold uppercase tracking-[0.18em]',
                  'transition-colors duration-(--duration-fast) ease-(--ease-std)',
                  isActive
                    ? 'bg-white/5 text-(--color-text-primary)'
                    : 'text-(--color-text-tertiary) hover:bg-white/5 hover:text-(--color-text-primary)',
                )}
              >
                <Icon className="size-4" strokeWidth={1.5} aria-hidden />
                {label}
              </Link>
            )
          })}
        </nav>

        <button
          type="button"
          aria-label="Abrir perfil"
          className="inline-flex size-11 items-center justify-center rounded-md border border-(--color-border-default) bg-transparent text-(--color-text-secondary) transition-colors duration-(--duration-fast) ease-(--ease-std) hover:border-(--color-border-strong) hover:bg-white/5 hover:text-(--color-text-primary)"
        >
          <CircleUser className="size-5" strokeWidth={1.5} aria-hidden />
        </button>
      </div>
    </header>
  )
}
