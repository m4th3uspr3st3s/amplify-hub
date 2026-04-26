-- ===========================================================================
-- Amplify Hub · Migração 0002 · Bypass RLS para claim app_metadata.admin
-- ===========================================================================
-- Owner (Dr. Matheus) precisa enxergar a totalidade do catálogo (Atlas +
-- Amplify) e a sessão ao vivo de qualquer track, ignorando o filtro de
-- entitlements. A claim canônica é `auth.users.raw_app_meta_data.admin = true`
-- (app_metadata é server-only — usuário comum não consegue forjar).
--
-- Estratégia: helper SQL `public.is_admin()` lê o JWT corrente. RLS adiciona
-- uma policy paralela `*_admin_bypass` em cada tabela cujo SELECT depende de
-- entitlement, mantendo as policies de aluno intactas (defesa em camadas).
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- 1. Helper estável e cacheável dentro da query
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'admin')::boolean,
    false
  );
$$;

grant execute on function public.is_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- 2. modules — admin vê tudo (publicado ou não)
-- ---------------------------------------------------------------------------
drop policy if exists "modules_select_admin" on public.modules;
create policy "modules_select_admin"
  on public.modules for select
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- 3. lessons — admin vê tudo
-- ---------------------------------------------------------------------------
drop policy if exists "lessons_select_admin" on public.lessons;
create policy "lessons_select_admin"
  on public.lessons for select
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- 4. live_sessions — admin vê tudo + pode update/insert
-- ---------------------------------------------------------------------------
drop policy if exists "live_sessions_select_admin" on public.live_sessions;
create policy "live_sessions_select_admin"
  on public.live_sessions for select
  to authenticated
  using (public.is_admin());

drop policy if exists "live_sessions_update_admin" on public.live_sessions;
create policy "live_sessions_update_admin"
  on public.live_sessions for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "live_sessions_insert_admin" on public.live_sessions;
create policy "live_sessions_insert_admin"
  on public.live_sessions for insert
  to authenticated
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 5. lesson_assets — admin vê tudo
-- ---------------------------------------------------------------------------
drop policy if exists "lesson_assets_select_admin" on public.lesson_assets;
create policy "lesson_assets_select_admin"
  on public.lesson_assets for select
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- 6. attendance_records — admin vê presença de todos os alunos
-- ---------------------------------------------------------------------------
drop policy if exists "attendance_select_admin" on public.attendance_records;
create policy "attendance_select_admin"
  on public.attendance_records for select
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- 7. purchases — admin vê todas as compras (auditoria)
-- ---------------------------------------------------------------------------
drop policy if exists "purchases_select_admin" on public.purchases;
create policy "purchases_select_admin"
  on public.purchases for select
  to authenticated
  using (public.is_admin());

-- ===========================================================================
-- FIM · 0002_admin_rls_bypass.sql
-- ===========================================================================
