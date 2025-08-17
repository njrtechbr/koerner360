# Regras do Projeto Koerner 360

## 📋 Visão Geral

Este documento define as regras e padrões de desenvolvimento para o projeto **Koerner 360**, um sistema de gestão de feedback e avaliações desenvolvido com Next.js, TypeScript e PostgreSQL.

## 🏗️ Arquitetura e Estrutura

### Stack Tecnológica
- **Framework**: Next.js 15.4.6 (App Router) + Node.js + Turbopack
- **Linguagem**: TypeScript 5.x (strict mode)
- **Runtime**: React 19.1.0 + React DOM 19.1.0
- **Banco de Dados**: PostgreSQL com Prisma ORM 6.14.0 + Prisma Client
- **Autenticação**: NextAuth.js v5.0.0-beta.29 (Auth.js) + bcryptjs 3.0.2
- **Estilização**: Tailwind CSS 4.x + CSS Variables + Lightning CSS
- **Componentes UI**: shadcn/ui (new-york style) + Radix UI primitives + Class Variance Authority
- **Ícones**: Lucide React 0.539.0
- **Formulários/Validação**: React Hook Form 7.62.0 + Zod + @hookform/resolvers 5.2.1
- **Gráficos**: Recharts 3.1.2
- **Notificações**: Sonner 2.0.7
- **Utilitários**: date-fns 4.1.0, clsx 2.1.1, Tailwind Merge
- **Qualidade**: ESLint + Prettier, Husky + lint-staged
- **Testes**: Jest + Testing Library
- **Build**: Turbopack (dev), Webpack (prod), Autoprefixer 10.4.21

### Estrutura de Diretórios
```
src/
├── app/                    # App Router do Next.js 15
│   ├── (auth)/            # Grupo de rotas autenticadas
│   │   ├── dashboard/     # Dashboard principal
│   │   │   ├── page.tsx   # /dashboard
│   │   │   └── loading.tsx # Loading UI
│   │   ├── usuarios/      # Gestão de usuários
│   │   │   ├── page.tsx   # /usuarios
│   │   │   ├── [id]/      # /usuarios/[id]
│   │   │   │   ├── page.tsx
│   │   │   │   ├── edit/
│   │   │   │   │   └── page.tsx # /usuarios/[id]/edit
│   │   │   │   └── loading.tsx
│   │   │   ├── novo/
│   │   │   │   └── page.tsx # /usuarios/novo
│   │   │   ├── loading.tsx
│   │   │   └── error.tsx
│   │   ├── avaliacoes/    # Gestão de avaliações
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx
│   │   │   │   └── loading.tsx
│   │   │   ├── loading.tsx
│   │   │   └── error.tsx
│   │   ├── feedbacks/     # Gestão de feedbacks
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── error.tsx
│   │   ├── layout.tsx     # Layout autenticado (sidebar + header)
│   │   ├── loading.tsx    # Loading global autenticado
│   │   └── error.tsx      # Error boundary autenticado
│   ├── (public)/          # Grupo de rotas públicas
│   │   ├── login/         # Página de login
│   │   │   ├── page.tsx
│   │   │   └── layout.tsx # Layout sem sidebar
│   │   └── changelog/     # Changelog público
│   │       └── page.tsx
│   ├── api/               # API Routes (Route Handlers)
│   │   ├── auth/          # NextAuth endpoints
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   ├── usuarios/      # CRUD usuários
│   │   │   ├── route.ts   # GET, POST /api/usuarios
│   │   │   └── [id]/
│   │   │       └── route.ts # GET, PUT, DELETE /api/usuarios/[id]
│   │   ├── avaliacoes/    # CRUD avaliações
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   └── feedbacks/     # CRUD feedbacks
│   │       ├── route.ts
│   │       └── [id]/
│   │           └── route.ts
│   ├── globals.css        # Estilos globais Tailwind CSS 4
│   ├── layout.tsx         # Root Layout
│   ├── page.tsx           # Página inicial (redirect para dashboard)
│   ├── loading.tsx        # Loading UI
│   ├── error.tsx          # Error UI
│   ├── not-found.tsx      # 404 Page
│   └── template.tsx       # Template wrapper (opcional)
├── components/            # Componentes React
│   ├── ui/               # Componentes base (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── layout/           # Componentes de layout
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   └── navigation.tsx
│   ├── forms/            # Componentes de formulário
│   │   ├── usuario-form.tsx
│   │   ├── avaliacao-form.tsx
│   │   └── feedback-form.tsx
│   ├── charts/           # Componentes de gráficos
│   │   ├── dashboard-charts.tsx
│   │   └── analytics-chart.tsx
│   ├── [feature]/        # Componentes específicos por funcionalidade
│   └── providers/        # Context providers
│       ├── auth-provider.tsx
│       └── theme-provider.tsx
├── lib/                  # Utilitários e configurações
│   ├── prisma.ts         # Cliente Prisma
│   ├── auth.ts           # Configuração Auth.js
│   ├── utils.ts          # Utilitários gerais
│   ├── validations.ts    # Schemas Zod
│   ├── constants.ts      # Constantes da aplicação
│   └── types.ts          # Tipos compartilhados
├── hooks/                # Custom hooks
│   ├── use-auth.ts       # Hook de autenticação
│   ├── use-usuarios.ts   # Hook para usuários
│   ├── use-avaliacoes.ts # Hook para avaliações
│   └── use-feedbacks.ts  # Hook para feedbacks
├── types/                # Definições de tipos TypeScript
│   ├── auth.ts           # Tipos de autenticação
│   ├── api.ts            # Tipos de API
│   └── database.ts       # Tipos do banco
├── styles/               # Estilos adicionais
└── middleware.ts         # Middleware do Next.js
```

### Layout Principal
**REGRA OBRIGATÓRIA**: Todas as páginas do sistema devem utilizar o layout principal (`src/app/layout.tsx`), que inclui:
- Sidebar de navegação responsiva
- Header com informações do usuário e tema
- Área de conteúdo principal com scroll
- Sistema de autenticação integrado
- Providers (Auth, Theme, Toast)

**EXCEÇÃO**: Apenas a página de login (`/login`) deve ficar fora do layout principal, utilizando seu próprio layout específico.

**Implementação Next.js 15**:
- Root Layout: `src/app/layout.tsx` com providers globais
- Nested Layouts: Usar grupos de rotas `(auth)` e `(public)`
- Loading States: Implementar `loading.tsx` em cada rota
- Error Boundaries: Implementar `error.tsx` para tratamento de erros
- Metadata API: Usar `generateMetadata` para SEO
- Componentes de layout: Reutilizar componentes em `src/components/layout/`

## 🚀 Desenvolvimento

### Next.js 15 App Router - Estrutura e Padrões

#### API Routes (Route Handlers)

**Padrão de API Route**
```typescript
// app/api/usuarios/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { usuarioSchema } from '@/lib/validations'
import { z } from 'zod'

// GET /api/usuarios
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado', timestamp: new Date().toISOString() },
        { status: 401 }
      )
    }

    // Verificar permissões
    if (session.user.tipo !== 'admin' && session.user.tipo !== 'supervisor') {
      return NextResponse.json(
        { success: false, error: 'Acesso negado', timestamp: new Date().toISOString() },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''

    const where = search
      ? {
          OR: [
            { nome: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const [usuarios, total] = await Promise.all([
      prisma.usuario.findMany({
        where,
        select: {
          id: true,
          nome: true,
          email: true,
          tipo: true,
          ativo: true,
          criado_em: true,
        },
        orderBy: { criado_em: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.usuario.count({ where }),
    ])

    const totalPaginas = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: usuarios,
      paginacao: {
        paginaAtual: page,
        totalPaginas,
        totalItens: total,
        itensPorPagina: limit,
        temProximaPagina: page < totalPaginas,
        temPaginaAnterior: page > 1,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor', timestamp: new Date().toISOString() },
      { status: 500 }
    )
  }
}

// POST /api/usuarios
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.tipo !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Acesso negado', timestamp: new Date().toISOString() },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = usuarioSchema.parse(body)

    // Verificar se email já existe
    const existingUser = await prisma.usuario.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email já está em uso', timestamp: new Date().toISOString() },
        { status: 409 }
      )
    }

    const usuario = await prisma.usuario.create({
      data: {
        ...validatedData,
        senha_hash: await bcrypt.hash(validatedData.senha, 12),
      },
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        ativo: true,
        criado_em: true,
      },
    })

    return NextResponse.json(
      { success: true, data: usuario, timestamp: new Date().toISOString() },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dados inválidos',
          details: error.errors,
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      )
    }

    console.error('Erro ao criar usuário:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor', timestamp: new Date().toISOString() },
      { status: 500 }
    )
  }
}
```

