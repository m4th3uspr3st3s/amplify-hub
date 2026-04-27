// ===========================================================================
// Amplify Hub · MarkdownLite (Server Component)
// ===========================================================================
// Renderizador minimalista de markdown para `lessons.body_md` na v1.
// Suporta apenas:
//   · `## Título` → <h2>
//   · `**negrito**` em qualquer posição → <strong>
//   · linhas em branco como separadores de parágrafo
//
// Sem dependência externa. Quando precisarmos de listas, links ou code blocks,
// promovemos para react-markdown — mas evitamos a dep enquanto o conteúdo for
// exclusivamente prosa institucional.
// ===========================================================================

import { Fragment, type ReactNode } from 'react'

function renderInline(text: string): ReactNode[] {
  // Quebra a linha em segmentos alternando texto puro / negrito.
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts
    .filter((part) => part.length > 0)
    .map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong
            key={idx}
            className="font-semibold text-(--color-text-primary)"
          >
            {part.slice(2, -2)}
          </strong>
        )
      }
      return <Fragment key={idx}>{part}</Fragment>
    })
}

export function MarkdownLite({ source }: { source: string }) {
  const blocks = source.split(/\n{2,}/)

  return (
    <div className="space-y-4 font-sans text-base leading-relaxed text-(--color-text-secondary)">
      {blocks.map((block, idx) => {
        const trimmed = block.trim()
        if (trimmed.length === 0) return null

        if (trimmed.startsWith('## ')) {
          return (
            <h2
              key={idx}
              className="font-serif text-xl font-semibold tracking-tight text-(--color-text-primary)"
            >
              {renderInline(trimmed.slice(3))}
            </h2>
          )
        }

        return (
          <p key={idx} className="text-(--color-text-secondary)">
            {renderInline(trimmed)}
          </p>
        )
      })}
    </div>
  )
}
