# Build e TestFlight (EAS)

A configuração está em `app.config.ts` e `eas.json`. Os passos abaixo precisam da sua conta (Expo e Apple) e são feitos uma vez.

## Perfis

| Perfil        | Para quê                                                             |
| ------------- | -------------------------------------------------------------------- |
| `development` | App de desenvolvimento (dev client) para testar com `npx expo start` |
| `preview`     | Build interno, instalado por link, sem passar pela loja              |
| `production`  | Build da loja; o número de build sobe sozinho (EAS)                  |

## Uma vez só

1. `npm i -g eas-cli` e `eas login`.
2. Em `mobile/`, `eas init`. Como a configuração é `app.config.ts`, o EAS mostra o `projectId` em vez de gravá-lo: copie para o `app.config.ts`:
   ```ts
   extra: { eas: { projectId: '<id>' } },
   ```
   O `projectId` não é segredo.
3. Arquivos do Firebase (baixe do console, projeto `move-1ed45`, apps `br.app.movetreino`) como **variáveis de arquivo** do EAS, nunca no Git:
   ```sh
   eas env:create --name GOOGLE_SERVICES_PLIST --type file --value ./GoogleService-Info.plist --visibility secret --environment development --environment preview --environment production
   eas env:create --name GOOGLE_SERVICES_JSON --type file --value ./google-services.json --visibility secret --environment development --environment preview --environment production
   ```
4. `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` e o endereço da API (`EXPO_PUBLIC_API_URL`) como variáveis de texto nos três ambientes (`--visibility plaintext`).
5. Apple Developer: o EAS cria o App ID `br.app.movetreino` e os certificados no primeiro build. Confira que a capability **Sign in with Apple** está ativa no App ID.
6. App Store Connect: crie o app **Move** com o Bundle ID `br.app.movetreino`, idioma principal português (Brasil).

## Gerar e enviar

```sh
eas build -p ios --profile development   # dev client no seu iPhone (registre o aparelho com eas device:create)
eas build -p ios --profile production
eas submit -p ios --latest                # envia ao TestFlight
```

## Aceite (manual)

Instale pelo TestFlight, crie uma conta, entre com e-mail, Apple e Google, e conclua um treino. Precisa da API publicada (B13).