**Dynamic Route Handler**
```typescript
// app/api/usuarios/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: { id: string }
}

// GET /api/usuarios/[id]
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado', timestamp: new Date().toISOString() },
        { status: 401 }
      )
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        ativo: true,
        criado_em: true,
        atualizado_em: true,
      },
    })

    if (!usuario) {
      return NextResponse.json(
        { success: false, error: 'Usuário não encontrado', timestamp: new Date().toISOString() },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: usuario,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Erro ao buscar usuário:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor', timestamp: new Date().toISOString() },
      { status: 500 }
    )
  }
}

// PUT /api/usuarios/[id]
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.tipo !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Acesso negado', timestamp: new Date().toISOString() },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = usuarioUpdateSchema.parse(body)

    const usuario = await prisma.usuario.update({
      where: { id: params.id },
      data: validatedData,
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        ativo: true,
        atualizado_em: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: usuario,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dados inválidos',
          details: error.errors,
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      )
    }

    console.error('Erro ao atualizar usuário:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor', timestamp: new Date().toISOString() },
      { status: 500 }
    )
  }
}

// DELETE /api/usuarios/[id]
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.tipo !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Acesso negado', timestamp: new Date().toISOString() },
        { status: 403 }
      )
    }

    await prisma.usuario.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      message: 'Usuário excluído com sucesso',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Erro ao excluir usuário:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor', timestamp: new Date().toISOString() },
      { status: 500 }
    )
  }
}
```

#### Middleware

```typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default withAuth(
  function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const token = request.nextauth.token

    // Redirect root to dashboard
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Check role-based access
    if (pathname.startsWith('/usuarios')) {
      if (token?.tipo !== 'admin' && token?.tipo !== 'supervisor') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    if (pathname.startsWith('/admin')) {
      if (token?.tipo !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Public routes
        if (
          pathname.startsWith('/login') ||
          pathname.startsWith('/changelog') ||
          pathname.startsWith('/api/auth')
        ) {
          return true
        }

        // Protected routes require token
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|changelog|login).*)',
  ],
}
```

## 🎯 Padrões de Desenvolvimento

### 1. TypeScript - Configurações e Padrões

#### Configuração TypeScript (tsconfig.json)

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/auth": ["./src/auth.ts"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/app/*": ["./src/app/*"],
      "@/types/*": ["./src/types/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/utils/*": ["./src/utils/*"]
    },
    // Configurações rigorosas adicionais
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "allowUnusedLabels": false,
    "allowUnreachableCode": false
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

#### Regras TypeScript Críticas

**1. Proibição de `any`**
```typescript
// ❌ Evitar
const dados: any = await response.json()

// ✅ Preferir
interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
}

const dados: ApiResponse<Usuario[]> = await response.json()

// ✅ Para casos desconhecidos
const dados: unknown = await response.json()
const errorData: Record<string, unknown> = {}
```

**2. Tipagem de Props e Estados**
```typescript
// ✅ Interface para props
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'destructive'
  size: 'sm' | 'md' | 'lg'
  disabled?: boolean
  onClick?: () => void
  children: React.ReactNode
}

// ✅ Tipagem de estado
interface UserState {
  usuarios: Usuario[]
  loading: boolean
  error: string | null
  filters: {
    search: string
    tipo: TipoUsuario | 'all'
    ativo: boolean | 'all'
  }
}

const [state, setState] = useState<UserState>({
  usuarios: [],
  loading: false,
  error: null,
  filters: {
    search: '',
    tipo: 'all',
    ativo: 'all',
  },
})
```

**3. Utility Types**
```typescript
// ✅ Usar utility types do TypeScript
type UsuarioCreate = Omit<Usuario, 'id' | 'criado_em' | 'atualizado_em'>
type UsuarioUpdate = Partial<Pick<Usuario, 'nome' | 'email' | 'ativo'>>
type UsuarioPublic = Pick<Usuario, 'id' | 'nome' | 'email' | 'tipo'>

// ✅ Para formulários
type UsuarioFormData = {
  nome: string
  email: string
  senha: string
  confirmarSenha: string
  tipo: TipoUsuario
  ativo: boolean
}

// ✅ Para API responses
type ApiError = {
  success: false
  error: string
  details?: unknown
  timestamp: string
}

type ApiSuccess<T> = {
  success: true
  data: T
  timestamp: string
}

type ApiResponse<T> = ApiSuccess<T> | ApiError
```

**4. Enums vs Union Types**
```typescript
// ✅ Para valores que podem mudar
type TipoUsuario = 'admin' | 'supervisor' | 'attendant'
type StatusAvaliacao = 'pendente' | 'em_andamento' | 'concluida' | 'cancelada'

// ✅ Para constantes fixas
enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

// ✅ Para configurações
const API_ENDPOINTS = {
  USUARIOS: '/api/usuarios',
  AVALIACOES: '/api/avaliacoes',
  FEEDBACKS: '/api/feedbacks',
} as const

type ApiEndpoint = typeof API_ENDPOINTS[keyof typeof API_ENDPOINTS]
```

**5. Tipagem de Hooks**
```typescript
// ✅ Hook customizado tipado
interface UseUsuariosReturn {
  usuarios: Usuario[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  create: (data: UsuarioCreate) => Promise<Usuario>
  update: (id: string, data: UsuarioUpdate) => Promise<Usuario>
  delete: (id: string) => Promise<void>
}

function useUsuarios(): UseUsuariosReturn {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Implementação...

  return {
    usuarios,
    loading,
    error,
    refetch,
    create,
    update,
    delete,
  }
}
```

**6. Tipagem de Eventos**
```typescript
// ✅ Eventos de formulário
const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault()
  // ...
}

const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = event.target
  // ...
}

const handleSelectChange = (value: string) => {
  // Para componentes shadcn/ui
}

// ✅ Refs tipadas
const inputRef = useRef<HTMLInputElement>(null)
const formRef = useRef<HTMLFormElement>(null)
```

**7. Tipagem de API Routes**
```typescript
// ✅ Tipagem para route handlers
interface RouteContext {
  params: { id: string }
}

export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse<Usuario>>> {
  // Implementação...
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<Usuario>>> {
  // Implementação...
}
```

### 2. Nomenclatura e Convenções

