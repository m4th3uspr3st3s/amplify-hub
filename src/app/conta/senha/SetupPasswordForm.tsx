'use client'

import { useActionState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import { ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { setupPassword, type SetupPasswordState } from './actions'

const INITIAL_STATE: SetupPasswordState = { status: 'idle' }

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
      {pending ? 'Salvando…' : 'Salvar e ir para o Dashboard'}
      <ArrowRight className="size-4" aria-hidden />
    </Button>
  )
}

export function SetupPasswordForm() {
  const [state, formAction] = useActionState(setupPassword, INITIAL_STATE)

  useEffect(() => {
    if (state.status === 'error') {
      toast.error(state.message)
    }
  }, [state])

  return (
    <form action={formAction} className="space-y-5" autoComplete="on">
      <div className="space-y-2">
        <label
          htmlFor="password"
          className="block font-sans text-[10px] uppercase tracking-[0.2em] text-(--color-text-tertiary)"
        >
          Nova senha
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={6}
          placeholder="Mínimo 6 caracteres"
          required
        />
        <p className="font-sans text-[11px] text-(--color-text-muted)">
          Use uma combinação que você lembre. Mínimo 6 caracteres.
        </p>
      </div>

      <SubmitButton />
    </form>
  )
}
