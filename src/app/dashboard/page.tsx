import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  CalendarDays,
  Clock,
} from 'lucide-react'
import { TopNav } from '@/components/layout/TopNav'
import { Countdown } from '@/components/live/Countdown'
import { EnterRoomButton } from '@/components/live/EnterRoomButton'
import { Surface } from '@/components/ui/Surface'
import { TrackTabs } from '@/components/dashboard/TrackTabs'
import { createClient } from '@/lib/supabase/server'
import { cutoffIsoHoursAgo } from '@/lib/time'
import { TRACK_LABELS, type Track } from '@/lib/tracks'

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

const SHORT_DATE_FMT = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'short',
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Sao_Paulo',
})

function formatScheduledFor(iso: string) {
  const parts = DATE_FMT.format(new Date(iso))
  return parts.replace(/,\s*(\d{2}:\d{2})$/, ' · $1')
}

function formatScheduledShort(iso: string) {
  return SHORT_DATE_FMT.format(new Date(iso)).replace(',', ' ·')
}

function formatGreetingName(fullName: string | null) {
  if (!fullName) return null
  const first = fullName.trim().split(/\s+/)[0]
  if (!first) return null
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase()
}

type TrackCard = {
  slug: string
  label: React.ReactNode
  description: string
  badge: string
}

