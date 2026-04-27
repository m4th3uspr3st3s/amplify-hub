// ===========================================================================
// Amplify Hub · Templates de email transacional
// ===========================================================================
// HTML inline strings (não React Email — evita dependência extra). Todas as
// cores são hardcoded em hex porque clientes de email (Gmail, Outlook,
// Apple Mail) não suportam CSS variables. As fontes do system stack são
// usadas como fallback universal — Adobe Caslon e Inter não vivem em email.
//
// Layout:
//   · Container central 600px
//   · Fundo dark editorial (#0e0e0c) + accent bronze (#c9a47a)
//   · Tipografia serif para headline, sans para corpo
//   · CTA único alinhado à esquerda (estilo bottom-aligned)
// ===========================================================================

import { TRACK_LABELS, type Track } from '@/lib/tracks'

const COLORS = {
  bg: '#0e0e0c',
  surface: '#16140f',
  border: '#2a2722',
  bronze: '#c9a47a',
  text: '#f4f1ea',
  muted: '#a8a39c',
  subtle: '#7a7570',
} as const

const DATE_FMT = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Sao_Paulo',
})

function formatDate(iso: string) {
  return DATE_FMT.format(new Date(iso)).replace(/,\s*(\d{2}:\d{2})$/, ' · $1')
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function firstName(fullName: string): string {
  if (!fullName) return ''
  const first = fullName.trim().split(/\s+/)[0] || ''
  if (!first) return ''
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase()
}

export type LiveContext = {
  recipientFullName: string
  trackLabel: string
  moduleTitle: string | null
  lessonTitle: string | null
  liveTitle: string
  scheduledForIso: string
  durationMinutes: number
  liveUrl: string
  agendaUrl: string
}

function shellHtml({
  preheader,
  headline,
  bodyHtml,
}: {
  preheader: string
  headline: string
  bodyHtml: string
}): string {
  // O preheader é o texto cinza que aparece ao lado do assunto na inbox.
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="color-scheme" content="dark">
    <title>${escapeHtml(headline)}</title>
  </head>
  <body style="margin:0;padding:0;background:${COLORS.bg};color:${COLORS.text};font-family:Inter,Helvetica,Arial,sans-serif;">
    <span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">${escapeHtml(preheader)}</span>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${COLORS.bg};">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background:${COLORS.surface};border:1px solid ${COLORS.border};border-radius:12px;overflow:hidden;">
            <tr>
              <td style="height:2px;background:linear-gradient(90deg,${COLORS.bronze} 0%,transparent 100%);font-size:0;line-height:0;">&nbsp;</td>
            </tr>
            <tr>
              <td style="padding:32px 32px 8px 32px;">
                <p style="margin:0;font-family:Inter,Helvetica,Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:0.22em;text-transform:uppercase;color:${COLORS.bronze};">
                  Amplify Hub
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 32px 32px 32px;font-family:Inter,Helvetica,Arial,sans-serif;color:${COLORS.text};">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px;border-top:1px solid ${COLORS.border};font-family:Inter,Helvetica,Arial,sans-serif;font-size:12px;color:${COLORS.subtle};">
                Você está recebendo este email porque tem acesso ativo a uma trilha do Amplify Hub. Se preferir não receber lembretes de mentorias, ajuste suas preferências dentro da plataforma.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

function ctaButton(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 0 0;">
    <tr>
      <td style="background:${COLORS.bronze};border-radius:6px;">
        <a href="${escapeHtml(href)}" style="display:inline-block;padding:12px 22px;font-family:Inter,Helvetica,Arial,sans-serif;font-size:13px;font-weight:600;letter-spacing:0.04em;color:${COLORS.bg};text-decoration:none;">
          ${escapeHtml(label)}
        </a>
      </td>
    </tr>
  </table>`
}

function dlBlock(rows: Array<[string, string]>): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:20px 0 0 0;border:1px solid ${COLORS.border};border-radius:8px;">
    ${rows
      .map(
        ([label, value], idx, arr) => `
        <tr>
          <td style="padding:12px 16px;${idx < arr.length - 1 ? `border-bottom:1px solid ${COLORS.border};` : ''}font-family:Inter,Helvetica,Arial,sans-serif;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:${COLORS.muted};width:140px;">
            ${escapeHtml(label)}
          </td>
          <td style="padding:12px 16px;${idx < arr.length - 1 ? `border-bottom:1px solid ${COLORS.border};` : ''}font-family:Inter,Helvetica,Arial,sans-serif;font-size:14px;color:${COLORS.text};">
            ${escapeHtml(value)}
          </td>
        </tr>`,
      )
      .join('')}
  </table>`
}

// ---------------------------------------------------------------------------
// Template 1 · live_scheduled — anúncio de mentoria recém-agendada
// ---------------------------------------------------------------------------
export function liveScheduledTemplate(ctx: LiveContext): {
  subject: string
  html: string
} {
  const greet = firstName(ctx.recipientFullName)
  const headline = `Nova mentoria marcada — ${ctx.trackLabel}`
  const subject = `Nova mentoria marcada · ${ctx.liveTitle}`
  const preheader = `${ctx.liveTitle} — ${formatDate(ctx.scheduledForIso)}`

  const body = `
    <h1 style="margin:0 0 16px 0;font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:1.25;font-weight:600;color:${COLORS.text};">
      ${escapeHtml(headline)}
    </h1>
    <p style="margin:0 0 12px 0;font-family:Inter,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:${COLORS.text};">
      ${greet ? `Oi, ${escapeHtml(greet)}.` : 'Olá.'}
    </p>
    <p style="margin:0;font-family:Inter,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:${COLORS.muted};">
      Acabamos de marcar uma nova mentoria ao vivo na sua trilha. A sala abre 15 minutos antes do horário.
    </p>
    ${dlBlock([
      ['Mentoria', ctx.liveTitle],
      ...(ctx.moduleTitle
        ? ([['Módulo', ctx.moduleTitle]] as [string, string][])
        : []),
      ...(ctx.lessonTitle
        ? ([['Aula', ctx.lessonTitle]] as [string, string][])
        : []),
      ['Quando', formatDate(ctx.scheduledForIso)],
      ['Duração', `${ctx.durationMinutes} minutos`],
    ])}
    ${ctaButton(ctx.agendaUrl, 'Ver no calendário')}
  `

  return { subject, html: shellHtml({ preheader, headline, bodyHtml: body }) }
}

// ---------------------------------------------------------------------------
// Template 2 · live_reminder_24h — lembrete 1 dia antes
// ---------------------------------------------------------------------------
export function liveReminder24hTemplate(ctx: LiveContext): {
  subject: string
  html: string
} {
  const greet = firstName(ctx.recipientFullName)
  const headline = `Amanhã: ${ctx.liveTitle}`
  const subject = `Lembrete · ${ctx.liveTitle} é amanhã`
  const preheader = `${formatDate(ctx.scheduledForIso)} — ${ctx.trackLabel}`

  const body = `
    <h1 style="margin:0 0 16px 0;font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:1.25;font-weight:600;color:${COLORS.text};">
      ${escapeHtml(headline)}
    </h1>
    <p style="margin:0 0 12px 0;font-family:Inter,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:${COLORS.text};">
      ${greet ? `Oi, ${escapeHtml(greet)}.` : 'Olá.'}
    </p>
    <p style="margin:0;font-family:Inter,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:${COLORS.muted};">
      Falta 1 dia para a próxima mentoria ao vivo da sua trilha. Reserve o horário na sua agenda — a sala abre 15 minutos antes.
    </p>
    ${dlBlock([
      ['Mentoria', ctx.liveTitle],
      ['Trilha', ctx.trackLabel],
      ['Quando', formatDate(ctx.scheduledForIso)],
      ['Duração', `${ctx.durationMinutes} minutos`],
    ])}
    ${ctaButton(ctx.agendaUrl, 'Abrir o calendário')}
  `

  return { subject, html: shellHtml({ preheader, headline, bodyHtml: body }) }
}

// ---------------------------------------------------------------------------
// Template 3 · live_reminder_1h — alerta final
// ---------------------------------------------------------------------------
export function liveReminder1hTemplate(ctx: LiveContext): {
  subject: string
  html: string
} {
  const greet = firstName(ctx.recipientFullName)
  const headline = `Começa em 1 hora — ${ctx.liveTitle}`
  const subject = `Em 1 hora · ${ctx.liveTitle}`
  const preheader = `${formatDate(ctx.scheduledForIso)} — entre direto pela plataforma`

  const body = `
    <h1 style="margin:0 0 16px 0;font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:1.25;font-weight:600;color:${COLORS.text};">
      ${escapeHtml(headline)}
    </h1>
    <p style="margin:0 0 12px 0;font-family:Inter,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:${COLORS.text};">
      ${greet ? `Oi, ${escapeHtml(greet)}.` : 'Olá.'}
    </p>
    <p style="margin:0;font-family:Inter,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:${COLORS.muted};">
      Sua mentoria começa em 1 hora. A sala abre 15 minutos antes — você já pode se preparar.
    </p>
    ${dlBlock([
      ['Mentoria', ctx.liveTitle],
      ['Trilha', ctx.trackLabel],
      ['Quando', formatDate(ctx.scheduledForIso)],
    ])}
    ${ctaButton(ctx.liveUrl, 'Entrar na sala')}
  `

  return { subject, html: shellHtml({ preheader, headline, bodyHtml: body }) }
}

// Helper compartilhado para o dispatcher.
export function trackLabelFor(track: Track): string {
  return TRACK_LABELS[track]
}
