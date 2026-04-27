// ===========================================================================
// Amplify Hub · LessonNextLiveCard (Server Component)
// ===========================================================================
// Card "Próxima mentoria" exibido logo abaixo do título de uma lesson e
// acima do body_md (Lote 2 §2.2). Faz uma query escopada a `lesson_id`
// pegando a primeira live com scheduled_for >= now() - 2h (mantém visível
// uma sessão que acabou de começar).
//
// Se não houver mentoria agendada, o componente devolve null (a UI da
// página decide se renderiza um placeholder editorial em outro nível).
// ===========================================================================

import { CalendarClock, Clock } from 'lucide-react'
import { Countdown } from '@/components/live/Countdown'
import { EnterRoomButton } from '@/components/live/EnterRoomButton'
import { Surface } from '@/components/ui/Surface'
import { createClient } from '@/lib/supabase/server'
import { cutoffIsoHoursAgo } from '@/lib/time'

const DATE_FMT = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Sao_Paulo',
})

function formatScheduledFor(iso: string) {
  const parts = DATE_FMT.format(new Date(iso))
  return parts.replace(/,\s*(\d{2}:\d{2})$/, ' · $1')
}

type Props = {
  lessonId: string
}

export async function LessonNextLiveCard({ lessonId }: Props) {
  const supabase = await createClient()

  // Cutoff: 2h atrás. Mantém visível uma live que acabou de começar (até a
  // própria sala em /aulas/[id] tomar conta da experiência).
  const cutoffIso = cutoffIsoHoursAgo(2)

  const { data: live } = await supabase
    .from('live_sessions')
    .select('id, title, scheduled_for, duration_minutes, is_active')
    .eq('lesson_id', lessonId)
    .gte('scheduled_for', cutoffIso)
    .order('scheduled_for', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!live) return null

  return (
    <Surface
      variant="card"
      className="relative mb-8 overflow-hidden p-6 md:p-7"
    >
      {/* Accent bar sage no topo — diferencia visualmente do hero do dashboard
          (bronze) sem competir com o título da aula. */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[2px] opacity-70"
        style={{
          background:
            'linear-gradient(90deg, var(--color-sage-400, #8aa498) 0%, transparent 100%)',
        }}
      />

      <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
        <div className="space-y-3">
          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-(--color-text-muted)">
            Próxima mentoria desta aula
          </p>
          <h3 className="font-serif text-xl font-semibold tracking-tight md:text-2xl">
            {live.title}
          </h3>
          <dl className="flex flex-wrap gap-x-6 gap-y-2 font-sans text-sm text-(--color-text-secondary)">
            <div className="flex items-center gap-2">
              <CalendarClock
                className="size-4 text-(--color-text-muted)"
                strokeWidth={1.5}
                aria-hidden
              />
              <dt className="sr-only">Quando</dt>
              <dd>{formatScheduledFor(live.scheduled_for)}</dd>
            </div>
            <div className="flex items-center gap-2">
              <Clock
                className="size-4 text-(--color-text-muted)"
                strokeWidth={1.5}
                aria-hidden
              />
              <dt className="sr-only">Duração</dt>
              <dd>{live.duration_minutes} minutos</dd>
            </div>
          </dl>
          <p className="font-sans text-sm text-(--color-bronze-400)">
            <Countdown targetIso={live.scheduled_for} />
          </p>
        </div>

        <div className="md:min-w-56">
          <EnterRoomButton
            liveSessionId={live.id}
            scheduledForIso={live.scheduled_for}
            isActive={live.is_active}
            fullWidth
          />
        </div>
      </div>
    </Surface>
  )
}
