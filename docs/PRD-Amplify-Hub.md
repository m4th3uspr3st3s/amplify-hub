---
documento: Product Requirements Document
codinome: Amplify Hub
versao: 0.2 (Live-First · sancionado pelo Owner)
data: 2026-04-25
autor: Claude Code (Principal Software Engineer · PM)
revisor: Dr. Matheus Prestes — CRM/SP 235.420
classificacao: Interno · Pós-aprovacao do Marco 1 (PRD)
status: Sancionado — scaffold Next.js autorizado
---

# PRD — Amplify Hub

> **Premissa única.** O `hub.amplifyhealth.com.br` é a **área de membros** privada e exclusiva dos alunos ativos do `Protocolo Amplify` e dos consumidores da `Linha Amplify` (DMB™, IMAGO™ Kit, AmpliSquad). É o **sistema de aprendizagem contínua ao vivo** sob o qual o aluno arquiteta autonomia clínica através de Inteligência Artificial.
>
> **Pivô arquitetural sancionado pelo Owner (v0.2):** as aulas são **ao vivo**, não VOD. O aluno **nunca** sai de `hub.amplifyhealth.com.br`. A infraestrutura de mídia é o **Stream Video React SDK** embutido no domínio próprio.

---

## 0. Decisões sancionadas (encerram §10 da v0.1)

| # | Pergunta v0.1 | Decisão v0.2 | Implicação |
|---|---|---|---|
| 1 | Provedor de vídeo | **Stream Video** (`@stream-io/video-react-sdk`) | WebRTC gerenciado, embedável no domínio próprio; substitui a coluna `video_url` por entidade `live_sessions` |
| 2 | Magic link vs senha | **Magic link + senha como fallback** | Reduz tickets de suporte; Supabase Auth suporta os dois nativamente |
| 3 | Google OAuth | **Adiado para v1.1** | Foco no MVP |
| 4 | CNAME | **`hub.amplifyhealth.com.br` → Vercel** | Mesmo padrão do site institucional |
| 5 | Revogação após refund/chargeback | **Imediata** | View `entitlements` filtra `status='paid'`; refund derruba acesso na próxima query |
| 6 | Migração de conteúdo legacy | **Zero** | Conteúdo nasce nativo no Hub; sem importação |
| 7 | CMS embutido vs Supabase Studio | **Supabase Studio na v1** | Owner tem proficiência técnica; evita re-escrever um CMS |

---

## 1. Visão geral

### 1.1 Posicionamento

Amplify Hub é uma **plataforma de ensino contínuo ao vivo** dedicada à entrega da metodologia do Protocolo Amplify e dos ativos da Linha Amplify aos alunos pagantes. O conteúdo se organiza em **módulos**, **aulas ao vivo agendadas** e **complementos persistentes** (slides, exercícios, gravações se opt-in). O acesso é provisionado automaticamente quando a Kiwify confirma a compra.

### 1.2 O que **é**

- Plataforma autenticada (Supabase Auth — magic link **e** senha).
- Catálogo de **módulos** com **aulas ao vivo** agendadas (`live_sessions`).
- Sala de aula embutida via Stream Video React SDK em `/aulas/[sessionId]` — sem redirecionamento externo.
- Histórico de presença e gravações opcionais por sessão.
- Painel administrativo do Owner via Supabase Studio (sem CMS embutido na v1).
- Provisionamento automático via webhook Kiwify (`/api/webhooks/kiwify`).

### 1.3 O que **não é**

- Não é VOD-first. Aulas gravadas são **subproduto** das sessões ao vivo, não o eixo do produto.
- Não é blog público. Hub inteiro fica `noindex`.
- Não é fórum nem rede social.
- Não é checkout (permanece na Kiwify).
- Não é o site institucional `amplifyhealth.com.br`.
- Não é o `Amplify Intelligence™`.

### 1.4 Ecossistema

