import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Atualiza a sessão Supabase a cada request e devolve um NextResponse pronto
// para ser propagado pelo proxy (src/proxy.ts).
//
// Regras inegociáveis (vide @supabase/ssr docs):
// 1. Chamar `getUser()` (não `getSession()`) — `getUser()` valida o token
//    contra o Auth server, prevenindo decisões de autorização sobre claims
//    forjadas no cookie.
// 2. NÃO inserir lógica entre `createServerClient` e `getUser()`. Qualquer
//    desvio quebra o ciclo de refresh e provoca logouts aleatórios.
// 3. Sempre retornar o `supabaseResponse` produzido — copiar cookies para um
//    response novo derruba os Set-Cookie de refresh.
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
          // Headers de no-cache acompanham o refresh para impedir que CDNs
          // sirvam cookies de auth de um usuário para outro.
          if (headers) {
            Object.entries(headers).forEach(([key, value]) =>
              supabaseResponse.headers.set(key, value),
            )
          }
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { supabaseResponse, user }
}
