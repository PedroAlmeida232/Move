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
backend/     API Java (a criar na Sprint 0)
mobile/      app React Native (a criar na Sprint 0)
prototype/   protótipo web com as telas e regras de referência
design/      marca: logo e ícone
```

O protótipo em `prototype/index.html` abre direto no navegador. Ele é a referência das regras de XP, metas e telas, mas não faz parte do produto.
