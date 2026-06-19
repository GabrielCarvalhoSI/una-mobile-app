# UNA Mobile App — Registro de Correções

## Bug Raiz: URL do Supabase incorreta

Ambos os `.env` (raiz e backend) continham `jyitnmqkjlffcyyebgqfg` (dois `f`), quando a URL correta do projeto Supabase é `jyitnmqkjlfcyyebgqfg` (um `f`). Isso fazia todas as chamadas ao Supabase falharem com `fetch failed` — login, cadastro, mapa, tudo.

**Confirmação:** decodificando o payload do JWT da `SUPABASE_SERVICE_ROLE_KEY`, o campo `ref` é `jyitnmqkjlfcyyebgqfg`.

---

## Correções no Frontend (app/)

### login.tsx
- Removido `refresh_token ?? ''` que corrompia sessões Supabase quando o backend não retornava refresh_token
- Adicionada validação de `access_token` e `refresh_token` antes de chamar `setSession()`
- Trocado `router.push('/mapa')` por `router.replace('/mapa')` para impedir voltar ao login com botão de voltar

### cadastro.tsx
- Mesma correção do `refresh_token ?? ''`
- Mesma validação de tokens antes de `setSession()`

### mapa.tsx
- Adicionado guard de token null com redirect para `/login`
- Adicionado tratamento de resposta 401 (limpa token + redirect)
- Adicionado `ListEmptyComponent` na FlatList para estado vazio
- Removido import `Linking` não utilizado e estado `showNavModal` morto
- **Adicionado botão "Como chegar"** no modal de detalhes — abre Google Maps (Android) ou Apple Maps (iOS) com rota até o ponto
- **Corrigida imagem dos cards** — trocado placeholder externo (`via.placeholder.com`) por logo local (`una.png`), pois o banco não possui coluna de imagem nos `collection_points`
- **Layout compactado** — header, cards e modal redimensionados com padding/font-size menores e `maxWidth: 400` para funcionar em qualquer tela (testado no S23 Ultra)

### perfil.tsx
- Adicionado `AsyncStorage.removeItem('userToken')` no logout
- Trocado acesso direto ao Supabase (`supabase.auth.getUser()` + query `profiles`) por chamada ao backend (`GET /profiles/me`)
- Adicionado tratamento de 401
- Removido campo `points_earned` inexistente, adicionado `pronouns`

### retirada.tsx / doacao.tsx / reclame.tsx
- Adicionado guard de token null com redirect
- Adicionado tratamento de resposta 401

### index.tsx (splash)
- Adicionado auto-login: verifica token existente no AsyncStorage
- Se sessão válida, redireciona direto para `/mapa`
- Mostra spinner de loading enquanto verifica

### _layout.tsx (criado)
- Root layout com gerenciamento de estado de auth
- Listener `onAuthStateChange` para `TOKEN_REFRESHED`, `SIGNED_OUT`, `SIGNED_IN`
- Validação de token no bootstrap
- Proteção de rotas autenticadas

### lib/supabase.ts
- Adicionado `console.warn()` quando credenciais Supabase não estão definidas no `.env`

---

## Correções no Backend (backend/)

### all-exceptions.filter.ts
- Adicionado campo `message` na resposta JSON (frontend lê `data.message`)
- Extrai primeiro item de arrays de validação do class-validator

### collection-points.service.ts
- Trocado `throw new Error()` por `throw new BadRequestException()` (NestJS precisa de HttpException para o filter funcionar)

### auth.module.ts
- Adicionado `AuthGuard` e `AdminGuard` como providers e exports

### auth.service.ts
- Adicionada lógica de retry (3 tentativas, 300ms delay) para busca de profile após signup, tratando race condition com trigger `handle_new_user`

### auth.controller.ts
- Adicionado alias `POST /auth/login` para compatibilidade com o app mobile (que usa `/login` em vez de `/signin`)

---

## Configuração

### app.json
- Adicionado plugin `expo-location` com mensagem de permissão em português

### .env (não commitados)
- `EXPO_PUBLIC_SUPABASE_URL` corrigido para URL com um `f`
- `EXPO_PUBLIC_API_URL` atualizado para IP correto da máquina
- `SUPABASE_URL` do backend corrigido igualmente
