# CanvasGroup

Sistema de canvas interativo para gerenciamento de grupos educacionais com avaliação e conexões visuais.

## Tech Stack

### Frontend
- **Next.js 15.5.9** - App Router (webpack por padrão, Turbopack opcional)
- **React 19** - UI library
- **TypeScript 5.7** - Type safety
- **Tailwind CSS 4** - Styling
- **@xyflow/react 12** - Canvas interativo (nodes & edges)
- **Lucide React** - Ícones
- **Firebase 10** - Autenticação Google OAuth

### Backend
- **Next.js API Routes** - RESTful endpoints em `src/app/api/`
- **Drizzle ORM 0.43** - Type-safe database queries
- **Neon PostgreSQL** - Serverless database com connection caching

### Utilitários
- **cuid2** - Geração de IDs únicos
- **clsx + tailwind-merge** - Class utilities
- **class-variance-authority** - Component variants

## Package Manager

Este projeto usa **bun** como gerenciador de pacotes:

```bash
bun install          # Instalar dependências
bun run dev          # Dev server (webpack)
bun run dev:turbo    # Dev server (Turbopack - pode ter bugs)
bun run build        # Build de produção
bun add <package>    # Adicionar pacote
```

## Estrutura do Projeto

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Página inicial (login)
│   ├── admin/page.tsx     # Dashboard administrativo
│   ├── canvas/page.tsx    # Canvas interativo
│   ├── groups/page.tsx    # Gerenciamento de grupos
│   ├── connections/page.tsx # Gerenciamento de conexões
│   ├── test-auth/page.tsx # Página de teste de API
│   └── api/               # API Routes
│       ├── auth/          # Autenticação
│       ├── groups/        # CRUD de grupos
│       ├── connections/   # CRUD de conexões
│       ├── activity-logs/ # Logs de atividade
│       ├── health/        # Health check
│       ├── seed/          # Seed de dados
│       └── test/          # Teste de API
├── components/
│   ├── ui/                # Componentes base (Button, Card, Modal, etc.)
│   ├── canvas/            # Componentes do canvas (GroupNode, ConnectionEdge)
│   ├── admin/             # Componentes do admin (GroupCard, StatCard)
│   ├── auth/              # AdminGuard
│   ├── activity/          # ActivityLogItem, ActivityFilters
│   └── connections/       # ConnectionsTable, ConnectionFilters
├── contexts/
│   └── AuthContext.tsx    # Contexto de autenticação
├── db/
│   ├── index.ts           # Conexão Drizzle + Neon
│   └── schema.ts          # Schema do banco
├── lib/
│   ├── constants.ts       # Admin emails, constantes
│   ├── firebase.ts        # Configuração Firebase
│   ├── utils.ts           # Utilitários (cn)
│   └── activity-utils.ts  # Helpers para activity logs
└── types/
    └── canvas.ts          # Tipos do canvas
```

## Database

### Schema (Drizzle)
Localizado em `src/db/schema.ts`:

| Tabela | Descrição |
|--------|-----------|
| **users** | Usuários (firebaseUid, email, role: admin/student) |
| **groups** | Grupos educacionais (type: superior/medio-a/medio-b) |
| **groupMembers** | Membros de cada grupo |
| **connections** | Conexões entre grupos (sourceId, targetId, appName) |
| **grades** | Notas dos grupos (0-100 interno, 0-10 display) |
| **activityLogs** | Auditoria de ações |

### Enums
- `group_type`: 'superior', 'medio-a', 'medio-b'
- `status`: 'active', 'pending'
- `user_role`: 'admin', 'student'
- `activity_type`: 'login', 'logout', 'create', 'update', 'delete'

### Comandos
```bash
bun run db:generate  # Gerar migrations
bun run db:push      # Push direto ao banco
bun run db:studio    # UI do Drizzle Studio
```

## Variáveis de Ambiente

Criar arquivo `.env` na raiz:

```env
# Neon PostgreSQL
NEON_DB=postgresql://user:pass@host/db?sslmode=require

