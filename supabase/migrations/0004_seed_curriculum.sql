-- ===========================================================================
-- Amplify Hub · Migração 0004 · Carga inicial do currículo oficial
-- Referência autoritativa: Laudo de Implementação · Carga do Currículo
-- ===========================================================================
--
-- Cobre:
--   · 15 Módulos (6 da trilha protocolo_amplify + 9 da trilha protocolo_atlas)
--   · 15 Lessons inaugurais (slug = 'visao-geral', order_index = 0) — uma
--     por módulo, ancorando os manuais em PDF e a primeira live_session.
--
-- Idempotência:
--   · modules        → ON CONFLICT (slug) DO UPDATE
--   · lessons        → ON CONFLICT (module_id, slug) DO UPDATE
--   · sem UUIDs hardcoded; chaves naturais (slug) garantem replay seguro
--     e portabilidade entre ambientes (dev / staging / produção).
--
-- Drip semanal (controle de liberação):
--   · M1 de cada trilha já nasce publicado (published_at = now()), tanto no
--     módulo quanto na lesson 'visao-geral' filha.
--   · M2..MN nascem com published_at = null. Admin enxerga via
--     0003_admin_rls_bypass.sql; aluno só vê após UPDATE manual posterior
--     (gotejamento semanal — uma migration curta tipo 0008_publish_*.sql,
--     ou via Supabase Studio com service_role).
--
-- Bypass de RLS: esta migration roda como superuser (postgres), portanto as
-- policies INSERT-restricted das tabelas modules/lessons não bloqueiam.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- 1. Módulos · Trilha Protocolo Amplify (6 módulos)
-- ---------------------------------------------------------------------------
insert into public.modules (slug, title, description, track, order_index, published_at)
values
  ('amplify-m1-fundamentos-diagnostico',
   'M1 · Fundamentos & Diagnóstico',
   'Mapeamento do estado clínico atual e fundamentos conceituais que sustentam toda a jornada Amplify.',
   'protocolo_amplify', 1, now()),
  ('amplify-m2-engenharia-prompt-clinica',
   'M2 · Engenharia de Prompt Clínica',
   'Construção de prompts de uso clínico com rigor técnico e segurança epistêmica.',
   'protocolo_amplify', 2, null),
  ('amplify-m3-liberdade-operacional',
   'M3 · Liberdade Operacional',
   'Automação de tarefas operacionais e desenho de fluxos para liberar tempo clínico.',
   'protocolo_amplify', 3, null),
  ('amplify-m4-autoridade-marketing-etico',
   'M4 · Autoridade & Marketing Ético',
   'Construção de autoridade médica digital com aderência ao CFM e compliance editorial.',
   'protocolo_amplify', 4, null),
  ('amplify-m5-jornada-do-paciente',
   'M5 · Jornada do Paciente',
   'Desenho ponta a ponta da experiência do paciente e instrumentação dos pontos de contato.',
   'protocolo_amplify', 5, null),
  ('amplify-m6-projeto-pratico-mvp',
   'M6 · Projeto Prático — Seu MVP',
   'Entrega do MVP do consultório aumentado por IA, com defesa em banca técnica.',
   'protocolo_amplify', 6, null)
on conflict (slug) do update set
  title        = excluded.title,
  description  = excluded.description,
  track        = excluded.track,
  order_index  = excluded.order_index,
  published_at = excluded.published_at;

