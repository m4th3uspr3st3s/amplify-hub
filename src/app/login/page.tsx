import Link from 'next/link'
import { Mail, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Surface } from '@/components/ui/Surface'

export const metadata = {
  title: 'Acessar · Amplify Hub',
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        {/* §3.2 Page layout — header institucional centralizado */}
        <header className="space-y-3 text-center">
          <p className="label-section">Amplify Hub</p>
          <h1 className="font-serif text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
            Acessar Hub
          </h1>
          <p className="font-sans text-sm text-(--color-text-secondary)">
            Área de membros do Protocolo Amplify e da Linha Amplify.
          </p>
        </header>

        {/* §2.4 Surface elevada para form (chrome de autenticação) */}
        <Surface variant="elevated" className="mt-10 p-8 space-y-6">
          <form className="space-y-5" autoComplete="on">
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

            <Button type="submit" variant="primary" size="lg" className="w-full">
              <Mail className="size-4" aria-hidden />
              Receber link de acesso
            </Button>
          </form>

          {/* Divisor — borda + label, sem sombra (§1.5) */}
          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-(--color-border-default)" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-(--color-bg-elevated) px-3 font-sans text-[10px] uppercase tracking-[0.2em] text-(--color-text-muted)">
                ou
              </span>
            </div>
          </div>

          {/* §2.2 Botão ghost via classe utilitária */}
          <Link href="/login/senha" className="btn-ghost w-full">
            <KeyRound className="size-4" aria-hidden />
            Entrar com senha
          </Link>
        </Surface>

        {/* Rodapé compliance */}
        <p className="mt-8 text-center font-sans text-xs leading-relaxed text-(--color-text-muted)">
          Acesso restrito a alunos com matrícula ativa.
          <br />
          Dr. Matheus Prestes · CRM/SP 235.420
        </p>
      </div>
    </main>
  )
}
