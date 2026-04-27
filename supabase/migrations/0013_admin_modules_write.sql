-- ===========================================================================
-- Amplify Hub · Migração 0013 · Escrita admin em public.modules
-- ===========================================================================
-- Habilita o controle de publicação dos módulos pelo Admin via UI (toggle
-- "Publicar módulo / Reverter para rascunho"). Sem esta policy, o cliente
-- browser do admin recebe "new row violates row-level security policy" ao
-- alternar `published_at` pela Server Action toggleModulePublication.
--
-- Estratégia: reaproveita o helper public.is_admin() criado na 0003. Mantém
-- a postura de "service_role só para automações; humanos administradores
-- usam o claim app_metadata.admin = true via JWT".
--
-- Escopo desta migration:
--   · public.modules → UPDATE para admin
--   (INSERT/DELETE ficam para uma futura migration quando construirmos as
--    UIs de criação/remoção de módulos — YAGNI por ora; remover module
--    cascateia em lessons, lesson_assets e user_progress.)
--
-- Idempotência: drop policy if exists antes de cada create.
-- ===========================================================================

drop policy if exists "modules_update_admin" on public.modules;
create policy "modules_update_admin"
  on public.modules for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ===========================================================================
-- FIM · 0013_admin_modules_write.sql
-- ===========================================================================
