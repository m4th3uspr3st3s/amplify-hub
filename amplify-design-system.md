# Amplify — Design System Universal

> **Fonte da verdade visual** para todos os produtos Amplify (Intelligence, Health, e quaisquer próximos forks).
> Originado da auditoria completa do Amplify Intelligence (commit HEAD em `main`) + padrões emergentes consolidados.
>
> Última revisão: 2026-04-25

---

## Sumário

0. [Princípios e Anti-Patterns](#0-principios-e-anti-patterns)
1. [Arquitetura de Tokens (Primitivas vs Semânticos)](#1-arquitetura-de-tokens-primitivas-vs-semanticos)
2. [Componentes Atômicos](#2-componentes-atomicos)
3. [Layouts e Shells](#3-layouts-e-shells)
4. [Padrões de Estado](#4-padroes-de-estado)
5. [Padrões de Formulário](#5-padroes-de-formulario)
6. [Tipografia](#6-tipografia)
7. [Dark Theme + Liquid Glass](#7-dark-theme--liquid-glass)
8. [Padrões Compostos](#8-padroes-compostos) *(novo)*
9. [Iconografia](#9-iconografia)
10. [Charts (Recharts)](#10-charts-recharts)
11. [Checklist de PR Review](#11-checklist-de-pr-review)
12. [Guia de Fork Inter-Projeto](#12-guia-de-fork-inter-projeto)

---

# 0. Princípios e Anti-Patterns

## 0.1 Filosofia

| Princípio | Significado prático |
|---|---|
| **Old Money / Vintage Medical Etching** | Sage emerald + bronze parchment + sepia. Sem neon, sem candy colors, sem gradientes saturados. |
| **Liquid Glass Organic Curves** | Superfícies premium (Sidebar, TopBar, Modais, Toasts, Dropdowns, Chat panel) usam `backdrop-filter` + bordas assimétricas com light catchers. Demais usam `surface` opaca. |
| **Sombras Banidas** | Elevação é feita por **borda + background**, não por `box-shadow`. Tokens `--shadow-*` são todos `none`. Exceção: superfícies Liquid Glass com `box-shadow` premium (top glow `inset` + deep external shadow). |
| **Dark-Only** | Não existe light mode. Não há classe `.dark`, não há `prefers-color-scheme: light` media query. Todas as cores são calibradas para fundo escuro. |
| **Mobile-First** | Breakpoint principal é `md:` (768px). Sidebar `hidden md:flex`, bottom nav `md:hidden`. |
| **Touch-First Interaction** | Todo elemento interativo respeita 44×44pt mínimo. `touch-action: manipulation` em todos os botões. |

## 0.2 Anti-Patterns Proibidos

| ❌ Não fazer | ✅ Fazer |
|---|---|
| Emoji como ícone estrutural (🚀 Settings) | Lucide React (`<Settings size={16} />`) |
| `style={{ color: '#45624e' }}` (primitiva direta) | `style={{ color: 'var(--color-primary)' }}` ou `text-[var(--color-primary)]` |
| `box-shadow: 0 4px 12px black` em card comum | `border: 1px solid var(--color-border-default)` |
| `transition: all 500ms` (animar tudo, lento) | `transition: bg-color 150ms var(--ease-std)` (animar específico, rápido) |
| Animar `width`, `height`, `top`, `left` | Animar `transform` e `opacity` |
| `<div onClick>` como botão | `<button>` semântico com `:focus-visible` |
| Texto cinza-em-cinza (`text-gray-500` em `bg-gray-700`) | Mínimo 4.5:1 — usar `--color-text-secondary` em surfaces |
| `outline: none` sem substituir | Substituir por `:focus-visible` ring (sage 2-layer) |
| Toast custom in-line | Usar `toast()` do wrapper Sonner (`src/components/ui/Toast.tsx`) |
| Fixed elements sem `safe-area-inset` | `bottom: calc(... + env(safe-area-inset-bottom))` |
| Modal sem `role="dialog"` + `aria-modal="true"` | Sempre incluir + `aria-labelledby` |

## 0.3 Hierarquia de Cores Funcionais

```
Severidade visual (mais quieto → mais alto)
─────────────────────────────────────────────
muted    →  text-disabled, parchment-500       (silencioso, hint)
neutral  →  text-secondary, border-default     (default, estrutura)
brand    →  primary (sage), bronze accent      (CTA, navegação ativa)
warning  →  bronze-500, risk-medium            (atenção sem urgência)
critical →  destructive (red), risk-critical   (apenas para perda/erro/risco)
```

Nunca use `critical` para info ou neutro — perde valor de sinal.

---

# 1. Arquitetura de Tokens (Primitivas vs Semânticos)

Fonte: [src/app/globals.css](src/app/globals.css) — bloco `@theme { }` (Tailwind v4).

> **Regra de ouro**: componentes consomem APENAS tokens semânticos (§1.2). Primitivas (§1.1) só existem para alimentar os semânticos. Para fork inter-projeto, troque as primitivas e mantenha os semânticos intactos.

## 1.1 Paleta Primitiva

### Medical Charcoal (neutros escuros)

| Token | Hex |
|---|---|
| `--color-charcoal-950` | `#0d0f0d` |
| `--color-charcoal-900` | `#111411` |
| `--color-charcoal-800` | `#161a15` |
| `--color-charcoal-700` | `#1a1f19` |
| `--color-charcoal-600` | `#1f2620` |
| `--color-charcoal-500` | `#252d24` |
| `--color-charcoal-400` | `#2e3a2d` |
| `--color-charcoal-300` | `#3d4d3b` |

### Apothecary Sage / Emerald (brand primary)

| Token | Hex |
|---|---|
| `--color-sage-900` | `#1a2e20` |
| `--color-sage-700` | `#2d4a36` |
| `--color-sage-500` | `#45624e` |
| `--color-sage-400` | `#5b8769` |
| `--color-sage-300` | `#7aaa8a` |
| `--color-sage-100` | `#c8e0cf` |

### Parchment / Sepia (texto e neutros quentes)

| Token | Hex |
|---|---|
| `--color-parchment-100` | `#f0ebe1` |
| `--color-parchment-200` | `#d8d1c3` |
| `--color-parchment-300` | `#b8a88a` |
| `--color-parchment-400` | `#8a7d68` |
| `--color-parchment-500` | `#5a5248` |

### Bronze / Accent (sinal premium)

| Token | Hex |
|---|---|
| `--color-bronze-400` | `#c9a47a` |
| `--color-bronze-500` | `#a67c52` |
| `--color-bronze-700` | `#6b4d2f` |

### Semantic Risk (escala discreta de 3 níveis)

| Token | Hex | Uso |
|---|---|---|
| `--color-risk-critical` | `#9c3b30` | Texto/borda de risco crítico |
| `--color-risk-critical-bg` | `#2a1212` | Background de risco crítico |
| `--color-risk-high` | `#b86e2d` | Texto/borda de risco alto |
| `--color-risk-high-bg` | `#2a1a0a` | Background de risco alto |
| `--color-risk-medium` | `#b39130` | Texto/borda de risco médio |
| `--color-risk-medium-bg` | `#272210` | Background de risco médio |

## 1.2 Tokens Semânticos

> **Use APENAS estes nos componentes.**

### Backgrounds

| Token | Valor | Uso |
|---|---|---|
| `--color-bg-base` | `#111411` | Body / fundo raiz |
| `--color-bg-aside` | `#161a15` | Sidebar desktop |
| `--color-bg-surface` | `#1a1f19` | Cards / surfaces (default) |
| `--color-bg-elevated` | `#1f2620` | Cards elevados / dropdowns |
| `--color-bg-overlay` | `#252d24` | Overlays internos |

### Primary Action

| Token | Valor |
|---|---|
| `--color-primary` | `#45624e` |
| `--color-primary-hover` | `#5b8769` |
| `--color-primary-muted` | `#1a2e20` |
| `--color-primary-fg` | `#c8e0cf` |

### Text

| Token | Valor | Uso |
|---|---|---|
| `--color-text-primary` | `#f0ebe1` | Texto principal (headings, body) |
| `--color-text-secondary` | `#d8d1c3` | Texto secundário |
| `--color-text-tertiary` | `#b8a88a` | Labels de seção, metadata |
| `--color-text-muted` | `#8a7d68` | Texto apagado, hints |
| `--color-text-disabled` | `#5a5248` | Placeholders, texto desabilitado |

### Borders

| Token | Valor |
|---|---|
| `--color-border-subtle` | `rgba(255, 255, 255, 0.08)` |
| `--color-border-default` | `rgba(255, 255, 255, 0.13)` |
| `--color-border-strong` | `rgba(255, 255, 255, 0.20)` |
| `--color-border-focus` | `#45624e` |

### Status Semântico

| Token | Valor |
|---|---|
| `--color-destructive` | `#9c3b30` |
| `--color-destructive-bg` | `#2a1212` |
| `--color-warning` | `#b86e2d` |
| `--color-warning-bg` | `#2a1a0a` |
| `--color-success` | `#45624e` |
| `--color-success-bg` | `#1a2e20` |

### Aliases de Compatibilidade

Preservam referências de componentes legados. **Evitar para código novo.**

```css
--color-deep:             #111411;
--color-parchment:        #f0ebe1;
--color-parchment-dim:    #d8d1c3;
--color-parchment-muted:  #8a7d68;
--color-charcoal:         #111411;
--color-charcoal-muted:   #1a1f19;
--color-charcoal-surface: #1a1f19;
--color-charcoal-border:  rgba(255, 255, 255, 0.13);
--color-sage:             #45624e;
--color-sage-muted:       #1a2e20;
--color-sage-bright:      #5b8769;
--color-bronze:           #a67c52;
--color-bronze-light:     #c9a47a;
--color-glass-bg:         rgba(26, 31, 25, 0.88);
--color-glass-border:     rgba(255, 255, 255, 0.13);
```

## 1.3 Tipografia (Tokens)

```css
--font-serif: var(--font-eb-garamond);
--font-sans:  var(--font-dm-sans);

/* Escala modular — Major Third (ratio 1.25) */
--text-xs:   0.75rem;   /* 12px */
--text-sm:   0.875rem;  /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg:   1.125rem;  /* 18px */
--text-xl:   1.25rem;   /* 20px */
--text-2xl:  1.5rem;    /* 24px */
--text-3xl:  1.875rem;  /* 30px */
--text-4xl:  2.25rem;   /* 36px */
```

## 1.4 Geometria — Border Radius

Filosofia: **Liquid Glass Organic Curves**.

```css
--radius-none: 0px;
--radius-xs:   4px;     /* Pills, chat bubbles, small badges */
--radius-sm:   8px;     /* Toasts, slim panels */
--radius-md:   12px;    /* Padrão para cards, inputs, botões */
--radius-lg:   16px;    /* Dashboard cards (rounded-xl) */
--radius-xl:   20px;
--radius-2xl:  28px;    /* Modais */
--radius-3xl:  36px;
```

## 1.5 Sombras

**Sombras estruturais são BANIDAS.** Elevação é feita via borda + background.

```css
--shadow-sm:   none;
--shadow-md:   none;
--shadow-lg:   none;
--shadow-xl:   none;
--shadow-2xl:  none;
--shadow-inner: none;
```

> **Exceção**: Superfícies **Liquid Glass** premium usam `box-shadow` literal com `inset` top glow + `rgba(0,0,0,*)` deep shadow. Ver §7.3.

## 1.6 Animação e Easing

```css
/* Durações */
--duration-instant: 80ms;
--duration-fast:    150ms;
--duration-normal:  220ms;
--duration-slow:    350ms;

/* Curvas de easing */
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in:  cubic-bezier(0.7, 0, 0.84, 0);
--ease-std: cubic-bezier(0.4, 0, 0.2, 1);
```

### Keyframes Disponíveis

| Nome | Efeito |
|---|---|
| `overlayIn` | Fade in (opacity 0 → 1) |
| `panelIn` | Fade in + scale(0.97) + translateY(4px) → normal |
| `panelOut` | Inverso de panelIn |
| `cardIn` | Fade in + translateY(8px) → 0 |
| `overlayOut` | Fade out |
| `shimmer` | Background position -200% → 200% (skeleton) |
| `pulse` | Opacity 1 → 0.5 → 1 (2s infinite) |

### Classes Utilitárias

```css
.animate-card-in   { animation: cardIn    var(--duration-slow)   var(--ease-out) both; }
.animate-fade-in   { animation: overlayIn var(--duration-normal) var(--ease-out); }
.animate-modal-out { animation: panelOut  var(--duration-fast)   var(--ease-in) forwards; }
.animate-pulse-dot { animation: pulse 2s infinite; }
```

## 1.7 Z-Index Architecture

> Use sempre estas variáveis; **nunca valores literais** nos componentes.

```css
--z-layout:   10;   /* TopBar, Sidebar desktop */
--z-sidebar:  20;   /* Sidebar sticky */
--z-nav:      30;   /* Mobile bottom nav */
--z-backdrop: 40;   /* Overlays de backdrop (mobile copiloto) */
--z-dropdown: 200;  /* Dropdowns, Popovers (NotificationBell) */
--z-panel:    300;  /* Chat panels, Drawers (CopilotWidget, SlideOver) */
--z-modal:    400;  /* Modais bloqueantes */
--z-toast:    500;  /* Toasts e alertas de sistema */
```

### Mobile Bottom Nav Height

```css
--bottom-nav-h: 0px;
@media (max-width: 767px) { :root { --bottom-nav-h: 64px; } }
```

---

# 2. Componentes Atômicos

## 2.1 Botão Primário (`.btn-primary`)

```css
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  min-height: 44px;                        /* touch target WCAG 2.5.5 */
  touch-action: manipulation;
  background-color: var(--color-primary);
  color: var(--color-primary-fg);
  border: 1px solid color-mix(in srgb, var(--color-sage-400) 60%, transparent);
  border-radius: var(--radius-md);
  font-family: var(--font-sans), sans-serif;
  font-size: var(--text-sm);
  font-weight: 500;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition:
    background-color var(--duration-fast) var(--ease-std),
    border-color     var(--duration-fast) var(--ease-std),
    transform        var(--duration-instant) var(--ease-std),
    box-shadow       var(--duration-fast) var(--ease-std);
}
```

**Estados:**

| Estado | Comportamento |
|---|---|
| `:hover` | `bg: --color-primary-hover`, dual-layer ring + ambient glow |
| `:active` | `transform: scale(0.98)`, `filter: brightness(0.92)` |
| `:focus-visible` | `outline: 2px solid var(--color-sage-400)`, offset 2px |
| `:disabled` | `opacity: 0.4`, `cursor: not-allowed`, `pointer-events: none` |

**Uso em JSX:**

```tsx
<button className="btn-primary" disabled={isPending}>
  {isPending ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
  Salvar
</button>
```

## 2.2 Botão Ghost (`.btn-ghost`)

```css
.btn-ghost {
  background-color: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 500;
  min-height: 44px;
  touch-action: manipulation;
}
```

**Estados:**

| Estado | Comportamento |
|---|---|
| `:hover` | `bg: rgba(255,255,255,0.04)`, `border: --color-border-strong`, `color: --color-text-primary` |
| `:active` | `transform: scale(0.98)` |
| `:focus-visible` | 2-layer sage ring |
| `:disabled` | `opacity: 0.4` |

## 2.3 Botão Destrutivo (`.btn-destructive`)

```css
.btn-destructive {
  background-color: transparent;
  color: var(--color-destructive);
  border: 1px solid color-mix(in srgb, var(--color-destructive) 40%, transparent);
  border-radius: var(--radius-md);
}
```

**Hover:** `bg: --color-destructive-bg`, borda 65% opacidade.

## 2.4 Surface / Card

```css
/* Surface padrão */
.surface {
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
}

/* Surface elevada */
.surface-elevated {
  background-color: var(--color-bg-elevated);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
}
```

**Padrão recorrente em dashboard cards:**

```tsx
<div className="bg-[#161c14] rounded-xl border border-[rgba(247,245,240,0.05)]
                p-[20px] md:p-[22px] flex flex-col h-full gap-5">
```

**Hover de card com elevação (KpiCard):**

```tsx
className="... hover:-translate-y-[3px]
               hover:border-[rgba(166,124,82,0.15)]
               hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
```

## 2.5 Label de Seção (`.label-section`)

```css
.label-section {
  font-family: var(--font-sans), sans-serif;
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.10em;
  color: var(--color-text-muted);
}
```

## 2.6 Toast (Sonner)

Componente: [src/components/ui/Toast.tsx](src/components/ui/Toast.tsx) — wrapper do Sonner.

**Configuração:**

```tsx
<SonnerToaster
  position="top-right"
  expand={false}
  visibleToasts={5}
  gap={8}
  offset={16}
  toastOptions={{
    unstyled: true,
    classNames: {
      toast:       'amplify-toast',
      title:       'amplify-toast-title',
      description: 'amplify-toast-desc',
      actionButton:'amplify-toast-action',
      closeButton: 'amplify-toast-close',
    },
    duration: 5000,
  }}
/>
```

**Estilo Liquid Glass:**

```css
.amplify-toast {
  width: 360px;
  max-width: calc(100vw - 32px);
  padding: 12px 16px;
  border-radius: 8px;
  background: rgba(14,20,15,0.82);
  backdrop-filter: blur(28px) saturate(160%) brightness(1.03);
  border-top: 1px solid rgba(255,255,255,0.14);
  border-left: 3px solid var(--toast-accent, rgba(122,155,109,0.7));
  border-right: 1px solid rgba(255,255,255,0.05);
  border-bottom: 1px solid rgba(255,255,255,0.04);
  box-shadow:
    0 1px 0 rgba(255,255,255,0.07) inset,
    0 20px 60px rgba(0,0,0,0.55),
    0 4px 20px rgba(0,0,0,0.35);
}
```

**Variantes por tipo (via CSS var `--toast-accent`):**

```css
[data-type="error"]   { --toast-accent: #f87171; }
[data-type="warning"] { --toast-accent: #fbbf24; }
[data-type="success"] { --toast-accent: #4ade80; }
[data-type="info"]    { --toast-accent: rgba(247,245,240,0.45); }
```

## 2.7 Status Badge

Padrão reutilizado em `PatientsClient`, `ProntuarioClient`, `AdSetsTable`:

```tsx
// Ativo
<span
  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm
             font-sans text-[11px] font-semibold whitespace-nowrap"
  style={{
    background: 'rgba(122,170,138,0.13)',
    border: '1px solid rgba(122,170,138,0.3)',
    color: '#7aaa8a'
  }}
>
  <span className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: '#7aaa8a' }} />
  Ativo
</span>
```

### Badge Semântico (recomendado)

Mapping canônico de status → cor:

```tsx
const STATUS_BADGE = {
  optimal: "bg-[rgba(122,155,109,0.15)] text-[var(--color-sage)]",
  active:  "bg-[rgba(166,124,82,0.15)]  text-[var(--color-bronze-light)]",
  warning: "bg-[rgba(196,168,74,0.15)]  text-[var(--color-risk-medium)]",
  paused:  "bg-[rgba(247,245,240,0.1)]  text-[var(--color-parchment-muted)]",
  critical:"bg-[rgba(220,80,60,0.12)]   text-[#f87171]",
} as const

<span className={`inline-flex px-2 py-1 rounded-md text-[10px] uppercase
                  font-bold tracking-wider ${STATUS_BADGE[status]}`}>
  {label}
</span>
```

### Pill Genérico (cores neutras)

```tsx
const PILL_COLORS = {
  blue:   { bg: 'rgba(100,130,200,0.12)', color: 'rgba(150,180,240,0.85)', border: '1px solid rgba(100,130,200,0.2)' },
  green:  { bg: 'rgba(122,155,109,0.12)', color: '#7a9b6d',               border: '1px solid rgba(122,155,109,0.22)' },
  bronze: { bg: 'rgba(166,124,82,0.12)',  color: '#c9a47a',               border: '1px solid rgba(166,124,82,0.22)' },
  red:    { bg: 'rgba(220,80,60,0.12)',   color: 'rgba(220,100,80,0.85)', border: '1px solid rgba(220,80,60,0.22)' },
}
```

## 2.8 Status Badge com Dot (Online/Offline)

Indicador de estado em tempo real:

```tsx
<div className="flex items-center gap-2">
  <span
    className="inline-block w-1.5 h-1.5 rounded-full"
    style={{
      background: isOnline ? '#7a9b6d' : 'rgba(166,124,82,0.7)',
      boxShadow: isOnline ? '0 0 5px rgba(122,155,109,0.7)' : 'none',
    }}
  />
  <span
    className="font-sans text-[11px] uppercase tracking-[0.2em]"
    style={{ color: isOnline ? 'rgba(122,155,109,0.75)' : 'rgba(166,124,82,0.65)' }}
  >
    {label}
  </span>
</div>
```

## 2.9 Notification Bell + Dropdown

**Bell button**: `w-11 h-11` (44px touch target), `rounded-lg`, hover `bg-[rgba(247,245,240,0.06)]`.

**Unread badge:**

```tsx
<span
  className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full
             flex items-center justify-center font-sans text-[9px] font-bold px-1"
  style={{ background: '#f87171', color: '#fff' }}
/>
```

**Dropdown panel** (via portal, Liquid Glass):

```tsx
style={{
  background:           'rgba(14,20,15,0.74)',
  backdropFilter:       'blur(28px) saturate(160%) brightness(1.03)',
  borderTop:            '1px solid rgba(255,255,255,0.16)',
  borderLeft:           '1px solid rgba(255,255,255,0.08)',
  borderRight:          '1px solid rgba(255,255,255,0.05)',
  borderBottom:         '1px solid rgba(255,255,255,0.04)',
  boxShadow:            `0 1px 0 rgba(255,255,255,0.09) inset,
                          0 16px 56px rgba(0,0,0,0.55),
                          0 4px 16px rgba(0,0,0,0.35)`,
}}
```

**Notification type color map:**

```tsx
const TYPE_COLORS = {
  crisis_detected:   '#f87171',
  transbordo:        '#fb923c',
  task_created:      '#818cf8',
  payment_confirmed: '#4ade80',
  new_patient:       '#34d399',
  memory_suggestion: '#38bdf8',
  expense_due:       '#fbbf24',
  lead:              '#fbbf24',
  message:           '#38bdf8',
  task:              '#818cf8',
  warning:           '#f87171',
  info:              'rgba(247,245,240,0.45)',
}
```

### Severity-Aware Notifications (NOVO)

Notificações em tempo real podem ter comportamento por severidade:

| Severity | Duração toast | Som | Cor |
|---|---|---|---|
| `critical` | 12s | sim (alert) | `#f87171` |
| `warn` | 6s | sim (chime) | `#fbbf24` |
| `info` | silencioso (5s) | não | `rgba(247,245,240,0.45)` |

Ver implementação em [src/components/dashboard/NotificationBell.tsx:102-126](src/components/dashboard/NotificationBell.tsx#L102-L126).

## 2.10 Progress Bar

Padrão usado em `BudgetCard` e `FunnelChart`:

```tsx
{/* Track */}
<div className="w-full h-2 rounded-full bg-[rgba(247,245,240,0.05)]">
  {/* Fill */}
  <div
    className="h-full rounded-full transition-all duration-700 ease-out"
    style={{
      width: `${percent}%`,
      background: `linear-gradient(90deg, var(--color-bronze) 0%,
                   var(--color-bronze-light) 100%)`,
    }}
  />
</div>
```

Share bar (menor, em tabela):

```tsx
<div className="w-[60px] h-1.5 rounded-full bg-[rgba(247,245,240,0.05)]">
  <div className="h-full rounded-full bg-[var(--color-bronze)]"
       style={{ width: `${share}%` }} />
</div>
```

## 2.11 KPI Card

```tsx
<div
  className="relative bg-[#161c14] rounded-xl p-4 md:p-[18px]
             border border-[rgba(247,245,240,0.05)]
             animate-card-in overflow-hidden shadow-sm
             transition-all duration-400
             hover:-translate-y-[3px]
             hover:border-[rgba(166,124,82,0.15)]
             hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)] group"
  style={{ animationDelay: `${delay}ms` }}
>
  {/* Accent bar no topo */}
  <div className="absolute top-0 left-0 right-0 h-[2px] opacity-70"
       style={{ background: `linear-gradient(90deg, ${color} 0%, transparent 100%)` }} />

  {/* Label */}
  <span className="text-[11px] uppercase tracking-wider
                    text-[var(--color-parchment-dim)] font-sans font-semibold">
    {label}
  </span>

  {/* Value */}
  <div className="text-3xl font-heading font-bold
                  text-[var(--color-bronze-light)] tracking-tight">
    {value}
  </div>

  {/* Change badge */}
  <span className={`inline-flex items-center rounded-md px-2.5 py-[3px]
                     text-[11px] font-semibold ${badgeColor}`}>
    {/* badgeColor: "text-[#4ADE80] bg-[#4ADE80]/15" ou
                    "text-[#F87171] bg-[#F87171]/12" */}
  </span>
</div>
```

## 2.12 Sparkline (SVG)

Usado dentro do KpiCard:

```tsx
<svg viewBox="0 0 100 32" className="w-full h-full" preserveAspectRatio="none">
  <defs>
    <linearGradient id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={color} stopOpacity="0.4" />
      <stop offset="100%" stopColor={color} stopOpacity="0" />
    </linearGradient>
  </defs>
  <polygon points={polygonPoints} fill={`url(#grad-${key})`} />
  <polyline points={points} fill="none" stroke={color}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
</svg>
```

---

# 3. Layouts e Shells

## 3.1 Dashboard Shell

Fonte: [src/app/dashboard/layout.tsx](src/app/dashboard/layout.tsx)

```tsx
<div className="flex h-dvh overflow-hidden" style={{ background: 'transparent' }}>
  {/* Sidebar — desktop only (md+) */}
  <Sidebar role={role} clinicName={clinicName} clinicLogoUrl={clinicLogoUrl} />

  <div className="flex-1 flex flex-col overflow-hidden relative">
    {/* TopBar — sticky */}
    <TopBar ... />

    {/* Main content — scroll area */}
    <main className="flex-1 overflow-y-auto w-full pb-safe-nav md:pb-0">
      {children}
    </main>
  </div>

  {/* FAB + alerts — fixed, omnipresentes */}
  <CopilotLoader />
  <ProactiveCopilotTrigger />
  <GlobalCrisisAlert />
</div>
```

### Sidebar Desktop

- Largura fixa: `w-[220px]`
- Altura: `h-screen sticky top-0`
- Background: **Liquid Glass** — `rgba(10,14,10,0.42)` + `backdrop-filter: blur(40px) saturate(180%)`
- Borda direita: `1px solid rgba(255,255,255,0.07)`
- Padding: `py-6`, items `px-3`
- Nav items: `rounded-xl text-sm`, gap `gap-3`, icon size `15-16px`
- Estado ativo: `text-[#c9a47a]`, `background: rgba(166,124,82,0.08)`, `borderLeft: 2px solid var(--color-bronze-400)`
- Estado inativo: `text-[rgba(247,245,240,0.52)]`
- Hover: `hover:text-[rgba(247,245,240,0.82)] hover:bg-[rgba(247,245,240,0.04)]`
- Group headers: `text-[10px] font-semibold uppercase tracking-widest`

### Mobile Bottom Nav

- `fixed bottom-0 left-0 right-0 h-16`
- Mesmo Liquid Glass da sidebar desktop
- `border-top: 1px solid rgba(255,255,255,0.07)`
- z-index: `var(--z-nav)` = 30
- Items: `flex-col`, icon 20px, label `text-[11px] font-sans font-semibold uppercase tracking-wider`

### TopBar

- `sticky top-0`, z-index: `var(--z-layout)`
- Padding: `px-5 py-3 md:px-8 md:py-3.5`
- Background: `rgba(255,255,255,0.04)` + `backdrop-blur-2xl`
- Bordas: top `rgba(255,255,255,0.14)`, bottom `rgba(255,255,255,0.06)`
- Shadow: `0 1px 0 rgba(255,255,255,0.07) inset, 0 8px 32px rgba(0,0,0,0.35)`

## 3.2 Page Layout (Content Area)

Padrão recorrente nas páginas:

```tsx
<div className="px-6 pt-8 pb-0">
  {/* Section label */}
  <p className="font-sans text-[10px] uppercase tracking-[0.22em] mb-3"
     style={{ color: 'rgba(166,124,82,0.72)' }}>
    Pacientes
  </p>

  {/* Heading */}
  <h1 className="font-heading text-3xl font-semibold tracking-tight leading-snug"
      style={{ color: '#f0ebe1' }}>
    Central de Gestão de Pacientes
  </h1>

  {/* Subtitle */}
  <p className="font-sans text-[12.5px] mt-1.5"
     style={{ color: 'rgba(240,235,225,0.32)' }}>
    Subtítulo descritivo
  </p>
</div>
```

## 3.3 Card / Surface Patterns

**Padrão dashboard cards (KpiCard, Chart, Table):**

```
bg:            #161c14 (literal) ou var(--color-bg-surface)
border:        1px solid rgba(247,245,240,0.05)
border-radius: rounded-xl (16px)
padding:       p-[20px] md:p-[22px]
layout:        flex flex-col h-full gap-5
```

**Padrão prontuário / cards menores com accent:**

```
bg:            rgba(247,245,240,0.025)
border:        1px solid rgba(247,245,240,0.07)
border-left:   3px solid rgba(122,155,109,0.35)  /* accent */
border-radius: rounded-sm (4px)
```

**Card heading padrão:**

```tsx
<h2 className="text-[var(--color-parchment)] font-heading font-bold text-lg leading-tight">
```

## 3.4 Mobile-First Patterns

O projeto usa **mobile-first** com breakpoint `md:` (768px) como principal:

- Sidebar: `hidden md:flex`
- Bottom nav: `md:hidden`
- TopBar padding: `px-5 py-3 md:px-8 md:py-3.5`
- Card padding: `p-4 md:p-[18px]`
- Grid layouts: `grid-cols-1 md:grid-cols-3`
- Role badge: `hidden md:block`
- Logout mobile: `md:hidden`
- Bottom safe area: `pb-safe-nav md:pb-0`

### Safe Area (iOS)

```css
@supports (padding: env(safe-area-inset-bottom)) {
  @media (max-width: 767px) {
    .pb-safe-nav {
      padding-bottom: calc(4rem + env(safe-area-inset-bottom));
    }
  }
}
```

## 3.5 Copilot / Right Panel

- Fixed right: `fixed top-0 right-0 h-full`
- Width: `min(420px, 100vw)`
- Slide transition: `transition-transform duration-300 ease-out`
- Open: `translateX(0)`, closed: `translateX(100%)`
- Background: Liquid Glass — `rgba(255,255,255,0.05)` + `backdrop-blur-2xl`
- Borders: left `rgba(255,255,255,0.14)`, top `rgba(255,255,255,0.10)`
- z-index: `var(--z-panel)` = 300
- Mobile backdrop: `fixed inset-0` + `rgba(0,0,0,0.52)` + `z-backdrop` = 40

### FAB (Floating Action Button)

```tsx
style={{
  zIndex:       'var(--z-panel, 300)',
  bottom:       'calc(var(--bottom-nav-h, 0px) + 20px + env(safe-area-inset-bottom, 0px))',
  right:        '20px',
  width:        '52px',
  height:       '52px',
  borderRadius: '50%',
  border:       '2px solid rgba(201,164,122,0.45)',
  boxShadow:    '0 0 0 1px rgba(201,164,122,0.15), 0 4px 20px rgba(0,0,0,0.40)',
}}
```

---

# 4. Padrões de Estado

## 4.1 Loading

### Skeleton

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-bg-surface) 25%,
    color-mix(in srgb, var(--color-bg-surface) 60%, var(--color-charcoal-400)) 50%,
    var(--color-bg-surface) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.8s ease-in-out infinite;
  border-radius: var(--radius-xs);
}
```

### Spinner (Loader2 de lucide-react)

```tsx
<Loader2 size={14} className="animate-spin" />
{/* Variante com cor sage */}
<Loader2 size={13} className="animate-spin"
         style={{ color: 'rgba(122,155,109,0.7)' }} />
```

### Loading state (tela cheia)

```tsx
<div className="flex flex-col items-center justify-center h-full
                text-[#f7f5f0]/50 font-sans mt-32">
  <div className="animate-pulse mb-4 text-2xl">⏳</div>
  <p>{message}</p>
  <p className="text-xs mt-2 text-[#f7f5f0]/30">Hint text.</p>
</div>
```

### Disabled Button

```css
.btn-primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}
```

## 4.2 Erro

### Form Error Inline

```tsx
{formError && (
  <p className="font-sans text-xs mt-2" style={{ color: '#f87171' }}>
    {formError}
  </p>
)}
```

### Crisis Alert (Modal Bloqueante)

Reservado para risco de vida ou perda crítica — não usar para erros comuns.

```tsx
// Backdrop
style={{
  zIndex:     9999,
  background: 'rgba(0,0,0,0.88)',
  backdropFilter: 'blur(14px)',
}}

// Card
style={{
  background: 'rgba(18,6,6,0.98)',
  border:     '1px solid rgba(220,80,60,0.4)',
  boxShadow:  '0 0 64px rgba(220,60,60,0.28), 0 8px 32px rgba(0,0,0,0.6)',
}}

// Header
style={{
  background:   'rgba(220,60,60,0.18)',
  borderBottom: '1px solid rgba(220,60,60,0.25)',
}}
// Icon/text: color '#f87171'

// A11y obrigatório
role="alertdialog"
aria-modal="true"
aria-labelledby="crisis-alert-title"
```

## 4.3 Empty State

### Padrão Universal

```tsx
<div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center">
  {/* Container do ícone — 64×64 com gradient sage */}
  <div
    className="w-16 h-16 rounded-sm flex items-center justify-center"
    style={{
      background: 'linear-gradient(135deg, rgba(122,155,109,0.1) 0%, rgba(92,122,80,0.05) 100%)',
      border:     '1px solid rgba(122,155,109,0.14)',
    }}
  >
    <MessageSquare size={28} strokeWidth={1} style={{ color: 'rgba(122,155,109,0.45)' }} />
  </div>

  {/* Title + subtitle */}
  <div>
    <p className="font-heading text-xl" style={{ color: 'rgba(247,245,240,0.45)' }}>
      Título do empty state
    </p>
    <p className="font-sans text-xs mt-1" style={{ color: 'rgba(247,245,240,0.2)' }}>
      Descrição do que fazer / por quê está vazio
    </p>
  </div>

  {/* CTA opcional */}
  {/* <button className="btn-primary mt-2">Criar primeiro</button> */}
</div>
```

### Empty Inline (lista compacta)

```tsx
<div className="flex flex-col items-center justify-center py-10 gap-2">
  <Bell size={22} strokeWidth={1}
        style={{ color: 'rgba(247,245,240,0.12)' }} />
  <p className="font-sans text-xs"
     style={{ color: 'rgba(247,245,240,0.25)' }}>
    Nenhum item
  </p>
</div>
```

### Empty Texto Itálico (dado ausente em ficha)

```tsx
<p className="font-sans text-xs italic"
   style={{ color: 'rgba(247,245,240,0.2)' }}>
  Nenhuma evolução registrada
</p>
```

---

# 5. Padrões de Formulário

## 5.1 Input Base (globals.css)

```css
input:not([type='checkbox']):not([type='radio']):not([type='range']),
textarea,
select {
  background-color: rgba(255, 255, 255, 0.03);
  color: var(--color-text-primary);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  color-scheme: dark;
  transition:
    background-color var(--duration-fast) var(--ease-std),
    box-shadow       var(--duration-fast) var(--ease-std);
}

/* Hover */
input:hover:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.05);
}

/* Focus — anel bronze/dourado */
input:focus-visible {
  outline: none;
  background-color: rgba(255, 255, 255, 0.05);
  border-color: transparent;
  box-shadow:
    0 0 0 1px rgba(201, 164, 122, 0.50),
    0 0 0 3px rgba(201, 164, 122, 0.12);
}

/* Placeholder */
input::placeholder {
  color: var(--color-text-disabled);
  opacity: 1;
}
```

## 5.2 Label

```tsx
<label
  htmlFor={id}
  className="block font-sans text-[10px] uppercase tracking-[0.2em] mb-1.5"
  style={{ color: 'rgba(240,235,225,0.45)' }}
>
  {label}
</label>
```

## 5.3 Field Wrapper

```tsx
function Field({ label, id, children }) {
  return (
    <div>
      <label htmlFor={id}
             className="block font-sans text-[10px] uppercase tracking-[0.2em] mb-1.5"
             style={{ color: 'rgba(240,235,225,0.45)' }}>
        {label}
      </label>
      <div className="px-4 py-3 rounded-sm transition-all duration-150"
           style={{ background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)' }}
           onFocus={e => (e.currentTarget.style.borderColor = 'rgba(166,124,82,0.4)')}
           onBlur={e  => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}>
        {children}
      </div>
    </div>
  )
}
```

## 5.4 Input em Copilot/Chat

```tsx
<textarea
  className="flex-1 font-sans text-sm px-3 py-2 outline-none
             transition-colors resize-none no-scrollbar"
  style={{
    backgroundColor: 'rgba(247,245,240,0.04)',
    border:          '1px solid rgba(247,245,240,0.08)',
    borderRadius:    '3px',
    color:           'rgba(247,245,240,0.88)',
    minHeight:       '36px',
    maxHeight:       '120px',
    overflowY:       'auto',
  }}
  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(122,155,109,0.4)')}
  onBlur={e  => (e.currentTarget.style.borderColor = 'rgba(247,245,240,0.08)')}
/>
```

## 5.5 Select (Option styling)

```css
option {
  background-color: var(--color-bg-elevated);
  color: var(--color-text-primary);
}
```

## 5.6 Erro Inline

```tsx
{formError && (
  <p className="font-sans text-xs mt-2" style={{ color: '#f87171' }}>
    {formError}
  </p>
)}
```

## 5.7 Autofill Override

```css
input:-webkit-autofill {
  -webkit-box-shadow: 0 0 0 1000px var(--color-bg-base) inset !important;
  -webkit-text-fill-color: var(--color-text-primary) !important;
  caret-color: var(--color-text-primary);
  transition: background-color 5000s ease-in-out 0s;
}
```

---

# 6. Tipografia

## 6.1 Fontes

| Variável CSS | Fonte Google | Pesos | Uso |
|---|---|---|---|
| `--font-eb-garamond` | **EB Garamond** | 500, 600, 700, 800 | Headings (h1-h4), títulos de seção, valores numéricos de destaque |
| `--font-dm-sans` | **DM Sans** | 400, 500, 600 | Body, labels, botões, UI geral |

**Declaração no root layout:**

```tsx
const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-eb-garamond",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-dm-sans",
  display: "swap",
});

<body className={`${ebGaramond.variable} ${dmSans.variable} font-sans antialiased`}>
```

## 6.2 Hierarquia Tipográfica

### Headings (h1-h4) — Serif

```css
h1, h2, h3, h4 {
  font-family: var(--font-serif), Georgia, serif;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.01em;
  color: var(--color-text-primary);
}
```

Classes Tailwind recorrentes:

- **h1 de página**: `font-heading text-3xl font-semibold tracking-tight leading-snug`
- **h2 de card**: `font-heading font-bold text-lg leading-tight`
- **h3 de seção interna**: `text-[11px] uppercase tracking-[0.15em] font-bold font-sans` (usa sans!)

### Labels de Seção (h5, h6) — Sans

```css
h5, h6 {
  font-family: var(--font-sans), sans-serif;
  font-weight: 600;
  font-size: var(--text-sm);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-tertiary);
}
```

### Body (sans)

```css
body {
  font-family: var(--font-sans), system-ui, sans-serif;
  font-size: var(--text-base);
  line-height: 1.6;
}
```

## 6.3 Escala Efetivamente Usada

| Tamanho | Uso |
|---|---|
| `text-[9px]` | Badge labels (uppercase), hints ultra-discretos |
| `text-[10px]` | Section labels (uppercase tracking-widest), counter pills, confidence % |
| `text-[11px]` | Status badges, nav labels mobile, table headers, bottom-row metadata |
| `text-xs` (12px) | Body em cards menores, descriptions, helper text |
| `text-[12.5px]` | Subtítulos de página |
| `text-[13px]` | Valores em tabelas, items de AI insight, destaques médios |
| `text-sm` (14px) | Botões, nav items, inputs, chat messages |
| `text-base` (16px) | Heading de empty state, títulos intermediários |
| `text-lg` (18px) | Card headings (h2) |
| `text-xl+` (20px+) | KPI values (text-3xl), budget percent (text-4xl) |

## 6.4 Pesos por Contexto

| Contexto | Font-weight | Font-family |
|---|---|---|
| Page heading | 600 (semibold) | Serif (EB Garamond) |
| Card heading | 700 (bold) | Serif |
| KPI value | 700-800 (bold/extrabold) | Serif |
| Section label | 600 (semibold) | Sans + uppercase + tracking |
| Body text | 400 (regular) | Sans |
| Button label | 500 (medium) | Sans |
| Badge / pill | 600 (semibold) | Sans |
| Muted / hint | 400-500 | Sans |

---

# 7. Dark Theme + Liquid Glass

## 7.1 Implementação

O projeto é **dark-only**. Não existe light mode.

- `color-scheme: dark` aplicado nos inputs via CSS.
- `<html lang="pt-BR">` — sem classe `.dark` ou atributo `data-theme`.
- Não há `prefers-color-scheme: light` media query.
- Background do body: mesh gradient escuro com blobs verdes e âmbares.
- Todas as cores do design system são calibradas para fundo escuro.

## 7.2 Body Background (Mesh Gradient)

```css
body {
  background-color: #0a0d09;
  background-image:
    radial-gradient(ellipse 72% 58% at 18% -6%,
                    rgba(20,52,17,0.72) 0%, transparent 62%),
    radial-gradient(ellipse 55% 48% at 88% 96%,
                    rgba(92,64,22,0.38) 0%, transparent 62%),
    url("data:image/svg+xml,...");  /* grain texture */
  background-repeat: no-repeat, no-repeat, repeat;
  background-attachment: fixed;
}
```

## 7.3 Liquid Glass

Técnica premium usada em superfícies de destaque (Sidebar, TopBar, Modais, Toasts, Dropdowns, Chat panel, SlideOvers).

**Fórmula base:**

```css
background: rgba(X, X, X, 0.42-0.82);      /* semi-translúcido */
backdrop-filter: blur(28-40px) saturate(160-180%);
-webkit-backdrop-filter: blur(28-40px) saturate(160-180%);

/* Light catchers — bordas assimétricas */
border-top:    1px solid rgba(255,255,255, 0.10-0.18);  /* mais brilhante */
border-left:   1px solid rgba(255,255,255, 0.05-0.14);
border-right:  1px solid rgba(255,255,255, 0.04-0.08);
border-bottom: 1px solid rgba(255,255,255, 0.04-0.06);

/* Shadow: inset top glow + deep external shadow */
box-shadow:
  0 1px 0 rgba(255,255,255,0.07) inset,
  0 16-24px 56-80px rgba(0,0,0,0.45-0.55),
  0 4px 16-20px rgba(0,0,0,0.30-0.35);
```

**Quando usar Liquid Glass vs surface opaca:**

| Use Liquid Glass | Use surface opaca |
|---|---|
| Elementos flutuantes sobre conteúdo (modais, dropdowns, drawers) | Cards de dashboard |
| Layout chrome (sidebar, topbar) | Tabelas, listas |
| Toasts, popovers, FABs | Inputs, formulários |

## 7.4 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 7.5 Scrollbar

```css
::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb {
  background: var(--color-border-strong);
  border-radius: 0;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-disabled);
}
```

Classe utilitária para ocultar scrollbar:

```css
.no-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.no-scrollbar::-webkit-scrollbar { display: none; }
```

---

# 8. Padrões Compostos

> Padrões que combinam tokens + componentes atômicos em estruturas reutilizáveis. **Esta é a seção mais importante para fork inter-projeto** — copia o snippet, adapta o conteúdo.

## 8.1 SlideOver / Drawer (lateral direito)

Usado para edição/detalhe contextual sem perder o contexto da listagem (ex: detalhe de tarefa, ficha de paciente, edição rápida).

**Specs:**
- Width: `max-w-[540px]` (responsivo: 100% mobile, 540px desktop)
- Animação: `slideIn 220ms ease-out`
- Backdrop: `rgba(0,0,0,0.55)` + `blur(2px)`, clicável para fechar
- Border-top opcional: 3px com cor por prioridade/contexto
- Body scroll lock obrigatório enquanto aberto

```tsx
<div className="fixed inset-0 z-[var(--z-panel)] flex" role="dialog" aria-modal="true">
  {/* Backdrop clicável */}
  <button
    type="button"
    onClick={onClose}
    className="flex-1 transition-opacity"
    style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)' }}
    aria-label="Fechar"
  />

  {/* Drawer panel */}
  <aside
    className="w-full max-w-[540px] h-full flex flex-col animate-[slideIn_220ms_ease-out]"
    style={{
      background: 'rgba(20,18,16,0.98)',
      borderLeft: '1px solid rgba(247,245,240,0.07)',
      borderTop: `3px solid ${PRIORITY_BORDER[priority] ?? 'rgba(247,245,240,0.08)'}`,
    }}
  >
    {/* Header sticky */}
    <div className="flex items-center justify-between px-6 py-4 shrink-0"
         style={{ borderBottom: '1px solid rgba(247,245,240,0.05)' }}>
      <p className="font-sans text-[11px] font-semibold uppercase tracking-widest"
         style={{ color: 'rgba(166,124,82,0.7)' }}>
        Detalhe da Tarefa
      </p>
      <button onClick={onClose}
              className="w-8 h-8 rounded-sm flex items-center justify-center
                         transition-colors hover:bg-[rgba(247,245,240,0.06)]">
        <X size={16} />
      </button>
    </div>

    {/* Body scrollável */}
    <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
      {/* Conteúdo */}
    </div>

    {/* Footer sticky com ações */}
    <div className="shrink-0 px-6 py-4 flex flex-col gap-2"
         style={{ borderTop: '1px solid rgba(247,245,240,0.05)' }}>
      <textarea ... />
      <button type="submit" className="btn-primary">
        Salvar
      </button>
    </div>
  </aside>
</div>

{/* Animação */}
<style jsx>{`
  @keyframes slideIn {
    from { transform: translateX(100%); }
    to   { transform: translateX(0); }
  }
`}</style>
```

**Body scroll lock:**

```tsx
useEffect(() => {
  const prev = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  return () => { document.body.style.overflow = prev }
}, [])
```

## 8.2 Vertical Tabs Layout (Settings)

Para páginas de configuração com 5+ seções. Em mobile, considere converter em `<select>` ou accordion.

**Specs:**
- Sidebar: `w-48 flex-shrink-0`
- Item ativo: bronze 0.15 bg + bronze borda
- Item inativo: transparente + parchment 0.08 borda

```tsx
const TABS = [
  { id: 'perfil',    label: 'Clínica',       icon: Building2 },
  { id: 'owner',     label: 'Proprietário',  icon: User },
  { id: 'ia',        label: 'Assistente IA', icon: Sparkles },
  // ...
]

function tabStyle(active: boolean): React.CSSProperties {
  return active
    ? { background: 'rgba(166,124,82,0.15)', color: '#c9a47a',
        border: '1px solid rgba(166,124,82,0.3)' }
    : { background: 'transparent', color: 'rgba(247,245,240,0.4)',
        border: '1px solid rgba(247,245,240,0.08)' }
}

<div className="flex gap-6">
  <nav className="flex flex-col gap-0.5 w-48 flex-shrink-0">
    {TABS.map(tab => (
      <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        className="flex items-center gap-3 px-4 py-3 rounded-sm text-sm transition-all"
        style={tabStyle(activeTab === tab.id)}
      >
        <tab.icon size={16} strokeWidth={1.5} />
        {tab.label}
      </button>
    ))}
  </nav>

  <div className="flex-1">
    {activeTab === 'perfil' && <TabPerfil />}
    {/* ... */}
  </div>
</div>
```

## 8.3 System / Quota Alert Banner

Banner sticky no topo para avisos persistentes (quota próxima do limite, billing, manutenção).

**Specs:**
- Posição: `sticky top-0 z-[var(--z-backdrop)]`
- Backdrop blur: `blur(10px)`
- Dismissible: salva em `sessionStorage` com key `amplify:banner:dismissed:<id>`

```tsx
const palette = severity === 'critical'
  ? { bg: 'rgba(220,60,60,0.14)',  border: 'rgba(220,60,60,0.35)',
      fg: '#f87171', icon: '#f87171' }
  : { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.35)',
      fg: '#fbbf24', icon: '#fbbf24' }

<div
  role="alert"
  className="sticky top-0 z-40 w-full"
  style={{
    background:     palette.bg,
    borderBottom:   `1px solid ${palette.border}`,
    backdropFilter: 'blur(10px)',
  }}
>
  <div className="flex items-center gap-3 px-4 py-2.5 max-w-7xl mx-auto">
    <AlertTriangle size={16} strokeWidth={2.5}
                   style={{ color: palette.icon, flexShrink: 0 }} />

    <div className="flex-1 min-w-0">
      <p className="font-sans text-sm font-semibold leading-snug"
         style={{ color: palette.fg }}>
        {title}
      </p>
      {body && (
        <p className="font-sans text-xs leading-snug mt-0.5"
           style={{ color: 'rgba(247,245,240,0.7)' }}>
          {body}
        </p>
      )}
    </div>

    <div className="flex items-center gap-2 shrink-0">
      {actionUrl && (
        <Link href={actionUrl}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                         font-sans text-xs font-semibold"
              style={{
                background: 'rgba(255,255,255,0.08)',
                color:      palette.fg,
                border:     `1px solid ${palette.border}`,
              }}>
          <ExternalLink size={12} />
          {cta}
        </Link>
      )}
      {canDismiss && (
        <button onClick={() => dismiss(id)}
                className="w-7 h-7 flex items-center justify-center rounded"
                style={{ color: 'rgba(247,245,240,0.4)' }}
                aria-label="Dispensar">
          <X size={14} strokeWidth={2} />
        </button>
      )}
    </div>
  </div>
</div>
```

## 8.4 Chat Bubbles + Status Icons

Bubbles assimétricos (3 cantos arredondados, 1 vivo apontando emissor) + ícones de status WhatsApp-style.

**Specs:**
- Max-width: 85%
- Padding: `px-3.5 py-2.5`
- Border-radius: `4px 4px 0px 4px` (user) / `0px 4px 4px 4px` (assistant)
- Status icons: 10px, lucide

```tsx
// Render bubble
const isUser = msg.role === 'user'
const bubbleStyle = isUser
  ? {
      background: 'rgba(50,78,42,0.72)',          // sage-dark
      border:     '1px solid rgba(122,155,109,0.18)',
      borderRadius: '4px 4px 0px 4px',
    }
  : {
      background: 'rgba(247,245,240,0.06)',       // parchment ultra-light
      border:     '1px solid rgba(247,245,240,0.07)',
      borderRadius: '0px 4px 4px 4px',
    }

<div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-1`}>
  <div
    className="max-w-[85%] px-3.5 py-2.5 font-sans text-sm"
    style={{ ...bubbleStyle, lineHeight: '1.55',
             color: isUser ? 'rgba(247,245,240,0.9)' : 'rgba(247,245,240,0.82)' }}
  >
    {msg.role === 'assistant'
      ? <MarkdownContent content={msg.content} />
      : msg.content}
  </div>
</div>

{/* Meta row: timestamp + status (apenas user) */}
<div className={`flex items-center gap-1 mt-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
  <span className="font-sans text-[9px]" style={{ color: 'rgba(247,245,240,0.3)' }}>
    {formatTime(msg.sent_at)}
  </span>
  {isUser && <StatusIcon status={msg.status} />}
</div>
```

**Status icons (WhatsApp-style):**

```tsx
function StatusIcon({ status }: { status: MessageStatus }) {
  if (status === 'sending')   return <Clock        size={10} style={{ color: 'rgba(247,245,240,0.28)' }} />
  if (status === 'sent')      return <Check        size={10} style={{ color: 'rgba(122,155,109,0.5)' }} />
  if (status === 'delivered') return <CheckCheck   size={10} style={{ color: 'rgba(122,155,109,0.65)' }} />
  if (status === 'read')      return <CheckCheck   size={10} style={{ color: 'rgba(122,155,109,1)' }} />
  if (status === 'failed')    return <AlertTriangle size={10} style={{ color: 'rgba(220,70,50,0.9)' }} />
  return null
}
```

## 8.5 Markdown Rendering em Chat

Para mensagens de assistant que renderizam tabelas, listas, code blocks.

```tsx
// Tabela
<table className="w-full border-collapse my-2 font-sans text-xs">
  <thead>
    <tr style={{ borderBottom: '1px solid rgba(201,164,122,0.2)' }}>
      <th className="text-left px-2 py-1 font-semibold"
          style={{ color: 'rgba(201,164,122,0.85)' }}>
        Coluna
      </th>
    </tr>
  </thead>
  <tbody>
    <tr style={{ borderBottom: '1px solid rgba(247,245,240,0.04)' }}>
      <td className="px-2 py-1" style={{ color: 'rgba(247,245,240,0.78)' }}>
        Valor
      </td>
    </tr>
  </tbody>
</table>

// Code block
<pre className="my-2 px-3 py-2 rounded-sm overflow-x-auto"
     style={{
       background: 'rgba(247,245,240,0.04)',
       border:     '1px solid rgba(247,245,240,0.06)',
       fontFamily: 'ui-monospace, monospace',
       fontSize:   '12px',
     }}>
  <code style={{ color: 'rgba(122,155,109,0.85)' }}>
    {codeContent}
  </code>
</pre>

// Lista
<ul className="my-1 pl-4 list-disc"
    style={{ color: 'rgba(247,245,240,0.82)' }}>
  <li>Item</li>
</ul>
```

## 8.6 Data Table

Padrão de tabela responsiva com `overflow-x-auto` em wrapper.

**Specs:**
- Container: `bg-[#161c14] rounded-xl border` + `overflow-x-auto min-w-[700px]`
- Header: `text-[10px] uppercase tracking-wider font-semibold` em `--color-parchment-muted`
- Row: `py-3 px-2`, `hover:bg-[rgba(247,245,240,0.02)]` + `transition-colors`
- Border entre rows: `border-b border-[rgba(247,245,240,0.05)]`
- Color-coded cells (CPL, KPI): cores semânticas inline (sage/risk-critical/parchment)

```tsx
<div className="bg-[#161c14] rounded-xl border border-[rgba(247,245,240,0.05)]
                p-[20px] flex flex-col w-full overflow-x-auto gap-4">
  <h2 className="text-[var(--color-parchment)] font-heading font-bold text-lg">
    Performance por Item
  </h2>

  <div className="w-full overflow-x-auto min-w-[700px]">
    <table className="w-full text-left border-collapse font-sans">
      <thead>
        <tr className="border-b border-[rgba(247,245,240,0.05)]
                       text-[10px] uppercase
                       text-[var(--color-parchment-muted)]
                       tracking-wider font-semibold">
          <th className="pb-3 pl-2">Nome</th>
          <th className="pb-3 px-2">Valor</th>
          <th className="pb-3 px-2">CPL</th>
          <th className="pb-3 pr-2">Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(row => (
          <tr key={row.id}
              className="border-b border-[rgba(247,245,240,0.05)]
                         hover:bg-[rgba(247,245,240,0.02)]
                         transition-colors">
            <td className="py-3 pl-2 text-xs font-semibold
                           text-[var(--color-parchment)]">
              {row.name}
            </td>
            <td className="py-3 px-2 text-[13px] font-bold">
              {row.value}
            </td>
            <td className={`py-3 px-2 text-[13px] font-bold ${
              row.cpl < 10 ? 'text-[var(--color-sage)]' :
              row.cpl > 15 ? 'text-[var(--color-risk-critical)]' :
              'text-[var(--color-parchment)]'
            }`}>
              R${row.cpl.toFixed(2)}
            </td>
            <td className="py-3 pr-2">
              <span className={`inline-flex px-2 py-1 rounded-md text-[10px]
                              uppercase font-bold tracking-wider
                              ${STATUS_BADGE[row.status]}`}>
                {row.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
```

## 8.7 Dialog / Modal com Formulário

Para criar/editar entidades. Diferente do SlideOver (lateral) — modal centraliza atenção total.

**Specs:**
- Backdrop: `rgba(0,0,0,0.5)`, click outside fecha
- Max-width: `max-w-2xl` (forms simples) ou `max-w-4xl` (forms complexos)
- Body: `max-h-[90vh] overflow-y-auto`
- Footer: actions com `gap-3`, primário primeiro
- z-index: `var(--z-modal)` = 400

```tsx
{isOpen && (
  <div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4"
       onClick={handleClose}
       role="dialog" aria-modal="true" aria-labelledby="modal-title">
    {/* Backdrop */}
    <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)' }} />

    {/* Modal panel */}
    <div className="relative bg-[#0d120e] rounded-sm max-w-2xl w-full
                    p-8 max-h-[90vh] overflow-y-auto"
         onClick={e => e.stopPropagation()}>
      <h2 id="modal-title" className="font-heading text-2xl font-bold mb-6">
        Nova Consulta
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Field label="Paciente">
          <input type="text" name="patient" />
        </Field>

        <Field label="Título">
          <input type="text" name="title" />
        </Field>

        <div className="flex items-center gap-3 pt-4">
          <button type="submit" disabled={isPending} className="btn-primary">
            {isPending ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
            Criar
          </button>
          <button type="button" onClick={handleClose} className="btn-ghost">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  </div>
)}
```

## 8.8 Modal Liquid Glass (CSS class)

Para modais "premium" (preferência: usar over o pattern em §8.7).

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.55);
  animation: overlayIn var(--duration-normal) var(--ease-out);
}

.modal-panel {
  background-color: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-top: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: var(--radius-2xl);            /* 28px */
  animation: panelIn var(--duration-normal) var(--ease-out);
}
```

---

# 9. Iconografia

## 9.1 Biblioteca

**lucide-react** é a única biblioteca de ícones permitida. Não usar emoji, FontAwesome, Material Icons, Heroicons, ou ícones customizados em SVG/PNG.

## 9.2 Convenções

| Contexto | Size | StrokeWidth |
|---|---|---|
| Botão padrão | 14-15px | 1.5 |
| Nav item desktop | 15-16px | 1.5 |
| Nav item mobile | 20px | 1.5 |
| Badge (com label) | 10-12px | 2-2.5 |
| Alert / Banner | 16px | 2.5 |
| Empty state container | 28px | 1 |
| Status icon (chat) | 10px | default |

## 9.3 Ícones Mais Frequentes

```
LayoutDashboard, Users, Calendar, Megaphone, BarChart3,
Settings, Wallet, Bell, Send, Loader2, ChevronDown,
ChevronRight, X, Save, Pencil, Trash2, AlertTriangle,
Brain, FileText, ClipboardCheck, FlaskConical,
Stethoscope, Copy, Check, CheckCheck, Clock,
MessageSquare, Building2, User, Sparkles, Plus,
ExternalLink, Zap
```

---

# 10. Charts (Recharts)

Biblioteca: **recharts** (`AreaChart`, `LineChart`, `BarChart`, `ResponsiveContainer`).

## 10.1 Palette de Métricas

```tsx
const metricsConfig = {
  leads: { color: "#7a9b6d" },   // sage
  cpl:   { color: "#a67c52" },   // bronze
  ctr:   { color: "#5c7a50" },   // sage muted
  spend: { color: "#c45d4a" },   // red muted
  // Para novos projetos, manter sage = primário, bronze = secundário
};
```

## 10.2 Tooltip Style

```tsx
contentStyle={{
  backgroundColor: "#1c231a",
  borderColor: "rgba(247,245,240,0.1)",
  borderRadius: "8px",
  color: "#f7f5f0",
  fontFamily: "var(--font-dm-sans)",
}}
```

## 10.3 Grid + Axis

```tsx
<CartesianGrid strokeDasharray="4 4"
               stroke="rgba(247,245,240,0.04)"
               vertical={false} />

<XAxis tick={{ fill: "rgba(247,245,240,0.5)",
               fontSize: 10,
               fontFamily: "var(--font-dm-sans)" }} />
```

## 10.4 Acessibilidade de Charts

- Sempre incluir tooltip com valores exatos (não confiar só na cor)
- Para dados críticos, oferecer alternativa em tabela
- Usar padrões/strokes diferentes além de cor (colorblind-safe)
- Empty state com mensagem clara, não chart vazio
- Loading com skeleton, não axis vazio

---

# 11. Checklist de PR Review

Use este checklist em todo PR que mexe em UI:

## 11.1 Tokens

- [ ] Não há cores primitivas (`#45624e`) hardcoded em componentes — só semânticos
- [ ] Não há `box-shadow` literal em cards comuns (só Liquid Glass)
- [ ] Z-index usa variável (`var(--z-*)`) — nunca número literal
- [ ] Border-radius usa token (`var(--radius-*)`) ou Tailwind equivalente
- [ ] Animação usa duração + easing tokens

## 11.2 Acessibilidade

- [ ] Todo botão tem `min-height: 44px` (ou `w-11 h-11` em ícone-only)
- [ ] Todo botão ícone-only tem `aria-label`
- [ ] `:focus-visible` está presente e visível (sage 2-layer ring)
- [ ] Modais têm `role="dialog"` + `aria-modal="true"` + `aria-labelledby`
- [ ] Contraste mínimo 4.5:1 para body text, 3:1 para large text
- [ ] Cores não são o único veículo de informação (status sempre tem dot/icon/label)
- [ ] `prefers-reduced-motion` é respeitado (usa media query global)

## 11.3 Interação

- [ ] `touch-action: manipulation` em botões
- [ ] Loading state com spinner + disabled durante async
- [ ] Erros aparecem perto do campo (não só no topo)
- [ ] Ações destrutivas usam `.btn-destructive` ou cor `--color-destructive`
- [ ] Navegação preserva scroll ao voltar

## 11.4 Layout

- [ ] Mobile-first (testado em 375px)
- [ ] Safe area respeitada em fixed elements (`env(safe-area-inset-bottom)`)
- [ ] Sem horizontal scroll em mobile
- [ ] Cards com altura uniforme em grid (`flex flex-col h-full`)

## 11.5 Tipografia

- [ ] Headings (h1-h4) usam serif (`font-heading`)
- [ ] Labels uppercase usam sans com `tracking-[0.2em]` ou maior
- [ ] Body é mínimo 14px (mobile) ou 16px (desktop)
- [ ] Números em tabelas usam `font-bold` para destaque

## 11.6 Estado

- [ ] Empty state implementado com ícone + título + descrição
- [ ] Loading skeleton ou spinner em operações > 300ms
- [ ] Disabled state com opacity 0.4 + cursor not-allowed
- [ ] Toast usado para feedback (não alert nativo)

## 11.7 Iconografia

- [ ] Lucide React (não emoji, não outras libs)
- [ ] StrokeWidth consistente (1.5 padrão)
- [ ] Size respeita contexto (tabela 9.2)

---

# 12. Guia de Fork Inter-Projeto

> Para criar um novo produto Amplify (ex: Amplify Health, Amplify Legal, Amplify Dental) reaproveitando este design system.

## 12.1 O que copiar SEM alterar

- **Toda a estrutura semântica** de tokens (`§1.2`): nomes, hierarquia, escala
- **Todos os componentes atômicos** (`§2`): btn-primary, btn-ghost, surface, etc.
- **Layout shell** (`§3`): Sidebar + TopBar + main + FAB pattern
- **Padrões de estado** (`§4`): loading, erro, empty
- **Padrões de formulário** (`§5`): input, label, field, autofill
- **Tipografia** (`§6`): EB Garamond + DM Sans, escala, pesos
- **Filosofia dark + Liquid Glass** (`§7`)
- **Padrões compostos** (`§8`): SlideOver, vertical tabs, banners, chat, table, modal
- **Iconografia** (`§9`): lucide-react, convenções de size
- **Checklist de PR** (`§11`)

## 12.2 O que ADAPTAR ao novo vertical

### Paleta primitiva (`§1.1`)

Mantenha a **estrutura** (charcoal + accent quente + accent frio + parchment + risk), troque os hexes para combinar com o vertical:

```
Vertical          | Accent quente (Bronze) | Accent frio (Sage)
─────────────────────────────────────────────────────────────────
Health (atual)    | Bronze parchment       | Apothecary Sage
Legal             | Bronze antiqued        | Navy/Indigo
Dental            | Bronze warm            | Mint/Aqua
Financial         | Gold leaf              | Forest deep
Education         | Bronze ochre           | Plum/Deep purple
```

### Aliases de compatibilidade (`§1.2 final`)

Reescreva os aliases (`--color-deep`, `--color-charcoal-*`, etc.) para apontarem para os novos primitivos. Não delete — alguns componentes legados ainda referenciam.

### Body Background (`§7.2`)

Reescreva os `radial-gradient` blobs para usar as cores do novo vertical. Mantenha mesh + grain — essa é a "assinatura" Amplify.

### Notification TYPE_COLORS (`§2.9`)

Adapte os tipos de notificação ao domínio do produto (ex: `case_filed`, `appointment_reminder`, `lead_qualified`).

### Status Badge mapping (`§2.7`)

Adapte os status semânticos ao domínio (ex: para Legal: `pending`, `filed`, `won`, `lost`).

### Recharts palette (`§10.1`)

Atualize `metricsConfig` para refletir métricas do novo produto, mas mantenha sage = primário e bronze = secundário.

## 12.3 O que NÃO mudar (valores arquiteturais)

| Regra | Por quê |
|---|---|
| Z-index scale (`§1.7`) | Garante que portals/modais/toasts coexistam sem conflito |
| Animation tokens (`§1.6`) | Garante "rítmo" Amplify consistente |
| Spacing scale (4/8 grid) | Base do sistema, quebra layout se mudar |
| Border-radius scale | Identidade "Liquid Glass Organic Curves" |
| Sombras banidas (`§1.5`) | Filosofia central — viola identidade se mudar |
| Liquid Glass formula (`§7.3`) | Diferenciador visual da marca |
| Touch target 44px | Acessibilidade não-negociável |
| Mobile-first (`md:` 768px) | Padrão de uso do produto |

## 12.4 Workflow de Fork

1. **Clone o repo base** Amplify Intelligence (ou novo template).
2. **Crie um branch** `feat/identity-<vertical>`.
3. **Substitua a paleta primitiva** em `globals.css` (`§1.1`).
4. **Atualize aliases** mantendo nomes (`§1.2 final`).
5. **Reescreva body background** com cores do vertical (`§7.2`).
6. **Adapte mappings semânticos**: `TYPE_COLORS`, `STATUS_BADGE`, `metricsConfig`.
7. **Roda smoke test**: navegue por todas as páginas-chave verificando que tokens semânticos resolvem corretamente.
8. **Rode o checklist de PR** (`§11`) inteiro.
9. **Atualize este documento** se descobrir padrão emergente novo.

## 12.5 Onboarding de novos devs

Para que um dev novo entregue UI Amplify-coerente em < 1 dia:

1. Leia `§0` (princípios + anti-patterns) — 10 min
2. Leia `§1.2` (tokens semânticos) — 10 min
3. Cole exemplos de `§2.1`, `§2.2`, `§2.4` em sandbox — 20 min
4. Implemente uma feature simples seguindo `§3.2` (page layout) — 1h
5. Aplique o checklist de `§11` no próprio PR — 15 min

---

*Documento mantido manualmente. Atualize quando descobrir padrão emergente, ou quando refatoração consolidar variantes.*
*Quando criar uma nova variante de componente, considere se ela vira padrão — se sim, documente em `§8`.*
