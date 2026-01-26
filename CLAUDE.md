# canvasgroup

Sistema de canvas interativo para gerenciamento de grupos educacionais com avaliação e conexões visuais.

## Tech Stack

### Frontend
- **Next.js 15** - App Router com Turbopack
- **React 19** - UI library
- **TypeScript 5.7** - Type safety
- **Tailwind CSS 4** - Styling
- **@xyflow/react 12** - Canvas interativo (nodes & edges)
- **Lucide React** - Ícones
- **Firebase 10** - Autenticação Google OAuth

### Backend
- **Next.js API Routes** - RESTful endpoints em `src/app/api/`
- **Drizzle ORM** - Type-safe database queries
- **Neon PostgreSQL** - Serverless database

### Utilitários
- **cuid2** - Geração de IDs únicos
- **clsx + tailwind-merge** - Class utilities
- **class-variance-authority** - Component variants

## Package Manager

Este projeto usa **bun** como gerenciador de pacotes. Sempre use bun em vez de npm:

- `bun install` (não `npm install`)
- `bun run dev` (não `npm run dev`)
- `bun add <package>` (não `npm install <package>`)
- `bun remove <package>` (não `npm uninstall <package>`)

## Database

### Schema (Drizzle)
Localizado em `src/db/schema.ts`:

- **users** - Usuários autenticados (firebaseUid, email, role: admin/student)
- **groups** - Grupos educacionais (type: superior/medio-a/medio-b)
- **groupMembers** - Membros de cada grupo
- **connections** - Conexões entre grupos (sourceId, targetId, appName)
- **grades** - Notas dos grupos (0-100 interno, 0-10 display)
- **activityLogs** - Auditoria de ações (action, entityType, entityId)

### Comandos
```bash
bun run db:generate  # Gerar migrations
bun run db:push      # Push direto ao banco
bun run db:studio    # UI do Drizzle Studio
```

## API Structure

### Endpoints
- `GET/POST /api/groups` - Listar/Criar grupos
- `PATCH/DELETE /api/groups/[id]` - Atualizar/Deletar grupo
- `GET/POST /api/groups/[id]/grades` - Histórico/Atribuir notas
- `GET/POST /api/connections` - Listar/Criar conexões
- `DELETE /api/connections/[id]` - Soft delete conexão
- `POST /api/auth/login` - Sync usuário Firebase → DB
- `POST /api/auth/logout` - Registrar logout
- `GET /api/auth/me` - Obter usuário do DB
- `GET /api/activity-logs` - Histórico com filtros e paginação

### Padrões
- Activity logging em operações CRUD (passar `userId` no body)
- Soft delete para conexões (campo `deletedAt`)
- Grades armazenadas como 0-100, exibidas como 0-10
- IP e User-Agent capturados para auditoria

## Reference Implementation

When implementing features from specs, always analyze the existing code in `samples/prof-charleno-canvas/` first:

- **Structure**: Follow the same project structure and file organization
- **Patterns**: Reuse existing React components, hooks, and utilities
- **Styling**: Maintain consistency with the existing CSS/styling approach
- **Dependencies**: Use the same libraries and versions (React Flow, Firebase, etc.)

Before writing new code:
1. Read relevant files in `samples/prof-charleno-canvas/`
2. Identify reusable patterns and components
3. Adapt the implementation to match existing conventions

## Key Patterns

### Activity Logging
```typescript
// Em API routes, logar ações passando userId
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

### Componentes de UI
- Modal, ModalHeader, ModalBody, ModalFooter em `src/components/ui/`
- AdminGuard para proteção de rotas admin
- AuthContext para estado de autenticação

## Domain Model

### ActivityLog

Auditoria e histórico de ações no sistema

### Auth

Autenticação via Firebase Google OAuth e controle de roles (admin/student)

### Canvas

Interface visual com nodes e edges usando React Flow (@xyflow/react)

### Connections

Ligações entre grupos com regras de negócio e nomes de aplicativos

### Grades

Sistema de notas numéricas (0-10) para avaliação de grupos

### Groups

Gerenciamento de grupos educacionais: Superior, Médio A e Médio B