#### Arquivos e Diretórios
- **Arquivos**: `kebab-case` (ex: `user-profile.tsx`)
- **Diretórios**: `kebab-case` (ex: `user-management/`)
- **Componentes**: `PascalCase` (ex: `UserProfile.tsx`)
- **Pages App Router**: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`
- **Route Handlers**: `route.ts` (ex: `api/users/route.ts`)
- **Middleware**: `middleware.ts` (root level)
- **Configurações**: `next.config.js`, `tailwind.config.ts`, `eslint.config.js`

#### Código TypeScript/JavaScript
- **Variáveis**: `camelCase` (ex: `nomeUsuario`)
- **Funções**: `camelCase` (ex: `obterDadosUsuario`)
- **Classes**: `PascalCase` (ex: `GerenciadorUsuarios`)
- **Constantes**: `UPPER_SNAKE_CASE` (ex: `API_BASE_URL`)
- **Interfaces/Types**: `PascalCase` (ex: `UsuarioInterface`)
- **Enums**: `PascalCase` (ex: `TipoUsuario`)

#### Banco de Dados (Prisma)
- **Tabelas**: `snake_case` (ex: `usuarios`, `avaliacoes_feedback`)
- **Campos**: `snake_case` (ex: `nome_completo`, `data_criacao`)
- **Relacionamentos**: Seguir convenções do Prisma
- **Índices**: Usar `@@index` para campos de busca frequente
- **Constraints**: Usar `@@unique` para combinações únicas
- **Enums**: `PascalCase` no schema, `UPPER_CASE` no banco

### 2. Estrutura de Componentes

#### Componente Padrão
```typescript
'use client'; // Apenas se necessário

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface MinhaComponenteProps {
  titulo: string;
  onAction?: () => void;
}

/**
 * Componente para [descrição da funcionalidade]
 * @param titulo - Título a ser exibido
 * @param onAction - Callback executado ao clicar
 */
export function MinhaComponente({ titulo, onAction }: MinhaComponenteProps) {
  const [estado, setEstado] = useState(false);

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold">{titulo}</h2>
      <Button onClick={onAction}>Ação</Button>
    </div>
  );
}
```

#### Hooks Customizados
```typescript
import { useState, useEffect } from 'react';

interface UseMinhaFuncionalidadeReturn {
  dados: any[];
  carregando: boolean;
  erro: string | null;
  recarregar: () => void;
}

/**
 * Hook para gerenciar [funcionalidade]
 */
export function useMinhaFuncionalidade(): UseMinhaFuncionalidadeReturn {
  // Implementação
}
```

### 3. API Routes

#### Estrutura Padrão
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/usuarios
 * Retorna lista de usuários
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const usuarios = await prisma.usuario.findMany();
    
    return NextResponse.json({
      success: true,
      data: usuarios,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
```

#### Estrutura de Resposta Padronizada
```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  paginacao?: {
    paginaAtual: number;
    totalPaginas: number;
    totalItens: number;
    itensPorPagina: number;
    temProximaPagina: boolean;
    temPaginaAnterior: boolean;
  };
}
```

### 4. Validação com Zod

```typescript
import { z } from 'zod';

export const usuarioSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  tipo: z.enum(['admin', 'supervisor', 'attendant']),
  ativo: z.boolean().default(true)
});

export type UsuarioFormData = z.infer<typeof usuarioSchema>;
```

## 🔐 Autenticação e Autorização

### NextAuth.js v5 (Auth.js) - Configuração
```typescript
// auth.ts
import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        
        const user = await prisma.usuario.findUnique({
          where: { email: credentials.email as string }
        })
        
        if (!user || !user.ativo) return null
        
        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.senha_hash
        )
        
        if (!isValid) return null
        
        return {
          id: user.id,
          email: user.email,
          name: user.nome,
          role: user.tipo
        }
      }
    })
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      return session
    }
  }
})
```

### Níveis de Acesso
- **admin**: Acesso total ao sistema, gerencia usuários, configurações
- **supervisor**: Gerencia atendentes e suas avaliações, relatórios
- **attendant**: Acesso apenas às próprias avaliações e dados

### Middleware de Proteção
```typescript
// middleware.ts
import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth
  
  // Rotas públicas
  const publicRoutes = ['/login', '/changelog']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  
  // Verificação de autorização por role
  const userRole = req.auth?.user?.role
  
  if (pathname.startsWith('/admin') && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
  
  if (pathname.startsWith('/supervisor') && !['admin', 'supervisor'].includes(userRole!)) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
  
  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|changelog|login).*)',
  ],
}
```

### Hooks de Autenticação
```typescript
// hooks/use-auth.ts
import { useSession } from 'next-auth/react'

export function useAuth() {
  const { data: session, status } = useSession()
  
  return {
    user: session?.user,
    isLoading: status === 'loading',
    isAuthenticated: !!session,
    role: session?.user?.role,
    isAdmin: session?.user?.role === 'admin',
    isSupervisor: ['admin', 'supervisor'].includes(session?.user?.role || ''),
    isAttendant: session?.user?.role === 'attendant'
  }
}
```

### Proteção de Componentes
```typescript
// components/auth/ProtectedRoute.tsx
import { useAuth } from '@/hooks/use-auth'
import { redirect } from 'next/navigation'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'supervisor' | 'attendant'
  fallback?: React.ReactNode
}

export function ProtectedRoute({ children, requiredRole, fallback }: ProtectedRouteProps) {
  const { isAuthenticated, role, isLoading } = useAuth()
  
  if (isLoading) return <div>Carregando...</div>
  
  if (!isAuthenticated) {
    redirect('/login')
  }
  
  if (requiredRole && role !== requiredRole) {
    return fallback || <div>Acesso negado</div>
  }
  
  return <>{children}</>
}
```

### Rotas Públicas
- `/login`
- `/changelog`
- `/api/auth/*`

## 🎨 Estilização e UI

### Tailwind CSS 3.x - Configuração
```javascript
// tailwind.config.js
const { fontFamily } = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', ...fontFamily.sans],
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
```

### shadcn/ui - Configuração
```json
// components.json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

### CSS Variables (globals.css)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.75rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 84% 4.9%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 94.1%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### Utilitários (lib/utils.ts)
```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formatação de data
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

// Formatação de data e hora
export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}
```

### Padrões de Componentes
```typescript
// Exemplo de componente com variantes
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
```

### Responsividade e Mobile-First
```typescript
// Exemplo de layout responsivo
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  <Card className="p-4">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">1,234</div>
      <p className="text-xs text-muted-foreground">+20.1% em relação ao mês anterior</p>
    </CardContent>
  </Card>
</div>
```

### Acessibilidade
- **Labels**: Sempre usar `htmlFor` em labels
- **ARIA**: Implementar `aria-label`, `aria-describedby`, `role`
- **Foco**: Garantir navegação por teclado
- **Contraste**: Seguir WCAG 2.1 AA (4.5:1 para texto normal)
- **Screen readers**: Usar `sr-only` para conteúdo apenas para leitores de tela

```typescript
// Exemplo acessível
<div className="space-y-2">
  <Label htmlFor="email" className="text-sm font-medium">
    Email
  </Label>
  <Input
    id="email"
    type="email"
    placeholder="seu@email.com"
    aria-describedby="email-error"
    className="w-full"
  />
  {error && (
    <p id="email-error" className="text-sm text-destructive" role="alert">
      {error}
    </p>
  )}
</div>
```

## 📊 Banco de Dados

### Convenções Prisma
- Usar `snake_case` para nomes de tabelas e campos
- Relacionamentos bem definidos
- Índices apropriados para performance
- Migrations versionadas

### Exemplo de Schema
```prisma
model Usuario {
  id          String   @id @default(cuid())
  nome        String
  email       String   @unique
  senha_hash  String
  tipo        TipoUsuario
  ativo       Boolean  @default(true)
  criado_em   DateTime @default(now())
  atualizado_em DateTime @updatedAt
  
  @@map("usuarios")
}

enum TipoUsuario {
  admin
  supervisor
  attendant
}
```

## ⏰ Manipulação de Data e Hora

**IMPORTANTE**: Para QUALQUER operação que envolva data e hora, é OBRIGATÓRIO utilizar os comandos do PowerShell para obter o timestamp atual, pois a IA não tem acesso à data e hora do sistema.

### Comandos Obrigatórios

- **Data e hora completa**: `Get-Date -Format "dd/MM/yyyy HH:mm:ss"`
- **Apenas data**: `Get-Date -Format "dd/MM/yyyy"`
- **Apenas hora**: `Get-Date -Format "HH:mm:ss"`
- **Formato ISO 8601**: `Get-Date -Format "o"`

### Exemplos de Uso

```powershell
# Obter data e hora completa
Get-Date -Format "dd/MM/yyyy HH:mm:ss"
# Resultado: 15/08/2025 21:38:06

