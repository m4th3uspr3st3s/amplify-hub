import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Next.js 16: o convention `middleware.ts` foi renomeado para `proxy.ts`
// (mesma funcao, novo nome — vide node_modules/next/dist/docs/.../proxy.md).
// A funcao exportada tambem precisa chamar-se `proxy`, nao `middleware`.
export async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request)

  const { pathname } = request.nextUrl
  const isProtected =
    pathname === '/dashboard' || pathname.startsWith('/dashboard/')

  if (isProtected && !user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirectedFrom', pathname)
    const redirectResponse = NextResponse.redirect(redirectUrl)
    // Preservar Set-Cookie emitidos pelo updateSession (refresh em curso).
    // Criar um redirect novo zerado descarta esses cookies e perpetua o
    // logout — o aluno volta a clicar no link e cai aqui de novo.
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie)
    })
    return redirectResponse
  }

  return supabaseResponse
}

export const config = {
  // Roda em todas as rotas exceto estaticos e otimizadores. O guard de
  // `/dashboard` em si fica acima — manter o matcher amplo permite que o
  // refresh de sessao ocorra tambem nas rotas publicas, evitando que o
  // aluno chegue ao /login com uma sessao expirada ja valida.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