function TrackGrid({ tracks }: { tracks: readonly TrackCard[] }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {tracks.map((track, idx) => (
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
  )
}

// A query traz `lessons.modules.track` para que possamos linkar
// "Ver calendário completo" para a trilha correta da próxima live e
// renderizar a track de origem em cada item da lista compacta.
type UpcomingSession = {
  id: string
  title: string
  scheduled_for: string
  duration_minutes: number
  is_active: boolean
  lessons: {
    title: string
    modules: {
      title: string
      track: Track
    } | null
  } | null
}

function flattenLessonRel(
  raw: NonNullable<UpcomingSession['lessons']> | NonNullable<UpcomingSession['lessons']>[] | null,
): UpcomingSession['lessons'] {
  if (!raw) return null
  return Array.isArray(raw) ? (raw[0] ?? null) : raw
}

function flattenModuleRel(
  raw:
    | NonNullable<NonNullable<UpcomingSession['lessons']>['modules']>
    | NonNullable<NonNullable<UpcomingSession['lessons']>['modules']>[]
    | null,
): NonNullable<UpcomingSession['lessons']>['modules'] {
  if (!raw) return null
  return Array.isArray(raw) ? (raw[0] ?? null) : raw
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

  // app_metadata é gerenciado via service role / Supabase Studio; user_metadata
  // é editável pelo próprio usuário. Para claim de admin, usamos sempre
  // app_metadata (PRD §4.2 — RLS de live_sessions/modules referencia este claim).
  const isAdmin = user.app_metadata?.admin === true

  // Cutoff: 2h atrás. Mantém visíveis lives que acabaram de começar (a sala
  // em /aulas/[id] continua sendo a fonte da verdade durante o ao-vivo).
  const cutoffIso = cutoffIsoHoursAgo(2)

  const [profileRes, upcomingRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle(),
    supabase
      .from('live_sessions')
      .select(
        'id, title, scheduled_for, duration_minutes, is_active, lessons(title, modules(title, track))',
      )
      .gte('scheduled_for', cutoffIso)
      .order('scheduled_for', { ascending: true })
      .limit(3),
  ])

  const greetingName = formatGreetingName(profileRes.data?.full_name ?? null)
  const upcomingRaw = (upcomingRes.data ?? []) as unknown as UpcomingSession[]
  const upcoming = upcomingRaw.map((row) => {
    const lesson = flattenLessonRel(row.lessons)
    const moduleEntity = lesson ? flattenModuleRel(lesson.modules) : null
    return {
      ...row,
      lessons: lesson ? { ...lesson, modules: moduleEntity } : null,
    }
  })

  const heroSession = upcoming[0] ?? null
  const restSessions = upcoming.slice(1)

  return (
    <div className="min-h-screen">
      <TopNav />

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
        <section
          aria-labelledby="next-live-heading"
          className="space-y-5"
        >
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
                <p
                  className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em]"
                  style={{ color: 'rgba(201,164,122,0.85)' }}
                >
                  {heroSession?.is_active
                    ? 'Ao vivo agora'
                    : 'Próxima mentoria ao vivo'}
                </p>

                {heroSession?.lessons?.modules ? (
                  <p className="font-sans text-sm font-medium text-(--color-bronze-400)">
                    {TRACK_LABELS[heroSession.lessons.modules.track]} ·{' '}
                    {heroSession.lessons.modules.title}
                  </p>
                ) : null}

                <h2
                  id="next-live-heading"
                  className="font-serif text-2xl font-semibold leading-tight tracking-tight md:text-3xl"
                >
                  {heroSession
                    ? heroSession.title
                    : 'Nenhuma mentoria agendada no momento.'}
                </h2>

                {heroSession ? (
                  <>
                    <dl className="flex flex-wrap gap-x-8 gap-y-2 font-sans text-sm text-(--color-text-secondary)">
                      <div className="flex items-center gap-2">
                        <CalendarClock
                          className="size-4 text-(--color-text-muted)"
                          strokeWidth={1.5}
                          aria-hidden
                        />
                        <dt className="sr-only">Quando</dt>
                        <dd>{formatScheduledFor(heroSession.scheduled_for)}</dd>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock
                          className="size-4 text-(--color-text-muted)"
                          strokeWidth={1.5}
                          aria-hidden
                        />
                        <dt className="sr-only">Duração</dt>
                        <dd>{heroSession.duration_minutes} minutos</dd>
                      </div>
                    </dl>
                    <p className="font-sans text-sm text-(--color-bronze-400)">
                      <Countdown targetIso={heroSession.scheduled_for} />
                    </p>
                  </>
                ) : (
                  <p className="font-sans text-sm text-(--color-text-muted)">
                    Avisaremos por e-mail quando uma nova mentoria for marcada.
                  </p>
                )}
              </div>

              <div className="md:min-w-64">
                {heroSession ? (
                  <EnterRoomButton
                    liveSessionId={heroSession.id}
                    scheduledForIso={heroSession.scheduled_for}
                    isActive={heroSession.is_active}
                    fullWidth
                  />
                ) : null}
              </div>
            </div>
          </Surface>

          {/* Lista compacta · próximas mentorias (itens 2 e 3) */}
          {restSessions.length > 0 ? (
            <div className="space-y-2">
              <p className="label-section">Em breve</p>
              <ul role="list" className="space-y-2">
                {restSessions.map((session) => {
                  const moduleTitle = session.lessons?.modules?.title
                  const trackLabel = session.lessons?.modules
                    ? TRACK_LABELS[session.lessons.modules.track]
                    : null
                  return (
                    <li key={session.id}>
                      <Surface
                        variant="surface"
                        className="flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3.5"
                      >
                        <div className="min-w-0 flex-1">
                          {trackLabel || moduleTitle ? (
                            <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-(--color-text-muted)">
                              {[trackLabel, moduleTitle]
                                .filter(Boolean)
                                .join(' · ')}
                            </p>
                          ) : null}
                          <p className="font-serif text-base font-semibold tracking-tight text-(--color-text-primary)">
                            {session.title}
                          </p>
                        </div>
                        <p className="font-sans text-xs text-(--color-text-secondary)">
                          {formatScheduledShort(session.scheduled_for)}
                        </p>
                        <p className="font-sans text-xs text-(--color-bronze-400)">
                          <Countdown targetIso={session.scheduled_for} />
                        </p>
                      </Surface>
                    </li>
                  )
                })}
              </ul>
            </div>
          ) : null}

          {/* Link para o calendário global unificado (Lote 4 §3) */}
          <div className="flex justify-end">
            <Link
              href="/agenda"
              className="inline-flex min-h-11 items-center gap-1.5 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-(--color-text-secondary) transition-colors duration-(--duration-fast) ease-(--ease-std) hover:text-(--color-text-primary)"
            >
              <CalendarDays className="size-4" strokeWidth={1.5} aria-hidden />
              Ver calendário completo
              <ArrowRight className="size-3.5" strokeWidth={1.75} aria-hidden />
            </Link>
          </div>
        </section>

        {/* §3.3 Trilhas — Admin (Dr. Matheus) navega entre Atlas e Amplify
            via abas; aluno comum vê apenas Fundamentos. A barreira real de
            acesso a conteúdo (módulos, aulas, assets) é a RLS no Supabase. */}
        {isAdmin ? (
          <section aria-label="Trilhas">
            <div className="mb-6">
              <p className="label-section mb-2">Trilhas</p>
              <h2 className="font-serif text-2xl font-semibold leading-tight tracking-tight md:text-3xl">
                Acesso completo (modo admin)
              </h2>
            </div>
            <TrackTabs
              advanced={<TrackGrid tracks={ADVANCED_TRACKS} />}
              foundation={<TrackGrid tracks={FOUNDATION_TRACKS} />}
            />
          </section>
        ) : (
          <section aria-labelledby="foundation-heading" className="space-y-6">
            <div className="flex items-end justify-between">
              <div>
                <p className="label-section mb-2">Trilhas</p>
                <h2
                  id="foundation-heading"
                  className="font-serif text-2xl font-semibold leading-tight tracking-tight md:text-3xl"
                >
                  Seu acesso ativo
                </h2>
              </div>
            </div>
            <TrackGrid tracks={FOUNDATION_TRACKS} />
          </section>
        )}
      </main>
    </div>
  )
}
