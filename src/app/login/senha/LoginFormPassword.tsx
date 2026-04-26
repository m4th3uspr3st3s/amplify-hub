'use client'

import { useActionState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import { LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { loginWithPassword, type LoginState } from '../actions'

const INITIAL_STATE: LoginState = { status: 'idle' }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      variant="primary"
      size="lg"
      className="w-full"
      disabled={pending}
      aria-disabled={pending}
    >
      <LogIn className="size-4" aria-hidden />
      {pending ? 'Acessando…' : 'Acessar'}
    </Button>
  )
}

export function LoginFormPassword() {
  const [state, formAction] = useActionState(loginWithPassword, INITIAL_STATE)

  useEffect(() => {
    if (state.status === 'error') {
      toast.error(state.message)
    }
  }, [state])

  return (
    <form action={formAction} className="space-y-5" autoComplete="on">
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block font-sans text-[10px] uppercase tracking-[0.2em] text-(--color-text-tertiary)"
        >
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="seu-email@dominio.com"
          required
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="block font-sans text-[10px] uppercase tracking-[0.2em] text-(--color-text-tertiary)"
        >
          Senha
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
        />
      </div>

      <SubmitButton />
    </form>
  )
}
