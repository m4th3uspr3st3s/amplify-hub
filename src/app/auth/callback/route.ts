import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// PKCE callback do Supabase Auth (magic link, OAuth, recovery).
// Magic link envia o usuario para esta rota com ?code=...&next=/conta/senha
// (ou ?error=...&error_code=otp_expired em caso de link velho/clique duplo).
//
// Padrao bulletproof do @supabase/ssr (vide node_modules/@supabase/ssr/docs/
// design.md §SSR framework patterns): pre-criar o NextResponse de redirect e
// passa-lo ao `setAll` para que os Set-Cookie de access/refresh saiam
// costurados na MESMA resposta. Confiar no `cookies()` de next/headers para
// propagar Set-Cookie em um redirect Route Handler e fragil em producao
// (Vercel + edge): a sessao se perde silenciosamente e o aluno cai em
// /login?redirectedFrom=/dashboard.
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  // Origem canonica: NEXT_PUBLIC_APP_URL e fonte de verdade (evita
  // request.nextUrl.origin retornar URL interna do edge na Vercel).
  const origin =
    process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin

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

  // `next` e interno por garantia: rejeitamos URLs absolutas para impedir
  // open-redirect via parametro manipulado.
  const safeNext =
    next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard'

  // Pre-criar a resposta para que o setAll grave Set-Cookie diretamente no
  // header de redirect que sera entregue ao navegador.
  const response = NextResponse.redirect(new URL(safeNext, origin))

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    const back = new URL('/login', origin)
    back.searchParams.set('error', 'Link inválido. Solicite um novo acesso.')
    return NextResponse.redirect(back)
  }

  return response
}
