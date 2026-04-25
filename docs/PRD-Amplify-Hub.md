---
documento: Product Requirements Document
codinome: Amplify Hub
versao: 0.1 (Draft Forense)
data: 2026-04-25
autor: Claude Code (Principal Software Engineer · PM)
revisor: Dr. Matheus Prestes — CRM/SP 235.420
classificacao: Interno · Pré-decisão arquitetural
status: Draft para validação do Owner — não iniciar `create-next-app`
---

# PRD — Amplify Hub

> **Premissa única.** O `hub.amplifyhealth.com.br` é a **área de membros** privada e exclusiva dos alunos ativos do `Protocolo Amplify` e dos consumidores da `Linha Amplify` (DMB™, IMAGO™ Kit, AmpliSquad). Não é blog. Não é landing. Não é o site institucional. É o **sistema de aprendizagem contínua** sob o qual o aluno arquiteta autonomia clínica através de Inteligência Artificial.
>
> Este PRD especifica a fundação técnica, a arquitetura de dados, o fluxo de provisionamento via Kiwify e a régua de marca. Pré-implementação.

---

## 1. Visão geral

### 1.1 Posicionamento

O Amplify Hub é uma **plataforma de ensino contínuo** (LMS — Learning Management System) cujo único propósito é entregar a metodologia do Protocolo Amplify e os ativos da Linha Amplify aos alunos pagantes. O conteúdo se organiza em **módulos**, **aulas** e **complementos**; o progresso do aluno é persistido por usuário; o acesso é provisionado automaticamente a partir do momento em que a Kiwify confirma a compra.

### 1.2 O que **é**

- Plataforma autenticada (Supabase Auth — email + magic link, opcionalmente Google OAuth).
- Catálogo de conteúdo estruturado em módulos e aulas com vídeo, texto, downloads e exercícios.
- Trilha de progresso por aluno (`user_progress` granular por aula).
- Painel administrativo restrito ao Owner para curadoria de módulos.
- Provisionamento automático via webhook Kiwify (`/api/webhooks/kiwify`).

### 1.3 O que **não é**

- Não é blog público. Indexação por buscador é proibida (`X-Robots-Tag: noindex`).
- Não é fórum nem rede social. Comentários e DMs ficam fora do escopo da v1.
- Não é checkout — checkout permanece na Kiwify, fora deste domínio.
- Não é o site institucional `amplifyhealth.com.br` (que vive em repositório separado, zero-build).
- Não é o `Amplify Intelligence™` (plataforma SaaS clínica, repositório separado).

### 1.4 Ecossistema — onde o Hub se encaixa

```
Site Institucional (amplifyhealth.com.br · zero-build · público)
        │
        │  CTA "Acessar Protocolo" / "Login Aluno"
        ▼
Amplify Hub (hub.amplifyhealth.com.br · ESTE PRODUTO · privado · autenticado)
        │
        │  Aluno consome módulos do Protocolo Amplify
        │  e baixa ativos da Linha Amplify
        ▼
Trilhas: Protocolo Amplify · DMB™ · IMAGO™ · AmpliSquad
```

---

## 2. Stack tecnológica

> Decisão arquitetural: o Hub **herda a stack do Amplify Intelligence™**, garantindo que o time opere em uma única toolchain entre o produto SaaS clínico e a plataforma educacional.

| Camada | Tecnologia | Justificativa |
|---|---|---|
| Framework | **Next.js 16** (App Router) | SSR + Server Actions + Route Handlers; compatibilidade com Supabase RLS na borda |
| Runtime | Node 20 LTS | Compatibilidade com `@supabase/ssr` |
| Banco | **Supabase Postgres** + Auth | Postgres gerenciado, Auth com email/magic link, Row Level Security (RLS) por padrão |
| ORM/SDK | `@supabase/ssr` + `@supabase/supabase-js` | Padrão oficial para Next.js 16 App Router (cookies-based session) |
| Estilo | **Tailwind CSS v4** | Diretiva `@theme` para tokens CSS — alinhamento direto com o DS Universal |
| Componentes | shadcn/ui (Radix + Tailwind) | Padrão do DS Universal §2 |
| Ícones | **lucide-react** | Padrão do DS Universal §9 — sem Font Awesome, sem caracteres tipográficos |
| Validação | Zod | Validação de payload do webhook Kiwify e formulários |
| Webhooks | Route Handler em `app/api/webhooks/kiwify/route.ts` | Runtime Node forçado (`export const runtime = 'nodejs'`) |
| Hospedagem | Vercel | Mesma origem do Site institucional, projetos separados |
| Domínio | `hub.amplifyhealth.com.br` | Subdomínio dedicado; DNS A apex aponta para Vercel |
| Observabilidade | Vercel Analytics + Supabase Logs | Painel único para Owner |