```
Site Institucional (amplifyhealth.com.br · zero-build · público)
        │
        │  CTA "Acessar Protocolo" / "Login Aluno"
        ▼
Amplify Hub (hub.amplifyhealth.com.br · ESTE PRODUTO · privado · live-first)
        │
        │  Aluno entra na sala de aula sem sair do domínio
        ▼
Trilhas: Protocolo Amplify · DMB™ · IMAGO™ · AmpliSquad
```

---

## 2. Stack tecnológica

| Camada | Tecnologia | Justificativa |
|---|---|---|
| Framework | **Next.js 16** (App Router · Turbopack) | SSR + Server Actions + Route Handlers; compat Supabase RLS na borda |
| Runtime | Node 20 LTS | `@supabase/ssr` + HMAC do webhook Kiwify (Edge quebra `crypto`) |
| Banco | **Supabase Postgres** + Auth | RLS por padrão; magic link + senha + service role no webhook |
| SDK Supabase | `@supabase/ssr` + `@supabase/supabase-js` | Padrão oficial Next.js 16 App Router |
| **Vídeo ao vivo** | **`@stream-io/video-react-sdk`** | WebRTC gerenciado embeddable; o aluno nunca sai do domínio |
| Estilo | **Tailwind CSS v4** | Diretiva `@theme` para tokens DS — alinhamento direto |
| Componentes | shadcn/ui (Radix + Tailwind) | Padrão DS Universal §2 |
| Ícones | **`lucide-react`** | Padrão DS Universal §9 |
| Validação | Zod | Webhook Kiwify e formulários |
| Webhook handler | Route Handler `runtime = 'nodejs'` | HMAC SHA-256 do body cru |
| Hospedagem | Vercel | Mesma origem do site, projeto separado |
| Domínio | `hub.amplifyhealth.com.br` (CNAME → Vercel) | Confirmado |
| Observabilidade | Vercel Analytics + Supabase Logs + Stream Dashboard | Triângulo único |

**Restrições explícitas:**

- Sem ORM pesado (Prisma/Drizzle) na v1 — `supabase-js` é suficiente.
- Sem CMS externo — `Supabase Studio` é o painel de curadoria.
- Sem provedor de vídeo alternativo — Stream Video é decisão única; trocar exige novo PRD.
- Iframes de terceiros são **vetados** em rotas autenticadas para preservar a regra "aluno não sai do domínio".

---

## 3. Design System — vinculação ao DS Universal

> **Fonte autoritativa:** [`../../Site/amplify-design-system.md`](../../Site/amplify-design-system.md). Este PRD não duplica o DS — apenas cita as regras inegociáveis para o Hub.

### 3.1 Filosofia inegociável (DS §0.1)

| Regra | Aplicação no Hub |
|---|---|
| **Dark-only** | Sem light mode, sem toggle. `body` em fundo `Medical Charcoal`. |
| **Sombras banidas** | `box-shadow: none` em cards/dropdowns padrão. Elevação por `border + background`. Exceção restrita: superfícies Liquid Glass (Sidebar, TopBar, Toast) com `backdrop-filter` + `inset` top glow. |
| **Touch-first 44×44pt** | Todo interativo respeita `min-height: 44px` + `touch-action: manipulation`. WCAG 2.5.5. Crítico em controles de sala ao vivo (mute, video, hangup). |
| **Liquid Glass** | Sidebar, TopBar, Toast e o painel de controles da sala ao vivo (`backdrop-filter: blur(28px) saturate(160%) brightness(1.03)`). |

### 3.2 Tipografia inegociável (DS §1.3)

- **Serif (display, H1, H2, blockquote):** `EB Garamond` (Google Fonts, `display=swap`).
- **Sans (corpo, UI, botões, label, micro-copy):** `DM Sans` (Google Fonts, `display=swap`).
- **Sem fallback decorativo.** Sem Cormorant, Fraunces ou Inter. O Hub nasce alinhado.

### 3.3 Tokens (DS §1.1, §1.2)

Tokens semânticos do DS portados para `app/globals.css` via `@theme` Tailwind v4. Aliases legados (`--deep`, `--sage`, `--bronze`) **vetados**.

### 3.4 Iconografia (DS §9)