# Obter apenas data
Get-Date -Format "dd/MM/yyyy"
# Resultado: 15/08/2025

# Obter apenas hora
Get-Date -Format "HH:mm:ss"
# Resultado: 21:38:15

# Formato ISO 8601 para APIs
Get-Date -Format "o"
# Resultado: 2025-08-15T21:38:01.0515454-03:00
```

### Regras de Implementação

**REGRA CRÍTICA**: Sempre que a IA precisar utilizar data e hora em qualquer operação, é necessário que o usuário forneça essa informação através dos comandos do PowerShell, pois a IA não tem acesso direto ao relógio do sistema.

**Cenários de Uso**:
- Criação de timestamps em logs
- Geração de nomes de arquivos com data
- Validação de datas em formulários
- Cálculos de tempo decorrido
- Formatação de datas para exibição
- Criação de backups com timestamp

**Exemplo de Implementação**:
```typescript
// ❌ ERRADO - IA não pode acessar Date diretamente
const agora = new Date();

// ✅ CORRETO - Usuário fornece via PowerShell
// Usuário executa: Get-Date -Format "o"
// IA recebe: "2025-08-15T21:38:01.0515454-03:00"
const timestamp = "2025-08-15T21:38:01.0515454-03:00";
const agora = new Date(timestamp);
```

## 🧪 Testes e Qualidade

### ESLint (Configuração Atual)
- **Extends**: `next/core-web-vitals`, `next/typescript`
- **Parser**: `@typescript-eslint/parser` (ES2023)
- **Plugins**: `@typescript-eslint`, `react`, `react-hooks`

#### Regras TypeScript Críticas
```json
{
  "@typescript-eslint/no-unused-vars": ["error", {"argsIgnorePattern": "^_", "varsIgnorePattern": "^_"}],
  "@typescript-eslint/no-explicit-any": "warn",
  "@typescript-eslint/prefer-const": "error",
  "@typescript-eslint/no-var-requires": "error"
}
```

#### Regras React/Hooks
```json
{
  "react-hooks/rules-of-hooks": "error",
  "react-hooks/exhaustive-deps": "warn",
  "react/jsx-key": "error",
  "react/no-children-prop": "error",
  "react/self-closing-comp": "error"
}
```

#### Regras Gerais
```json
{
  "no-console": "warn",
  "no-debugger": "error",
  "no-var": "error",
  "prefer-const": "error",
  "eqeqeq": ["error", "always"],
  "curly": ["error", "all"]
}
```

#### Import Organization
```json
{
  "import/order": ["error", {
    "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
    "newlines-between": "always",
    "alphabetize": {"order": "asc", "caseInsensitive": true}
  }]
}
```

### Prettier
- Formatação automática integrada com ESLint
- Configuração padrão do projeto
- Scripts: `npm run format`, `npm run format:check`

### Estrutura de Testes
```
__tests__/
├── components/     # Testes de componentes React
├── api/           # Testes de API routes
├── lib/           # Testes de utilitários
└── setup.ts       # Configuração global Jest
```

### Scripts de Teste
```bash
npm test              # Executa todos os testes
npm run test:watch    # Modo watch para desenvolvimento
npm run test:coverage # Executa testes com relatório de cobertura
npm run test:ci       # Executa testes para CI/CD (sem watch)
npm run test:e2e      # Executa testes end-to-end com Playwright
npm run test:unit     # Executa apenas testes unitários
npm run test:integration # Executa testes de integração
```

### Configuração de Testes

#### Jest Configuration (jest.config.js)
```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/api/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

module.exports = createJestConfig(customJestConfig);
```

#### Testing Library Setup (jest.setup.js)
```javascript
import '@testing-library/jest-dom';
import { server } from './src/__mocks__/server';

// Estabelecer API mocking antes de todos os testes
beforeAll(() => server.listen());

// Resetar handlers após cada teste
afterEach(() => server.resetHandlers());

// Limpar após todos os testes
afterAll(() => server.close());
```

### Estrutura de Testes

#### Testes de Componentes
```typescript
// __tests__/components/MinhaComponente.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MinhaComponente } from '@/components/MinhaComponente';
import { SessionProvider } from 'next-auth/react';

// Mock do next-auth
const mockSession = {
  user: { id: '1', name: 'Test User', email: 'test@example.com' },
  expires: '2024-12-31',
};

const renderWithSession = (component: React.ReactElement) => {
  return render(
    <SessionProvider session={mockSession}>
      {component}
    </SessionProvider>
  );
};

describe('MinhaComponente', () => {
  it('deve renderizar corretamente', () => {
    renderWithSession(<MinhaComponente titulo="Teste" />);
    expect(screen.getByText('Teste')).toBeInTheDocument();
  });

  it('deve chamar onAction quando botão é clicado', async () => {
    const mockOnAction = jest.fn();
    renderWithSession(
      <MinhaComponente titulo="Teste" onAction={mockOnAction} />
    );
    
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(mockOnAction).toHaveBeenCalledTimes(1);
    });
  });
});
```

#### Testes de API Routes
```typescript
// __tests__/api/usuarios.test.ts
import { createMocks } from 'node-mocks-http';
import handler from '@/app/api/usuarios/route';
import { getServerSession } from 'next-auth';

// Mock do next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

// Mock do Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    usuario: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

describe('/api/usuarios', () => {
  beforeEach(() => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: '1', tipo: 'admin' },
    });
  });

  it('deve retornar lista de usuários para admin', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    
    await handler.GET(req);
    
    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(true);
  });
});
```

#### Testes de Hooks
```typescript
// __tests__/hooks/useMinhaFuncionalidade.test.ts
import { renderHook, act } from '@testing-library/react';
import { useMinhaFuncionalidade } from '@/hooks/useMinhaFuncionalidade';

describe('useMinhaFuncionalidade', () => {
  it('deve inicializar com estado correto', () => {
    const { result } = renderHook(() => useMinhaFuncionalidade());
    
    expect(result.current.dados).toEqual([]);
    expect(result.current.carregando).toBe(false);
    expect(result.current.erro).toBe(null);
  });

  it('deve carregar dados corretamente', async () => {
    const { result } = renderHook(() => useMinhaFuncionalidade());
    
    await act(async () => {
      result.current.recarregar();
    });
    
    expect(result.current.carregando).toBe(false);
    expect(result.current.dados.length).toBeGreaterThan(0);
  });
});
```

## ⚠️ Prevenção de Erros de Build

### Regras Críticas para TypeScript

#### 1. Proibição de Tipos `any`
**REGRA OBRIGATÓRIA**: Nunca usar o tipo `any` no código TypeScript.

**Alternativas recomendadas**:
```typescript
// ❌ ERRADO
function processarDados(dados: any) {
  return dados.propriedade;
}

// ✅ CORRETO - Usar tipos específicos
function processarDados(dados: Record<string, unknown>) {
  return dados.propriedade;
}

// ✅ CORRETO - Usar union types
function validarCampo(valor: string | boolean | Date | null) {
  // implementação
}

// ✅ CORRETO - Usar unknown para tratamento de erros
try {
  // código
} catch (error: unknown) {
  const zodError = error as ZodError;
}
```

#### 2. Declaração de Variáveis
**REGRA OBRIGATÓRIA**: Usar `const` sempre que possível, `let` apenas quando reatribuição for necessária.

```typescript
// ❌ ERRADO
let digitoVerificador = calcularDigito(cpf);
let resultado = processarDados();

// ✅ CORRETO
const digitoVerificador = calcularDigito(cpf);
const resultado = processarDados();
```

#### 3. Tipagem de Componentes UI
**REGRA OBRIGATÓRIA**: Sempre tipar propriedades de componentes com tipos literais específicos.

```typescript
// ❌ ERRADO
const variant = STATUS_CORES[status] as any;

