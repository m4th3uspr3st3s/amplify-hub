import Link from 'next/link'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { Surface } from '@/components/ui/Surface'

export default function HomePage() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16 md:py-24">
      <section className="w-full max-w-2xl">
        {/* §3.2 Page layout — section label + h1 + subtitle */}
        <p className="label-section mb-3">Amplify Hub</p>

        <h1 className="font-serif text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
          Autonomia clínica através de Inteligência Artificial.
        </h1>

        <p className="mt-6 max-w-xl font-sans text-base leading-relaxed text-(--color-text-secondary) md:text-lg">
          Esta é a área de membros do <strong>Protocolo Amplify</strong> e da
          Linha Amplify — DMB<sup>&trade;</sup>, IMAGO<sup>&trade;</sup> Kit e
          AmpliSquad. Aulas ao vivo, conteúdo nativo, sem nenhum redirecionamento
          para fora do domínio.
        </p>

        {/* §2.4 Surface card com accent bar bronze (§2.11 KpiCard pattern) */}
        <Surface variant="card" className="relative mt-10 overflow-hidden p-6">
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-[2px] opacity-70"
            style={{
              background:
                'linear-gradient(90deg, var(--color-bronze-400) 0%, transparent 100%)',
            }}
          />

          <div className="flex items-start gap-4">
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-md border border-(--color-sage-300)/20"
              style={{ background: 'rgba(122,170,138,0.10)' }}
            >
              <ShieldCheck
                className="size-5"
                strokeWidth={1.5}
                aria-hidden
                style={{ color: 'var(--color-sage-300)' }}
              />
            </div>

            <div className="flex-1 space-y-2">
              <p className="label-section">Marco 2 · Scaffold inicial</p>
              <p className="font-sans text-sm leading-relaxed text-(--color-text-secondary)">
                Próxima entrega: integração Supabase Auth (magic link + senha),
                tabelas <code>live_sessions</code> e{' '}
                <code>attendance_records</code>, e sala de aula via Stream Video
                embedada.
              </p>
              <Link
                href="/login"
                className="mt-2 inline-flex items-center gap-1.5 font-sans text-sm font-medium text-(--color-bronze-400) transition-colors duration-(--duration-fast) ease-(--ease-std) hover:text-(--color-text-primary) focus-visible:outline-none"
              >
                Acessar Hub
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </div>
        </Surface>
      </section>
    </main>
  )
}