`lucide-react` é a única fonte. Caracteres tipográficos como ícones (`✓ ✕ ✦`) são **proibidos**. Tamanhos: 16/20/24px. Cor sempre `currentColor`.

### 3.5 Componentes herdados

- `Button` (primary, ghost, destructive — DS §2.1, §2.2, §2.3) com `min-height: 44px`.
- `Card / Surface` (DS §2.4) — borda + background, sem sombra.
- `Toast` via Sonner (DS §2.6).
- `Sidebar` Liquid Glass (DS §7.3).

---

## 4. Schema do Supabase (live-first)

> Schema da v0.2. Migrações em `supabase/migrations/`. RLS habilitada em todas as tabelas do schema `public`.

### 4.1 Diagrama relacional

```
auth.users (Supabase nativa)
   │ 1
   ▼ 1
profiles
   │ 1
   │   * (FK user_id)
   ▼
user_progress *──── 1 lessons *──── 1 modules
                       │                │
                       │ 1              │ 1
                       │                │
                       ▼ *              ▼ *
                    lesson_assets    live_sessions
                    (PDF, slides,   (Stream Video call)
                     templates)             │
                                            │ 1
                                            ▼ *
                                     attendance_records
                                     (presença por aluno)

purchases ──── webhook Kiwify ──► entitlements (view)
```

### 4.2 Tabelas

#### `profiles`
Espelho público de `auth.users`.

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | `uuid` PK · FK → `auth.users.id` `ON DELETE CASCADE` | mesmo UUID do user |
| `full_name` | `text` | |
| `crm` | `text` (nullable) | CRM/UF |
| `crm_verified_at` | `timestamptz` (nullable) | |
| `avatar_url` | `text` (nullable) | bucket Supabase Storage |
| `created_at` / `updated_at` | `timestamptz` | trigger `set_updated_at` |

**RLS:** aluno lê/edita só o próprio. Insert via trigger `handle_new_user`.

#### `modules`
Unidade pedagógica de alto nível.

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | `uuid` PK | |
| `slug` | `text` UNIQUE NOT NULL | |
| `title` | `text` NOT NULL | |
| `description` | `text` | |
| `track` | `text` NOT NULL | enum: `protocolo_amplify`, `dmb`, `imago`, `amplisquad` |
| `order_index` | `int` NOT NULL | |
| `published_at` | `timestamptz` (nullable) | |
| `created_at` / `updated_at` | `timestamptz` | |

**RLS:** select condicionado a `published_at != null` E entitlement ativo na `track`.

#### `lessons`
Aula como **agrupador lógico** de uma ou mais sessões ao vivo + assets persistentes. Não tem `video_url` — vídeo vive em `live_sessions`.

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | `uuid` PK | |
| `module_id` | `uuid` FK → `modules.id` `ON DELETE CASCADE` | |
| `slug` | `text` NOT NULL · `(module_id, slug)` UNIQUE | |
| `title` | `text` NOT NULL | |
| `body_md` | `text` | descrição/agenda da aula em Markdown |
| `order_index` | `int` NOT NULL | |
| `published_at` | `timestamptz` (nullable) | |
| `created_at` / `updated_at` | `timestamptz` | |

**RLS:** herda do `module` pai.

> **Removido em relação à v0.1:** `video_url`, `duration_seconds`. Substituídos pela tabela `live_sessions`.

#### `live_sessions` 🆕
**Sessão ao vivo agendada**, vinculada à `lesson`. Uma `lesson` pode ter múltiplas sessões (ex.: original + reprise).

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | `uuid` PK · `default gen_random_uuid()` | usado também como `stream_call_id` (formato `default:<uuid>`) |
| `lesson_id` | `uuid` FK → `lessons.id` `ON DELETE CASCADE` | |
| `title` | `text` NOT NULL | "Aula 3 — Arquitetura de prompts clínicos" |
| `scheduled_for` | `timestamptz` NOT NULL | data/hora de início |
| `duration_minutes` | `int` NOT NULL · default `90` | duração planejada |
| `stream_call_id` | `text` NOT NULL UNIQUE | ID da call no Stream Video (`default:<uuid>`) |
| `stream_call_type` | `text` NOT NULL · default `'default'` | tipo Stream (`default`, `livestream`, etc.) |
| `is_active` | `boolean` NOT NULL · default `false` | `true` enquanto a sessão estiver no ar |
| `started_at` | `timestamptz` (nullable) | preenchido quando o Owner inicia |
| `ended_at` | `timestamptz` (nullable) | preenchido quando o Owner encerra |
| `recording_url` | `text` (nullable) | preenchido se opt-in de gravação |
| `host_user_id` | `uuid` FK → `auth.users.id` | normalmente o Owner |
| `created_at` / `updated_at` | `timestamptz` | |

