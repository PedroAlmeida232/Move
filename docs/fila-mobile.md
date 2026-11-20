# Fila do agente do MOBILE

Legenda: `[ ]` pendente · `[x]` feito (PR mergeado na dev). Faça sempre a primeira `[ ]` cujas dependências estejam feitas. Regras completas em `CLAUDE.md`. Nos testes, a API e o Firebase são simulados: telas não precisam esperar o backend.

- [x] **M01** · [MOB] Esqueleto Expo com TypeScript e Jest · `feature/mobile-skeleton` · https://trello.com/c/HOSVbvax · depende: —
- [x] **M02** · [MOB] Funções puras de XP, nível e sequência (regras do protótipo; escreva `docs/gamificacao.md` antes) · `feature/domain-gamification` · https://trello.com/c/M5SjcYVn · depende: M01
- [x] **M03** · [MOB] Cliente da API e sessão do Firebase · `feature/mobile-auth-session` · https://trello.com/c/kr7dztay · depende: M01. Projeto Firebase `move-1ed45` já existe.
- [x] **M04** · [MOB] Telas de entrar, criar conta e recuperar senha (com caixa de consentimento de dados de saúde e link da política) · `feature/mobile-auth-screens` · https://trello.com/c/9qPrm6f9 · depende: M03
- [x] **M05** · [MOB] Telas do plano e do treino do dia · `feature/mobile-workout` · https://trello.com/c/2lwMl9s4 · depende: M03 (a integração real precisa do backend B07 e B08)
- [x] **M06** · [MOB] Telas de dieta e peso · `feature/mobile-diet-weight` · https://trello.com/c/RfHnCUxn · depende: M03 (integração real: B09 e B10)
- [x] **M07** · [MOB] Telas de progresso, nível e conquistas · `feature/mobile-progress` · https://trello.com/c/VHkcDO2B · depende: M02, M05 (conquistas reais: B11)
- [x] **M08** · [MOB] Entrar com Apple e Google · `feature/mobile-social-login` · https://trello.com/c/N9fMLTHs · depende: M04. Parte humana: ativar os provedores no Firebase.
- [ ] **M09** · [MOB] Excluir conta (parte do app, em Ajustes) · `feature/delete-account-app` · https://trello.com/c/SjFv3aSp · depende: M04, B12
- [ ] **M10** · [MOB][INFRA] Build iOS com EAS e TestFlight · `feature/eas-build` · https://trello.com/c/do5yQBg9 · depende: M04. Partes humanas: EAS e App Store Connect.