**Restrições explícitas:**

- Sem mock de banco, sem JSON local, sem SQLite. Supabase é fonte única de verdade desde a v0.
- Sem ORM pesado (Prisma/Drizzle) na v1 — `supabase-js` é suficiente e remove uma camada de drift.
- Sem CMS externo (Sanity/Contentful) na v1 — conteúdo vive no Postgres do Supabase com schema versionado em `/supabase/migrations/`.

---

## 3. Design System — vinculação ao DS Universal

> **Fonte autoritativa:** [`../../Site/amplify-design-system.md`](../../Site/amplify-design-system.md). Este PRD não duplica o DS — apenas cita as regras inegociáveis para o Hub.

### 3.1 Filosofia inegociável (DS §0.1)

| Regra | Aplicação no Hub |
|---|---|
| **Dark-only** | Sem light mode. Sem toggle. `body { background: var(--color-bg-base) }` em fundo escuro do `Medical Charcoal`. |
| **Sombras banidas** | `box-shadow: none` em todos os cards, modais comuns, dropdowns padrão. Elevação **exclusivamente por borda + background** (`border: 1px solid var(--color-border-default)`). Exceção restrita: superfícies Liquid Glass (Sidebar, TopBar, Toast) com `backdrop-filter` + `inset` top glow. |
| **Touch-first 44×44pt** | Todo elemento interativo (botão, checkbox, link em lista) respeita `min-height: 44px` + `touch-action: manipulation`. WCAG 2.5.5. |
| **Liquid Glass para chrome** | Sidebar, TopBar e Toast usam `backdrop-filter: blur(28px) saturate(160%) brightness(1.03)` + bordas assimétricas (DS §7.3). |

### 3.2 Tipografia inegociável (DS §1.3)

- **Serif (display, H1, H2, blockquote):** `EB Garamond` via Google Fonts com `display=swap`.
- **Sans (corpo, UI, botões, label, micro-copy):** `DM Sans` via Google Fonts com `display=swap`.
- **Sem fallback decorativo.** Sem Cormorant, sem Fraunces, sem Inter. (O site institucional ainda tem divergência tipográfica registrada em `Site/CLAUDE.md` §10 bloqueante 1 — o Hub **nasce** alinhado ao DS Universal e não herda essa pendência.)

### 3.3 Tokens (DS §1.1, §1.2)

Tokens primitivos e semânticos do DS Universal são portados para `app/globals.css` via diretiva `@theme` do Tailwind v4:

```css
@theme {
  --color-charcoal-950: #0d0f0d;
  --color-bg-base:      #111411;
  --color-bg-surface:   #1a1f19;
  --color-bg-elevated:  #1f2620;
  --color-sage-500:     #45624e;
  --color-bronze-500:   #a67c52;
  --color-parchment-100: #f0ebe1;
  --color-border-default: /* DS §1.2 */;
  --color-text-primary:   /* DS §1.2 */;
  /* ... ver DS §1.1, §1.2 para a lista completa */
}
```

Aliases legados (`--deep`, `--sage`, `--bronze`) são **vetados** no Hub. O código fala apenas em tokens semânticos do DS.

### 3.4 Iconografia (DS §9)

- `lucide-react` é a única fonte de ícones.
- Caracteres tipográficos (`✓ ✕ ✦ →`) **não** são ícones — banidos como elementos estruturais.
- Tamanho padrão: 16px (UI dense), 20px (UI confortável), 24px (hero/feature).
- Cor: `currentColor` (herdado do contexto) — nunca cor hardcoded no SVG.

### 3.5 Componentes herdados do DS

- `Button` (primary, ghost, destructive — DS §2.1, §2.2, §2.3) com `min-height: 44px`.
- `Card / Surface` (DS §2.4) — borda + background, sem sombra.
- `Toast` via Sonner (DS §2.6).
- `Sidebar` Liquid Glass (DS §7.3).

---