**RLS:**
- `select`: aluno com entitlement na `track` do `module` pai vê a sessão.
- `update`: apenas `host_user_id` (ou claim `admin = true`).
- `insert`: apenas claim `admin = true` (Supabase Studio na v1).

**Index:** `(lesson_id, scheduled_for desc)`, `(is_active) where is_active = true`.

#### `attendance_records` 🆕
Marcador de presença por (aluno, sessão).

| Coluna | Tipo | Notas |
|---|---|---|
| `user_id` | `uuid` FK → `auth.users.id` `ON DELETE CASCADE` | |
| `live_session_id` | `uuid` FK → `live_sessions.id` `ON DELETE CASCADE` | |
| `joined_at` | `timestamptz` NOT NULL | |
| `left_at` | `timestamptz` (nullable) | |
| `total_seconds_present` | `int` (nullable) | calculado no `left_at` |
| PK | `(user_id, live_session_id, joined_at)` | suporta múltiplos `join` na mesma sessão |

**RLS:** aluno lê só o próprio histórico. Insert/update via Server Action ou webhook Stream (v1.1).

#### `lesson_assets`
Mantido. Anexos persistentes da `lesson` (PDFs, slides, templates, exercícios).

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | `uuid` PK | |
| `lesson_id` | `uuid` FK → `lessons.id` `ON DELETE CASCADE` | |
| `kind` | `text` NOT NULL | enum: `pdf`, `slides`, `template`, `exercise`, `audio` |
| `title` | `text` NOT NULL | |
| `storage_path` | `text` NOT NULL | bucket `lesson-assets` |
| `size_bytes` | `bigint` | |
| `created_at` | `timestamptz` | |

**RLS:** herda da `lesson` pai.

#### `user_progress`
**Refatorado.** Em modelo live-first, "progresso" é primariamente **presença na sessão ao vivo** + flag manual de "concluído". Mantém `lesson_id` como granularidade.

| Coluna | Tipo | Notas |
|---|---|---|
| `user_id` | `uuid` FK → `auth.users.id` `ON DELETE CASCADE` | |
| `lesson_id` | `uuid` FK → `lessons.id` `ON DELETE CASCADE` | |
| `attended_live` | `boolean` NOT NULL · default `false` | derivado de `attendance_records` (trigger ou view) |
| `marked_complete_at` | `timestamptz` (nullable) | flag manual do aluno |
| `notes` | `text` (nullable) | anotações privadas |
| PK | `(user_id, lesson_id)` | |

**RLS:** aluno lê/edita só o próprio.

#### `purchases`
Mantido. Registro imutável da Kiwify.

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | `uuid` PK | |
| `user_id` | `uuid` FK → `auth.users.id` (nullable) | preenchido pela trigger `link_pending_purchases` |
| `email` | `text` NOT NULL | email do comprador |
| `kiwify_order_id` | `text` UNIQUE NOT NULL | idempotência |
| `product_code` | `text` NOT NULL | mapeia para `track` |
| `status` | `text` NOT NULL | `paid`, `refunded`, `chargeback`, `canceled` |
| `amount_cents` | `int` NOT NULL | |
| `currency` | `text` NOT NULL · default `'BRL'` | |
| `purchased_at` | `timestamptz` NOT NULL | timestamp Kiwify |
| `raw_payload` | `jsonb` NOT NULL | auditoria |
| `created_at` | `timestamptz` `default now()` | |