// ✅ CORRETO
const variant: "default" | "secondary" | "destructive" | "outline" = 
  STATUS_CORES[status] as "default" | "secondary" | "destructive" | "outline";
```

#### 4. Remoção de Imports e Variáveis Não Utilizadas
**REGRA OBRIGATÓRIA**: Remover todos os imports e variáveis não utilizadas antes do commit.

```typescript
// ❌ ERRADO
import { useState, useEffect } from 'react'; // useEffect não usado
import { Button, Card } from '@/components/ui'; // Card não usado

function MeuComponente() {
  const [dados, setDados] = useState([]);
  const variavel = 'não usada'; // variável não utilizada
  
  return <Button>Clique</Button>;
}

// ✅ CORRETO
import { useState } from 'react';
import { Button } from '@/components/ui';

function MeuComponente() {
  const [dados, setDados] = useState([]);
  
  return <Button>Clique</Button>;
}
```

#### 5. Dependências de Hooks
**REGRA OBRIGATÓRIA**: Incluir todas as dependências necessárias nos arrays de dependência dos hooks.

```typescript
// ❌ ERRADO
const handleUpload = useCallback(() => {
  toast.success('Upload realizado');
}, []); // toast está faltando nas dependências

// ✅ CORRETO
const handleUpload = useCallback(() => {
  toast.success('Upload realizado');
}, [toast]);
```

### Checklist de Build

#### Antes de Fazer Commit
- [ ] **Executar `npm run build` com sucesso**
- [ ] **Zero erros de TypeScript**
- [ ] **Zero erros de ESLint** (warnings são aceitáveis)
- [ ] **Nenhum tipo `any` no código**
- [ ] **Todas as variáveis declaradas com `const` quando possível**
- [ ] **Imports não utilizados removidos**
- [ ] **Variáveis não utilizadas removidas**
- [ ] **Dependências de hooks completas**
- [ ] **Tipos de componentes UI específicos**

#### Comandos de Verificação
```bash
# Verificar build
npm run build

# Verificar ESLint
npm run lint

# Verificar tipos TypeScript
npx tsc --noEmit
```

### Tratamento de Erros Comuns

#### Erro: "Unexpected any"
```typescript
// Substituir por tipos específicos
Record<string, unknown>     // Para objetos genéricos
string | boolean | null     // Para union types
unknown                     // Para tratamento de erros

// Exemplos práticos:
// ❌ ERRADO
const dados: any = response.data;
const variant = STATUS_CORES[status] as any;

// ✅ CORRETO
const dados: Record<string, unknown> = response.data;
const variant: "default" | "secondary" | "destructive" | "outline" = 
  STATUS_CORES[status] as "default" | "secondary" | "destructive" | "outline";
```

#### Erro: "prefer-const"
```typescript
// Alterar let para const quando não há reatribuição
const valor = calcular(); // em vez de let valor = calcular();

// Exemplos práticos:
// ❌ ERRADO
let digitoVerificador1 = (soma % 11) < 2 ? 0 : 11 - (soma % 11);
let digitoVerificador2 = (soma % 11) < 2 ? 0 : 11 - (soma % 11);

// ✅ CORRETO
const digitoVerificador1 = (soma % 11) < 2 ? 0 : 11 - (soma % 11);
const digitoVerificador2 = (soma % 11) < 2 ? 0 : 11 - (soma % 11);
```

#### Erro: "no-unused-vars"
```typescript
// Remover imports e variáveis não utilizadas
// Ou usar underscore para indicar intencionalmente não usado
const _variavel = valor; // se realmente necessário manter

// Exemplos práticos:
// ❌ ERRADO
import { useState, useEffect, useMemo } from 'react'; // useMemo não usado
import { Button, Card, Input } from '@/components/ui'; // Card não usado

// ✅ CORRETO
import { useState, useEffect } from 'react';
import { Button, Input } from '@/components/ui';
```

#### Erro: "React Hook useCallback has missing dependencies"
```typescript
// Incluir todas as dependências necessárias
// ❌ ERRADO
const handleUpload = useCallback(() => {
  toast.success('Upload realizado');
}, []); // toast está faltando

// ✅ CORRETO
const handleUpload = useCallback(() => {
  toast.success('Upload realizado');
}, [toast]);
```

### Resolução de Problemas de Build

#### Build falha com erros de TypeScript
1. Executar verificação de tipos: `npx tsc --noEmit`
2. Corrigir todos os erros de tipo
3. Executar novamente: `npm run build`

#### Build falha com erros de ESLint
1. Executar ESLint: `npm run lint`
2. Corrigir erros críticos (warnings são aceitáveis)
3. Usar `npm run lint -- --fix` para correções automáticas
4. Executar novamente: `npm run build`

#### Script populate-changelog.ts falha
1. Verificar se o banco de dados está rodando
2. Verificar se as migrations foram aplicadas: `npx prisma migrate dev`
3. Verificar se o arquivo CHANGELOG.md existe e está bem formatado
4. Executar novamente: `npx ts-node scripts/populate-changelog.ts`

## 🚀 Build e Deploy

### Scripts Disponíveis
```bash
# Desenvolvimento
npm run dev              # Desenvolvimento com Turbopack (Next.js 15)
npm run dev:debug        # Desenvolvimento com debug habilitado
npm run dev:https        # Desenvolvimento com HTTPS local

# Build e Produção
npm run build            # Build de produção otimizado
npm run build:analyze    # Build com análise de bundle
npm run build:info       # Gera informações de build
npm run start            # Inicia servidor de produção

# Versionamento
npm run version:patch    # Incrementa versão patch (correções)
npm run version:minor    # Incrementa versão minor (funcionalidades)
npm run version:major    # Incrementa versão major (breaking changes)

# Qualidade
npm run lint             # Executa ESLint
npm run lint:fix         # Executa ESLint com correções automáticas
npm run type-check       # Verificação de tipos TypeScript
npm run format           # Formata código com Prettier
npm run format:check     # Verifica formatação sem alterar

# Database
npm run db:generate      # Gera cliente Prisma
npm run db:push          # Aplica mudanças no schema
npm run db:migrate       # Executa migrations
npm run db:studio        # Abre Prisma Studio
npm run db:seed          # Executa seeds do banco
```

### Configuração do Next.js 15

#### next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Habilita Turbopack para desenvolvimento
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  // Otimizações de performance
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Configurações de imagem
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Headers de segurança
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### Fluxo de Build Obrigatório
**SEQUÊNCIA OBRIGATÓRIA** - Sempre seguir esta ordem:

```bash
# 1. Verificar qualidade do código
npm run lint
npm run type-check
npm run format:check

# 2. Executar testes
npm run test:ci

# 3. Verificar build de produção
npm run build

# 4. Atualizar informações de build
npm run build:info

# 5. Sincronizar changelog com banco de dados
npx ts-node scripts/populate-changelog.ts

# 6. Adicionar alterações ao stage
git add .

# 7. Fazer commit das alterações
git commit -m "chore: atualiza versão e changelog para [versão] - [descrição das alterações]"
```

**⚠️ IMPORTANTE**: Este fluxo é obrigatório para manter a consistência entre o código, documentação e banco de dados.

### Otimizações de Performance

#### Bundle Analyzer
```bash
# Analisar tamanho do bundle
npm run build:analyze

# Visualizar relatório
open .next/analyze/client.html
```

#### Code Splitting
```typescript
// Lazy loading de componentes
import dynamic from 'next/dynamic';

const ComponentePesado = dynamic(
  () => import('@/components/ComponentePesado'),
  {
    loading: () => <div>Carregando...</div>,
    ssr: false, // Desabilita SSR se necessário
  }
);

