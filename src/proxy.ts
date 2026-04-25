import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Next.js 16: o convention `middleware.ts` foi renomeado para `proxy.ts`
// (mesma função, novo nome — vide node_modules/next/dist/docs/.../proxy.md).
// A função exportada também precisa chamar-se `proxy`, não `middleware`.
export async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request)

  const { pathname } = request.nextUrl
  const isProtected =
    pathname === '/dashboard' || pathname.startsWith('/dashboard/')

  if (isProtected && !user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirectedFrom', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}

export const config = {
  // Roda em todas as rotas exceto estáticos e otimizadores. O guard de
  // `/dashboard` em si fica acima — manter o matcher amplo permite que o
  // refresh de sessão ocorra também nas rotas públicas, evitando que o
  // aluno chegue ao /login com uma sessão expirada já válida.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
