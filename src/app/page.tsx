export default function HomePage() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <section className="max-w-2xl space-y-8">
        <p className="font-sans text-xs uppercase tracking-[0.2em] text-(--color-text-muted)">
          Amplify Hub
        </p>

        <h1 className="font-serif text-5xl leading-tight md:text-6xl">
          Autonomia clínica através de Inteligência Artificial.
        </h1>

        <p className="font-sans text-base leading-relaxed text-(--color-text-secondary) md:text-lg">
          Esta é a área de membros do <strong>Protocolo Amplify</strong> e da
          Linha Amplify — DMB<sup>&trade;</sup>, IMAGO<sup>&trade;</sup> Kit e
          AmpliSquad. Aulas ao vivo, conteúdo nativo, sem nenhum redirecionamento
          para fora do domínio.
        </p>

        <div className="rounded-lg border border-(--color-border-default) bg-(--color-bg-surface) p-6">
          <p className="font-sans text-sm text-(--color-text-muted)">
            Marco 2 · scaffold inicial. Próxima entrega: integração Supabase
            Auth (magic link + senha), tabelas <code>live_sessions</code> e{' '}
            <code>attendance_records</code>, e sala de aula via Stream Video
            embedada.
          </p>
        </div>
      </section>
    </main>
  )
}
