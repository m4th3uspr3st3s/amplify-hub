-- ===========================================================================
-- Amplify Hub · Migração 0009 · Escrita admin em public.lessons
-- ===========================================================================
-- Habilita o editor de `body_md` no Hub (Lote 1 da iteração "Estação de
-- Comando do Admin" · Laudo de Auditoria v1.1 §1.1). Sem estas policies o
-- cliente browser do admin recebe "new row violates row-level security
-- policy" no UPDATE de body_md disparado pela Server Action
-- updateLessonBody.
--
-- Estratégia: reaproveita o helper public.is_admin() criado na 0003. Mantém
-- a postura de "service_role só para automações; humanos administradores
-- usam o claim app_metadata.admin = true via JWT".
--
-- Escopo desta migration:
--   · public.lessons → UPDATE/INSERT para admin
--   (DELETE fica para uma futura migration quando construirmos a UI de
--    remoção de aulas — YAGNI por ora; remover lesson cascateia em
--    live_sessions, lesson_assets e user_progress.)
--
-- Idempotência: drop policy if exists antes de cada create.
-- ===========================================================================

drop policy if exists "lessons_update_admin" on public.lessons;
create policy "lessons_update_admin"
  on public.lessons for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "lessons_insert_admin" on public.lessons;
create policy "lessons_insert_admin"
  on public.lessons for insert
  to authenticated
  with check (public.is_admin());

-- ===========================================================================
-- FIM · 0009_admin_lessons_write.sql
-- ===========================================================================
