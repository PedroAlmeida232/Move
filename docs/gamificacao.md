# Gamificação: regras de XP, nível e sequência

Fonte: `prototype/index.html` (`XP`, `LEVELS`, `stats`, `levelOf`, `streak`). O código fica em `mobile/src/domain/`, em funções puras (sem React, sem relógio, sem rede). XP, nível e sequência **nunca são gravados**: são calculados a partir dos dados. Só as conquistas são gravadas.

## XP

| Evento | XP |
|---|---|
| Série concluída | 10 |
| Treino concluído (completo) | 50 |
| Refeição registrada | 5, até 5 refeições por dia (a 6ª em diante não pontua) |
| Dia com a meta de proteína batida | 30 (uma vez por dia; só vale se a meta for maior que 0) |
| Peso registrado | 15 por registro |

`xpFor(sessions, meals, weights, proteinGoal = 0)` soma tudo. Entradas vazias valem 0.

Fora do escopo desta tarefa (existem no protótipo, mas dependem de telas que ainda não existem no app): missões do dia (20 XP cada) e rotina de postura (15 XP). Entram quando essas funcionalidades existirem.

## Níveis

| # | Nome | XP mínimo |
|---|---|---|
| 1 | Iniciante | 0 |
| 2 | Ativo | 500 |
| 3 | Focado | 2000 |
| 4 | Forte | 6000 |
| 5 | Elite | 15000 |

`levelFor(xp)` devolve o nível atual, o próximo (ou `null` no máximo), o XP que falta para o próximo e a porcentagem da barra dentro do nível (arredondada). No nível máximo: falta 0 e a barra fica em 100%. O limite é inclusivo: com exatamente 500 XP o nível é Ativo. XP negativo é tratado como 0.

## Sequência

`streak(days, today, restWeekdays = [])`: quantos dias de treino seguidos, contando para trás a partir de `today`.

- `days`: datas (`YYYY-MM-DD`) com treino concluído. Repetidas contam uma vez.
- Hoje sem treino **não quebra** a sequência (o dia ainda não acabou): a contagem segue de ontem para trás.
- Um dia de treino passado sem treino **quebra**.
- Dias de descanso (`restWeekdays`, 0 = domingo … 6 = sábado, os dias sem exercício no plano) não quebram e não somam.
- Datas futuras (depois de `today`) são ignoradas.
- Entrada vazia vale 0.

## Dia e fuso horário

As datas são sempre o **dia do calendário no fuso do usuário**, em texto `YYYY-MM-DD`. Nenhuma função de regra usa `Date` nem o fuso do aparelho: quem chama converte o instante com `dayKey(instante, fusoIana)` (ex.: `America/Sao_Paulo`). Assim, um treino às 23h30 em São Paulo continua sendo do dia local mesmo que em UTC já seja o dia seguinte, e a virada de dia acontece à meia-noite local.
