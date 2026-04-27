-- ===========================================================================
-- Amplify Hub · Migração 0007 · Estrutura da tabela lesson_assets
-- Referência autoritativa: Laudo de Implementação · §3.4
-- ===========================================================================
--
-- Adiciona UNIQUE(lesson_id, storage_path) em public.lesson_assets para
-- viabilizar INSERT idempotente das próximas migrations de seed dos manuais
-- (futuro 0008_seed_lesson_assets.sql, executado após o Owner subir os PDFs
-- físicos no bucket via Supabase Studio).
--
-- Sem o UNIQUE, replays criariam linhas duplicadas — esta migration prepara
-- o terreno para que `INSERT ... ON CONFLICT (lesson_id, storage_path) DO
-- UPDATE` seja sintaticamente válido.
--
-- Idempotência:
--   · IF NOT EXISTS no nome do constraint para replay seguro.
--   · Não há INSERT de dados nesta migration (ver cabeçalho do laudo).
-- ===========================================================================

alter table public.lesson_assets
  drop constraint if exists lesson_assets_lesson_path_unique;

alter table public.lesson_assets
  add constraint lesson_assets_lesson_path_unique
  unique (lesson_id, storage_path);

-- ===========================================================================
-- FIM · 0007_lesson_assets_structure.sql
-- ===========================================================================
