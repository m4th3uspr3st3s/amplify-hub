import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Supabase client para Server Components, Server Actions e Route Handlers.
// Em Server Components, `setAll` pode falhar (cookie store é read-only) — o
// catch silencioso é seguro porque o `proxy.ts` (src/proxy.ts) reemite a
// sessão a cada request, refrescando os tokens fora do render path.
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Chamado a partir de um Server Component: ignorar. A sessão é
            // mantida atualizada pelo proxy.
          }
        },
      },
    },
  )
}
