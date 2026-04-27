-- ===========================================================================
-- Amplify Hub · Migração 0011 · Aumento do limite do bucket lesson-assets
-- ===========================================================================
-- Owner bateu na trava de 50 MiB ao subir um manual denso. Elevamos o teto
-- para 150 MiB (157286400 bytes) — cobre PDFs ilustrados, slides exportados
-- e workbooks longos sem precisar comprimir agressivamente.
--
-- Sem ALTER no shape da tabela storage.buckets — é um UPDATE pontual no
-- registro do bucket. A migration 0005 mantém o INSERT idempotente original;
-- esta apenas sobrescreve o limite atual.
--
-- Idempotência: WHERE id = 'lesson-assets' garante o no-op se o bucket já
-- estiver no limite alvo (replays são seguros).
-- ===========================================================================

update storage.buckets
   set file_size_limit = 157286400  -- 150 MiB (150 * 1024 * 1024)
 where id = 'lesson-assets';

-- ===========================================================================
-- FIM · 0011_increase_storage_limit.sql
-- ===========================================================================
