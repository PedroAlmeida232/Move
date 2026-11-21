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

Variáveis de ambiente: `DATABASE_URL`, `DATABASE_USER`, `DATABASE_PASSWORD` e `FIREBASE_PROJECT_ID`. A senha do banco fica só no `.env` local e na Railway.

### Deploy da API (Railway)

A API roda na Railway a partir do `backend/Dockerfile` (multi-stage, Java 21) e é publicada sozinha a cada merge na `main`.

Configuração do serviço na Railway:

| Item | Valor |
| --- | --- |
| Região | US East |
| Root Directory | `backend` |
| Branch de deploy | `main` |
| Healthcheck | `/api/v1/health` |

Variáveis (aba Variables do serviço; nunca no Git):

| Variável | Para quê |
| --- | --- |
| `DATABASE_URL` | JDBC do Supabase (Session pooler, porta 5432, `sslmode=require`) |
| `DATABASE_USER` | usuário do pooler |
| `DATABASE_PASSWORD` | senha do banco |
| `FIREBASE_PROJECT_ID` | `move-1ed45` |
| `SPRING_PROFILES_ACTIVE` | `prod` |

A porta vem da variável `PORT`, que a própria Railway define.

Para testar a imagem na sua máquina, com um Postgres em contêiner (nunca o Supabase real):

```bash
cd backend
docker build -t move-api .
docker network create move-net
docker run -d --rm --name move-pg --network move-net -e POSTGRES_PASSWORD=teste postgres:16-alpine
docker run --rm --network move-net -p 8080:8080 \
  -e DATABASE_URL=jdbc:postgresql://move-pg:5432/postgres -e DATABASE_USER=postgres \
  -e DATABASE_PASSWORD=teste -e FIREBASE_PROJECT_ID=move-teste move-api
curl localhost:8080/api/v1/health   # {"status":"ok"}
```

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
