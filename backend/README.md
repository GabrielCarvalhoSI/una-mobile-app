# Una Backend

API REST do projeto Una — plataforma de saúde menstrual para estudantes da UFPE.

Permite que o app mobile e o painel web gerenciem pontos de coleta de absorventes, retiradas, doações e relatos de problemas.

## Tecnologias

- **NestJS** — framework Node.js
- **Supabase** — banco de dados PostgreSQL + PostGIS e autenticação
- **Swagger** — documentação automática da API

## Pré-requisitos

- Node.js 18+
- Conta no Supabase com as migrations aplicadas (repositório `analauraboliveira/Una`)

## Configuração

**1. Clone e instale as dependências:**
```bash
git clone <url-do-repo>
cd una-backend
npm install
```

**2. Crie o arquivo `.env`:**
```bash
cp .env.example .env
```

Preencha com as credenciais do seu projeto Supabase:
```
PORT=3000
SUPABASE_URL=https://<seu-projeto>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
```

> As chaves estão em: Dashboard Supabase → Project Settings → API

**3. Inicie o servidor:**
```bash
# Desenvolvimento (hot reload)
npm run start:dev

# Produção
npm run build
npm start
```

Acesse a documentação em: `http://localhost:3000/docs`

## Endpoints Principais

### Autenticação

```
POST /auth/signup    — Cadastro de nova usuária
POST /auth/signin    — Login → retorna access_token JWT
```

### App Mobile (requer Bearer token)

```
GET  /profiles/me                          — Perfil da usuária logada
GET  /collection-points?lat=&lng=          — Pontos de coleta mais próximos
GET  /collection-points/:id                — Detalhe do ponto com estoque
POST /transactions/withdrawal              — Retirada de absorvente
POST /transactions/donation                — Doação de absorventes
POST /feedbacks                            — Relatar problema num ponto
GET  /feedbacks/mine                       — Meus relatos
```

### Painel Admin (requer role = 'admin')

```
GET   /admin/feedbacks                     — Todos os relatos
PATCH /admin/feedbacks/:id                 — Atualizar status do relato
GET   /admin/collection-points             — Todos os pontos (incluindo inativos)
PATCH /admin/collection-points/:id         — Atualizar dados ou status do ponto
```

## Regras de Negócio

- **Retirada:** limite de 1 item por usuária por dia
- **Retirada:** bloqueada se estoque = 0
- **Retirada:** operações simultâneas são seguras (`SELECT FOR UPDATE` no banco)
- **Feedback:** ao registrar, admins recebem notificação automática em tempo real
- **Admin:** usuárias comuns não acessam rotas `/admin/*`

## Estrutura do Projeto

```
src/
├── auth/               — Signup, signin, guards de JWT e admin
├── profiles/           — Perfil da usuária autenticada
├── collection-points/  — Listagem e detalhe de pontos de coleta
├── transactions/       — Retiradas e doações
├── feedbacks/          — Relatos de problemas
├── admin/              — Endpoints administrativos
├── supabase/           — Cliente Supabase (service role)
└── common/             — Decorators e filtro de erros
```

## Repositórios Relacionados

| Camada | Repositório |
|---|---|
| Banco de dados + Painel Web | `analauraboliveira/Una` |
| App Mobile | `GabrielCarvalhoSI/una-mobile-app` |