## 4. Schema do Supabase (draft)

> Schema inicial. Migrações vivem em `supabase/migrations/<timestamp>_<nome>.sql`. RLS habilitado em **todas** as tabelas exceto `auth.*` (gerenciada pela Supabase).

### 4.1 Diagrama relacional

```
auth.users (Supabase nativa)
   │ 1
   │
   ▼ 1
profiles ────────────────────────────────────┐
   │ 1                                        │
   │                                          │
   │ * (FK user_id)                           │
   ▼                                          │
user_progress  *──── 1  lessons  *──── 1  modules
   │                       │
   │                       │ 1
   │                       ▼ *
   │                    lesson_assets   (downloads, slides, exercícios)
   │
   │ * (FK user_id)
   ▼
purchases  ──── (origem: webhook Kiwify)
```

### 4.2 Tabelas

#### `profiles`
Espelho público de `auth.users` com dados do aluno e marcadores de acesso.

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | `uuid` (PK, FK → `auth.users.id` `ON DELETE CASCADE`) | mesmo UUID do user |
| `full_name` | `text` | nome completo |
| `crm` | `text` (nullable) | CRM/UF do aluno (médicos verificados) |
| `crm_verified_at` | `timestamptz` (nullable) | quando o CRM foi validado pela curadoria |
| `avatar_url` | `text` (nullable) | bucket Supabase Storage |
| `created_at` | `timestamptz` `default now()` | |
| `updated_at` | `timestamptz` `default now()` | trigger `set_updated_at` |

**RLS:** `select using (auth.uid() = id)` — aluno lê apenas o próprio perfil. `update using (auth.uid() = id)`. Insert via trigger `handle_new_user` (executado no signup).

#### `modules`
Unidade pedagógica de alto nível (ex.: "Módulo 1 — Fundamentos do Protocolo Amplify").

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | `uuid` PK `default gen_random_uuid()` | |
| `slug` | `text` UNIQUE NOT NULL | URL friendly (`fundamentos`) |
| `title` | `text` NOT NULL | "Módulo 1 — Fundamentos" |
| `description` | `text` | resumo |
| `track` | `text` NOT NULL | enum: `protocolo_amplify`, `dmb`, `imago`, `amplisquad` |
| `order_index` | `int` NOT NULL | ordem dentro da trilha |
| `published_at` | `timestamptz` (nullable) | NULL = rascunho |
| `created_at` / `updated_at` | `timestamptz` | |

**RLS:** `select using (published_at is not null and auth.role() = 'authenticated' and exists (purchase ativa coerente com track))`. Admin (Owner) bypass via claim.

#### `lessons`
Aula individual dentro de um módulo.

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | `uuid` PK | |
| `module_id` | `uuid` FK → `modules.id` `ON DELETE CASCADE` | |
| `slug` | `text` NOT NULL | `(module_id, slug)` UNIQUE |
| `title` | `text` NOT NULL | |
| `body_md` | `text` | corpo da aula em Markdown |
| `video_url` | `text` (nullable) | URL HLS / Vimeo / Mux |
| `duration_seconds` | `int` (nullable) | |
| `order_index` | `int` NOT NULL | |
| `published_at` | `timestamptz` (nullable) | |
| `created_at` / `updated_at` | `timestamptz` | |

**RLS:** mesma lógica de `modules` — herda permissão da trilha do módulo pai.

#### `lesson_assets`
Anexos da aula (PDFs, slides, planilhas, exercícios).

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | `uuid` PK | |
| `lesson_id` | `uuid` FK → `lessons.id` `ON DELETE CASCADE` | |
| `kind` | `text` NOT NULL | enum: `pdf`, `slides`, `template`, `exercise`, `audio` |
| `title` | `text` NOT NULL | |
| `storage_path` | `text` NOT NULL | path no Supabase Storage bucket `lesson-assets` |
| `size_bytes` | `bigint` | |
| `created_at` | `timestamptz` | |

**RLS:** select condicionado a acesso à `lesson` pai.

#### `user_progress`
Marcador granular por (aluno, aula).

| Coluna | Tipo | Notas |
|---|---|---|
| `user_id` | `uuid` FK → `auth.users.id` `ON DELETE CASCADE` | |
| `lesson_id` | `uuid` FK → `lessons.id` `ON DELETE CASCADE` | |
| `started_at` | `timestamptz` (nullable) | |
| `completed_at` | `timestamptz` (nullable) | |
| `last_position_seconds` | `int` (nullable) | retomada de vídeo |
| `notes` | `text` (nullable) | anotações privadas do aluno |
| PK | `(user_id, lesson_id)` | composta |

