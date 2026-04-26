'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const LoginSchema = z.object({
  email: z.email({ error: 'Informe um e-mail válido.' }).trim().toLowerCase(),
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
      emailRedirectTo: `${appUrl}/dashboard`,
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
