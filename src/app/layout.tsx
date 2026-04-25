import type { Metadata } from 'next'
import { EB_Garamond, DM_Sans } from 'next/font/google'
import './globals.css'

// Tipografia institucional Amplify (DS Universal §1.3).
// EB Garamond: serif para display, H1, H2, blockquote.
// DM Sans:     sans para corpo, UI, botões, label, micro-copy.
const ebGaramond = EB_Garamond({
  variable: '--font-serif',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const dmSans = DM_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
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
      data-theme="dark"
    >
      <body className="min-h-full flex flex-col font-sans bg-bg-base text-text-primary">
        {children}
      </body>
    </html>
  )
}
