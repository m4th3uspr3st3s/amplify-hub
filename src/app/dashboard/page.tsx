import Link from 'next/link'
import {
  ArrowUpRight,
  CalendarClock,
  CircleUser,
  Clock,
  Lock,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Surface } from '@/components/ui/Surface'

export const metadata = {
  title: 'Lobby · Amplify Hub',
}

// Dados fictícios — Marco 3 é apenas esqueleto visual.
// Backend (Supabase + Stream) entra no Marco 4.
const NEXT_LIVE = {
  module: 'Protocolo Amplify · Módulo 3',
  title: 'Arquitetura de prompts clínicos para anamnese assistida',
  scheduledForLabel: 'Quinta-feira, 30 de abril · 20h00',
  durationLabel: '90 minutos',
}

const TRACKS = [
  {
    slug: 'protocolo-amplify',
    label: 'Protocolo Amplify',
    description:
      'Mentoria em 6 módulos para arquitetar autonomia clínica com IA.',
    badge: 'Mentoria · 6 módulos',
  },
  {
    slug: 'dmb',
    label: <>DMB&trade;</>,
    description:
      'Documentação Médica Blindada. Sistema de compliance documental.',
    badge: 'Linha Amplify',
  },
  {
    slug: 'imago',
    label: <>IMAGO&trade; Kit</>,
    description: 'Identidade visual com Inteligência Artificial.',
    badge: 'Linha Amplify',
  },
] as const

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      {/* §3.1 TopBar — Liquid Glass (única exceção à proibição de shadow §1.5) */}
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
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8">
          <Link
            href="/dashboard"
            className="font-serif text-xl tracking-tight text-(--color-text-primary)"
          >
            Amplify Hub
          </Link>

          <button
            type="button"
            aria-label="Abrir perfil"
            className="inline-flex size-11 items-center justify-center rounded-md border border-(--color-border-default) bg-transparent text-(--color-text-secondary) transition-colors duration-(--duration-fast) ease-(--ease-std) hover:border-(--color-border-strong) hover:bg-white/5 hover:text-(--color-text-primary)"
          >
            <CircleUser className="size-5" strokeWidth={1.5} aria-hidden />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-14 px-5 py-10 md:px-8 md:py-14">
        {/* §3.2 Page layout — section label + h1 + subtitle */}
        <div>
          <p className="label-section mb-3">Lobby</p>
          <h1 className="font-serif text-3xl font-semibold leading-snug tracking-tight md:text-4xl">
            Bem-vindo de volta.
          </h1>
          <p className="mt-2 font-sans text-[12.5px] text-(--color-text-muted)">
            Sua próxima mentoria, suas trilhas ativas e o estado do seu acesso.
          </p>
        </div>

        {/* §2.11 Hero card com accent bar bronze + cardIn animation */}
        <section aria-labelledby="next-live-heading">
          <Surface
            variant="card"
            className="relative overflow-hidden p-6 md:p-8"
          >
            {/* Accent bar bronze no topo (§2.11) */}
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-[2px] opacity-70"
              style={{
                background:
                  'linear-gradient(90deg, var(--color-bronze-400) 0%, transparent 100%)',
              }}
            />

            <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
              <div className="space-y-4">
                {/* §2.5 label-section em bronze para destaque de "próximo" */}
                <p
                  className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em]"
                  style={{ color: 'rgba(201,164,122,0.85)' }}
                >
                  Próxima mentoria ao vivo
                </p>

                <p className="font-sans text-sm font-medium text-(--color-bronze-400)">
                  {NEXT_LIVE.module}
                </p>

                <h2
                  id="next-live-heading"
                  className="font-serif text-2xl font-semibold leading-tight tracking-tight md:text-3xl"
                >
                  {NEXT_LIVE.title}
                </h2>

                <dl className="flex flex-wrap gap-x-8 gap-y-2 font-sans text-sm text-(--color-text-secondary)">
                  <div className="flex items-center gap-2">
                    <CalendarClock
                      className="size-4 text-(--color-text-muted)"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                    <dt className="sr-only">Quando</dt>
                    <dd>{NEXT_LIVE.scheduledForLabel}</dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock
                      className="size-4 text-(--color-text-muted)"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                    <dt className="sr-only">Duração</dt>
                    <dd>{NEXT_LIVE.durationLabel}</dd>
                  </div>
                </dl>
              </div>

              <div className="md:min-w-64">
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled
                >
                  <Lock className="size-4" aria-hidden />
                  A sala abre 15 minutos antes
                </Button>
              </div>
            </div>
          </Surface>
        </section>

        {/* §3.3 Grade de cards — Trilhas com hover-lift */}
        <section aria-labelledby="tracks-heading" className="space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="label-section mb-2">Trilhas</p>
              <h2
                id="tracks-heading"
                className="font-serif text-2xl font-semibold leading-tight tracking-tight md:text-3xl"
              >
                Seu acesso ativo
              </h2>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {TRACKS.map((track, idx) => (
              <Link
                key={track.slug}
                href={`/trilhas/${track.slug}`}
                className="group block focus-visible:outline-none"
              >
                <Surface
                  variant="card"
                  interactive
                  className="relative h-full p-6 group-focus-visible:border-(--color-border-focus)"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <div className="flex h-full flex-col gap-4">
                    <div className="flex items-start justify-between gap-3">
                      <p
                        className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em]"
                        style={{ color: 'rgba(201,164,122,0.85)' }}
                      >
                        {track.badge}
                      </p>
                      <ArrowUpRight
                        className="size-4 text-(--color-text-muted) transition-transform duration-(--duration-fast) ease-(--ease-std) group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-(--color-text-primary)"
                        strokeWidth={1.5}
                        aria-hidden
                      />
                    </div>

                    <h3 className="font-serif text-2xl font-semibold leading-tight tracking-tight">
                      {track.label}
                    </h3>

                    <p className="font-sans text-sm leading-relaxed text-(--color-text-secondary)">
                      {track.description}
                    </p>

                    <span className="mt-auto inline-flex items-center gap-1.5 font-sans text-xs font-medium uppercase tracking-[0.18em] text-(--color-text-muted) transition-colors duration-(--duration-fast) ease-(--ease-std) group-hover:text-(--color-bronze-400)">
                      Abrir trilha
                    </span>
                  </div>
                </Surface>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
