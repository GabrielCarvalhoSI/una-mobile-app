# Una Backend — Guia do Codebase

Backend da plataforma de saúde menstrual Una (UFPE).
API REST em NestJS que conecta os apps mobile e web ao banco de dados Supabase.

## Stack

| Tecnologia | Uso |
|---|---|
| Node.js + NestJS | Framework REST |
| Supabase Auth | Autenticação e geração de JWT |
| Supabase PostgreSQL + PostGIS | Banco de dados (repo Una) |
| class-validator | Validação de DTOs |
| @nestjs/swagger | Documentação automática da API |

## Repositórios relacionados

| Camada | Tecnologia | Repositório |
|---|---|---|
| Frontend Web (Admin) | Next.js 16 | `analauraboliveira/Una` |
| Frontend Mobile | React Native (Expo) | `GabrielCarvalhoSI/una-mobile-app` |
| Backend API | NestJS | **este repo** |

## Variáveis de Ambiente

Criar `.env` na raiz com base em `.env.example`:

```
PORT=3000
SUPABASE_URL=https://<projeto>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
```

`SUPABASE_SERVICE_ROLE_KEY` bypassa o RLS — nunca expor no frontend.

## Estrutura de Arquivos

```
src/
├── main.ts                         — Bootstrap: ValidationPipe global, Swagger, CORS
├── app.module.ts                   — Módulo raiz, importa todos os módulos
│
├── supabase/
│   ├── supabase.module.ts          — Módulo global (@Global)
│   └── supabase.service.ts         — Cliente admin Supabase (service role key)
│
├── common/
│   ├── decorators/
│   │   └── current-user.decorator.ts   — @CurrentUser() extrai user do request
│   └── filters/
│       └── all-exceptions.filter.ts    — Filtro global de erros (B09)
│
├── auth/
│   ├── auth.controller.ts          — POST /auth/signup, POST /auth/signin
│   ├── auth.service.ts             — Lógica de cadastro e login via Supabase Auth
│   ├── auth.guard.ts               — Valida Bearer JWT via supabase.auth.getUser()
│   ├── admin.guard.ts              — Verifica role = 'admin' no perfil
│   └── dto/
│       ├── signup.dto.ts           — Campos do cadastro com validações
│       └── signin.dto.ts           — Email + senha
│
├── profiles/
│   ├── profiles.controller.ts      — GET /profiles/me
│   ├── profiles.service.ts         — Busca perfil da usuária autenticada
│   └── profiles.module.ts
│
├── collection-points/
│   ├── collection-points.controller.ts — GET /collection-points, GET /collection-points/:id
│   ├── collection-points.service.ts    — Chama RPC get_nearest_collection_points()
│   └── collection-points.module.ts
│
├── transactions/
│   ├── transactions.controller.ts  — POST /transactions/withdrawal, POST /transactions/donation
│   ├── transactions.service.ts     — Regras de negócio de retirada e doação
│   ├── transactions.module.ts
│   └── dto/
│       ├── withdrawal.dto.ts       — point_id + item_type
│       └── donation.dto.ts         — point_id + item_type + quantity + notes?
│
├── feedbacks/
│   ├── feedbacks.controller.ts     — POST /feedbacks, GET /feedbacks/mine
│   ├── feedbacks.service.ts        — Cria relatos (trigger notifica admins)
│   ├── feedbacks.module.ts
│   └── dto/
│       └── create-feedback.dto.ts  — point_id, category, is_specific?, description?
│
├── admin/
│   ├── admin.controller.ts         — Endpoints /admin/* protegidos por AdminGuard
│   ├── admin.service.ts            — Listagem e atualização de feedbacks e pontos
│   ├── admin.module.ts
│   └── dto/
│       ├── update-feedback.dto.ts          — status (pending|in_progress|resolved)
│       └── update-collection-point.dto.ts  — name?, status?, floor?, room?
│
└── types/
    └── database.ts                 — Tipos TypeScript espelhando o schema PostgreSQL
```

## Endpoints

### Públicos (sem auth)

| Método | Rota | Body | Resposta |
|---|---|---|---|
| POST | `/auth/signup` | `{ email, password, full_name, username, pronouns?, age?, cycle_duration_days?, menstruation_duration_days? }` | `{ access_token, user }` |
| POST | `/auth/signin` | `{ email, password }` | `{ access_token, user }` |

### Autenticados (`Authorization: Bearer <token>`)

| Método | Rota | Body | Resposta |
|---|---|---|---|
| GET | `/profiles/me` | — | Perfil completo da usuária |
| GET | `/collection-points?lat=&lng=&radius?=&limit?=` | — | Lista de pontos próximos com `sigla`, `qtd`, `latitude`, `longitude` |
| GET | `/collection-points/:id` | — | Detalhe do ponto com `inventory` por tipo |
| POST | `/transactions/withdrawal` | `{ point_id, item_type }` | `{ message, transaction, inventory, stock_alert? }` |
| POST | `/transactions/donation` | `{ point_id, item_type, quantity, notes? }` | `{ message, transaction, inventory }` |
| POST | `/feedbacks` | `{ point_id, category, is_specific?, description? }` | `{ message, feedback }` |
| GET | `/feedbacks/mine` | — | Relatos da usuária autenticada |

