import { notFound, redirect } from 'next/navigation'
import { StreamRoom } from '@/components/live/StreamRoom'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Sala ao vivo · Amplify Hub',
}

export default async function LiveRoomPage({
  params,
}: {
  params: Promise<{ liveSessionId: string }>
}) {
  const { liveSessionId } = await params

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // RLS de live_sessions exige entitlement na track do módulo pai. Se a
  // query devolve null, o aluno não tem acesso (ou a sessão não existe) —
  // tratamos como 404 para não vazar a existência do recurso.
  const { data: liveSession } = await supabase
    .from('live_sessions')
    .select('id, stream_call_id, stream_call_type, title, is_active')
    .eq('id', liveSessionId)
    .maybeSingle()

  if (!liveSession) {
    notFound()
  }

  // PRD §4.2 — stream_call_id armazenado no formato "default:<uuid>".
  // Se vier sem prefixo, caímos para a coluna stream_call_type (default 'default').
  const [parsedType, parsedId] = liveSession.stream_call_id.includes(':')
    ? liveSession.stream_call_id.split(':')
    : [liveSession.stream_call_type, liveSession.stream_call_id]

  return (
    <StreamRoom
      callType={parsedType}
      callId={parsedId}
    />
  )
}