**RLS:** aluno vê suas próprias; insert/update **somente** via Service Role no webhook handler.

#### `entitlements` (view)
Resumo de "user_id → trilhas ativas". **Refund/chargeback derruba acesso imediato** ao filtrar `status = 'paid'`.

```sql
CREATE OR REPLACE VIEW entitlements AS
SELECT DISTINCT user_id, product_code AS track
FROM purchases
WHERE status = 'paid' AND user_id IS NOT NULL;
```

### 4.3 Indices essenciais

- `lessons (module_id, order_index)`
- `live_sessions (lesson_id, scheduled_for desc)`
- `live_sessions (is_active) WHERE is_active = true`
- `attendance_records (user_id, live_session_id)`
- `purchases (email)`, `purchases (kiwify_order_id) UNIQUE`
- `user_progress (user_id, lesson_id)` PK

### 4.4 Triggers

- `handle_new_user` — cria `profiles` no signup.
- `set_updated_at` — `profiles`, `modules`, `lessons`, `live_sessions`.
- `link_pending_purchases` — casa `purchases.email` com novo `auth.users`.
- `derive_attended_live` — quando `attendance_records` for inserido com `total_seconds_present >= 600` (10min), upserta `user_progress.attended_live = true`.

---

## 5. Stream Video — arquitetura de mídia

### 5.1 Fluxo do aluno

```
Aluno acessa /aulas/[liveSessionId]
        │
        ▼
Server Component valida (RLS Supabase: tem entitlement?)
        │
        ▼
Route Handler /api/stream/token (POST) gera user token assinado com STREAM_API_SECRET (server-only)
        │
        ▼
Client Component monta <StreamVideoClient> + <StreamCall callId={live_sessions.stream_call_id}>
        │
        ▼
Aluno entra na sala dentro do hub.amplifyhealth.com.br — sem redirect
        │
        ▼
Server Action joinLiveSession() insere attendance_records.joined_at
```

### 5.2 Geração de token

- `STREAM_API_KEY` é pública (`NEXT_PUBLIC_STREAM_API_KEY`).
- `STREAM_API_SECRET` é server-only — nunca exposta ao cliente.
- Token gerado em `/app/api/stream/token/route.ts` com `runtime = 'nodejs'`, validade curta (1h), claims mínimas (`user_id`, `name`, `image`).
- **Nunca** gerar token no client. **Nunca** versionar segredo.

### 5.3 Papéis na sala

- `host` — Owner. Pode iniciar/encerrar a call, silenciar, gravar.
- `participant` — aluno autenticado com entitlement.
- Sem convite anônimo. Sem link público.

### 5.4 Gravação (opt-in)

- Decisão por sessão: Owner ativa antes de iniciar.
- Gravação fica em bucket Stream + URL salva em `live_sessions.recording_url`.
- Política CFM: gravação **não** captura áudio ou vídeo de paciente. Aulas são doutrinárias, não atendimentos.

### 5.5 Restrição inegociável

> **Iframe de plataforma terceira é vetado** em rotas autenticadas. O aluno nunca vê barra de URL diferente de `hub.amplifyhealth.com.br`. Stream Video roda em componente nativo React, dentro do nosso domínio.

---

## 6. Provisionamento — webhook Kiwify

### 6.1 Endpoint

```
POST https://hub.amplifyhealth.com.br/api/webhooks/kiwify
```

`app/api/webhooks/kiwify/route.ts` com `export const runtime = 'nodejs'`.

### 6.2 Eventos suportados (v1)

| Evento | Ação |
|---|---|
| `order.paid` / `order.approved` | UPSERT `purchases (status='paid')`; cria `auth.users` se email novo; envia magic link |
| `order.refunded` | UPDATE `purchases.status = 'refunded'`; **acesso revogado imediatamente** (view filtra) |
| `order.chargeback` | Idem refunded; alerta admin |
| `subscription.canceled` (futuro) | `status = 'canceled'` |

### 6.3 Mapeamento `product_code → track`

Variáveis de ambiente (`.env.example`):

