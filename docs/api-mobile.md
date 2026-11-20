# Contrato da API usado pelo app (pedido do mobile ao backend)

O app (mobile) escreve aqui o que espera de cada endpoint. O agente do backend decide os detalhes finais nos cards B07 e B08; se mudar algo, atualize este arquivo e avise o mobile. Todas as rotas exigem `Authorization: Bearer <token do Firebase>` e só devolvem dados do próprio usuário. Datas e horas em UTC (ISO 8601); o app converte para o fuso local.

## Plano de treino (B07)

`GET /api/v1/plan` → `200`

```json
{
  "days": [
    {
      "weekday": 1,
      "name": "Costas e postura",
      "exercises": [
        { "id": "b6f0…", "name": "Serrote (remada unilateral)", "sets": 3, "reps": "10 a 12", "side": "left", "note": null }
      ]
    }
  ]
}
```

- `weekday`: 0 = domingo … 6 = sábado. Dia que não aparece em `days` (ou sem exercícios) é descanso.
- `exercises` na ordem em que devem ser feitos.
- `sets`: número de séries (inteiro ≥ 1). `reps`: texto livre ("10 a 12", "30 s").
- `side` e `note` são opcionais (o app ainda não os usa; o PUT de edição vem depois).
- Usuário sem plano: `200` com `"days": []`.

## Registrar treino (B08)

`POST /api/v1/workouts` → `201` com `{ "id": "…" }`

```json
{
  "performedAt": "2026-11-20T21:30:00.000Z",
  "finished": true,
  "sets": [
    { "exerciseId": "b6f0…", "setNumber": 1, "kg": 12.5, "reps": 10, "done": true }
  ]
}
```

- `finished`: o treino foi concluído (todas as séries feitas). O app só envia `true` por enquanto.
- `kg` e `reps` podem ser `null` (série sem anotação); nunca negativos (`400` se forem).
- `reps` inteiro; `kg` com casas decimais.

## Pendências para o backend (não bloqueiam o app)

- `GET /api/v1/workouts?from=&to=`: o app vai precisar para mostrar "treino já concluído hoje" depois de reabrir, e para a sequência e o XP (M07). Formato sugerido: lista de sessões com `id`, `performedAt`, `finished` e `sets`.
