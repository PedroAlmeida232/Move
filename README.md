# Move

App de treino, dieta e progresso com gamificação (XP, níveis, sequência, missões e conquistas).

Planejamento e tarefas: [quadro do Trello](https://trello.com/b/hRuIZBUd/move)

## Stack

| Camada | Tecnologia |
| --- | --- |
| Mobile | React Native + Expo (TypeScript) |
| API | Java 21 + Spring Boot 3 |
| Banco | Postgres gerenciado do Supabase, acessado só pela API |
| Login | Firebase Auth |

Fluxo: app → (HTTPS + token do Firebase) → API Java → Postgres (Supabase).

## Branches

```
main
 └── dev
      └── feature/<nome-da-tarefa>
```

- `main`: produção. Recebe a `dev` no fim de cada sprint.
- `dev`: integração. Recebe as features por pull request.
- `feature/*`: uma por card do Trello, criada a partir da `dev`.

## Como trabalhamos

Desenvolvimento orientado a testes (TDD): primeiro o teste que falha, depois o mínimo de código para passar, depois a refatoração. As regras completas estão no card "Regras de TDD" do Trello.

## Estrutura

```
backend/     API Java 21 + Spring Boot 3 (Maven)
mobile/      app React Native + Expo (TypeScript)
docs/        política de privacidade e filas de tarefas dos agentes
prototype/   protótipo web com as telas e regras de referência
design/      marca: logo e ícone
```

## Como rodar

### Backend (`backend/`)

Requisitos: Java 21 e Docker rodando (os testes usam Testcontainers com Postgres; não dependem do Supabase).

```bash
cd backend
./mvnw verify                      # compila e roda todos os testes
cp .env.example .env               # preencha os valores (o .env nunca vai para o Git)
set -a; source .env; set +a
./mvnw spring-boot:run             # sobe a API em http://localhost:8080
```

Variáveis de ambiente: `DATABASE_URL`, `DATABASE_USER`, `DATABASE_PASSWORD` e `FIREBASE_PROJECT_ID`. Opcional: `FIREBASE_SERVICE_ACCOUNT_JSON` (chave de administrador, só para excluir conta; sem ela `DELETE /api/v1/me` responde 503). Senha e chave ficam só no `.env` local e na Railway. Teste manual da exclusão de conta: [`backend/docs/excluir-conta-teste-manual.md`](backend/docs/excluir-conta-teste-manual.md).

### Mobile (`mobile/`)

Requisitos: Node.js e o app Expo Go ou um emulador.

```bash
cd mobile
npm install
npm start                          # abre o Expo
npm test                           # testes (Jest)
npx tsc --noEmit                   # checagem de tipos
npm run lint
```

O protótipo em `prototype/index.html` abre direto no navegador. Ele é a referência das regras de XP, metas e telas, mas não faz parte do produto.