// Lazy loading de bibliotecas
const carregarBiblioteca = async () => {
  const { biblioteca } = await import('biblioteca-pesada');
  return biblioteca;
};
```

#### Otimização de Imagens
```typescript
import Image from 'next/image';

// Uso otimizado do componente Image
<Image
  src="/imagem.jpg"
  alt="Descrição"
  width={800}
  height={600}
  priority={false} // true apenas para imagens above-the-fold
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### CI/CD Pipeline

#### GitHub Actions Workflow
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: koerner360_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run type checking
        run: npm run type-check
      
      - name: Run tests
        run: npm run test:ci
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/koerner360_test
      
      - name: Build application
        run: npm run build
      
      - name: Run E2E tests
        run: npm run test:e2e

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Snyk to check for vulnerabilities
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

  deploy:
    needs: [test, security]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to production
        run: |
          # Scripts de deploy específicos
          echo "Deploying to production..."
```

### Monitoramento e Observabilidade

#### Configuração de Logging
```typescript
// lib/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

export { logger };
```

#### Health Check Endpoint
```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Verificar conexão com banco
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version,
      uptime: process.uptime(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: 'Database connection failed',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
```

### Configuração de Husky

#### Pre-commit Hook
```bash
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Executar lint-staged
npx lint-staged

# Verificar tipos TypeScript
npm run type-check

# Executar testes relacionados aos arquivos alterados
npm run test -- --passWithNoTests --findRelatedTests
```

#### Lint-staged Configuration
```javascript
// .lintstagedrc.js
module.exports = {
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write',
  ],
  '*.{json,md,yml,yaml}': [
    'prettier --write',
  ],
  '*.{css,scss}': [
    'prettier --write',
  ],
};
```

## 📝 Documentação

### Arquivos de Documentação Obrigatórios
Manter atualizados os seguintes arquivos após cada alteração significativa:

#### Documentação Principal
- `README.md`: Visão geral, instalação e uso básico
- `CHANGELOG.md`: Registro detalhado de alterações e versões
- `CONTRIBUTING.md`: Guia completo de contribuição
- `LICENSE.md`: Termos de licenciamento do projeto
- `CODE_OF_CONDUCT.md`: Diretrizes de conduta da comunidade

#### Templates e Guias
- `.github/ISSUE_TEMPLATE.md`: Modelo para reportar problemas
- `.github/PULL_REQUEST_TEMPLATE.md`: Modelo para pull requests
- `.github/SECURITY.md`: Política de segurança

#### Documentação Técnica
- `docs/`: Documentação técnica detalhada
  - `docs/api/`: Documentação da API
    - `docs/api/authentication.md`: Autenticação e autorização
    - `docs/api/endpoints.md`: Endpoints disponíveis
    - `docs/api/examples.md`: Exemplos de uso
  - `docs/user-guide/`: Guia do usuário
    - `docs/user-guide/getting-started.md`: Primeiros passos
    - `docs/user-guide/features.md`: Funcionalidades
    - `docs/user-guide/troubleshooting.md`: Solução de problemas
  - `docs/dev-guide/`: Guia de desenvolvimento
    - `docs/dev-guide/setup.md`: Configuração do ambiente
    - `docs/dev-guide/architecture.md`: Arquitetura do sistema
    - `docs/dev-guide/database.md`: Estrutura do banco de dados
    - `docs/dev-guide/deployment.md`: Processo de deploy
  - `docs/components/`: Documentação de componentes
    - `docs/components/ui-components.md`: Componentes de UI
    - `docs/components/business-components.md`: Componentes de negócio

**⚠️ IMPORTANTE**: A atualização destes arquivos é obrigatória e deve ser feita sempre que houver mudanças significativas no projeto.

### Documentação de Componentes

#### Storybook (Recomendado)
```bash
# Instalar Storybook
npx storybook@latest init

# Executar Storybook
npm run storybook

# Build do Storybook
npm run build-storybook
```

#### Exemplo de Story
```typescript
// stories/Button.stories.ts
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/ui/button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: { type: 'select' },
      options: ['default', 'sm', 'lg', 'icon'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Button',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Delete',
  },
};
```

### Documentação de API

#### OpenAPI/Swagger
```typescript
// lib/swagger.ts
import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: 'app/api',
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Koerner 360 API',
        version: '1.0.0',
        description: 'API para sistema de gestão de feedback e avaliações',
      },
      servers: [
        {
          url: 'http://localhost:3000/api',
          description: 'Servidor de desenvolvimento',
        },
      ],
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  });
  return spec;
};
```

#### Documentação de Endpoint
```typescript
/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Lista todos os usuários
 *     tags: [Usuários]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Itens por página
 *     responses:
 *       200:
 *         description: Lista de usuários retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Usuario'
 *                 paginacao:
 *                   $ref: '#/components/schemas/Paginacao'
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
export async function GET(request: NextRequest) {
  // Implementação
}
```

### Comentários de Código
```typescript
/**
 * Função para calcular a média das avaliações
 * @param avaliacoes - Array de avaliações
 * @returns Média calculada ou 0 se não houver avaliações
 */
function calcularMediaAvaliacoes(avaliacoes: Avaliacao[]): number {
  if (avaliacoes.length === 0) return 0;
  
  const soma = avaliacoes.reduce((acc, avaliacao) => acc + avaliacao.nota, 0);
  return soma / avaliacoes.length;
}
```

### JSDoc para Componentes
```typescript
/**
 * Componente para exibir lista de usuários com paginação e filtros
 * 
 * @param usuarios - Array de usuários a serem exibidos
 * @param onEdit - Callback executado ao editar um usuário
 * @param onDelete - Callback executado ao excluir um usuário
 * @param loading - Estado de carregamento da lista
 * @param error - Mensagem de erro, se houver
 * 
 * @example
 * ```tsx
 * <ListaUsuarios 
 *   usuarios={usuarios}
 *   loading={isLoading}
 *   error={error}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 * />
 * ```
 * 
 * @example
 * ```tsx
 * // Com filtros personalizados
 * <ListaUsuarios 
 *   usuarios={usuariosFiltrados}
 *   filtros={{
 *     tipo: 'admin',
 *     ativo: true
 *   }}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 * />
 * ```
 */
export function ListaUsuarios({ 
  usuarios, 
  onEdit, 
  onDelete, 
  loading = false,
  error = null,
  filtros
}: ListaUsuariosProps) {
  // Implementação
}
```

### Documentação de Hooks
```typescript
/**
 * Hook para gerenciar estado de usuários com operações CRUD
 * 
 * @param opcoes - Opções de configuração do hook
 * @param opcoes.autoCarregar - Se deve carregar dados automaticamente
 * @param opcoes.intervaloAtualizacao - Intervalo para atualização automática (ms)
 * 
 * @returns Objeto com estado e funções para manipular usuários
 * 
 * @example
 * ```tsx
 * function ComponenteUsuarios() {
 *   const {
 *     usuarios,
 *     carregando,
 *     erro,
 *     criarUsuario,
 *     atualizarUsuario,
 *     excluirUsuario,
 *     recarregar
 *   } = useUsuarios({ autoCarregar: true });
 * 
 *   const handleCriar = async (dados: UsuarioFormData) => {
 *     try {
 *       await criarUsuario(dados);
 *       toast.success('Usuário criado com sucesso!');
 *     } catch (error) {
 *       toast.error('Erro ao criar usuário');
 *     }
 *   };
 * 
 *   return (
 *     <div>
 *       {carregando && <Loading />}
 *       {erro && <ErrorMessage message={erro} />}
 *       <ListaUsuarios usuarios={usuarios} onEdit={atualizarUsuario} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useUsuarios(opcoes: UseUsuariosOpcoes = {}): UseUsuariosReturn {
  // Implementação
}
```

### Documentação de Utilitários
```typescript
/**
 * Formata um CPF para exibição com máscara
 * 
 * @param cpf - CPF sem formatação (apenas números)
 * @returns CPF formatado no padrão XXX.XXX.XXX-XX
 * 
 * @throws {Error} Quando o CPF não possui 11 dígitos
 * 
 * @example
 * ```typescript
 * formatarCPF('12345678901'); // '123.456.789-01'
 * formatarCPF('123456789'); // Throws Error: CPF deve ter 11 dígitos
 * ```
 */
