# Move: instruções para agentes

App de treino, dieta e progresso com gamificação, em português do Brasil. Planejamento: https://trello.com/b/hRuIZBUd/move

## Stack e estrutura
- `backend/`: Java 21, Spring Boot 3, Maven. Um pacote por funcionalidade em `br.app.move` (controller → service → repository). Flyway + Spring Data JPA no Postgres do Supabase.
- `mobile/`: React Native + Expo (TypeScript estrito, Expo Router). `app/` telas, `src/features/`, `src/domain/` (funções puras), `src/lib/`.
- Login: Firebase Auth. A API valida o token (projeto `move-1ed45`). O app nunca fala direto com o banco.
- `prototype/index.html`: protótipo web, só referência de regras, cores e telas.
- A primeira versão exige internet. Sem offline.

## Papéis (um agente por área)
- Agente do **backend**: só mexe em `backend/` (e `docs/fila-backend.md`).
- Agente do **mobile**: só mexe em `mobile/` (e `docs/fila-mobile.md`).
- Se precisar de algo da outra área, anote o pedido para o Pedro e siga com o que dá. Não edite a outra área.

## Como trabalhar a fila
1. Leia a fila da sua área (`docs/fila-backend.md` ou `docs/fila-mobile.md`). Pegue a **primeira tarefa `[ ]`** cujas dependências estejam feitas.
2. Antes de começar, confirme que o PR da tarefa anterior foi mergeado: `git fetch origin && git log origin/dev --oneline | head`.
3. Crie a branch a partir da dev: `git switch -c <branch da tarefa> origin/dev`. (A `dev` fica aberta na pasta principal; por isso use `origin/dev`.)
4. Abra o card do Trello da tarefa (link na fila) e siga o objetivo, o RED, o GREEN e o aceite.
5. Apresente o plano em poucas linhas e **espere o OK do Pedro**.
6. Execute com TDD. No fim: rode todos os testes, marque a tarefa como `[x]` na fila (no mesmo PR), faça o push e **pare**. Não abra PR nem faça merge sem pedir.
7. Se a tarefa depender de algo do Pedro (console do Firebase, Railway, Apple), diga qual é e pule para a próxima da fila.

## TDD (obrigatório)
Red → Green → Refactor. Nenhum código de produção sem um teste que falhou antes (rode e veja falhar). Commits: `test:` antes do `feat:`/`fix:`, depois `refactor:`. Bug novo: primeiro um teste que o reproduz. Testes não dependem de internet, Firebase real nem Supabase real. Regras de negócio (XP, metas, sequência, conquistas) com cobertura total.

## Verificação
- Backend: `mvn verify`
- Mobile: `npm test`, `npx tsc --noEmit`, `npm run lint`

## Git
`main` (produção) ← `dev` (integração) ← `feature/*`. Uma branch por tarefa, a partir de `origin/dev`. Nunca commitar na `main` nem na `dev`. Conventional Commits em português.

## Arquitetura sem overengineering
Sem hexagonal, CQRS, eventos, microsserviços, nem interface com uma única implementação. Só extrair abstração na terceira repetição. XP, nível e sequência são calculados em funções puras a partir dos dados; só as conquistas são gravadas. Sem biblioteca de estado ou de UI no mobile até doer de verdade.

## Segurança e privacidade
- Nenhum segredo no Git: `.env`, senhas, chaves, `GoogleService-Info.plist`. Variáveis de ambiente: `FIREBASE_PROJECT_ID`, `DATABASE_URL`, `DATABASE_USER`, `DATABASE_PASSWORD` (a senha só no `.env` local e na Railway). Mantenha um `.env.example` sem a senha.
- Toda tabela nova: `enable row level security`, sem policies (só a API acessa o banco).
- Cada usuário só acessa os próprios dados (teste explícito).
- **Nunca instalar analytics, anúncios ou rastreamento** (nem o pacote de analytics do Firebase). A política de privacidade diz que o app não usa isso.
- Dados de peso, treino e dieta são dados de saúde sensíveis.
