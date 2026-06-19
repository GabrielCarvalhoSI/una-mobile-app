# Una Mobile App — Guia do Codebase

App mobile da plataforma de saúde menstrual Una (UFPE).
React Native com Expo Router. Consome a API REST `una-backend`.

## Stack

| Tecnologia | Uso |
|---|---|
| Expo (SDK 52+) | Framework React Native |
| expo-router | Navegação baseada em arquivos |
| @supabase/supabase-js | Client para auth.setSession (sincronização de sessão) |
| AsyncStorage | Armazenamento do JWT |
| expo-location | GPS para ordenação de pontos por distância |

## Repositórios relacionados

| Camada | Repositório |
|---|---|
| Backend API | `anaraque-l/una-backend` |
| Frontend Web (Admin) | `analauraboliveira/Una` → pasta `frontend-web/` |
| Banco de dados | `analauraboliveira/Una` → pasta `database/` |

## Variáveis de Ambiente

Criar `.env` na raiz (nunca commitar — ver `.env.example`):

```
EXPO_PUBLIC_SUPABASE_URL=https://<projeto>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
EXPO_PUBLIC_API_URL=http://<ip-do-backend>:3000
```

> Android Emulator: usar `10.0.2.2` no lugar de `localhost`.
> Device físico: usar o IP da máquina na rede local.

## Estrutura de Telas

```
app/
├── index.tsx       — Splash/boas-vindas, sem auth
├── login.tsx       — POST /auth/login → salva token + setSession
├── cadastro.tsx    — POST /auth/signup → salva token + setSession
├── mapa.tsx        — GET /collection-points → lista pontos
├── retirada.tsx    — POST /transactions/withdrawal (recebe point_id, sigla, qtd)
├── doacao.tsx      — POST /transactions/donation  (recebe point_id, sigla)
├── reclame.tsx     — POST /feedbacks              (recebe point_id, sigla)
└── perfil.tsx      — supabase.auth.getUser() + profiles table
```

## Fluxo de Autenticação

1. Login/Cadastro → backend retorna `{ access_token, refresh_token }`
2. Salvar token: `AsyncStorage.setItem('userToken', access_token)`
3. Sincronizar sessão Supabase: `supabase.auth.setSession({ access_token, refresh_token })`
4. Chamadas autenticadas ao backend: header `Authorization: Bearer <token>`

## Navegação com parâmetros

O `mapa.tsx` passa parâmetros para telas filhas via query string:

```
/retirada?point_id=<uuid>&sigla=CIn&qtd=5
/doacao?point_id=<uuid>&sigla=CIn
/reclame?point_id=<uuid>&sigla=CIn
```

Usar `useLocalSearchParams()` em cada tela para ler os parâmetros.

## Enums do banco

**item_type:** `pad` | `tampon` | `panty_liner`

**feedback_category:** `empty_stock` | `inaccessible` | `damaged` | `other`

## Pendência: Google Maps API Key

Adicionar em `app.json` → `android`:
```json
"config": { "googleMaps": { "apiKey": "<GOOGLE_MAPS_API_KEY>" } }
```
Obter em: console.cloud.google.com → Maps SDK for Android.
