import { redirect } from 'next/navigation'
import { Surface } from '@/components/ui/Surface'
import { createClient } from '@/lib/supabase/server'
import { SetupPasswordForm } from './SetupPasswordForm'

export const metadata = {
  title: 'Defina sua senha · Amplify Hub',
}

export default async function SetupPasswordPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Defesa em profundidade — proxy.ts so guarda /dashboard. Se um usuario
  // sem sessao chegar aqui, mandamos para /login.
  if (!user) {
    redirect('/login')
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        {/* §3.2 Page layout — header focado, sem nav lateral */}
        <header className="space-y-3 text-center">
          <p className="label-section">Onboarding</p>
          <h1 className="font-serif text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
            Defina sua senha de acesso
          </h1>
          <p className="font-sans text-sm leading-relaxed text-(--color-text-secondary)">
            Para garantir sua autonomia, defina uma senha segura. Você poderá
            usá-la como alternativa ao Magic Link.
          </p>
        </header>

        {/* §2.4 Surface elevada — borda + bg, sem sombra estrutural */}
        <Surface variant="elevated" className="mt-10 p-8">
          <SetupPasswordForm />
        </Surface>

        {/* Rodape compliance institucional */}
        <p className="mt-8 text-center font-sans text-xs leading-relaxed text-(--color-text-muted)">
          Amplify Hub · Área de membros
          <br />
          Dr. Matheus Prestes · CRM/SP 235.420
        </p>
      </div>
    </main>
  )
}
