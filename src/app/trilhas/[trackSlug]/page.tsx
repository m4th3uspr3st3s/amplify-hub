// ===========================================================================
// Amplify Hub · /trilhas/[trackSlug] — lista de módulos da trilha
// ===========================================================================
// Drill-down nível 1. RLS já filtra por entitlement; admin vê tudo (incluindo
// módulos com published_at = null) graças ao bypass de 0003. Marcamos esses
// como "Em rascunho" para evitar confusão visual.
// ===========================================================================

import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ChevronRight, ArrowUpRight, Lock } from 'lucide-react'
import { Surface } from '@/components/ui/Surface'
import { createClient } from '@/lib/supabase/server'
import { TRACK_LABELS, TRACK_TAGLINES, urlSlugToTrack } from '@/lib/tracks'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ trackSlug: string }>
}) {
  const { trackSlug } = await params
  const track = urlSlugToTrack(trackSlug)
  return {
    title: track
      ? `${TRACK_LABELS[track]} · Amplify Hub`
      : 'Trilha · Amplify Hub',
  }
}

export default async function TrackPage({
  params,
}: {
  params: Promise<{ trackSlug: string }>
}) {
  const { trackSlug } = await params
  const track = urlSlugToTrack(trackSlug)
  if (!track) notFound()

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const isAdmin = user.app_metadata?.admin === true

  // RLS sem admin retorna apenas modules publicados E entitled. Com admin,
  // retorna todos da track (bypass via 0003_admin_rls_bypass).
  const { data: modules, error } = await supabase
    .from('modules')
    .select('id, slug, title, description, order_index, published_at')
    .eq('track', track)
    .order('order_index', { ascending: true })

  if (error) {
    throw error
  }

  if (!modules || modules.length === 0) {
    notFound()
  }

  const trackLabel = TRACK_LABELS[track]
  const tagline = TRACK_TAGLINES[track]
  const publishedCount = modules.filter((m) => m.published_at !== null).length

  return (
    <main className="mx-auto max-w-5xl px-5 py-10 md:px-8 md:py-14">
      <nav
        aria-label="Trilha de navegação"
        className="mb-8 flex items-center gap-2 font-sans text-xs uppercase tracking-[0.18em] text-(--color-text-muted)"
      >
        <Link
          href="/dashboard"
          className="min-h-11 inline-flex items-center transition-colors duration-(--duration-fast) ease-(--ease-std) hover:text-(--color-text-primary)"
        >
          Lobby
        </Link>
        <ChevronRight className="size-3.5 opacity-60" aria-hidden />
        <span className="text-(--color-text-secondary)">{trackLabel}</span>
      </nav>

      <header className="mb-10 space-y-3">
        <p className="label-section">Trilha</p>
        <h1 className="font-serif text-3xl font-semibold leading-snug tracking-tight md:text-4xl">
          {trackLabel}
        </h1>
        <p className="font-sans text-sm text-(--color-text-secondary) md:text-base">
          {tagline}
        </p>
        <p className="font-sans text-xs text-(--color-text-muted)">
          {publishedCount} de {modules.length} módulos publicados
          {isAdmin ? ' · modo admin: visualizando rascunhos' : ''}
        </p>
      </header>

      <ul role="list" className="space-y-3">
        {modules.map((mod, idx) => {
          const isDraft = mod.published_at === null
          const href = `/trilhas/${trackSlug}/${mod.slug}`

          return (
            <li key={mod.id}>
              <Link
                href={href}
                className="group block focus-visible:outline-none"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <Surface
                  variant="card"
                  interactive
                  className="relative p-5 group-focus-visible:border-(--color-border-focus) md:p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-center gap-2 font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-(--color-text-muted)">
                        <span>Módulo {mod.order_index}</span>
                        {isDraft ? (
                          <span
                            className="inline-flex items-center gap-1 rounded-sm border border-(--color-border-default) px-2 py-0.5 text-(--color-text-tertiary)"
                            title="Visível apenas para admins até a publicação"
                          >
                            <Lock className="size-3" strokeWidth={1.5} />
                            Em rascunho
                          </span>
                        ) : null}
                      </div>
                      <h2 className="font-serif text-xl font-semibold leading-tight tracking-tight md:text-2xl">
                        {mod.title}
                      </h2>
                      {mod.description ? (
                        <p className="font-sans text-sm text-(--color-text-secondary)">
                          {mod.description}
                        </p>
                      ) : null}
                    </div>

                    <ArrowUpRight
                      className="size-5 shrink-0 text-(--color-text-muted) transition-transform duration-(--duration-fast) ease-(--ease-std) group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-(--color-text-primary)"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                  </div>
                </Surface>
              </Link>
            </li>
          )
        })}
      </ul>
    </main>
  )
}