```
KIWIFY_PRODUCT_PROTOCOLO=protocolo_amplify
KIWIFY_PRODUCT_DMB=dmb
KIWIFY_PRODUCT_IMAGO=imago
```

Produto desconhecido → log `WARN` + `product_code = 'unknown'` para revisão manual.

### 6.4 Verificação de assinatura

1. Lê `req.text()` cru.
2. `crypto.createHmac('sha256', KIWIFY_WEBHOOK_SECRET).update(rawBody).digest('hex')`.
3. Compara em tempo constante (`crypto.timingSafeEqual`).
4. Falha → `401`. Sucesso → segue.

### 6.5 Idempotência

`purchases.kiwify_order_id UNIQUE` + `INSERT ... ON CONFLICT DO UPDATE`.

### 6.6 Provisionamento

```
Webhook OK
  ├─► UPSERT purchases (...)
  ├─► auth.users com este email?
  │     ├─► SIM → trigger link_pending_purchases já casou user_id
  │     └─► NÃO → admin.createUser({ email }) + sendMagicLink(email)
  └─► Logar outcome
```

Aluno recebe magic link → cai em `/onboarding` (nome, CRM opcional, avatar).

### 6.7 Auth dual — magic link + senha

Supabase Auth aceita os dois flows nativamente. UI:

- `/login` apresenta magic link como primário ("Receber link de acesso") e link secundário "Entrar com senha".
- `/conta/seguranca` permite criar/alterar senha (segundo fator de conveniência).

---

## 7. Estrutura inicial do repositório (proposta refinada)

```
amplify-hub/
├── README.md
├── CLAUDE.md
├── .gitignore
├── .gitattributes
├── package.json
├── next.config.ts                 (Turbopack habilitado)
├── tsconfig.json
├── tailwind.config.ts             (Tailwind v4, importa tokens DS)
├── postcss.config.mjs
├── docs/
│   ├── PRD-Amplify-Hub.md         este documento
│   └── conformidade-ds.md         matriz de aderência (Marco 3)
├── supabase/
│   ├── config.toml
│   └── migrations/
│       ├── 0001_initial_schema.sql
│       ├── 0002_live_sessions.sql
│       └── 0003_rls_policies.sql
├── src/
│   ├── app/
│   │   ├── layout.tsx             providers, fontes EB Garamond + DM Sans, dark
│   │   ├── globals.css            @theme com tokens DS Universal
│   │   ├── page.tsx               dashboard do aluno (próxima aula ao vivo)
│   │   ├── login/
│   │   ├── onboarding/
│   │   ├── trilhas/[track]/
│   │   │   └── [moduleSlug]/[lessonSlug]/
│   │   ├── aulas/[liveSessionId]/   sala ao vivo Stream Video
│   │   ├── conta/
│   │   ├── admin/                  guard por claim admin
│   │   └── api/
│   │       ├── stream/token/route.ts
│   │       └── webhooks/kiwify/route.ts
│   ├── components/
│   │   ├── ui/                    shadcn primitives
│   │   ├── live/                  componentes da sala ao vivo
│   │   └── hub/                   componentes próprios
│   └── lib/
│       ├── supabase/
│       │   ├── server.ts          createServerClient
│       │   ├── browser.ts         createBrowserClient
│       │   └── service-role.ts    server-only
│       ├── stream/
│       │   └── token.ts           generateUserToken (server-only)
│       └── kiwify/
│           └── verify-signature.ts
└── public/
```

---

## 8. Diretrizes verbais — vinculantes em todo conteúdo

Herdadas de `Site/CLAUDE.md` §9 e `amplify-agent-os/CLAUDE.md` §7. Aplicáveis a copy de UI, emails transacionais, mensagens de erro, descrição de módulos, **título de aulas ao vivo**.

### 8.1 Vocabulário próprio (preferir)
`autonomia`, `sistema`, `fluxo`, `domínio`, `arquitetar`, `construir`, `metodologia`, `prática`, `compliance`, `conformidade`.

