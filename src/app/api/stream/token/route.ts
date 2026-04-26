import { NextResponse } from 'next/server'
import { StreamClient } from '@stream-io/node-sdk'
import { createClient } from '@/lib/supabase/server'

// PRD §5.2 — token Stream gerado server-only com STREAM_API_SECRET.
// Edge Runtime quebra o Node SDK (jsonwebtoken usa `crypto` nativo).
export const runtime = 'nodejs'

export async function POST() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY
  const apiSecret = process.env.STREAM_API_SECRET

  if (!apiKey || !apiSecret) {
    return NextResponse.json(
      { error: 'stream_credentials_missing' },
      { status: 500 },
    )
  }

  // Profile já é espelhado por trigger handle_new_user; maybeSingle evita
  // 406 se o profile ainda não tiver sido criado por algum motivo.
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .maybeSingle()

  const name = profile?.full_name?.trim() || user.email || 'Aluno Amplify'
  const image = profile?.avatar_url ?? undefined

  const stream = new StreamClient(apiKey, apiSecret)

  // Stream exige que o usuário exista antes de receber token. Upsert é
  // idempotente — chamadas repetidas só atualizam name/image.
  await stream.upsertUsers([
    {
      id: user.id,
      name,
      image,
      role: 'user',
    },
  ])

  // PRD §5.2 — validade curta (1h), claims mínimas (user_id apenas; name e
  // image vivem no perfil Stream upsertado acima).
  const token = stream.generateUserToken({
    user_id: user.id,
    validity_in_seconds: 60 * 60,
  })

  return NextResponse.json({
    apiKey,
    token,
    userId: user.id,
    name,
    image,
  })
}
