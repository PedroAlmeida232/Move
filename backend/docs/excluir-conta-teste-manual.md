# Teste manual: excluir conta (`DELETE /api/v1/me`)

Usa o Firebase **real** do projeto `move-1ed45`. Use só uma conta de teste: a exclusão é definitiva.

## 1. Chave de administrador (uma vez)

1. Console do Firebase → projeto `move-1ed45` → Configurações do projeto → Contas de serviço → **Gerar nova chave privada**.
2. Converta o JSON para **uma linha** e coloque no seu `backend/.env` (ele está no `.gitignore`):
   `FIREBASE_SERVICE_ACCOUNT_JSON='<cole aqui o JSON em uma linha>'`
   (por exemplo: `jq -c . chave.json`). Apague o arquivo baixado depois. Nunca cole a chave no chat nem no Git.

## 2. Subir a API

```bash
cd backend && set -a && source .env && set +a && ./mvnw spring-boot:run
```

## 3. Criar a conta de teste e pegar o token

1. Crie o usuário pelo app, ou em Authentication → Adicionar usuário (e-mail e senha).
2. Pegue um ID token (vale 1 hora). Com o app aberto em dev, ou por curl com a **Web API Key** do projeto (Configurações do projeto → Geral):
   ```bash
   curl -s "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=<WEB_API_KEY>" \
     -H 'Content-Type: application/json' \
     -d '{"email":"teste@exemplo.com","password":"<senha>","returnSecureToken":true}' | jq -r .idToken
   ```
   `export TOKEN=<idToken>`

## 4. Criar dados e conferir

```bash
curl -s localhost:8080/api/v1/me -H "Authorization: Bearer $TOKEN"        # cria a linha em users
curl -s -X PUT localhost:8080/api/v1/weight/$(date +%F) -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' -d '{"weightKg":80.4}'
```

## 5. Excluir

```bash
curl -i -X DELETE localhost:8080/api/v1/me -H "Authorization: Bearer $TOKEN"   # esperado: 204, sem corpo
```

## 6. Conferir

- Authentication, no console do Firebase: o usuário **não** aparece mais.
- Banco (Supabase SQL editor ou psql): `select count(*) from users where firebase_uid = '<uid>';` → 0, e nenhuma linha dele em `weight_entries`, `workout_sessions` etc.
- Repetir o `DELETE` com o mesmo token: ele ainda é válido por até 1 hora, mas o Firebase responde "usuário não existe", que conta como sucesso (`204`).
  Atenção: um `GET /me` com esse token ainda válido **recria** a linha no banco; por isso o app encerra a sessão local logo depois do `204`.

## Casos de erro

| Situação | Resposta | O que acontece com os dados |
| --- | --- | --- |
| Sem `FIREBASE_SERVICE_ACCOUNT_JSON` | `503` | nada é apagado |
| Chave inválida ou Firebase fora do ar | `502` | nada é apagado; pode tentar de novo |
| Sem token ou token inválido | `401` | nada é apagado |