### 8.2 Vocabulário proibido (rejeitar)
`hack`, `fácil`, `rápido`, `revolucionário`, `disruptivo`, `passivo`, `simples`, `garantido`, "ganho rápido", "ganho fácil", "resultado garantido", "X em Y dias".

### 8.3 Promessas vetadas
Sem resultado financeiro específico, sem número de pacientes, sem percentual de aumento de receita, sem prazo determinado de retorno. Compliance CFM proíbe.

### 8.4 Trademarks (sempre marcados)
`Protocolo Amplify`, `SAIM®`, `IMAGO™` Kit, `DMB™`, `AmpliSquad`, `Amplify Intelligence™`.

Em React: `Protocolo Amplify`, `SAIM<sup>®</sup>`, `IMAGO<sup>&trade;</sup>`, `DMB<sup>&trade;</sup>`.

### 8.5 Referência ao fundador
"Médico com **especialidade em psiquiatria forense**" + `CRM/SP 235.420`. Nunca "psiquiatra forense".

### 8.6 Tom
Frases curtas. Parágrafos curtos. Técnico sem pedantismo. De médico para médico. Confiante sem arrogância. Orientado a **autonomia**, nunca dependência.

---

## 9. Variáveis de ambiente (template)

`.env.example` (versionado, sem segredos reais):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stream Video
NEXT_PUBLIC_STREAM_API_KEY=
STREAM_API_SECRET=

# Kiwify
KIWIFY_WEBHOOK_SECRET=
KIWIFY_PRODUCT_PROTOCOLO=protocolo_amplify
KIWIFY_PRODUCT_DMB=dmb
KIWIFY_PRODUCT_IMAGO=imago

# App
NEXT_PUBLIC_APP_URL=https://hub.amplifyhealth.com.br
```

`.env.local` **NUNCA** versionado.

---

## 10. Fora do escopo da v1

- VOD-first (a v1 é live-first; gravações são subproduto).
- Comentários, fórum, chat assíncrono fora da sala ao vivo.
- Certificado em PDF.
- Quiz / avaliação automática.
- Mobile app nativo.
- Pagamento dentro do Hub.
- Múltiplos planos / matriz complexa.
- i18n (PT-BR única).
- Google OAuth (v1.1).
- CMS embutido (Supabase Studio na v1).

---

## 11. Critérios de aceitação da v1

- [ ] Aluno do Protocolo Amplify loga via magic link ou senha.
- [ ] Aluno **não** vê módulos de trilhas que não comprou (RLS validada).
- [ ] Webhook Kiwify provisiona acesso automático em compra paga.
- [ ] Webhook Kiwify revoga acesso **imediato** em refund/chargeback.
- [ ] Aluno entra em sala ao vivo via Stream Video **sem sair** de `hub.amplifyhealth.com.br`.
- [ ] Token Stream é gerado server-side com secret nunca exposta.
- [ ] Presença é registrada em `attendance_records` ao entrar/sair.
- [ ] Tipografia (`EB Garamond` + `DM Sans`), tokens DS, dark-only e touch targets 44pt validados em mobile ≤ 380px e desktop.
- [ ] Nenhum `box-shadow` estrutural fora de Liquid Glass.
- [ ] Vocabulário proibido ausente; trademarks marcados.
- [ ] `noindex` declarado e validado.
- [ ] Migrações Supabase versionadas em `supabase/migrations/`.

---

## 12. Referências

- [`../../Site/amplify-design-system.md`](../../Site/amplify-design-system.md) — DS Universal Amplify.
- [`../../Site/CLAUDE.md`](../../Site/CLAUDE.md) — site institucional, §9 (régua verbal), §11 (armadilhas Vercel).
- [`../../amplify-agent-os/CLAUDE.md`](../../amplify-agent-os/CLAUDE.md) — convenções herdadas.
- Stream Video React SDK — documentação oficial.
- Supabase Auth (PKCE) + `@supabase/ssr` para Next.js App Router.
- Kiwify Webhooks v3 — referência externa.

---

*Dr. Matheus Prestes · CRM/SP 235.420 · Amplify Health © 2026 · Documento sancionado · Marco 1 concluído*
