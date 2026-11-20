## Card

<!-- Link do card do Trello -->

## O que mudou

<!-- Resumo em poucas linhas -->

## Como testar

<!-- Comandos e passos. Backend: `mvn verify`. Mobile: `npm test`, `npx tsc --noEmit`, `npm run lint`. -->

## Checklist de TDD

- [ ] Vi o teste falhar antes de escrever o código (commit `test:` antes do `feat:`/`fix:`)
- [ ] Refatorei com os testes verdes (commit `refactor:`)
- [ ] Todos os testes passam e não dependem de internet, Firebase real nem Supabase real
- [ ] Regras de negócio novas têm cobertura total

## Segurança e privacidade

- [ ] Nenhum segredo no Git (`.env`, senhas, chaves)
- [ ] Tabela nova: `enable row level security`, sem policies
- [ ] Cada usuário só acessa os próprios dados (teste explícito)
- [ ] Nenhum analytics, anúncio ou rastreamento
