# Fila do agente do BACKEND

Legenda: `[ ]` pendente · `[x]` feito (PR mergeado na dev). Faça sempre a primeira `[ ]` cujas dependências estejam feitas. Regras completas em `CLAUDE.md`.

- [x] **B01** · [INFRA] Estrutura do repositório (só README, template de PR e docs; não criar `mobile/`) · `feature/repo-structure` · https://trello.com/c/XlsqmAQf · depende: —
- [ ] **B02** · [BE] Esqueleto Spring Boot com endpoint de saúde · `feature/backend-skeleton` · https://trello.com/c/yyoJAmug · depende: —
- [ ] **B03** · [BE] Banco: Flyway, Testcontainers e Supabase · `feature/db-setup` · https://trello.com/c/9LAGZsws · depende: B02, Docker rodando
- [x] **B04** · [BE] Validar o token do Firebase · `feature/backend-firebase-auth` · https://trello.com/c/0BIZ0lHZ · depende: B02
- [x] **B05** · [BE] Usuário: criar no primeiro login e `GET /me` · `feature/backend-user-me` · https://trello.com/c/preJbJX3 · depende: B03, B04
- [ ] **B06** · [INFRA] CI no GitHub Actions · `feature/ci` · https://trello.com/c/4qQGCHoe · depende: B02 e M01 (esqueleto mobile mergeado)
- [x] **B07** · [DB][BE] Perfil e plano de treino · `feature/plan` · https://trello.com/c/M6pUPjKh · depende: B05
- [x] **B08** · [DB][BE] Registrar treinos feitos · `feature/workout-log` · https://trello.com/c/LEiPeCeD · depende: B05
- [ ] **B09** · [DB][BE] Refeições e metas de dieta · `feature/meals` · https://trello.com/c/qBHF9lf6 · depende: B05
- [ ] **B10** · [DB][BE] Registro de peso e medidas · `feature/weight` · https://trello.com/c/ao2P89U5 · depende: B05
- [ ] **B11** · [DB][BE] Conquistas e missões · `feature/achievements` · https://trello.com/c/uzUss4iA · depende: B08
- [ ] **B12** · [BE] Excluir conta (parte da API: `DELETE /me`, cascade e remoção no Firebase) · `feature/delete-account-api` · https://trello.com/c/SjFv3aSp · depende: B07 a B11 (todas as tabelas). Requer chave de administrador do Firebase: peça ao Pedro, só nas variáveis da Railway.
- [ ] **B13** · [BE][INFRA] Dockerfile e deploy na Railway · `feature/deploy-api` · https://trello.com/c/1q9dH8Kc · depende: B03, B04. Partes humanas: conta e variáveis na Railway (região US East).
