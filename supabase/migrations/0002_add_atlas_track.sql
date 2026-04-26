-- ===========================================================================
-- Migration 0002 — adiciona a trilha `protocolo_atlas` ao enum de modules.track
--
-- Contexto (PRD §4.2): a v0.2 do PRD passa a reconhecer cinco trilhas
-- (`protocolo_amplify`, `protocolo_atlas`, `dmb`, `imago`, `amplisquad`).
-- A migração 0001 fixou um CHECK anônimo com apenas quatro valores; o nome
-- gerado pelo Postgres para esse constraint inline é `modules_track_check`.
--
-- Estratégia: drop + add idempotente — re-executável em ambientes onde
-- a 0002 já tenha sido aplicada parcialmente.
--
-- RLS: nenhuma policy referencia o constraint diretamente; a segregação
-- continua via `entitlements.track = modules.track`. Sem efeito colateral.
-- ===========================================================================

alter table public.modules
  drop constraint if exists modules_track_check;

alter table public.modules
  add constraint modules_track_check
  check (track in (
    'protocolo_amplify',
    'protocolo_atlas',
    'dmb',
    'imago',
    'amplisquad'
  ));
