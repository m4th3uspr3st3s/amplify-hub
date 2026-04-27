// ===========================================================================
// Amplify Hub · Helpers de Trilha (track ↔ URL slug)
// ===========================================================================
// O CHECK constraint em public.modules.track usa underscore
// (`protocolo_amplify`, `protocolo_atlas`, …), mas as URLs públicas usam
// hífen (`/trilhas/protocolo-amplify`). Centralizamos a conversão aqui para
// evitar drift entre dashboard, rotas e RLS.
// ===========================================================================

export const TRACKS = [
  'protocolo_amplify',
  'protocolo_atlas',
  'dmb',
  'imago',
  'amplisquad',
] as const

export type Track = (typeof TRACKS)[number]

export const TRACK_LABELS: Record<Track, string> = {
  protocolo_amplify: 'Protocolo Amplify',
  protocolo_atlas: 'Protocolo Atlas',
  dmb: 'DMB™',
  imago: 'IMAGO™ Kit',
  amplisquad: 'AmpliSquad',
}

export const TRACK_TAGLINES: Record<Track, string> = {
  protocolo_amplify:
    'Mentoria em 6 módulos para arquitetar autonomia clínica com IA.',
  protocolo_atlas:
    'Formação avançada em 9 módulos: operação de sistemas proprietários em escala clínica.',
  dmb: 'Documentação Médica Blindada — sistema de compliance documental.',
  imago: 'Identidade visual com Inteligência Artificial.',
  amplisquad: 'Squad próprio de agentes especializados.',
}

export function urlSlugToTrack(slug: string): Track | null {
  const candidate = slug.replace(/-/g, '_')
  return (TRACKS as readonly string[]).includes(candidate)
    ? (candidate as Track)
    : null
}

export function trackToUrlSlug(track: Track): string {
  return track.replace(/_/g, '-')
}