**RLS:** `select/insert/update using (auth.uid() = user_id)` — aluno só toca o próprio progresso.

#### `purchases`
Registro imutável de compra confirmada pela Kiwify.

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | `uuid` PK | |
| `user_id` | `uuid` FK → `auth.users.id` (nullable até casar email) | |
| `email` | `text` NOT NULL | email do comprador na Kiwify |
| `kiwify_order_id` | `text` UNIQUE NOT NULL | `order_id` ou `transaction_id` da Kiwify |
| `product_code` | `text` NOT NULL | mapeia para `track` (ex: `protocolo_amplify`, `dmb`, `imago`) |
| `status` | `text` NOT NULL | `paid`, `refunded`, `chargeback`, `canceled` |
| `amount_cents` | `int` NOT NULL | |
| `currency` | `text` NOT NULL `default 'BRL'` | |
| `purchased_at` | `timestamptz` NOT NULL | timestamp Kiwify |
| `raw_payload` | `jsonb` NOT NULL | payload bruto do webhook (auditoria) |
| `created_at` | `timestamptz` `default now()` | |

**RLS:** `select using (auth.uid() = user_id)` — aluno vê suas compras; admin vê tudo. Insert/update **somente** via Service Role no webhook handler.

#### `entitlements` (view materializada ou tabela)
Resumo de "a quais trilhas este user_id tem acesso ativo no momento". Derivado de `purchases.status = 'paid'` (ou `refunded`/`chargeback` removendo direito).

```sql
CREATE OR REPLACE VIEW entitlements AS
SELECT DISTINCT user_id, product_code AS track
FROM purchases
WHERE status = 'paid' AND user_id IS NOT NULL;
```

Usado pelas políticas RLS de `modules`/`lessons` para aplicar gating de acesso.

### 4.3 Indices e constraints essenciais

- `lessons (module_id, order_index)` — listagem ordenada.
- `purchases (email)` — busca por email no webhook quando `user_id` ainda nulo.
- `purchases (kiwify_order_id) UNIQUE` — idempotência do webhook.
- `user_progress (user_id, lesson_id) PK` — evita duplicata.

### 4.4 Triggers

- `handle_new_user`: ao criar `auth.users`, criar `profiles` correspondente.
- `set_updated_at`: atualizar `updated_at` em `profiles`, `modules`, `lessons`.
- `link_pending_purchases`: ao criar `auth.users`, casar `purchases.email = new.email` e setar `purchases.user_id`.

---

## 5. Fluxo de provisionamento — webhook Kiwify

### 5.1 Endpoint

```
POST https://hub.amplifyhealth.com.br/api/webhooks/kiwify
```

Implementado em `app/api/webhooks/kiwify/route.ts` com `export const runtime = 'nodejs'` (Edge runtime quebra `crypto` para verificação HMAC — referência: `Site/CLAUDE.md` §11.1).

### 5.2 Eventos suportados (v1)

| Evento Kiwify | Ação no Hub |
|---|---|
| `order.paid` / `order.approved` | Registrar `purchases (status='paid')`; criar `auth.users` se email novo; enviar magic link de boas-vindas |
| `order.refunded` | Atualizar `purchases.status = 'refunded'`; entitlement removido automaticamente pela view |
| `order.chargeback` | Idem refunded; alerta no painel admin |
| `subscription.canceled` (futuro) | Marcar como `canceled` quando houver assinatura |

### 5.3 Mapeamento `product_code → track`

Mantido em variável de ambiente versionada em `.env.example` (sem segredo):

```
KIWIFY_PRODUCT_DMB=dmb
KIWIFY_PRODUCT_IMAGO=imago
KIWIFY_PRODUCT_PROTOCOLO=protocolo_amplify
```

Produto desconhecido → log `WARN` + persistência com `product_code = 'unknown'` para revisão manual. **Nunca silenciar.**

### 5.4 Verificação de assinatura

Kiwify envia `x-kiwify-signature` (HMAC-SHA256 do body com segredo compartilhado). Handler:

