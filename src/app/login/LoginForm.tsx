'use client'

import { useActionState, useEffect, useRef } from 'react'
import { useFormStatus } from 'react-dom'
import { useSearchParams } from 'next/navigation'
import { Mail } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { loginWithMagicLink, type LoginState } from './actions'

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
      <Mail className="size-4" aria-hidden />
      {pending ? 'Enviando link…' : 'Receber link de acesso'}
    </Button>
  )
}

export function LoginForm() {
  const [state, formAction] = useActionState(loginWithMagicLink, INITIAL_STATE)
  const searchParams = useSearchParams()
  const callbackErrorShown = useRef(false)

  useEffect(() => {
    if (state.status === 'success') {
      toast.success(state.message)
    } else if (state.status === 'error') {
      toast.error(state.message)
    }
  }, [state])

  // Erro vindo de /auth/callback (otp_expired, exchange falhou, etc.).
  // useRef evita re-disparo se o componente re-renderiza com o mesmo param.
  useEffect(() => {
    const callbackError = searchParams.get('error')
    if (callbackError && !callbackErrorShown.current) {
      callbackErrorShown.current = true
      toast.error(callbackError)
    }
  }, [searchParams])

  return (
    <form action={formAction} className="space-y-5" autoComplete="on">
      {/* §5.2 Label uppercase tracking-[0.2em] */}
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

      <SubmitButton />
    </form>
  )
}
