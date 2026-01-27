# CanvasGroup

Sistema de canvas interativo para gerenciamento de grupos educacionais com avaliação e conexões visuais.

![Next.js](https://img.shields.io/badge/Next.js-15.5-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)
![Drizzle ORM](https://img.shields.io/badge/Drizzle-0.43-green)

## Funcionalidades

- **Canvas Interativo**: Visualização de grupos em 3 colunas (2º Ano A, Ensino Superior, 2º Ano B)
- **Gerenciamento de Grupos**: CRUD completo com membros e status
- **Conexões Visuais**: Ligações entre grupos com nomes de aplicativos
- **Sistema de Notas**: Avaliação de 0-10 com histórico completo
- **Autenticação**: Google OAuth via Firebase
- **Controle de Acesso**: Roles admin/student
- **Auditoria**: Log completo de todas as ações

## Screenshots

### Canvas
```
┌─────────────┬─────────────┬─────────────┐
│  2º ANO A   │  SUPERIOR   │  2º ANO B   │
├─────────────┼─────────────┼─────────────┤
│ ┌─────────┐ │ ┌─────────┐ │ ┌─────────┐ │
│ │ Grupo 1 │ │ │ Grupo 1 │ │ │ Grupo 1 │ │
│ └─────────┘ │ └─────────┘ │ └─────────┘ │
│ ┌─────────┐ │ ┌─────────┐ │ ┌─────────┐ │
│ │ Grupo 2 │───│ Grupo 2 │───│ Grupo 2 │ │
│ └─────────┘ │ └─────────┘ │ └─────────┘ │
└─────────────┴─────────────┴─────────────┘
```

## Tech Stack

| Categoria | Tecnologia |
|-----------|------------|
| Framework | Next.js 15 (App Router) |
| UI | React 19, Tailwind CSS 4 |
| Canvas | @xyflow/react 12 |
| Database | Neon PostgreSQL (Serverless) |
| ORM | Drizzle ORM |
| Auth | Firebase Authentication |
| Language | TypeScript 5.7 |

## Pré-requisitos

- [Bun](https://bun.sh/) (gerenciador de pacotes)
- Conta no [Neon](https://neon.tech/) (banco de dados)
- Projeto no [Firebase](https://firebase.google.com/) (autenticação)

## Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/canvasgroup.git
cd canvasgroup
```

### 2. Instale as dependências

```bash
bun install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Neon PostgreSQL
NEON_DB=postgresql://user:password@host/database?sslmode=require

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# Admin emails (opcional)
ADMIN_EMAILS=admin@example.com
```

### 4. Configure o banco de dados

```bash
# Push do schema para o banco
bun run db:push

# (Opcional) Popular com dados de teste
curl -X POST http://localhost:3000/api/seed
```

### 5. Inicie o servidor

```bash
bun run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `bun run dev` | Servidor de desenvolvimento (webpack) |
| `bun run dev:turbo` | Servidor com Turbopack (experimental) |
| `bun run build` | Build de produção |
| `bun run start` | Inicia servidor de produção |
| `bun run lint` | Executa linter |
| `bun run db:generate` | Gera migrations Drizzle |
| `bun run db:push` | Push do schema para o banco |
| `bun run db:studio` | Interface visual do Drizzle |

## Estrutura do Projeto

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Login
│   ├── admin/             # Dashboard admin
│   ├── canvas/            # Canvas interativo
│   ├── groups/            # Gerenciamento de grupos
│   ├── connections/       # Gerenciamento de conexões
│   └── api/               # API Routes
├── components/
│   ├── ui/                # Componentes base
│   ├── canvas/            # Componentes do canvas
│   ├── admin/             # Componentes admin
│   └── ...
├── contexts/              # React Contexts
├── db/                    # Drizzle ORM
├── lib/                   # Utilitários
└── types/                 # TypeScript types
```

## API Endpoints

### Autenticação
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/login` | Sincroniza usuário Firebase → DB |
| POST | `/api/auth/logout` | Registra logout |
| GET | `/api/auth/me` | Retorna usuário atual |

### Grupos
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/groups` | Lista todos os grupos |
| POST | `/api/groups` | Cria novo grupo |
| PATCH | `/api/groups/[id]` | Atualiza grupo |
| DELETE | `/api/groups/[id]` | Remove grupo |

### Notas
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/groups/[id]/grades` | Histórico de notas |
| POST | `/api/groups/[id]/grades` | Atribui nota |

### Conexões
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/connections` | Lista conexões |
| POST | `/api/connections` | Cria conexão |
| DELETE | `/api/connections/[id]` | Remove conexão |

### Utilitários
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/health` | Health check |
| GET | `/api/activity-logs` | Logs de atividade |
| POST | `/api/seed` | Popular banco com dados de teste |

## Modelo de Dados

### Users
- `id` (UUID)
- `firebaseUid` (string, unique)
- `email` (string, unique)
- `displayName` (string)
- `role` (admin | student)

### Groups
- `id` (UUID)
- `name` (string)
- `type` (superior | medio-a | medio-b)
- `leaderName` (string)
- `status` (active | pending)
- `members` (relation)

### Connections
- `id` (UUID)
- `sourceId` (FK → groups)
- `targetId` (FK → groups)
- `appName` (string)

### Grades
- `id` (UUID)
- `groupId` (FK → groups)
- `grade` (integer 0-100)
- `observations` (text)
- `gradedBy` (FK → users)

## Configuração do Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
2. Ative **Authentication** → **Sign-in method** → **Google**
3. Adicione seu domínio em **Authorized domains**
4. Copie as credenciais para o `.env`

## Configuração do Neon

1. Crie uma conta no [Neon](https://neon.tech/)
2. Crie um novo projeto
3. Copie a connection string para `NEON_DB` no `.env`

## Administradores

Os emails de administradores são definidos em `src/lib/constants.ts`:

```typescript
export const ADMIN_EMAILS = [
  'admin@example.com',
];
```

Ou via variável de ambiente:

```env
ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

## Desenvolvimento

### Adicionar novo componente UI

```bash
# Componentes ficam em src/components/ui/
touch src/components/ui/my-component.tsx
```

### Modificar schema do banco

```bash
# 1. Edite src/db/schema.ts
# 2. Gere migration
bun run db:generate

# 3. Aplique ao banco
bun run db:push
```

### Adicionar nova API route

```bash
# Crie o arquivo em src/app/api/
mkdir -p src/app/api/my-route
touch src/app/api/my-route/route.ts
```

## Troubleshooting

### Erro 500 em API routes

Use webpack em vez de Turbopack:

```bash
bun run dev  # usa webpack (estável)
```

### Erro de conexão com banco

1. Verifique a variável `NEON_DB` no `.env`
2. Teste via `/api/health`

### Erro de autenticação Firebase

1. Verifique as variáveis `NEXT_PUBLIC_FIREBASE_*`
2. Confirme que o domínio está autorizado no Firebase Console

## Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

Desenvolvido com Next.js, React Flow e muito café.
