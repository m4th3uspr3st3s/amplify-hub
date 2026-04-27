import { Resend } from 'resend'

// ===========================================================================
// Amplify Hub · Resend singleton
// ===========================================================================
// Lazy-initialized para que módulos importem o helper sem exigir a env var
// no boot (rotas de UI não devem quebrar se a chave do Resend ainda não
// foi provisionada — só o handler de notificações depende dela).
// ===========================================================================

let cached: Resend | null = null

export function getResend(): Resend {
  if (cached) return cached

  const key = process.env.RESEND_API_KEY
  if (!key) {
    throw new Error('getResend: RESEND_API_KEY ausente.')
  }

  cached = new Resend(key)
  return cached
}

// Endereço de origem dos emails. Precisa ser um endereço cujo domínio esteja
// verificado no painel do Resend (DKIM + SPF). Default editorial enquanto o
// owner não provisiona — o dispatcher loga aviso se cair no fallback.
export function getFromAddress(): string {
  return (
    process.env.RESEND_FROM_EMAIL ||
    'Amplify Hub <noreply@amplifyhealth.com.br>'
  )
}

// Origem pública (links nos emails). Em produção: https://hub.amplifyhealth.com.br
export function getPublicBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.replace(/^/, 'https://') ||
    'http://localhost:3000'
  )
}