### Administrativos (role = 'admin')

| Método | Rota | Body | Resposta |
|---|---|---|---|
| GET | `/admin/feedbacks?status?=` | — | Todos os relatos com dados do ponto e da usuária |
| PATCH | `/admin/feedbacks/:id` | `{ status }` | Feedback atualizado |
| GET | `/admin/collection-points` | — | Todos os pontos (incluindo inativos) com estoque |
| PATCH | `/admin/collection-points/:id` | `{ name?, status?, floor?, room? }` | Ponto atualizado |

## Autenticação — Como funciona

1. **Cadastro (`/auth/signup`):** O backend cria o usuário via `supabase.auth.admin.createUser()`. O trigger `handle_new_user` no banco cria automaticamente o row em `profiles`. O backend então faz sign-in imediatamente para gerar e retornar o `access_token`.

2. **Login (`/auth/signin`):** Repassa email/senha ao Supabase Auth via `signInWithPassword()`. Retorna o `access_token` JWT.

3. **Rotas protegidas (`AuthGuard`):** Extrai o `Bearer <token>` do header `Authorization` e valida via `supabase.auth.getUser(token)`. Carrega o perfil da usuária do banco e anexa ao `request.user`.

4. **Rotas admin (`AdminGuard`):** Após o `AuthGuard`, verifica se `request.user.profile.role === 'admin'`. Retorna 403 para estudantes.

## Regras de Negócio Críticas

### Retirada (`POST /transactions/withdrawal`)

O service verifica em ordem antes de inserir:
1. Ponto existe e está `active` → 404 / 400
2. Usuária já retirou hoje via `has_user_withdrawn_today()` → 400 ("Limite: 1 item por dia")
3. Estoque do `item_type` naquele ponto é ≥ 1 → 400 ("Estoque esgotado")
4. INSERT em `transactions` → trigger `adjust_inventory_on_transaction` decrementa o estoque com `SELECT FOR UPDATE` (seguro para acessos simultâneos)
5. Retorna estoque atualizado + alerta se `is_stock_low()` = true

### Doação (`POST /transactions/donation`)

1. Ponto existe → 404
2. `item_type` está cadastrado no ponto → 400
3. INSERT em `transactions` → trigger soma ao estoque
4. Retorna estoque atualizado

### Feedback

INSERT em `feedbacks` aciona o trigger `notify_admins_on_feedback` que cria automaticamente uma `notification` para cada admin. Supabase Realtime envia o evento ao painel web em tempo real.

## Resposta de Pontos para o Mobile

O app mobile (`mapa.tsx`) espera o formato `Point { id, sigla, nome, latitude, longitude, qtd }`.
O endpoint `GET /collection-points` mapeia os campos do banco para este formato:

```
building  → sigla
name      → nome
latitude  → latitude  (extraída do PostGIS via RPC)
longitude → longitude (extraída do PostGIS via RPC)
total_stock → qtd
```

## Validação (B09)

`ValidationPipe` global configurado em `main.ts` com:
- `whitelist: true` — remove campos não declarados no DTO
- `forbidNonWhitelisted: true` — rejeita requisições com campos extras
- `transform: true` — converte tipos automaticamente (ex: query string → number)

Erros de validação retornam `400` com array de mensagens descritivas em português.

## Tratamento de Erros (B09)

`AllExceptionsFilter` global padroniza todas as respostas de erro:

```json
{
  "statusCode": 400,
  "timestamp": "2026-06-18T00:00:00.000Z",
  "path": "/transactions/withdrawal",
  "error": "Estoque esgotado neste ponto para o produto selecionado"
}
```

Erros 5xx são logados no console com stack trace.

## Documentação Swagger

Disponível em `http://localhost:3000/docs` ao rodar o projeto.
Todos os endpoints têm `@ApiOperation`, `@ApiProperty` nos DTOs e autenticação Bearer configurada.

## Segurança (OWASP)

- JWT validado em cada requisição via Supabase Auth (não armazenado no backend)
- `SUPABASE_SERVICE_ROLE_KEY` nunca exposto ao cliente
- `whitelist: true` no ValidationPipe previne mass assignment
- `forbidNonWhitelisted: true` rejeita payloads inesperados
- AdminGuard impede escalada de privilégio
- Trigger com `SELECT FOR UPDATE` previne race condition em retiradas simultâneas
- Estoque nunca fica negativo (CHECK constraint no banco + verificação no service)
