// ===========================================================================
// Amplify Hub · /trilhas/[trackSlug]/[moduleSlug]/[lessonSlug] — página da aula
// ===========================================================================
// Drill-down nível 3. Renderiza body_md (via MarkdownLite) e a lista de
// materiais de apoio (LessonAssetList — Server Component que busca os assets
// e injeta os AssetDownloadButton com signed URLs on-click).
// ===========================================================================

import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ChevronRight, Lock } from 'lucide-react'
import { LessonAssetList } from '@/components/lesson/LessonAssetList'
import { MarkdownLite } from '@/components/lesson/MarkdownLite'
import { Surface } from '@/components/ui/Surface'
import { createClient } from '@/lib/supabase/server'
import { TRACK_LABELS, urlSlugToTrack } from '@/lib/tracks'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    trackSlug: string
    moduleSlug: string
    lessonSlug: string
  }>
}) {
  const { lessonSlug } = await params
  return {
    title: `Aula · Amplify Hub`,
    other: { 'amplify:lesson-slug': lessonSlug },
  }
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{
    trackSlug: string
    moduleSlug: string
    lessonSlug: string
  }>
}) {
  const { trackSlug, moduleSlug, lessonSlug } = await params
  const track = urlSlugToTrack(trackSlug)
  if (!track) notFound()

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const isAdmin = user.app_metadata?.admin === true

  // Resolve módulo + aula em duas queries (RLS aplica entitlement em cada).
  // Optamos por não fazer JOIN aninhado em select() para manter os tipos
  // explícitos e o erro mais legível.
  const { data: moduleRow } = await supabase
    .from('modules')
    .select('id, slug, title, order_index, published_at, track')
    .eq('slug', moduleSlug)
    .eq('track', track)
    .maybeSingle()

  if (!moduleRow) notFound()

  const { data: lesson } = await supabase
    .from('lessons')
    .select('id, slug, title, body_md, order_index, published_at')
    .eq('module_id', moduleRow.id)
    .eq('slug', lessonSlug)
    .maybeSingle()

  if (!lesson) notFound()

  const trackLabel = TRACK_LABELS[track]
  const lessonIsDraft = lesson.published_at === null

  return (
    <main className="mx-auto max-w-3xl px-5 py-10 md:px-8 md:py-14">
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
        <Link
          href={`/trilhas/${trackSlug}/${moduleSlug}`}
          className="min-h-11 inline-flex items-center transition-colors duration-(--duration-fast) ease-(--ease-std) hover:text-(--color-text-primary)"
        >
          {moduleRow.title}
        </Link>
        <ChevronRight className="size-3.5 opacity-60" aria-hidden />
        <span className="text-(--color-text-secondary)">{lesson.title}</span>
      </nav>

      <header className="mb-10 space-y-3">
        <p className="label-section">
          Módulo {moduleRow.order_index} · Aula {lesson.order_index + 1}
        </p>
        <h1 className="font-serif text-3xl font-semibold leading-snug tracking-tight md:text-4xl">
          {lesson.title}
        </h1>
        {lessonIsDraft && isAdmin ? (
          <p className="inline-flex items-center gap-1 font-sans text-xs uppercase tracking-[0.18em] text-(--color-text-muted)">
            <Lock className="size-3.5" strokeWidth={1.5} />
            Em rascunho · visível apenas para admins
          </p>
        ) : null}
      </header>

      {lesson.body_md ? (
        <Surface variant="card" className="mb-10 p-6 md:p-8">
          <MarkdownLite source={lesson.body_md} />
        </Surface>
      ) : null}

      <section aria-labelledby="materials-heading" className="space-y-4">
        <h2
          id="materials-heading"
          className="font-serif text-xl font-semibold tracking-tight"
        >
          Materiais de apoio
        </h2>
        <LessonAssetList lessonId={lesson.id} />
      </section>
    </main>
  )
}
