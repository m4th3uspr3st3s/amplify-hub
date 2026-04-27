-- ===========================================================================
-- Amplify Hub · Migração 0008 · Escrita admin em lesson_assets + storage
-- ===========================================================================
-- Habilita o uploader nativo no Hub (Lote 3 da iteração de currículo). Sem
-- estas policies, o cliente browser do admin recebe "new row violates row-
-- level security policy" tanto no upload (storage.objects) quanto no INSERT
-- de metadados (public.lesson_assets).
--
-- Estratégia: reaproveita o helper public.is_admin() criado na 0003 e
-- escopa a escrita ao bucket `lesson-assets`. Mantém a postura de "service
-- role só para automações (webhook Kiwify); humanos administradores usam o
-- claim app_metadata.admin = true via JWT".
--
-- Escopo desta migration:
--   · public.lesson_assets       → INSERT/UPDATE/DELETE para admin
--   · storage.objects            → INSERT para admin no bucket lesson-assets
--   (UPDATE/DELETE em storage.objects ficam para uma futura migration quando
--    construirmos a UI de exclusão/substituição — YAGNI por ora.)
--
-- Idempotência: drop policy if exists antes de cada create.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- 1. public.lesson_assets — escrita admin
-- ---------------------------------------------------------------------------
drop policy if exists "lesson_assets_insert_admin" on public.lesson_assets;
create policy "lesson_assets_insert_admin"
  on public.lesson_assets for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "lesson_assets_update_admin" on public.lesson_assets;
create policy "lesson_assets_update_admin"
  on public.lesson_assets for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "lesson_assets_delete_admin" on public.lesson_assets;
create policy "lesson_assets_delete_admin"
  on public.lesson_assets for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- 2. storage.objects — INSERT admin no bucket `lesson-assets`
-- ---------------------------------------------------------------------------
drop policy if exists "lesson_assets_storage_insert_admin" on storage.objects;
create policy "lesson_assets_storage_insert_admin"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'lesson-assets'
    and public.is_admin()
  );

-- ===========================================================================
-- FIM · 0008_admin_lesson_assets_write.sql
-- ===========================================================================
