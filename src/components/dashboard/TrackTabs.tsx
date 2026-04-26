'use client'

import * as Tabs from '@radix-ui/react-tabs'
import type { ReactNode } from 'react'

type TrackTabsProps = {
  advanced: ReactNode
  foundation: ReactNode
  defaultValue?: 'atlas' | 'amplify'
}

// DS Universal §0.1 (44pt) · §1.3 (EB Garamond para labels institucionais) ·
// §1.5 (sem sombras estruturais — elevação por borda + bg).
// Estado ativo em sage (verde institucional) §1.1.
export function TrackTabs({
  advanced,
  foundation,
  defaultValue = 'atlas',
}: TrackTabsProps) {
  return (
    <Tabs.Root defaultValue={defaultValue} className="space-y-8">
      <Tabs.List
        aria-label="Selecionar trilha"
        className="inline-flex w-full items-stretch gap-1 rounded-md border border-(--color-border-default) bg-(--color-bg-elevated) p-1 md:w-auto"
      >
        <Tabs.Trigger
          value="atlas"
          className="
            group flex-1 min-h-11 px-5 py-2 rounded-sm
            font-serif text-base font-semibold tracking-tight
            text-(--color-text-secondary)
            transition-colors duration-(--duration-fast) ease-(--ease-std)
            hover:text-(--color-text-primary)
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-border-focus)
            data-[state=active]:bg-(--color-sage-900)
            data-[state=active]:text-(--color-sage-100)
            data-[state=active]:border data-[state=active]:border-(--color-sage-700)
          "
        >
          Formação Avançada (Atlas)
        </Tabs.Trigger>
        <Tabs.Trigger
          value="amplify"
          className="
            group flex-1 min-h-11 px-5 py-2 rounded-sm
            font-serif text-base font-semibold tracking-tight
            text-(--color-text-secondary)
            transition-colors duration-(--duration-fast) ease-(--ease-std)
            hover:text-(--color-text-primary)
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-border-focus)
            data-[state=active]:bg-(--color-sage-900)
            data-[state=active]:text-(--color-sage-100)
            data-[state=active]:border data-[state=active]:border-(--color-sage-700)
          "
        >
          Fundamentos (Amplify)
        </Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="atlas" className="focus-visible:outline-none">
        {advanced}
      </Tabs.Content>
      <Tabs.Content value="amplify" className="focus-visible:outline-none">
        {foundation}
      </Tabs.Content>
    </Tabs.Root>
  )
}
