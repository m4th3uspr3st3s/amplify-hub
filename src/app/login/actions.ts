'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const LoginSchema = z.object({
  email: z.email({ error: 'Informe um e-mail válido.' }).trim().toLowerCase(),
})

const PasswordLoginSchema = z.object({
  email: z.email({ error: 'Informe um e-mail válido.' }).trim().toLowerCase(),
  password: z
    .string({ error: 'Informe a sua senha.' })
    .min(1, { error: 'Informe a sua senha.' }),
})

export type LoginState =
  | { status: 'idle' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string }

export async function loginWithMagicLink(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = LoginSchema.safeParse({ email: formData.get('email') })

  if (!parsed.success) {
    return {
      status: 'error',
      message: parsed.error.issues[0]?.message ?? 'E-mail inválido.',
    }
  }

  const supabase = await createClient()
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      // PKCE callback oficial — exchangeCodeForSession ocorre em
      // /auth/callback/route.ts, que entao redireciona para `next`.
      emailRedirectTo: `${appUrl}/auth/callback?next=/dashboard`,
      // Auth dual: o Supabase cria o usuário automaticamente se não existir.
      // O webhook Kiwify (Marco 6) é quem provisiona usuários pagos; este flag
      // permanece `true` enquanto o webhook não está em produção, para que o
      // Owner consiga testar com a própria conta.
      shouldCreateUser: true,
    },
  })

  if (error) {
    return {
      status: 'error',
      message:
        'Não foi possível enviar o link agora. Tente novamente em instantes.',
    }
  }

  return {
    status: 'success',
    message: 'Verifique o seu e-mail para acessar o Hub.',
  }
}

export async function loginWithPassword(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = PasswordLoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return {
      status: 'error',
      message: parsed.error.issues[0]?.message ?? 'Dados inválidos.',
    }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    // Não vazamos a causa exata (existência de conta vs senha errada) para
    // evitar enumeração de e-mails — Supabase retorna `Invalid login
    // credentials` em ambos os casos, mas reforçamos a mensagem unificada.
    return {
      status: 'error',
      message: 'E-mail ou senha incorretos.',
    }
  }

  // redirect() lança internamente — precisa ficar fora de try/catch e ser a
  // última instrução. O proxy.ts revalida a sessão na próxima request.
  redirect('/dashboard')
}
