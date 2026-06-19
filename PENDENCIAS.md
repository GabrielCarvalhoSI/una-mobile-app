# Pendências — Una Mobile App

O fluxo principal (cadastro → login → mapa → retirada → doação → relato → perfil) está integrado com o backend.
O backend NestJS está na pasta `backend/` deste mesmo repositório.
A navegação de pontos usa lista (`FlatList`) — sem mapa nativo, sem dependência do Google Maps.
Os itens abaixo são o que falta para o app estar pronto para uso real.

---

## P1 — Token refresh (sessão expira em ~1h)

**Arquivos:** `app/login.tsx`, `app/cadastro.tsx`, `app/_layout.tsx`

O JWT do Supabase expira em 1 hora. Quando isso acontece, todas as chamadas ao backend retornam 401 e o usuário precisa logar novamente manualmente.

> O backend **já retorna** `refresh_token` no login/cadastro, então o `setSession` funciona. Falta só registrar o listener de renovação automática.

**Como resolver:**

```ts
// O setSession já ativa o auto-refresh interno do cliente Supabase
await supabase.auth.setSession({
  access_token: data.access_token,
  refresh_token: data.refresh_token, // não usar ?? '' — usar o valor real
})

// Escutar renovações e atualizar o AsyncStorage
supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'TOKEN_REFRESHED' && session) {
    await AsyncStorage.setItem('userToken', session.access_token)
  }
})
```

O listener `onAuthStateChange` deve ser registrado uma vez no contexto raiz do app (`app/_layout.tsx`).

---

## P2 — Botão "Reclamar" não passa point_id para reclame.tsx

**Arquivo:** `app/mapa.tsx`

A tela `reclame.tsx` está integrada com o backend e espera receber `point_id` e `sigla` via parâmetros de navegação. Porém, o `mapa.tsx` ainda não tem um botão "Reclamar" no modal do ponto selecionado.

**Como resolver:**

No modal de detalhes do ponto em `mapa.tsx`, adicionar um terceiro botão ao lado de "Retirar" e "Doar":

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

## P3 — "Pontos acumulados" no perfil lê campo inexistente

**Arquivo:** `app/perfil.tsx`

A tela exibe "Pontos acumulados" lendo `profile?.points_earned`, mas a tabela `profiles` não tem essa coluna no schema. Resultado: sempre mostra `0`.

**Como resolver (escolher um):**

- **Remover** o card de pontos, já que não há sistema de gamificação no banco; ou
- **Adicionar** a coluna ao banco (`ALTER TABLE profiles ADD COLUMN points_earned INTEGER DEFAULT 0`) e a lógica para incrementá-la (ex: trigger em `transactions`).

---

## P4 — Logout em perfil.tsx não limpa o token do AsyncStorage

**Arquivo:** `app/perfil.tsx`

O logout chama `supabase.auth.signOut()` mas não remove o `userToken` do AsyncStorage. Se o token ficar corrompido, pode haver comportamento inconsistente nas chamadas ao backend.

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
eas init              # associa ao projeto Expo
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
| P1 | Token refresh | Sessão expira em 1h sem renovação automática |
| P2 | Botão "Reclamar" no mapa | `reclame.tsx` inacessível pelo fluxo normal |
| P3 | `points_earned` inexistente | Perfil sempre mostra 0 pontos |
| P4 | Logout não limpa AsyncStorage | Inconsistência menor |
| P5 | eas.json ausente | Não é possível gerar APK distribuível |
