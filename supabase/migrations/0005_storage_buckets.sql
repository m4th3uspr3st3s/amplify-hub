-- ===========================================================================
-- Amplify Hub · Migração 0005 · Bucket privado `lesson-assets`
-- Referência autoritativa: Laudo de Implementação · §3.1
-- ===========================================================================
--
-- Cria o bucket `lesson-assets` para armazenar manuais em PDF e demais
-- anexos vinculados às lessons. PRIVADO — downloads ocorrem via signed URL
-- gerada server-side após validação de entitlement (RLS sobre storage.objects
-- vem na 0006).
--
-- Restrições:
--   · public        = false  (alunos não devem listar/baixar via URL pública)
--   · file_size_limit = 50 MiB (alinhado com config.toml [storage])
--   · allowed_mime_types = ['application/pdf'] na v1 (manuais oficiais).
--     Quando expandirmos para slides/áudio, basta um ALTER pontual.
--
-- Idempotência: ON CONFLICT (id) DO UPDATE — replay seguro em todos os
-- ambientes; reflete também alterações futuras de policy do bucket.
-- ===========================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'lesson-assets',
  'lesson-assets',
  false,
  52428800,
  array['application/pdf']
)
on conflict (id) do update set
  public             = excluded.public,
  file_size_limit    = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ===========================================================================
-- FIM · 0005_storage_buckets.sql
-- ===========================================================================
