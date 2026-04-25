-- ===========================================================================
-- Amplify Hub · Migração 0001 · Schema inicial (live-first)
-- Referência autoritativa: docs/PRD-Amplify-Hub.md §4
-- ===========================================================================
--
-- Cobre:
--   · Tabelas: profiles, modules, lessons, live_sessions, attendance_records,
--     lesson_assets, user_progress, purchases.
--   · View: entitlements (revogação imediata em refund/chargeback).
--   · Triggers: handle_new_user, set_updated_at, link_pending_purchases,
--     derive_attended_live.
--   · Indices essenciais (PRD §4.3).
--   · Row Level Security em TODAS as tabelas do schema public.
--
-- Convenções:
--   · UUIDs gerados via gen_random_uuid() (extensão pgcrypto).
--   · Todas as FKs para auth.users usam ON DELETE CASCADE.
--   · RLS habilitada antes da definição das policies.
--   · `service_role` ignora RLS por padrão (Supabase) — usado no webhook
--     Kiwify para INSERT/UPDATE em `purchases`.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- 0. Extensões
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- 1. Função utilitária: set_updated_at
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ===========================================================================
-- 2. profiles — espelho público de auth.users (PRD §4.2)
-- ===========================================================================
create table public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  full_name       text,
  crm             text,
  crm_verified_at timestamptz,
  avatar_url      text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- INSERT: feito exclusivamente pelo trigger handle_new_user (security definer).
-- DELETE: cascateado por auth.users.

