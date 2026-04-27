import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// ===========================================================================
// Amplify Hub · Supabase admin client (service_role)
// ===========================================================================
// Cliente que bypass-a a RLS via service_role key. Uso restrito a:
//   · Cron handlers (route handlers acionados pelo Vercel Cron)
//   · Webhooks externos (Kiwify) — futuro
//
// NÃO IMPORTAR em Server Components, Server Actions de aluno, ou Client
// Components. service_role permite ler auth.users, ler/escrever qualquer
// linha de qualquer tabela ignorando RLS — vazar isso é game-over.
//
// `persistSession: false` porque o handler é stateless. `autoRefreshToken:
// false` evita timers em cold start de serverless.
//
// Tipagem: enquanto não geramos os tipos via `supabase gen types typescript`,
// expomos como SupabaseClient genérico (sem Database). Tabelas e RPC ficam
// fracamente tipadas — compensamos com validação de payload nas camadas que
// consomem (ex: dispatch.ts faz cast explícito do retorno).
// ===========================================================================

let cached: SupabaseClient | null = null

export function createAdminClient(): SupabaseClient {
  if (cached) return cached

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error(
      'createAdminClient: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY ausente.',
    )
  }

  cached = createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  return cached
}
