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
    <main className="flex min-h-screen items-center justify-center bg-(--color-bg-base) px-6 py-16">
      <div className="w-full max-w-md space-y-10">
        {/* Cabeçalho institucional */}
        <header className="space-y-3 text-center">
          <p className="font-sans text-xs uppercase tracking-[0.24em] text-(--color-text-muted)">
            Amplify Hub
          </p>
          <h1 className="font-serif text-4xl leading-tight md:text-5xl">
            Acessar Hub
          </h1>
          <p className="font-sans text-sm text-(--color-text-secondary)">
            Área de membros do Protocolo Amplify e da Linha Amplify.
          </p>
        </header>

        {/* Formulário */}
        <Surface className="p-8 space-y-6" variant="surface">
          <form className="space-y-5" autoComplete="on">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block font-sans text-sm font-medium text-(--color-text-secondary)"
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

          {/* Divisor com discrição (sem sombra; apenas linha) */}
          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-(--color-border-default)" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-(--color-bg-surface) px-3 font-sans text-xs uppercase tracking-[0.16em] text-(--color-text-muted)">
                ou
              </span>
            </div>
          </div>

          <Link
            href="/login/senha"
            className="flex w-full items-center justify-center gap-2 min-h-11 px-5 rounded-md border border-(--color-border-default) font-sans text-sm font-medium text-(--color-text-secondary) transition-colors duration-150 ease-out hover:border-(--color-border-strong) hover:text-(--color-text-primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-border-focus) focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-bg-base)"
          >
            <KeyRound className="size-4" aria-hidden />
            Entrar com senha
          </Link>
        </Surface>

        {/* Rodapé compliance */}
        <p className="text-center font-sans text-xs leading-relaxed text-(--color-text-muted)">
          Acesso restrito a alunos com matrícula ativa.
          <br />
          Dr. Matheus Prestes · CRM/SP 235.420
        </p>
      </div>
    </main>
  )
}
