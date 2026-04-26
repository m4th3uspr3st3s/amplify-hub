import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Surface } from '@/components/ui/Surface'
import { LoginFormPassword } from './LoginFormPassword'

export const metadata = {
  title: 'Entrar com senha · Amplify Hub',
}

export default function PasswordLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        {/* §3.2 Page layout — header institucional centralizado */}
        <header className="space-y-3 text-center">
          <p className="label-section">Amplify Hub</p>
          <h1 className="font-serif text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
            Entrar com senha
          </h1>
          <p className="font-sans text-sm text-(--color-text-secondary)">
            Use o e-mail e a senha cadastrados em Conta · Segurança.
          </p>
        </header>

        {/* §2.4 Surface elevada para form (chrome de autenticação) */}
        <Surface variant="elevated" className="mt-10 p-8 space-y-6">
          <LoginFormPassword />

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
          <Link href="/login" className="btn-ghost w-full">
            <ArrowLeft className="size-4" aria-hidden />
            Voltar para Magic Link
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