-- ---------------------------------------------------------------------------
-- 2.1 Trigger handle_new_user (PRD §4.4)
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ===========================================================================
-- 3. modules — unidade pedagógica de alto nível (PRD §4.2)
-- ===========================================================================
create table public.modules (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        text not null,
  description  text,
  track        text not null
                 check (track in ('protocolo_amplify', 'dmb', 'imago', 'amplisquad')),
  order_index  int  not null,
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger modules_set_updated_at
  before update on public.modules
  for each row execute function public.set_updated_at();

alter table public.modules enable row level security;

-- SELECT: aluno só vê módulos publicados E dos quais possui entitlement.
create policy "modules_select_entitled"
  on public.modules for select
  to authenticated
  using (
    published_at is not null
    and exists (
      select 1 from public.entitlements e
      where e.user_id = auth.uid()
        and e.track = modules.track
    )
  );

-- INSERT/UPDATE/DELETE: apenas service_role (Supabase Studio na v1).

-- ===========================================================================
-- 4. lessons — agrupador lógico de live_sessions + assets (PRD §4.2)
-- ===========================================================================
create table public.lessons (
  id           uuid primary key default gen_random_uuid(),
  module_id    uuid not null references public.modules(id) on delete cascade,
  slug         text not null,
  title        text not null,
  body_md      text,
  order_index  int  not null,
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (module_id, slug)
);

create index lessons_module_order_idx
  on public.lessons (module_id, order_index);

create trigger lessons_set_updated_at
  before update on public.lessons
  for each row execute function public.set_updated_at();

alter table public.lessons enable row level security;

-- SELECT: herda do módulo pai (módulo publicado + entitlement na track).
create policy "lessons_select_via_module"
  on public.lessons for select
  to authenticated
  using (
    exists (
      select 1 from public.modules m
      where m.id = lessons.module_id
        and m.published_at is not null
        and exists (
          select 1 from public.entitlements e
          where e.user_id = auth.uid()
            and e.track = m.track
        )
    )
  );

-- ===========================================================================
-- 5. live_sessions — sessão ao vivo Stream Video (PRD §4.2)
-- ===========================================================================
create table public.live_sessions (
  id                uuid primary key default gen_random_uuid(),
  lesson_id         uuid not null references public.lessons(id) on delete cascade,
  title             text not null,
  scheduled_for     timestamptz not null,
  duration_minutes  int  not null default 90,
  stream_call_id    text not null unique,
  stream_call_type  text not null default 'default',
  is_active         boolean not null default false,
  started_at        timestamptz,
  ended_at          timestamptz,
  recording_url     text,
  host_user_id      uuid references auth.users(id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index live_sessions_lesson_scheduled_idx
  on public.live_sessions (lesson_id, scheduled_for desc);

create index live_sessions_active_idx
  on public.live_sessions (is_active)
  where is_active = true;

create trigger live_sessions_set_updated_at
  before update on public.live_sessions
  for each row execute function public.set_updated_at();

alter table public.live_sessions enable row level security;

-- SELECT: aluno com entitlement na track do módulo pai.
create policy "live_sessions_select_entitled"
  on public.live_sessions for select
  to authenticated
  using (
    exists (
      select 1
      from public.lessons l
      join public.modules m on m.id = l.module_id
      where l.id = live_sessions.lesson_id
        and m.published_at is not null
        and exists (
          select 1 from public.entitlements e
          where e.user_id = auth.uid()
            and e.track = m.track
        )
    )
  );

-- UPDATE: apenas o host. INSERT: apenas service_role (Supabase Studio na v1).
create policy "live_sessions_update_host"
  on public.live_sessions for update
  to authenticated
  using (auth.uid() = host_user_id)
  with check (auth.uid() = host_user_id);

-- ===========================================================================
-- 6. attendance_records — presença por (aluno, sessão) (PRD §4.2)
-- ===========================================================================
create table public.attendance_records (
  user_id                uuid not null references auth.users(id) on delete cascade,
  live_session_id        uuid not null references public.live_sessions(id) on delete cascade,
  joined_at              timestamptz not null default now(),
  left_at                timestamptz,
  total_seconds_present  int,
  primary key (user_id, live_session_id, joined_at)
);

create index attendance_user_session_idx
  on public.attendance_records (user_id, live_session_id);

alter table public.attendance_records enable row level security;

create policy "attendance_select_own"
  on public.attendance_records for select
  to authenticated
  using (auth.uid() = user_id);

create policy "attendance_insert_own"
  on public.attendance_records for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "attendance_update_own"
  on public.attendance_records for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ===========================================================================
-- 7. lesson_assets — anexos persistentes (PRD §4.2)
-- ===========================================================================
create table public.lesson_assets (
  id           uuid primary key default gen_random_uuid(),
  lesson_id    uuid not null references public.lessons(id) on delete cascade,
  kind         text not null
                 check (kind in ('pdf', 'slides', 'template', 'exercise', 'audio')),
  title        text not null,
  storage_path text not null,
  size_bytes   bigint,
  created_at   timestamptz not null default now()
);

alter table public.lesson_assets enable row level security;

-- SELECT: herda da lesson pai.
create policy "lesson_assets_select_via_lesson"
  on public.lesson_assets for select
  to authenticated
  using (
    exists (
      select 1
      from public.lessons l
      join public.modules m on m.id = l.module_id
      where l.id = lesson_assets.lesson_id
        and m.published_at is not null
        and exists (
          select 1 from public.entitlements e
          where e.user_id = auth.uid()
            and e.track = m.track
        )
    )
  );

-- ===========================================================================
-- 8. user_progress — refatorado para live-first (PRD §4.2)
-- ===========================================================================
create table public.user_progress (
  user_id             uuid not null references auth.users(id) on delete cascade,
  lesson_id           uuid not null references public.lessons(id) on delete cascade,
  attended_live       boolean not null default false,
  marked_complete_at  timestamptz,
  notes               text,
  primary key (user_id, lesson_id)
);

alter table public.user_progress enable row level security;

create policy "user_progress_select_own"
  on public.user_progress for select
  to authenticated
  using (auth.uid() = user_id);

create policy "user_progress_insert_own"
  on public.user_progress for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "user_progress_update_own"
  on public.user_progress for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ===========================================================================
-- 9. purchases — registro imutável Kiwify (PRD §4.2)
-- ===========================================================================
create table public.purchases (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete set null,
  email           text not null,
  kiwify_order_id text not null unique,
  product_code    text not null,
  status          text not null
                    check (status in ('paid', 'refunded', 'chargeback', 'canceled')),
  amount_cents    int  not null,
  currency        text not null default 'BRL',
  purchased_at    timestamptz not null,
  raw_payload     jsonb not null,
  created_at      timestamptz not null default now()
);

create index purchases_email_idx on public.purchases (email);

alter table public.purchases enable row level security;

-- SELECT: aluno vê apenas as próprias compras.
create policy "purchases_select_own"
  on public.purchases for select
  to authenticated
  using (auth.uid() = user_id);

-- INSERT/UPDATE: apenas via service_role (webhook handler).

-- ---------------------------------------------------------------------------
-- 9.1 Trigger link_pending_purchases (PRD §4.4)
-- Quando um auth.users novo casa com purchases.email pendentes, espelha o
-- user_id para que o entitlement passe a valer imediatamente.
-- ---------------------------------------------------------------------------
create or replace function public.link_pending_purchases()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.purchases
     set user_id = new.id
   where user_id is null
     and lower(email) = lower(new.email);
  return new;
end;
$$;

create trigger on_auth_user_created_link_purchases
  after insert on auth.users
  for each row execute function public.link_pending_purchases();

-- ===========================================================================
-- 10. entitlements — view de acesso ativo (PRD §4.2)
-- Refund/chargeback derruba acesso imediato pelo filtro status='paid'.
-- ===========================================================================
create or replace view public.entitlements as
select distinct
  user_id,
  product_code as track
from public.purchases
where status = 'paid'
  and user_id is not null;

-- A view roda com permissões do invocador. Como `purchases` tem RLS, o
-- `select` da view só retorna linhas que o usuário pode ler — mas como
-- as policies de `modules`/`lessons`/etc. consultam a view via subquery,
-- precisamos garantir que o aluno autenticado consiga ler suas próprias
-- linhas (já coberto por purchases_select_own acima).
grant select on public.entitlements to authenticated;

-- ===========================================================================
-- 11. Trigger derive_attended_live (PRD §4.4)
-- Em INSERT/UPDATE de attendance_records com >= 600s de presença, marca
-- user_progress.attended_live = true via UPSERT.
-- ===========================================================================
create or replace function public.derive_attended_live()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lesson_id uuid;
begin
  if coalesce(new.total_seconds_present, 0) < 600 then
    return new;
  end if;

  select lesson_id into v_lesson_id
    from public.live_sessions
   where id = new.live_session_id;

  if v_lesson_id is null then
    return new;
  end if;

  insert into public.user_progress (user_id, lesson_id, attended_live)
  values (new.user_id, v_lesson_id, true)
  on conflict (user_id, lesson_id)
  do update set attended_live = true;

  return new;
end;
$$;

create trigger attendance_derive_attended_live
  after insert or update on public.attendance_records
  for each row execute function public.derive_attended_live();

-- ===========================================================================
-- FIM · 0001_initial_schema.sql
-- ===========================================================================
