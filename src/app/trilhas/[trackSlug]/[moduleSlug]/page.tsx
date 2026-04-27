// ===========================================================================
// Amplify Hub · /trilhas/[trackSlug]/[moduleSlug] — lista de lessons
// ===========================================================================
// Drill-down nível 2. Resolve módulo via slug, lista lessons ordenadas por
// order_index. RLS de lessons herda de modules — aluno só vê o que tem
// entitlement; admin vê tudo via 0003_admin_rls_bypass.
// ===========================================================================

import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowUpRight, ChevronRight, Lock } from 'lucide-react'
import { Surface } from '@/components/ui/Surface'
import { createClient } from '@/lib/supabase/server'
import { TRACK_LABELS, urlSlugToTrack } from '@/lib/tracks'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ trackSlug: string; moduleSlug: string }>
}) {
  const { moduleSlug } = await params
  return {
    title: `Módulo · Amplify Hub`,
    other: { 'amplify:module-slug': moduleSlug },
  }
}

export default async function ModulePage({
  params,
}: {
  params: Promise<{ trackSlug: string; moduleSlug: string }>
}) {
  const { trackSlug, moduleSlug } = await params
  const track = urlSlugToTrack(trackSlug)
  if (!track) notFound()

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const isAdmin = user.app_metadata?.admin === true

  const { data: moduleRow } = await supabase
    .from('modules')
    .select('id, slug, title, description, order_index, published_at, track')
    .eq('slug', moduleSlug)
    .eq('track', track)
    .maybeSingle()

  if (!moduleRow) notFound()

  const { data: lessons } = await supabase
    .from('lessons')
    .select('id, slug, title, body_md, order_index, published_at')
    .eq('module_id', moduleRow.id)
    .order('order_index', { ascending: true })

  if (!lessons) notFound()

  const trackLabel = TRACK_LABELS[track]
  const moduleIsDraft = moduleRow.published_at === null

  return (
    <main className="mx-auto max-w-5xl px-5 py-10 md:px-8 md:py-14">
      <nav
        aria-label="Trilha de navegação"
        className="mb-8 flex flex-wrap items-center gap-2 font-sans text-xs uppercase tracking-[0.18em] text-(--color-text-muted)"
      >
        <Link
          href="/dashboard"
          className="min-h-11 inline-flex items-center transition-colors duration-(--duration-fast) ease-(--ease-std) hover:text-(--color-text-primary)"
        >
          Lobby
        </Link>
        <ChevronRight className="size-3.5 opacity-60" aria-hidden />
        <Link
          href={`/trilhas/${trackSlug}`}
          className="min-h-11 inline-flex items-center transition-colors duration-(--duration-fast) ease-(--ease-std) hover:text-(--color-text-primary)"
        >
          {trackLabel}
        </Link>
        <ChevronRight className="size-3.5 opacity-60" aria-hidden />
        <span className="text-(--color-text-secondary)">{moduleRow.title}</span>
      </nav>

      <header className="mb-10 space-y-3">
        <p className="label-section">Módulo {moduleRow.order_index}</p>
        <h1 className="font-serif text-3xl font-semibold leading-snug tracking-tight md:text-4xl">
          {moduleRow.title}
        </h1>
        {moduleRow.description ? (
          <p className="font-sans text-sm text-(--color-text-secondary) md:text-base">
            {moduleRow.description}
          </p>
        ) : null}
        {moduleIsDraft && isAdmin ? (
          <p className="font-sans text-xs text-(--color-text-muted)">
            Modo admin · este módulo ainda não está publicado para os alunos.
          </p>
        ) : null}
      </header>

      <section aria-labelledby="lessons-heading" className="space-y-4">
        <h2
          id="lessons-heading"
          className="font-serif text-xl font-semibold tracking-tight"
        >
          Aulas
        </h2>

        {lessons.length === 0 ? (
          <Surface
            variant="surface"
            className="p-6 font-sans text-sm text-(--color-text-muted)"
          >
            Nenhuma aula publicada neste módulo ainda.
          </Surface>
        ) : (
          <ul role="list" className="space-y-3">
            {lessons.map((lesson, idx) => {
              const isDraft = lesson.published_at === null
              const href = `/trilhas/${trackSlug}/${moduleSlug}/${lesson.slug}`

              return (
                <li key={lesson.id}>
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
                            <span>Aula {lesson.order_index + 1}</span>
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
                          <h3 className="font-serif text-lg font-semibold leading-tight tracking-tight md:text-xl">
                            {lesson.title}
                          </h3>
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
        )}
      </section>
    </main>
  )
}