1. Lê `req.text()` cru (não `req.json()` — assinatura é sobre o body bruto).
2. Calcula `crypto.createHmac('sha256', KIWIFY_WEBHOOK_SECRET).update(rawBody).digest('hex')`.
3. Compara em tempo constante (`crypto.timingSafeEqual`).
4. Falha → `401`. Sucesso → segue.

### 5.5 Idempotência

- Constraint `purchases.kiwify_order_id UNIQUE` + `INSERT ... ON CONFLICT (kiwify_order_id) DO UPDATE SET status = excluded.status, raw_payload = excluded.raw_payload` garante que retentativas da Kiwify não dupliquem.
- Cada webhook recebido é logado (Supabase `webhook_log` opcional na v1.1) com `received_at`, `signature_valid`, `outcome`.

### 5.6 Provisionamento de acesso

```
Webhook OK
  ├─► UPSERT purchases (kiwify_order_id, email, product_code, status, ...)
  ├─► Existe auth.users com este email?
  │     ├─► SIM  → trigger link_pending_purchases já casou user_id
  │     └─► NÃO  → admin.createUser({ email, email_confirm: false })
  │                + sendMagicLink(email)
  └─► Logar outcome
```

O aluno recebe magic link e cai diretamente em `/onboarding` (definir nome, CRM opcional, foto).

---

## 6. Estrutura inicial do repositório (proposta)

```
amplify-hub/
├── README.md
├── CLAUDE.md                           contexto operacional do repo
├── .gitignore                          blindagem (.env*, .next/, node_modules/)
├── .gitattributes                      LF estrito (herdado do amplify-agent-os)
├── package.json
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts                  importa tokens do DS Universal
├── docs/
│   ├── PRD-Amplify-Hub.md              este documento
│   └── conformidade-ds.md              matriz de aderência ao DS Universal (Marco 2)
├── supabase/
│   ├── config.toml
│   └── migrations/
│       └── 0001_initial_schema.sql     tabelas + RLS + triggers
├── app/
│   ├── layout.tsx                      providers, fontes, theme dark
│   ├── globals.css                     @theme com tokens DS Universal
│   ├── page.tsx                        landing autenticada (dashboard do aluno)
│   ├── login/
│   ├── onboarding/
│   ├── trilhas/[track]/
│   │   └── [moduleSlug]/[lessonSlug]/
│   ├── conta/
│   ├── admin/                          guard por claim/role admin
│   └── api/
│       └── webhooks/
│           └── kiwify/route.ts
├── components/
│   ├── ui/                             shadcn primitives
│   └── hub/                            componentes próprios do Hub
└── lib/
    ├── supabase/
    │   ├── server.ts                   createServerClient
    │   ├── browser.ts                  createBrowserClient
    │   └── service-role.ts             apenas server-only
    └── kiwify/
        └── verify-signature.ts
```

---

## 7. Diretrizes verbais — vinculantes em todo conteúdo do Hub

Herdadas de `Site/CLAUDE.md` §9 e `amplify-agent-os/CLAUDE.md` §7. Aplicáveis a copy de UI, emails transacionais, mensagens de erro, descrição de módulos e aulas.

### 7.1 Vocabulário próprio (preferir)

`autonomia`, `sistema`, `fluxo`, `domínio`, `arquitetar`, `construir`, `metodologia`, `prática`, `compliance`, `conformidade`.

### 7.2 Vocabulário proibido (rejeitar)

`hack`, `fácil`, `rápido`, `revolucionário`, `disruptivo`, `passivo`, `simples`, `garantido`. Também: "ganho rápido", "ganho fácil", "resultado garantido", "X em Y dias".

### 7.3 Promessas vetadas

Sem resultado financeiro específico, sem número de pacientes, sem percentual de aumento de receita, sem prazo determinado de retorno. Compliance CFM proíbe.

### 7.4 Trademarks (sempre marcados)

- `Protocolo Amplify`
- `SAIM®` — registrado, credencial em exibição.
- `IMAGO™` Kit
- `DMB™` (Documentação Médica Blindada)
- `AmpliSquad`
- `Amplify Intelligence™`

Em React, marcar via texto literal: `Protocolo Amplify`, `SAIM<sup>®</sup>`, `IMAGO<sup>&trade;</sup>`, `DMB<sup>&trade;</sup>`.

### 7.5 Referência ao fundador

"Médico com **especialidade em psiquiatria forense**" + `CRM/SP 235.420`. Nunca "psiquiatra forense" — vetado pelo CFM.

