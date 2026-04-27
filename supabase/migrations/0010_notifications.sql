-- ===========================================================================
-- Amplify Hub · Migração 0010 · Sistema de notificações
-- ===========================================================================
-- Habilita o Lote 3 do roadmap de expansão (Laudo de Auditoria v1.1 §3.2):
--   · public.notification_jobs       → fila persistente de envios
--   · public.user_notification_prefs → opt-out por aluno (LGPD-adjacente)
--   · trigger enqueue_live_notifications → INSERT em live_sessions
--     enfileira automaticamente 3 jobs (live_scheduled, _reminder_24h, _1h)
--   · public.get_recipients_for_track(track) → função SECURITY DEFINER
--     consultada pelo dispatcher para resolver email de destinatários
--     (precisa ler auth.users; dispatcher roda com service_role mas a
--     função abstrai o JOIN entitlements + prefs para uso reaproveitável)
--
-- Postura de segurança: as duas tabelas só são manipuladas pelo
-- service_role (cron dispatcher) E, no caso de prefs, pelo próprio aluno
-- via RLS (UPDATE/SELECT do próprio registro). Service_role bypassa RLS.
--
-- Idempotência: drop policy/trigger/function if exists antes de cada criar.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- 1. notification_jobs — fila de envios pendentes
-- ---------------------------------------------------------------------------
create table if not exists public.notification_jobs (
  id              uuid primary key default gen_random_uuid(),
  kind            text not null
                    check (kind in (
                      'live_scheduled',
                      'live_reminder_24h',
                      'live_reminder_1h',
                      'lesson_published'
                    )),
  live_session_id uuid references public.live_sessions(id) on delete cascade,
  lesson_id       uuid references public.lessons(id) on delete cascade,
  run_at          timestamptz not null,
  sent_at         timestamptz,
  recipient_count int,
  error           text,
  created_at      timestamptz not null default now()
);

create index if not exists notification_jobs_pending_idx
  on public.notification_jobs (run_at)
  where sent_at is null;

alter table public.notification_jobs enable row level security;

-- SELECT/INSERT/UPDATE/DELETE: apenas service_role (cron dispatcher).
-- Usuários autenticados não devem ver a fila de outros alunos.

-- ---------------------------------------------------------------------------
-- 2. user_notification_prefs — opt-out por aluno
-- ---------------------------------------------------------------------------
create table if not exists public.user_notification_prefs (
  user_id              uuid primary key references auth.users(id) on delete cascade,
  email_live_reminders boolean not null default true,
  updated_at           timestamptz not null default now()
);

create trigger user_notification_prefs_set_updated_at
  before update on public.user_notification_prefs
  for each row execute function public.set_updated_at();

alter table public.user_notification_prefs enable row level security;

drop policy if exists "user_notification_prefs_select_own" on public.user_notification_prefs;
create policy "user_notification_prefs_select_own"
  on public.user_notification_prefs for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "user_notification_prefs_upsert_own" on public.user_notification_prefs;
create policy "user_notification_prefs_upsert_own"
  on public.user_notification_prefs for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "user_notification_prefs_update_own" on public.user_notification_prefs;
create policy "user_notification_prefs_update_own"
  on public.user_notification_prefs for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 3. enqueue_live_notifications — trigger AFTER INSERT em live_sessions
-- ---------------------------------------------------------------------------
-- Enfileira até 3 jobs por sessão recém-criada:
--   · live_scheduled        → run_at = now() (envio na próxima rodada do cron)
--   · live_reminder_24h     → scheduled_for - 24h (só se ainda no futuro)
--   · live_reminder_1h      → scheduled_for - 1h  (só se ainda no futuro)
--
-- Lembretes "no passado" são pulados (admin agendando uma live para daqui a
-- 30 minutos não dispara um job 24h_reminder antigo).
-- ---------------------------------------------------------------------------
create or replace function public.enqueue_live_notifications()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
begin
  insert into public.notification_jobs (kind, live_session_id, lesson_id, run_at)
  values ('live_scheduled', new.id, new.lesson_id, v_now);

  if new.scheduled_for - interval '24 hours' > v_now then
    insert into public.notification_jobs (kind, live_session_id, lesson_id, run_at)
    values (
      'live_reminder_24h',
      new.id,
      new.lesson_id,
      new.scheduled_for - interval '24 hours'
    );
  end if;

  if new.scheduled_for - interval '1 hour' > v_now then
    insert into public.notification_jobs (kind, live_session_id, lesson_id, run_at)
    values (
      'live_reminder_1h',
      new.id,
      new.lesson_id,
      new.scheduled_for - interval '1 hour'
    );
  end if;

  return new;
end;
$$;

drop trigger if exists live_sessions_enqueue_notifications on public.live_sessions;
create trigger live_sessions_enqueue_notifications
  after insert on public.live_sessions
  for each row execute function public.enqueue_live_notifications();

-- ---------------------------------------------------------------------------
-- 4. get_recipients_for_track — resolução de destinatários
-- ---------------------------------------------------------------------------
-- Cruzamento canônico para segmentação Atlas vs Amplify (Laudo §3.3):
-- entitlement na track → email ativo → opt-in preserved.
--
-- Retorna user_id, email e full_name (para personalizar saudação no template).
-- SECURITY DEFINER porque precisa ler auth.users (auth schema é restrito).
-- Grant para service_role apenas — usuários comuns não devem listar emails.
-- ---------------------------------------------------------------------------
create or replace function public.get_recipients_for_track(p_track text)
returns table (
  user_id   uuid,
  email     text,
  full_name text
)
language sql
security definer
set search_path = public, auth
as $$
  select
    u.id,
    u.email,
    coalesce(p.full_name, '')
  from auth.users u
  join public.entitlements e
    on e.user_id = u.id
   and e.track = p_track
  left join public.profiles p
    on p.id = u.id
  left join public.user_notification_prefs np
    on np.user_id = u.id
  where u.email is not null
    and coalesce(np.email_live_reminders, true) = true;
$$;

revoke all on function public.get_recipients_for_track(text) from public, anon, authenticated;
grant execute on function public.get_recipients_for_track(text) to service_role;

-- ===========================================================================
-- FIM · 0010_notifications.sql
-- ===========================================================================
