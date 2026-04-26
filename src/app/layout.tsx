import type { Metadata } from 'next'
import { EB_Garamond, DM_Sans } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

// DS Universal §1.3 / §6.1 — fontes institucionais Amplify.
// As variáveis CSS expostas aqui são consumidas em globals.css via @theme.
const ebGaramond = EB_Garamond({
  variable: '--font-eb-garamond',
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Amplify Hub · Área de membros',
  description:
    'Plataforma de ensino contínuo ao vivo para alunos do Protocolo Amplify e da Linha Amplify.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${ebGaramond.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {children}
        {/* DS Universal §2.6 — Toast Liquid Glass dark, sem sombra estrutural. */}
        <Toaster
          theme="dark"
          position="top-center"
          richColors
          closeButton
          toastOptions={{
            classNames: {
              toast:
                'border border-(--color-border-default) bg-(--color-bg-elevated) text-(--color-text-primary) font-sans',
            },
          }}
        />
      </body>
    </html>
  )
}