# Firebase (cliente)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Admin emails (opcional, complementa lib/constants.ts)
ADMIN_EMAILS=admin1@email.com,admin2@email.com
```

## API Structure

### Endpoints
| Método | Rota | Descrição |
|--------|------|-----------|
| GET/POST | `/api/groups` | Listar/Criar grupos |
| PATCH/DELETE | `/api/groups/[id]` | Atualizar/Deletar grupo |
| GET/POST | `/api/groups/[id]/grades` | Histórico/Atribuir notas |
| GET/POST | `/api/connections` | Listar/Criar conexões |
| DELETE | `/api/connections/[id]` | Soft delete conexão |
| GET/POST | `/api/auth/login` | Health check / Sync usuário |
| POST | `/api/auth/logout` | Registrar logout |
| GET | `/api/auth/me` | Obter usuário do DB |
| GET | `/api/activity-logs` | Histórico com filtros |
| GET | `/api/health` | Health check do banco |
| POST | `/api/seed` | Popular banco com dados de teste |

### Padrões de API
- CORS headers em todas as respostas
- Activity logging em operações CRUD
- Soft delete para conexões (campo `deletedAt`)
- Grades: 0-100 interno, 0-10 display
- IP e User-Agent capturados para auditoria

## Canvas

### Layout em 3 Colunas
```
┌─────────────┬─────────────┬─────────────┐
│  2º ANO A   │  SUPERIOR   │  2º ANO B   │
│  (medio-a)  │             │  (medio-b)  │
│   x: 50     │   x: 370    │   x: 690    │
├─────────────┼─────────────┼─────────────┤
│   Cards     │   Cards     │   Cards     │
│   fixos     │   fixos     │   fixos     │
│   y: 90+    │   y: 90+    │   y: 90+    │
│   spacing:  │   spacing:  │   spacing:  │
│   220px     │   220px     │   220px     │
└─────────────┴─────────────┴─────────────┘
```

### Configurações do React Flow
- `nodesDraggable={false}` - Cards não arrastáveis
- `nodesConnectable={true}` - Permite criar conexões (admin)
- `fitView` com `padding: 0.1`
- Zoom inicial: 0.85
- Background: pontos com gap de 16px

### Componentes
- `GroupNode` - Card de grupo com membros e conexões
- `SectionHeader` - Cabeçalho de coluna
- `ConnectionEdge` - Linha de conexão com label

## Autenticação

### Fluxo
1. Usuário clica "Entrar com Google"
2. Firebase Auth abre popup
3. Após sucesso, `AuthContext` chama `/api/auth/login`
4. API sincroniza usuário no PostgreSQL
5. Role determinada por email (hardcoded ou env)

### Admin Emails
Definidos em `src/lib/constants.ts`:
```typescript
export const ADMIN_EMAILS = [
  'charleno@gmail.com',
  'charlenopires@ifpi.edu.br',
];
```

### AuthContext
- Retry automático (3 tentativas com backoff)
- Fallback local se API falhar
- Logging detalhado para debug

## Seed de Dados

Executar via POST para `/api/seed`:
```bash
curl -X POST http://localhost:3000/api/seed
```

Cria:
- 1 admin user (charleno@gmail.com)
- 12 grupos (4 Superior, 4 Médio A, 4 Médio B)
- 6 conexões entre grupos
- 7 notas
- Activity logs para todas as ações

## Troubleshooting

### Erro 500 com corpo vazio em API routes
1. Use webpack em vez de Turbopack: `bun run dev`
2. Verifique logs do servidor para `[Auth Login]`
3. Teste em `/test-auth` para isolar o problema

### Hydration mismatch
O `<html>` tem `suppressHydrationWarning` para ignorar atributos de extensões.

### Database não conecta
1. Verifique `NEON_DB` no `.env`
2. Teste via `/api/health`
3. Connection caching está habilitado em `src/db/index.ts`

## Key Patterns

### Activity Logging
```typescript
await db.insert(activityLogs).values({
  userId,
  action: 'create' | 'update' | 'delete' | 'login' | 'logout',
  entityType: 'user' | 'group' | 'connection' | 'grade',
  entityId: entity.id,
  details: 'Descrição da ação',
  ipAddress,
  userAgent,
});
```

### API Route com CORS
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  // ...
  return NextResponse.json(data, { headers: corsHeaders });
}
```

### Neon Connection (Serverless)
```typescript
import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

neonConfig.fetchConnectionCache = true;
const sql = neon(process.env.NEON_DB!);
export const db = drizzle({ client: sql, schema });
```

## Domain Model

| Domínio | Descrição |
|---------|-----------|
| **Auth** | Firebase Google OAuth + roles (admin/student) |
| **Groups** | Grupos educacionais: Superior, Médio A, Médio B |
| **Connections** | Ligações entre grupos com apps (GitHub, Figma, etc.) |
| **Grades** | Sistema de notas 0-10 com histórico |
| **ActivityLog** | Auditoria completa de ações |
| **Canvas** | Visualização com React Flow (@xyflow/react) |