-- ---------------------------------------------------------------------------
-- 2. Módulos · Trilha Protocolo Atlas (9 módulos)
-- ---------------------------------------------------------------------------
insert into public.modules (slug, title, description, track, order_index, published_at)
values
  ('atlas-m1-blueprint-atlas',
   'M1 · Blueprint Atlas',
   'Visão geral da arquitetura Atlas e do conjunto de sistemas proprietários a serem dominados.',
   'protocolo_atlas', 1, now()),
  ('atlas-m2-substrato-de-conhecimento',
   'M2 · Substrato de Conhecimento',
   'Construção do Vault clínico e do substrato de conhecimento que alimenta os meta-agentes.',
   'protocolo_atlas', 2, null),
  ('atlas-m3-hermes-meta-agente-pessoal',
   'M3 · Hermes — Meta-agente Pessoal',
   'Operação do meta-agente Hermes como orquestrador clínico-administrativo pessoal.',
   'protocolo_atlas', 3, null),
  ('atlas-m4-squad-proprio',
   'M4 · Squad Próprio',
   'Construção e governança de squads de agentes especializados sob comando do médico.',
   'protocolo_atlas', 4, null),
  ('atlas-m5-claude-code',
   'M5 · Claude Code',
   'Uso operacional do Claude Code como ambiente de desenvolvimento clínico-técnico.',
   'protocolo_atlas', 5, null),
  ('atlas-m6-integracao-de-sistemas',
   'M6 · Integração de Sistemas',
   'Integração entre sistemas (EMR, agenda, financeiro, comunicação) com observabilidade.',
   'protocolo_atlas', 6, null),
  ('atlas-m7-jornada-longitudinal',
   'M7 · Jornada Longitudinal',
   'Modelagem da jornada longitudinal do paciente em horizontes de meses e anos.',
   'protocolo_atlas', 7, null),
  ('atlas-m8-compliance-avancado',
   'M8 · Compliance Avançado',
   'Compliance avançado: LGPD, CFM, retenção, auditabilidade e blindagem documental.',
   'protocolo_atlas', 8, null),
  ('atlas-m9-consolidacao-apresentacao',
   'M9 · Consolidação & Apresentação',
   'Consolidação dos sistemas, apresentação executiva e plano de operação contínua.',
   'protocolo_atlas', 9, null)
on conflict (slug) do update set
  title        = excluded.title,
  description  = excluded.description,
  track        = excluded.track,
  order_index  = excluded.order_index,
  published_at = excluded.published_at;

-- ---------------------------------------------------------------------------
-- 3. Lessons inaugurais ("visao-geral") · Trilha Protocolo Amplify
-- order_index = 0 (reserva 1+ para as aulas semanais que virão).
-- published_at espelha o módulo pai (M1 publicado, demais null).
-- ---------------------------------------------------------------------------
insert into public.lessons (module_id, slug, title, body_md, order_index, published_at)
select
  m.id,
  'visao-geral',
  'Aula 1 · Visão Geral — ' || m.title,
  '## Visão Geral' || E'\n\n' ||
  'Esta é a aula inaugural do **' || m.title || '**.' || E'\n\n' ||
  'O manual oficial em PDF está disponível na seção de **Materiais** abaixo.' || E'\n\n' ||
  'As aulas ao vivo deste módulo serão publicadas semanalmente conforme a agenda da turma.',
  0,
  m.published_at
from public.modules m
where m.slug in (
  'amplify-m1-fundamentos-diagnostico',
  'amplify-m2-engenharia-prompt-clinica',
  'amplify-m3-liberdade-operacional',
  'amplify-m4-autoridade-marketing-etico',
  'amplify-m5-jornada-do-paciente',
  'amplify-m6-projeto-pratico-mvp'
)
on conflict (module_id, slug) do update set
  title        = excluded.title,
  body_md      = excluded.body_md,
  order_index  = excluded.order_index,
  published_at = excluded.published_at;

-- ---------------------------------------------------------------------------
-- 4. Lessons inaugurais ("visao-geral") · Trilha Protocolo Atlas
-- ---------------------------------------------------------------------------
insert into public.lessons (module_id, slug, title, body_md, order_index, published_at)
select
  m.id,
  'visao-geral',
  'Aula 1 · Visão Geral — ' || m.title,
  '## Visão Geral' || E'\n\n' ||
  'Esta é a aula inaugural do **' || m.title || '**.' || E'\n\n' ||
  'O manual oficial em PDF está disponível na seção de **Materiais** abaixo.' || E'\n\n' ||
  'As aulas ao vivo deste módulo serão publicadas semanalmente conforme a agenda da turma.',
  0,
  m.published_at
from public.modules m
where m.slug in (
  'atlas-m1-blueprint-atlas',
  'atlas-m2-substrato-de-conhecimento',
  'atlas-m3-hermes-meta-agente-pessoal',
  'atlas-m4-squad-proprio',
  'atlas-m5-claude-code',
  'atlas-m6-integracao-de-sistemas',
  'atlas-m7-jornada-longitudinal',
  'atlas-m8-compliance-avancado',
  'atlas-m9-consolidacao-apresentacao'
)
on conflict (module_id, slug) do update set
  title        = excluded.title,
  body_md      = excluded.body_md,
  order_index  = excluded.order_index,
  published_at = excluded.published_at;

-- ===========================================================================
-- FIM · 0004_seed_curriculum.sql
-- ===========================================================================
