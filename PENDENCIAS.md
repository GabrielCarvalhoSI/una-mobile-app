# Pendências — Una Mobile App

O fluxo principal (cadastro → login → mapa → retirada → doação → relato → perfil) está integrado com o backend.
Os itens abaixo são o que falta para o app estar pronto para uso real.

---

## P1 — Google Maps API Key (Android crasha sem ela)

**Arquivo:** `app.json`

O plugin `react-native-maps` está configurado mas sem chave do Google Maps.
O app crasha no Android ao abrir qualquer tela que use o componente de mapa.

**Como resolver:**

1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Ative a API **Maps SDK for Android**
3. Crie uma credencial → API Key
4. Adicione em `app.json`, dentro de `"android"`:

```json
"android": {
  "config": {
    "googleMaps": {
      "apiKey": "SUA_CHAVE_AQUI"
    }
  }
}
```

---

## P2 — Token refresh (sessão expira em ~1h)

**Arquivos:** `app/login.tsx`, `app/cadastro.tsx`

O JWT do Supabase expira em 1 hora. Quando isso acontece, todas as chamadas ao backend retornam 401 e o usuário precisa logar novamente manualmente.

**Como resolver:**

Ao fazer login/cadastro, o backend retorna `refresh_token`. Usar o cliente Supabase para renovar automaticamente:

```ts
// O setSession já ativa o auto-refresh interno do cliente Supabase
await supabase.auth.setSession({
  access_token: data.access_token,
  refresh_token: data.refresh_token, // não usar ?? '' aqui — usar o valor real
})

// Escutar renovações e atualizar o AsyncStorage
supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'TOKEN_REFRESHED' && session) {
    await AsyncStorage.setItem('userToken', session.access_token)
  }
})
```

O listener `onAuthStateChange` deve ser registrado uma vez, no contexto raiz do app (ex: `app/_layout.tsx`).

---

## P3 — Botão "Reclamar" não passa point_id para reclame.tsx

**Arquivo:** `app/mapa.tsx`

A tela `reclame.tsx` foi integrada com o backend e espera receber `point_id` e `sigla` via parâmetros de navegação. Porém, o `mapa.tsx` ainda não tem um botão "Reclamar" no modal do ponto selecionado.

**Como resolver:**

No modal de detalhes do ponto em `mapa.tsx`, adicionar um terceiro botão:

```tsx
<TouchableOpacity
  style={styles.btnAction}
  onPress={() => {
    const p = selectedPoint;
    setSelectedPoint(null);
    router.push(`/reclame?point_id=${p!.id}&sigla=${p!.sigla}`);
  }}
>
  <Text style={styles.btnActionText}>Reclamar</Text>
</TouchableOpacity>
```

---

## P4 — Logout em perfil.tsx não limpa o token do AsyncStorage

**Arquivo:** `app/perfil.tsx`

O logout chama `supabase.auth.signOut()` mas não remove o `userToken` do AsyncStorage. Se o usuário reinstalar o app ou o token ficar corrompido, pode haver comportamento inconsistente.

**Como resolver:**

```ts
const handleLogout = async () => {
  await supabase.auth.signOut()
  await AsyncStorage.removeItem('userToken')
  router.replace('/login')
}
```

---

## P5 — Sem config de build para APK (eas.json ausente)

Para gerar um APK ou IPA distribuível via Expo EAS Build, é necessário o arquivo `eas.json` na raiz do projeto.

**Como criar:**

```bash
npm install -g eas-cli
eas init        # associa ao projeto Expo
eas build:configure   # gera eas.json automaticamente
```

Ou criar manualmente:

```json
{
  "cli": { "version": ">= 5.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  }
}
```

Para gerar APK: `eas build --platform android --profile preview`

---

## Resumo

| # | Pendência | Impacto |
|---|---|---|
| P1 | Google Maps API Key | Android crasha |
| P2 | Token refresh | Sessão expira em 1h |
| P3 | Botão "Reclamar" no mapa | Tela reclame.tsx inacessível pelo fluxo normal |
| P4 | Logout não limpa AsyncStorage | Inconsistência menor |
| P5 | eas.json ausente | Não é possível gerar APK distribuível |
