-- ===========================================================================
-- Amplify Hub · Migração 0006 · RLS de storage.objects para `lesson-assets`
-- Referência autoritativa: Laudo de Implementação · §3.3
-- ===========================================================================
--
-- Defesa em camadas: a tabela public.lesson_assets já filtra LINHAS por
-- entitlement (0001_initial_schema.sql §8). Esta migration filtra OBJETOS
-- físicos no Storage, fechando o vetor "vazei o storage_path, baixei sem
-- entitlement".
--
-- Convenção de path (Laudo §3.2):
--   tracks/<track>/<module-slug>/<lesson-slug>/<filename>
--
-- Estratégia: split_part(name, '/', 2) extrai o segmento <track> e cruza
-- com a view public.entitlements. Admin (claim app_metadata.admin = true,
-- via public.is_admin() definido na 0003) tem bypass.
--
-- Escopo: apenas SELECT. INSERT/UPDATE/DELETE em storage.objects continuam
-- restritos a service_role (uploads via Supabase Studio pelo Owner).
--
-- Idempotência: drop policy if exists antes de criar.
-- ===========================================================================

drop policy if exists "lesson_assets_storage_select" on storage.objects;

create policy "lesson_assets_storage_select"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'lesson-assets'
    and (
      public.is_admin()
      or exists (
        select 1
        from public.entitlements e
        where e.user_id = auth.uid()
          and e.track   = split_part(name, '/', 2)
      )
    )
  );

-- ===========================================================================
-- FIM · 0006_lesson_assets_storage_rls.sql
-- ===========================================================================
