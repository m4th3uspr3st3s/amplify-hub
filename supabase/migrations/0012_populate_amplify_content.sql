-- ===========================================================================
-- Amplify Hub · Migração 0012 · Carga de conteúdo real · Protocolo Amplify
-- ===========================================================================
-- Popula `lessons.body_md` da aula inaugural (slug = 'visao-geral') de cada
-- um dos 6 módulos do Protocolo Amplify, a partir dos materiais oficiais
-- versionados em `D:\AmpliFy Health\Aulas\Módulo N`.
--
-- Estratégia editorial: o conteúdo bruto dos refinamentos/estruturas (DOCX)
-- contém roteiros longos com tabelas e copy de palco. Para a página da
-- aula, destilamos o essencial em 3 seções estáveis renderizáveis pelo
-- MarkdownLite (## h2 + **negrito** + parágrafos):
--   · Sobre este módulo            → posicionamento + dor que resolve
--   · O que você vai aprender      → objetivos pedagógicos concretos
--   · Mudança que você vai sentir  → transformação de identidade prometida
--
-- O manual oficial em PDF segue como o material canônico — referenciado
-- no fim do body para encaminhar o aluno ao Materiais de apoio.
--
-- Idempotência: UPDATE incondicional pelo par (modules.slug, lessons.slug).
-- Replay seguro — o body é sempre sobrescrito pela versão desta migration.
-- Sem ON CONFLICT necessário (não é INSERT).
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- M1 · Fundamentos & Diagnóstico
-- Fonte: Refinamento_Completo_do_Módulo_1_Amplify_Health.docx
-- ---------------------------------------------------------------------------
update public.lessons l
   set body_md = $body$## Sobre este módulo

Este é o ponto de partida da jornada Amplify. Antes de qualquer ferramenta, antes de qualquer prompt, o Módulo 1 te entrega o **diagnóstico clínico do seu consultório**: o mapa de onde a sobrecarga nasce, por que ela se sustenta e quais alavancas vão sair primeiro do papel.

Sai daqui quem entende que sua dor operacional não é falha pessoal — é um quadro **diagnosticável**, com nome, padrão e tratamento.

## O que você vai aprender

**O framework dos 3 eixos e 8 diagnósticos.** Aprende a nomear com precisão clínica os gargalos do seu consultório (de SGO — Síndrome de Gestão Operacional — a FAA — Fadiga Administrativa Aguda) e a reconhecer qual deles te tira mais energia hoje.

**A leitura do seu laudo individual.** O laudo de maturidade gerado para você deixa de ser um relatório frio e vira a base de toda a sua jornada nos próximos cinco módulos — cada diagnóstico aponta para um conjunto específico de tratamentos.

**O posicionamento da IA como aliada clínica.** Sai a narrativa de ameaça existencial e entra a metáfora operacional: a IA é o **estetoscópio do século XXI**, um residente digital que te devolve tempo para ser médico.

## Mudança que você vai sentir

A transição é de **Médico Sobrecarregado** para **Médico Estrategista**. Você para de reagir ao sistema e começa a redesenhá-lo. A postura muda de "o consultório é assim" para "eu vou diagnosticar e tratar o que está atrasando minha prática".

Quando o módulo terminar, a frase que fica é: **"Eu não estou sozinho. O que eu sinto tem nome — e tem tratamento."**

## Materiais

O manual oficial deste módulo está disponível na seção **Materiais de apoio** abaixo. Recomenda-se baixá-lo antes da live para acompanhar o framework completo dos 8 diagnósticos.$body$
  from public.modules m
 where m.id = l.module_id
   and m.slug = 'amplify-m1-fundamentos-diagnostico'
   and l.slug = 'visao-geral';

-- ---------------------------------------------------------------------------
-- M2 · Engenharia de Prompt Clínica
-- Fonte: Estrutura_Detalhada_Módulo_2_-_Engenharia_de_Prompt_Clínica.docx
-- ---------------------------------------------------------------------------
update public.lessons l
   set body_md = $body$## Sobre este módulo

Com o diagnóstico do Módulo 1 em mãos, o Módulo 2 entrega a **primeira linha de tratamento**: a prescrição. No vocabulário Amplify, prompt é prescrição — e prescrições mal escritas levam a respostas ineficazes ou perigosas, dentro e fora da clínica.

Aqui você aprende a escrever a prescrição que devolve resultados precisos, seguros e auditáveis.

## O que você vai aprender

**O Framework CPTF — Contexto, Persona, Tarefa, Formato.** Os quatro componentes que separam um prompt genérico de uma instrução clínica de qualidade. Cada componente atende a uma falha específica das respostas vagas que você já experimentou.

**As regras de compliance e anonimização.** Como aplicar o framework respeitando LGPD e ética médica — sem expor dado de paciente em prompt, sem transferir responsabilidade para a ferramenta, sem perder rastreabilidade.

**Sua biblioteca pessoal de 5 prompts validados.** Você sai do módulo com prompts prontos para resumo de caso, diferencial diagnóstico, briefing pré-consulta, comunicação ao paciente e revisão de prontuário — todos construídos sobre o seu próprio diagnóstico do Módulo 1.

## Mudança que você vai sentir

De **Usuário de IA** (que consome passivamente o que a ferramenta entrega) para **Engenheiro Clínico de IA** (que projeta e comanda a ferramenta para gerar resultados auditáveis).

A epifania chega quando você aplica o CPTF ao seu próprio caso clínico real e a IA devolve, na primeira tentativa, uma resposta que você teria assinado embaixo. A frase que fica é: **"A qualidade da resposta não é sorte. É instrução."**

## Materiais

O manual oficial e a estrutura completa da biblioteca de prompts estão disponíveis na seção **Materiais de apoio** abaixo.$body$
  from public.modules m
 where m.id = l.module_id
   and m.slug = 'amplify-m2-engenharia-prompt-clinica'
   and l.slug = 'visao-geral';

-- ---------------------------------------------------------------------------
-- M3 · Liberdade Operacional
-- Fonte: Estrutura_Detalhada_Módulo_3_-_Liberdade_Operacional.docx
-- ---------------------------------------------------------------------------
update public.lessons l
   set body_md = $body$## Sobre este módulo

A média mostra: um médico gasta cerca de **16 minutos por paciente apenas no prontuário eletrônico**. Em um dia de 10 atendimentos, são quase 3 horas perdidas para o teclado. O Módulo 3 entrega o sistema que **demite o teclado da função de transcritor**.

A promessa concreta: zerar o tempo gasto digitando documentos repetitivos, sem perder qualidade clínica nem rastreabilidade jurídica.

## O que você vai aprender

**A arquitetura do scribing clínico.** O fluxo completo Voz → Transcrição → IA Estruturadora → Documento, e por que cada estágio existe. Você entende o que está acontecendo dentro da automação — não apenas como apertar botões.

**A escolha e instalação das ferramentas certas.** Quais softwares atendem aos critérios clínicos (segurança, anonimização, latência, auditabilidade) e como instalá-los na sua máquina durante a própria aula.

**Sua primeira automação funcionando ao vivo.** Demonstração na qual o mentor fala um trecho de consulta livremente e a tela monta, em tempo real, um prontuário com Anamnese, Exame Físico, Hipóteses e Conduta — pronto para conferir e assinar.

## Mudança que você vai sentir

De **Engenheiro Clínico de IA** (que comanda a IA tarefa por tarefa) para **Médico Orquestrador** (que constrói máquinas que trabalham para ele de forma autônoma).

Quando você ouve sua voz virar prontuário estruturado em tempo real, a percepção de valor sai do campo da curiosidade e entra no campo da reposse. A frase que fica é: **"Recuperei 2 horas do meu dia."**

## Materiais

O manual oficial deste módulo está disponível na seção **Materiais de apoio** abaixo. Recomenda-se baixar antes da live — durante a sessão você vai instalar o software junto com o mentor.$body$
  from public.modules m
 where m.id = l.module_id
   and m.slug = 'amplify-m3-liberdade-operacional'
   and l.slug = 'visao-geral';

-- ---------------------------------------------------------------------------
-- M4 · Autoridade & Marketing Ético
-- Fonte: Estrutura_Detalhada_Módulo_4_-_Autoridade_&_Marketing_Ético.docx
-- ---------------------------------------------------------------------------
update public.lessons l
   set body_md = $body$## Sobre este módulo

Recuperado o tempo nos módulos anteriores, surge a pergunta inevitável: **o que fazer com ele?** O Módulo 4 propõe um caminho específico — substituir a "caça" por pacientes (anúncios, descontos, mais convênios) por um sistema que **atrai pacientes qualificados** 24 horas por dia.

Marketing aqui não é a palavra suja que você imagina. É educação do paciente em escala, com aderência ao CFM e compliance editorial.

## O que você vai aprender

**O Funil de Conteúdo Clínico — Topo, Meio, Fundo.** Como cada tipo de conteúdo cumpre uma função diferente na jornada do paciente, e por que misturar os três frustra os três.

**A "Tradução de Mediquês" via IA.** Um framework para pegar um tema clínico complexo da sua especialidade e transformá-lo em um post claro, magnético e eticamente correto — em menos de 15 minutos, do prompt à imagem.

**O Calendário Editorial mínimo viável.** Como sistematizar a produção de conteúdo de forma que ela aconteça em horas por mês, não em horas por semana, e como usar IA para planejá-lo.

## Mudança que você vai sentir

De **Clínico Invisível** (passivo, dependente de indicações e convênios) para **Médico-Educador** (autoridade digital que atrai pacientes pelo conhecimento que compartilha).

A epifania acontece quando você vê o primeiro conteúdo completo (texto + visual) saindo pronto para publicar, criado por você com esforço mínimo. A frase que fica é: **"Construir autoridade não é fardo. É sistema."**

## Materiais

O manual oficial deste módulo está disponível na seção **Materiais de apoio** abaixo.$body$
  from public.modules m
 where m.id = l.module_id
   and m.slug = 'amplify-m4-autoridade-marketing-etico'
   and l.slug = 'visao-geral';

-- ---------------------------------------------------------------------------
-- M5 · Jornada do Paciente (Diferencial Forense)
-- Fonte: Estrutura_Detalhada_Módulo_5_-_A_Jornada_do_Paciente_(O_Diferencial_Forense).docx
-- ---------------------------------------------------------------------------
update public.lessons l
   set body_md = $body$## Sobre este módulo

Tempo, prescrição, captação. Resolvidos. Falta o **coração da prática médica: o resultado do paciente**. Agenda cheia não significa nada se a adesão ao tratamento é baixa.

A maioria dos médicos opera com a "estratégia da esperança" — prescreve e torce. O Módulo 5 substitui a esperança por um sistema que cuida, monitora e protege. É o pilar **forense** da mentoria.

## O que você vai aprender

**A Régua de Acompanhamento Ativo.** Os três componentes — Gatilhos, Mensagens, Ações — que transformam a comunicação pós-consulta em vigilância clínica estruturada e auditável.

**O design da sua primeira jornada (D+2, D+7, D+30).** Sessão prática para desenhar uma régua de 3 passos para um tratamento real do seu consultório, com gatilhos condicionais (ex: "se o paciente responder 'sim' para efeito colateral X, notificar a equipe imediatamente").

**A documentação como linha de defesa jurídica.** Por que cada interação registrada vira não apenas cuidado clínico, mas blindagem documental — e como o pilar forense da Amplify se materializa em uma régua bem desenhada.

## Mudança que você vai sentir

De **Médico-Educador** (que atrai pelo conhecimento) para **Médico-Guardião** (que zela ativamente pelo sucesso do tratamento e protege paciente e prática).

Ao visualizar pela primeira vez sua régua rodando — mensagens disparando, gatilhos respondendo, equipe sendo alertada nos casos certos — a percepção sai do campo da eficiência e entra no campo da segurança clínica. A frase que fica é: **"Agora eu cuido do paciente mesmo quando ele não está aqui."**

## Materiais

O manual oficial deste módulo está disponível na seção **Materiais de apoio** abaixo.$body$
  from public.modules m
 where m.id = l.module_id
   and m.slug = 'amplify-m5-jornada-do-paciente'
   and l.slug = 'visao-geral';

-- ---------------------------------------------------------------------------
-- M6 · Projeto Prático — Seu MVP
-- Fonte: Estrutura_Detalhada_Módulo_6_-_O_Projeto_Prático_(MVP_&_Escala).docx
-- ---------------------------------------------------------------------------
update public.lessons l
   set body_md = $body$## Sobre este módulo

O fim da jornada Amplify e o começo de outra. O Módulo 6 não ensina algo novo — ele **integra** tudo o que veio antes em um único projeto: o MVP da sua clínica digital.

Aqui o aluno deixa de ser aluno. Vira **arquiteto da própria prática**.

## O que você vai aprender

**O Canvas da Clínica Digital.** Um framework de uma página para conectar, em formato apresentável, o seu diagnóstico do Módulo 1, a biblioteca de prompts do M2, a automação de scribing do M3, o sistema de conteúdo do M4 e a régua de acompanhamento do M5.

**A defesa do seu MVP em banca técnica.** Apresentação dos projetos para a turma com feedback do mentor — não como avaliação, mas como ensaio da forma como você vai apresentar sua nova clínica para sócios, equipe e pacientes.

**O caminho pós-mentoria.** Os próximos passos concretos: comunidade, consultoria pontual, e os critérios para decidir quando avançar para o **Protocolo Atlas** (a formação avançada em sistemas proprietários).

## Mudança que você vai sentir

De **Médico-Guardião** (que zela pelo paciente individual) para **Médico-Empreendedor** (que projeta e escala impacto e modelo de negócio).

Quando você apresenta seu fluxograma conectando a dor original do M1 com a solução sistêmica que você desenhou, a transformação se materializa. A certificação não é diploma — é o reconhecimento dessa nova identidade. A frase que fica é: **"Eu sou o arquiteto da minha clínica digital."**

## Materiais

O manual oficial deste módulo está disponível na seção **Materiais de apoio** abaixo. O Canvas da Clínica Digital também é distribuído como template para preenchimento durante o workshop.$body$
  from public.modules m
 where m.id = l.module_id
   and m.slug = 'amplify-m6-projeto-pratico-mvp'
   and l.slug = 'visao-geral';

-- ===========================================================================
-- FIM · 0012_populate_amplify_content.sql
-- ===========================================================================