### 7.6 Tom

Frases curtas. Parágrafos curtos. Técnico sem pedantismo. De médico para médico. Confiante sem arrogância. Orientado a **autonomia**, nunca dependência.

---

## 8. Variáveis de ambiente (template)

`.env.example` (versionado, sem segredos reais):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Kiwify
KIWIFY_WEBHOOK_SECRET=
KIWIFY_PRODUCT_PROTOCOLO=protocolo_amplify
KIWIFY_PRODUCT_DMB=dmb
KIWIFY_PRODUCT_IMAGO=imago

# App
NEXT_PUBLIC_APP_URL=https://hub.amplifyhealth.com.br
```

`.env.local` (NUNCA versionado — entra no `.gitignore`).

---

## 9. Fora do escopo da v1

Documentar para evitar scope creep:

- Comentários em aulas / fórum / chat.
- Certificado de conclusão em PDF.
- Quiz / avaliação automática.
- Notificação push / mobile app nativo.
- Pagamento dentro do Hub (permanece na Kiwify).
- Múltiplos planos / matriz de permissão complexa.
- Internacionalização (PT-BR única na v1).

---

## 10. Pendências de decisão do Owner

1. **Provedor de vídeo.** Vimeo Pro? Mux? Bunny Stream? Define `lessons.video_url` semântico e custos. Sugestão técnica: Mux (HLS adaptativo + analytics nativo).
2. **Magic link vs senha.** Apenas magic link (recomendado — sem fricção, sem senha esquecida) ou habilitar senha como fallback?
3. **OAuth Google.** Habilitar agora (acelera login) ou v1.1?
4. **Subdomínio do projeto Vercel.** Confirmar `hub.amplifyhealth.com.br` como CNAME para Vercel (mesmo padrão do site institucional).
5. **Política de revogação.** Quanto tempo após `refunded` o aluno perde acesso? Imediato, 7 dias, 30 dias?
6. **Conteúdo legacy.** Existe conteúdo do Protocolo Amplify hoje em outra plataforma (Hotmart Members, Memberkit, Google Drive)? Será migrado ou recriado?
7. **Painel admin.** Owner edita módulos/aulas direto no Hub (CMS embutido) ou via Supabase Studio (SQL/UI)? Recomendação técnica v1: Supabase Studio para evitar re-escrever um CMS.

---

## 11. Critérios de aceitação da v1

A v1 do Amplify Hub é considerada pronta quando:

- [ ] Aluno do Protocolo Amplify consegue logar via magic link e ver os módulos da trilha que comprou.
- [ ] Aluno **não** vê módulos de trilhas que **não** comprou (RLS validada).
- [ ] Webhook Kiwify provisiona acesso automático sem intervenção do Owner em uma compra paga.
- [ ] Webhook Kiwify revoga acesso automático em refund/chargeback.
- [ ] Progresso por aula é persistido por aluno e exibido no dashboard.
- [ ] Tipografia (`EB Garamond` + `DM Sans`), tokens DS, dark-only e touch targets 44pt validados em mobile ≤ 380px e desktop.
- [ ] Nenhum `box-shadow` estrutural fora de Liquid Glass.
- [ ] Vocabulário proibido ausente em todo copy de UI; trademarks marcados em todas as menções visíveis.
- [ ] `noindex` declarado e validado.
- [ ] Migrações Supabase versionadas em `supabase/migrations/` (sem schema "drift" do Studio para o repo).

---

## 12. Referências

- [`../../Site/amplify-design-system.md`](../../Site/amplify-design-system.md) — DS Universal Amplify (autoritativo visual).
- [`../../Site/CLAUDE.md`](../../Site/CLAUDE.md) — contexto do site institucional, §9 (régua verbal), §11 (armadilhas técnicas Vercel).
- [`../../amplify-agent-os/CLAUDE.md`](../../amplify-agent-os/CLAUDE.md) — convenções herdadas (LF estrito, vocabulário, isolamento de domínios).
- Documentação Supabase Auth (PKCE flow, `@supabase/ssr` para Next.js App Router).
- Documentação Kiwify Webhooks (v3) — referência externa autoritativa.

---

*Dr. Matheus Prestes · CRM/SP 235.420 · Amplify Health © 2026 · Documento interno · Pré-decisão arquitetural*
