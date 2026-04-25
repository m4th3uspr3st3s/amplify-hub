import Link from 'next/link'
import { CalendarClock, CircleUser, Clock, Lock } from 'lucide-react'
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
    <div className="min-h-screen bg-(--color-bg-base)">
      {/* ─── Header ─────────────────────────────────────────────────── */}
      <header className="border-b border-(--color-border-default) bg-(--color-bg-base)/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link
            href="/dashboard"
            className="font-serif text-xl tracking-tight text-(--color-text-primary)"
          >
            Amplify Hub
          </Link>

          <button
            type="button"
            aria-label="Perfil"
            className="inline-flex size-11 items-center justify-center rounded-full border border-(--color-border-default) bg-(--color-bg-surface) text-(--color-text-secondary) transition-colors duration-150 ease-out hover:border-(--color-border-strong) hover:text-(--color-text-primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-border-focus) focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-bg-base)"
          >
            <CircleUser className="size-5" aria-hidden />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-16 px-6 py-12">
        {/* ─── Hero · Próxima mentoria ao vivo ───────────────────────── */}
        <section aria-labelledby="next-live-heading" className="space-y-4">
          <p className="font-sans text-xs uppercase tracking-[0.24em] text-(--color-text-muted)">
            Próxima mentoria ao vivo
          </p>

          <Surface
            variant="elevated"
            className="overflow-hidden p-8 md:p-10"
          >
            <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
              <div className="space-y-5">
                <p className="font-sans text-sm font-medium text-(--color-bronze-400)">
                  {NEXT_LIVE.module}
                </p>

                <h2
                  id="next-live-heading"
                  className="font-serif text-3xl leading-tight md:text-4xl"
                >
                  {NEXT_LIVE.title}
                </h2>

                <dl className="flex flex-wrap gap-x-8 gap-y-2 font-sans text-sm text-(--color-text-secondary)">
                  <div className="flex items-center gap-2">
                    <CalendarClock
                      className="size-4 text-(--color-text-muted)"
                      aria-hidden
                    />
                    <dt className="sr-only">Quando</dt>
                    <dd>{NEXT_LIVE.scheduledForLabel}</dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock
                      className="size-4 text-(--color-text-muted)"
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

        {/* ─── Trilhas ───────────────────────────────────────────────── */}
        <section aria-labelledby="tracks-heading" className="space-y-6">
          <div className="flex items-end justify-between">
            <div className="space-y-1">
              <p className="font-sans text-xs uppercase tracking-[0.24em] text-(--color-text-muted)">
                Trilhas
              </p>
              <h2
                id="tracks-heading"
                className="font-serif text-2xl leading-tight md:text-3xl"
              >
                Seu acesso ativo
              </h2>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {TRACKS.map(track => (
              <Link
                key={track.slug}
                href={`/trilhas/${track.slug}`}
                className="group block focus-visible:outline-none"
              >
                <Surface
                  interactive
                  variant="surface"
                  className="h-full p-6 group-focus-visible:border-(--color-border-focus) group-focus-visible:ring-2 group-focus-visible:ring-(--color-border-focus) group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-(--color-bg-base)"
                >
                  <div className="flex h-full flex-col gap-4">
                    <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-(--color-bronze-400)">
                      {track.badge}
                    </p>
                    <h3 className="font-serif text-2xl leading-tight">
                      {track.label}
                    </h3>
                    <p className="font-sans text-sm leading-relaxed text-(--color-text-secondary)">
                      {track.description}
                    </p>
                    <span className="mt-auto font-sans text-sm text-(--color-text-muted) transition-colors duration-150 group-hover:text-(--color-text-primary)">
                      Abrir trilha →
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
