import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// PKCE callback do Supabase Auth (magic link, OAuth, recovery).
// Magic link envia o usuário para esta rota com ?code=...&next=/dashboard
// (ou ?error=...&error_code=otp_expired em caso de link velho/clique duplo).
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl

  const error = searchParams.get('error')
  const errorCode = searchParams.get('error_code')
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (error) {
    const message =
      errorCode === 'otp_expired' || error === 'access_denied'
        ? 'Link expirado. Solicite um novo acesso.'
        : 'Não foi possível concluir o acesso. Tente novamente.'
    const back = new URL('/login', origin)
    back.searchParams.set('error', message)
    return NextResponse.redirect(back)
  }

  if (!code) {
    const back = new URL('/login', origin)
    back.searchParams.set('error', 'Código de acesso ausente.')
    return NextResponse.redirect(back)
  }

  const supabase = await createClient()
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
    code,
  )

  if (exchangeError) {
    const back = new URL('/login', origin)
    back.searchParams.set('error', 'Link inválido. Solicite um novo acesso.')
    return NextResponse.redirect(back)
  }

  // `next` é interno por garantia: rejeitamos URLs absolutas para impedir
  // open-redirect via parâmetro manipulado.
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard'
  return NextResponse.redirect(new URL(safeNext, origin))
}