export function formatarCPF(cpf: string): string {
  if (cpf.length !== 11) {
    throw new Error('CPF deve ter 11 dígitos');
  }
  
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Valida se um CPF é válido usando o algoritmo oficial
 * 
 * @param cpf - CPF a ser validado (com ou sem formatação)
 * @returns true se o CPF for válido, false caso contrário
 * 
 * @example
 * ```typescript
 * validarCPF('123.456.789-01'); // false (CPF inválido)
 * validarCPF('11144477735'); // true (CPF válido)
 * validarCPF('12345678901'); // false (CPF inválido)
 * ```
 */
export function validarCPF(cpf: string): boolean {
  // Implementação da validação
}
```

## 🔄 Versionamento

### Versionamento
- **MAJOR**: Mudanças incompatíveis
- **MINOR**: Novas funcionalidades compatíveis
- **PATCH**: Correções de bugs

#### Scripts de Versionamento
- `npm run version:patch` - Incrementa versão patch (correções de bugs)
- `npm run version:minor` - Incrementa versão minor (novas funcionalidades)
- `npm run version:major` - Incrementa versão major (breaking changes)

### 📋 Controle de Versionamento

**REGRA CRÍTICA**: Todas as versões devem estar sincronizadas entre os arquivos do projeto.

#### Arquivos que Devem Estar Sincronizados

1. **package.json** - Versão principal do projeto
2. **CHANGELOG.md** - Histórico de versões e alterações
3. **build-info.json** - Informações de build geradas automaticamente
4. **src/lib/build-info.ts** - Informações de build para a aplicação

#### Processo de Atualização de Versão

**SEQUÊNCIA OBRIGATÓRIA**:

1. **Atualizar package.json**:
   ```bash
   # Para correções de bugs
   npm run version:patch
   
   # Para novas funcionalidades
   npm run version:minor
   
   # Para mudanças incompatíveis
   npm run version:major
   ```

2. **Atualizar informações de build**:
   ```bash
   npm run build:info
   ```

3. **Verificar sincronização**:
   ```bash
   # Verificar versão no package.json
   node -p "require('./package.json').version"
   
   # Verificar se CHANGELOG.md tem a versão correspondente
   grep -n "\[$(node -p "require('./package.json').version")\]" CHANGELOG.md
   ```

4. **Commit das alterações**:
   ```bash
   git add .
   git commit -m "chore: atualiza versão para $(node -p "require('./package.json').version")"
   ```

#### Verificação de Consistência

**CHECKLIST DE VERSIONAMENTO**:

- [ ] Versão no `package.json` está correta
- [ ] Entrada correspondente existe no `CHANGELOG.md`
- [ ] `build-info.json` foi atualizado com `npm run build:info`
- [ ] `src/lib/build-info.ts` foi gerado automaticamente
- [ ] Todas as alterações foram commitadas
- [ ] Tag de versão foi criada (se aplicável)

#### Comandos de Verificação

```bash
# Verificar versão atual
node -p "require('./package.json').version"

# Verificar última entrada do CHANGELOG
head -20 CHANGELOG.md | grep -E "\[\d+\.\d+\.\d+\]"

# Verificar informações de build
cat build-info.json | grep version

# Verificar se há mudanças não commitadas
git status --porcelain
```

#### Resolução de Problemas de Versionamento

**Problema**: Versão no package.json diferente do CHANGELOG.md
**Solução**:
1. Identificar qual versão está correta
2. Atualizar o arquivo inconsistente
3. Executar `npm run build:info`
4. Fazer commit das correções

**Problema**: build-info.json desatualizado
**Solução**:
```bash
npm run build:info
git add build-info.json src/lib/build-info.ts
git commit -m "chore: atualiza informações de build"
```

**Problema**: CHANGELOG.md sem entrada para versão atual
**Solução**:
1. Adicionar entrada manual no CHANGELOG.md
2. Seguir formato padrão: `## [X.Y.Z] - YYYY-MM-DD`
3. Documentar as alterações realizadas
4. Fazer commit da atualização
- **IMPORTANTE**: Sempre executar o fluxo de build após versionamento
- Documentar todas as mudanças significativas no CHANGELOG.md

### Changelog
- Manter `CHANGELOG.md` atualizado
- Usar formato Keep a Changelog
- Documentar todas as mudanças significativas

## 🛡️ Segurança

### Boas Práticas
- Nunca expor secrets em código
- Validar todas as entradas
- Usar HTTPS em produção
- Sanitizar dados do usuário
- Implementar rate limiting

### Variáveis de Ambiente
```env
# .env.local
NEXTAUTH_SECRET=koerner360-secret-key-development-only
NEXTAUTH_URL=http://localhost:3000
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/koerner360?schema=public"
```

## 📋 Checklist de Desenvolvimento

### Antes de Fazer Commit
- [ ] **Build executado com sucesso** (`npm run build`)
- [ ] **Zero erros de TypeScript** (`npx tsc --noEmit`)
- [ ] **Zero erros de ESLint** (`npm run lint`) - warnings são aceitáveis
- [ ] **Nenhum tipo `any` no código**
- [ ] **Variáveis declaradas com `const` quando possível**
- [ ] **Imports não utilizados removidos**
- [ ] **Variáveis não utilizadas removidas**
- [ ] **Dependências de hooks completas**
- [ ] **Tipos de componentes UI específicos**
- [ ] Código formatado com Prettier
- [ ] Testes passando
- [ ] Documentação atualizada
- [ ] Changelog atualizado (se necessário)

### Antes de Fazer Deploy
- [ ] Build de produção funcionando
- [ ] Testes de integração passando
- [ ] Variáveis de ambiente configuradas
- [ ] Migrations aplicadas
- [ ] Backup do banco de dados

## 🤝 Contribuição

### Fluxo de Trabalho
1. Criar branch feature/fix
2. Desenvolver seguindo as regras
3. Fazer commit com mensagem descritiva
4. Abrir Pull Request
5. Code review
6. Merge após aprovação

### Mensagens de Commit
```
feat: adiciona sistema de avaliações 360°
fix: corrige erro de paginação na lista de usuários
docs: atualiza documentação da API
chore: atualiza dependências
```

---

---

**Última atualização**: 15/08/2025 21:21:43  
**Versão das regras**: 2.0.0

### Histórico de Versões das Regras
- **v2.0.0** (15/08/2025): 
  - Atualização completa para Next.js 15 com Turbopack
  - Migração para Tailwind CSS 4
  - Atualização para Auth.js v5 (NextAuth.js v5)
  - Adicionadas configurações avançadas de testes (Jest, Testing Library, Playwright)
  - Implementação de CI/CD com GitHub Actions
  - Configuração de monitoramento e observabilidade
  - Documentação expandida com Storybook e OpenAPI/Swagger
  - Otimizações de performance e bundle analysis
  - Configuração avançada de Husky e lint-staged
  - Diretrizes de segurança aprimoradas
- **v1.3.0** (15/08/2025): Adicionada seção completa de controle de versionamento com sincronização de arquivos
- **v1.2.0** (15/08/2025): Adicionada seção de manipulação de data e hora com comandos PowerShell obrigatórios
- **v1.1.0** (15/08/2025): Adicionada seção completa de prevenção de erros de build
- **v1.0.0** (Agosto 2024): Versão inicial das regras do projeto

### Contribuições e Feedback
Para dúvidas, sugestões ou melhorias sobre estas regras:
- Abra uma issue no repositório do projeto
- Consulte a documentação em `docs/`
- Entre em contato com a equipe de desenvolvimento
- Participe das discussões da comunidade

### Próximas Atualizações Planejadas
- Integração com ferramentas de análise de código (SonarQube)
- Configuração de testes de acessibilidade automatizados
- Implementação de métricas de performance em tempo real
- Documentação interativa com exemplos ao vivo
- Configuração de ambientes de desenvolvimento com Docker

**Mantenha-se sempre atualizado com as últimas versões das tecnologias e estas regras para garantir a qualidade e consistência do projeto Koerner 360.**


### ⚠️ Regras Críticas para Manipulação de Dados

**REGRA OBRIGATÓRIA**: É estritamente proibido apagar dados do banco de dados sem autorização prévia e documentada, independentemente do ambiente (desenvolvimento, teste ou produção).

#### Procedimentos Obrigatórios

1. **Backup Completo**
   - Realizar backup completo do banco antes de qualquer operação de modificação
   - Armazenar backup em local seguro e documentado
   - Validar integridade do backup antes de prosseguir

2. **Documentação**
   - Registrar detalhadamente a operação a ser realizada
   - Documentar motivo da modificação
   - Manter log de todas as alterações

3. **Autorização**
   - Obter autorização formal do responsável pelo projeto
   - Validar impacto da operação com a equipe
   - Confirmar necessidade real da modificação

4. **Ambiente Seguro**
   - Utilizar ambiente isolado para testes
   - Validar scripts de modificação
   - Ter plano de rollback documentado

**LEMBRE-SE**: Dados são o ativo mais valioso do sistema. Sua preservação é prioridade máxima.


## 📚 Referências de Documentação

### Documentação Oficial das Tecnologias
Sempre seguir a documentação oficial das tecnologias principais utilizadas neste projeto:

#### Next.js 15
- **Documentação Principal**: [Next.js Documentation](https://nextjs.org/docs)
- **App Router**: [App Router Guide](https://nextjs.org/docs/app)
- **API Routes**: [Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- **Server Components**: [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- **Data Fetching**: [Data Fetching Guide](https://nextjs.org/docs/app/building-your-application/data-fetching)
- **Turbopack**: [Turbopack Documentation](https://turbo.build/pack/docs)
- **Performance**: [Optimizing Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- **Deployment**: [Deployment Guide](https://nextjs.org/docs/app/building-your-application/deploying)

#### Prisma ORM
- **Documentação Principal**: [Prisma Documentation](https://www.prisma.io/docs)
- **Next.js Integration**: [Prisma with Next.js](https://www.prisma.io/docs/guides/nextjs)
- **Database Setup**: [Database Connectors](https://www.prisma.io/docs/concepts/database-connectors)
- **Migrations**: [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- **Query Optimization**: [Query Optimization](https://www.prisma.io/docs/guides/performance-and-optimization)
- **Type Safety**: [Generated Types](https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/generating-prisma-client)
- **Best Practices**: [Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization/query-optimization-performance)

#### Tailwind CSS 4
- **Documentação Principal**: [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- **Installation**: [Installation Guide](https://tailwindcss.com/docs/installation)
- **Utility Classes**: [Utility-First Fundamentals](https://tailwindcss.com/docs/utility-first)
- **Configuration**: [Configuration](https://tailwindcss.com/docs/configuration)
- **Custom Styles**: [Adding Custom Styles](https://tailwindcss.com/docs/adding-custom-styles)
- **Responsive Design**: [Responsive Design](https://tailwindcss.com/docs/responsive-design)
- **Dark Mode**: [Dark Mode](https://tailwindcss.com/docs/dark-mode)
- **Performance**: [Optimizing for Production](https://tailwindcss.com/docs/optimizing-for-production)

#### shadcn/ui
- **Documentação Principal**: [shadcn/ui Documentation](https://ui.shadcn.com/docs)
- **Installation**: [Installation Guide](https://ui.shadcn.com/docs/installation)
- **Components**: [Components Library](https://ui.shadcn.com/docs/components)
- **Theming**: [Theming Guide](https://ui.shadcn.com/docs/theming)
- **Customization**: [Customization](https://ui.shadcn.com/docs/components-json)
- **CLI**: [CLI Usage](https://ui.shadcn.com/docs/cli)
- **Examples**: [Examples](https://ui.shadcn.com/examples)

#### Auth.js (NextAuth.js v5)
- **Documentação Principal**: [Auth.js Documentation](https://authjs.dev)
- **Getting Started**: [Getting Started Guide](https://authjs.dev/getting-started)
- **Next.js Integration**: [NextAuth.js](https://authjs.dev/getting-started/installation?framework=next.js)
- **Authentication**: [Authentication Providers](https://authjs.dev/getting-started/providers)
- **Session Management**: [Session Management](https://authjs.dev/guides/basics/sessions)
- **Middleware**: [Middleware](https://authjs.dev/guides/basics/securing-pages-and-api-routes)
- **Database Adapters**: [Database Adapters](https://authjs.dev/getting-started/adapters)
- **Security**: [Security Considerations](https://authjs.dev/guides/basics/security)

#### ESLint
- **Documentação Principal**: [ESLint Documentation](https://eslint.org/docs/latest/)
- **User Guide**: [User Guide](https://eslint.org/docs/latest/use/)
- **Rules Reference**: [Rules Reference](https://eslint.org/docs/latest/rules/)
- **Configuration**: [Configuration Guide](https://eslint.org/docs/latest/use/configure/)
- **TypeScript ESLint**: [TypeScript ESLint](https://typescript-eslint.io/)
- **React ESLint**: [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react)
- **Next.js ESLint**: [ESLint in Next.js](https://nextjs.org/docs/app/building-your-application/configuring/eslint)

#### TypeScript
- **Documentação Principal**: [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- **Handbook**: [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- **React TypeScript**: [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- **Next.js TypeScript**: [TypeScript in Next.js](https://nextjs.org/docs/app/building-your-application/configuring/typescript)

#### PostgreSQL
- **Documentação Principal**: [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- **Performance Tuning**: [Performance Tips](https://www.postgresql.org/docs/current/performance-tips.html)
- **Best Practices**: [PostgreSQL Best Practices](https://wiki.postgresql.org/wiki/Don%27t_Do_This)

### Recursos Adicionais

#### Ferramentas de Desenvolvimento
- **React Developer Tools**: [Browser Extension](https://react.dev/learn/react-developer-tools)
- **Prisma Studio**: [Database Browser](https://www.prisma.io/studio)
- **Tailwind CSS IntelliSense**: [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

#### Comunidade e Suporte
- **Next.js GitHub**: [Next.js Repository](https://github.com/vercel/next.js)
- **Prisma GitHub**: [Prisma Repository](https://github.com/prisma/prisma)
- **Tailwind CSS GitHub**: [Tailwind CSS Repository](https://github.com/tailwindlabs/tailwindcss)
- **shadcn/ui GitHub**: [shadcn/ui Repository](https://github.com/shadcn-ui/ui)
- **Auth.js GitHub**: [Auth.js Repository](https://github.com/nextauthjs/next-auth)

#### Blogs e Tutoriais
- **Vercel Blog**: [Next.js Updates](https://vercel.com/blog)
- **Prisma Blog**: [Database Best Practices](https://www.prisma.io/blog)
- **Tailwind CSS Blog**: [Design System Tips](https://tailwindcss.com/blog)

### Melhores Práticas
- Sempre verificar a compatibilidade da versão mais recente
- Seguir padrões e práticas recomendadas
- Consultar implementações de exemplo
- Revisar diretrizes de segurança
- Manter-se atualizado com mudanças nas APIs
- Participar das comunidades para suporte

### Checklist de Referências
- [ ] Documentação oficial consultada
- [ ] Versões compatíveis verificadas
- [ ] Exemplos de implementação revisados
- [ ] Diretrizes de segurança seguidas
- [ ] Melhores práticas aplicadas
- [ ] Comunidade consultada para dúvidas específicas
