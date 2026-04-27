import { NextResponse, type NextRequest } from 'next/server'
import { dispatchPendingNotifications } from '@/lib/notifications/dispatch'

// ===========================================================================
// Amplify Hub · POST/GET /api/notifications/dispatch
// ===========================================================================
// Endpoint chamado pelo Vercel Cron a cada 15 minutos (vide vercel.json).
// Vercel envia automaticamente o header `Authorization: Bearer ${CRON_SECRET}`
// quando a env var CRON_SECRET está definida no projeto. Validamos esse
// header para impedir invocação manual por terceiros.
//
// Aceita GET (default do Vercel Cron) e POST (para testes manuais via curl).
// Não usa edge runtime: o Resend SDK e o Supabase admin client dependem do
// Node runtime para crypto + fetch streaming.
// ===========================================================================

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function isAuthorized(request: NextRequest): boolean {
  const expected = process.env.CRON_SECRET
  if (!expected) {
    // Sem CRON_SECRET configurado, recusamos todas as chamadas (defesa em
    // profundidade — não queremos um endpoint público que dispara emails
    // se o owner esqueceu de provisionar a env var).
    return false
  }
  const header = request.headers.get('authorization') ?? ''
  return header === `Bearer ${expected}`
}

async function handle(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  try {
    const summary = await dispatchPendingNotifications()
    return NextResponse.json({ ok: true, ...summary })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown_error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return handle(request)
}

export async function POST(request: NextRequest) {
  return handle(request)
}
