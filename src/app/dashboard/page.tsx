import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  ArrowUpRight,
  CalendarClock,
  CircleUser,
  Clock,
  Lock,
  Radio,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Surface } from '@/components/ui/Surface'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Lobby · Amplify Hub',
}

const ADVANCED_TRACKS = [
  {
    slug: 'protocolo-atlas',
    label: 'Protocolo Atlas',
    description:
      'Formação avançada em 9 módulos: operação de sistemas proprietários (Hermes, Vault, Claude Code) em escala clínica.',
    badge: 'Avançado · 9 módulos',
  },
] as const

const FOUNDATION_TRACKS = [
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

const DATE_FMT = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Sao_Paulo',
})

function formatScheduledFor(iso: string) {
  // "Quinta-feira, 30 de abril, 20:00" → padroniza com "·" entre data e hora.
  const parts = DATE_FMT.format(new Date(iso))
  return parts.replace(/,\s*(\d{2}:\d{2})$/, ' · $1')
}

function formatGreetingName(fullName: string | null) {
  if (!fullName) return null
  const first = fullName.trim().split(/\s+/)[0]
  if (!first) return null
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase()
}

export default async function DashboardPage() {
  const supabase = await createClient()

  // Defesa em profundidade: o proxy.ts já redireciona, mas o Data Access Layer
  // do Next.js 16 (authentication.md) exige verificação no Server Component.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [profileRes, liveRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle(),
    supabase
      .from('live_sessions')
      .select(
        'id, title, scheduled_for, duration_minutes, stream_call_id, lessons(title, modules(title, track))',
      )
      .eq('is_active', true)
      .order('scheduled_for', { ascending: true })
      .limit(1)
      .maybeSingle(),
  ])

  const greetingName = formatGreetingName(profileRes.data?.full_name ?? null)
  const activeSession = liveRes.data
  const lesson = Array.isArray(activeSession?.lessons)
    ? activeSession?.lessons[0]
    : activeSession?.lessons
  const moduleEntity = Array.isArray(lesson?.modules)
    ? lesson?.modules[0]
    : lesson?.modules

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
            {greetingName
              ? `Bem-vindo de volta, ${greetingName}.`
              : 'Bem-vindo de volta.'}
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
                {/* §2.5 label-section em bronze para destaque de "ao vivo" / "próximo" */}
                <p
                  className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em]"
                  style={{ color: 'rgba(201,164,122,0.85)' }}
                >
                  {activeSession ? 'Ao vivo agora' : 'Próxima mentoria ao vivo'}
                </p>

                {activeSession && moduleEntity ? (
                  <p className="font-sans text-sm font-medium text-(--color-bronze-400)">
                    {moduleEntity.title}
                  </p>
                ) : null}

                <h2
                  id="next-live-heading"
                  className="font-serif text-2xl font-semibold leading-tight tracking-tight md:text-3xl"
                >
                  {activeSession
                    ? activeSession.title
                    : 'Nenhuma sessão ao vivo neste momento.'}
                </h2>

                {activeSession ? (
                  <dl className="flex flex-wrap gap-x-8 gap-y-2 font-sans text-sm text-(--color-text-secondary)">
                    <div className="flex items-center gap-2">
                      <CalendarClock
                        className="size-4 text-(--color-text-muted)"
                        strokeWidth={1.5}
                        aria-hidden
                      />
                      <dt className="sr-only">Quando</dt>
                      <dd>{formatScheduledFor(activeSession.scheduled_for)}</dd>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock
                        className="size-4 text-(--color-text-muted)"
                        strokeWidth={1.5}
                        aria-hidden
                      />
                      <dt className="sr-only">Duração</dt>
                      <dd>{activeSession.duration_minutes} minutos</dd>
                    </div>
                  </dl>
                ) : (
                  <p className="font-sans text-sm text-(--color-text-muted)">
                    Avisaremos por e-mail quando a próxima aula entrar no ar.
                  </p>
                )}
              </div>

              <div className="md:min-w-64">
                {activeSession ? (
                  <Link
                    href={`/aulas/${activeSession.id}`}
                    className="btn-primary w-full"
                  >
                    <Radio className="size-4" aria-hidden />
                    Entrar na sala
                  </Link>
                ) : (
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
                )}
              </div>
            </div>
          </Surface>
        </section>

        {/* §3.3 Hierarquia de trilhas — Avançado primeiro, Fundamentos depois.
            A query de live_sessions/RLS continua intacta: o agrupamento é
            estritamente visual. Aluno só vê o card se o RLS devolver módulos
            da trilha correspondente. */}
        <section aria-labelledby="advanced-heading" className="space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="label-section mb-2">Avançado</p>
              <h2
                id="advanced-heading"
                className="font-serif text-2xl font-semibold leading-tight tracking-tight md:text-3xl"
              >
                Formação Avançada
              </h2>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {ADVANCED_TRACKS.map((track, idx) => (
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

        <section aria-labelledby="foundation-heading" className="space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="label-section mb-2">Fundamentos</p>
              <h2
                id="foundation-heading"
                className="font-serif text-2xl font-semibold leading-tight tracking-tight md:text-3xl"
              >
                Fundamentos &amp; Linha Amplify
              </h2>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {FOUNDATION_TRACKS.map((track, idx) => (
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
