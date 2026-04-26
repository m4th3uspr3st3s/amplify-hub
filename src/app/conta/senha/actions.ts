'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const SetupPasswordSchema = z.object({
  password: z
    .string({ error: 'Defina uma senha.' })
    .min(6, { error: 'A senha precisa ter pelo menos 6 caracteres.' }),
})

export type SetupPasswordState =
  | { status: 'idle' }
  | { status: 'error'; message: string }

export async function setupPassword(
  _prev: SetupPasswordState,
  formData: FormData,
): Promise<SetupPasswordState> {
  const parsed = SetupPasswordSchema.safeParse({
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return {
      status: 'error',
      message: parsed.error.issues[0]?.message ?? 'Senha inválida.',
    }
  }

  const supabase = await createClient()

  // Defesa em profundidade: updateUser falha se nao houver sessao ativa,
  // mas checamos antes para devolver mensagem clara em vez de erro generico.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      status: 'error',
      message: 'Sessão expirada. Solicite um novo link de acesso.',
    }
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  })

  if (error) {
    return {
      status: 'error',
      message: 'Não foi possível salvar a senha agora. Tente novamente.',
    }
  }

  // redirect() lanca internamente — fora de try/catch, ultima instrucao.
  redirect('/dashboard')
}
