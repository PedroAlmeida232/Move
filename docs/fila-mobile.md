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
- [x] **M09** · [MOB] Excluir conta (parte do app, em Ajustes) · `feature/delete-account-app` · https://trello.com/c/SjFv3aSp · depende: M04, B12
- [ ] **M10** · [MOB][INFRA] Build iOS com EAS e TestFlight · `feature/eas-build` · https://trello.com/c/do5yQBg9 · depende: M04. Partes humanas: EAS e App Store Connect.

## Sprint 6 · Redesign

Direção visual: estilo Apple (fundo cinza-claro, cards brancos arredondados, azul só como destaque, fonte do sistema), modo escuro revisado. Ícones Ionicons; gráficos com `react-native-svg`. Telas novas usam só os tokens (D01) e os componentes (D02).

- [x] **D01** · [MOB] Tokens de design · `feature/design-tokens` · https://trello.com/c/riTAHfM3 · depende: —
- [x] **D02** · [MOB] Componentes base · `feature/design-components` · https://trello.com/c/hheCnQds · depende: D01
- [x] **D03** · [MOB] Navegação com ícones · `feature/design-navigation` · https://trello.com/c/hweJK689 · depende: D02
- [x] **D04** · [MOB] Tela Hoje · `feature/design-today` · https://trello.com/c/uyfxV5IU · depende: D03 e mockup aprovado pelo Pedro
- [x] **D05** · [MOB] Plano e treino · `feature/design-workout` · https://trello.com/c/kyO0eWzI · depende: D04
- [x] **D06** · [MOB] Dieta · `feature/design-diet` · https://trello.com/c/C96e4Sel · depende: D04
- [x] **D07** · [MOB] Peso · `feature/design-weight` · https://trello.com/c/IGcJDJh1 · depende: D06
- [x] **D08** · [MOB] Progresso e conquistas · `feature/design-progress` · https://trello.com/c/Op4JUnop · depende: D04
- [x] **D09** · [MOB] Login e Ajustes · `feature/design-auth-settings` · https://trello.com/c/syvwRNMq · depende: D02
- [x] **D10** · [MOB] Polimento e acessibilidade · `feature/design-polish` · https://trello.com/c/Ae9yVBB8 · depende: D04 a D09

## Sprint 7 · Melhorias antes do lançamento

A busca de alimentos vem em três fatias, cada uma útil sozinha: repetir refeição (P01), catálogo no backend (B14, fila do backend) e buscar alimento no app (P03).

- [x] **P01** · [MOB] Repetir refeição · `feature/repeat-meal` · https://trello.com/c/JBBUqLXr · depende: D06
- [x] **P02** · [MOB] Carga da última vez e descanso no treino · `feature/workout-last-load` · https://trello.com/c/WGWlaUSN · depende: D05
- [ ] **M11** · [MOB][INFRA] Atualizações sem passar pela revisão (expo-updates) · `feature/ota-updates` · https://trello.com/c/bipuEjzD · depende: M10. Parte humana: `eas update`.
- [ ] **P03** · [MOB] Buscar alimento e informar os gramas · `feature/food-search` · https://trello.com/c/0QQLf5wN · depende: P01 e B14
