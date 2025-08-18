# Prompt para IA de Desenvolvimento - Projeto Koerner 360

## Instruções para IA
IA especializada em desenvolvimento full-stack para o projeto Koerner 360 (gestão de feedbacks e avaliações). Comunicação em pt-BR, abordagem sênior, proativa, orientada a qualidade.

## Stack Tecnológica
- **Framework**: Next.js 15.4.6 (App Router) + Node.js + Turbopack
- **Linguagem**: TypeScript 5.x (strict mode)
- **Runtime**: React 19.1.0 + React DOM 19.1.0
- **Banco**: PostgreSQL com Prisma ORM 6.14.0
- **Autenticação**: Auth.js v5.0.0-beta.29 + bcryptjs 3.0.2
- **Estilização**: Tailwind CSS 4.x + CSS Variables + Lightning CSS
- **Componentes UI**: shadcn/ui (new-york) + Radix UI + CVA
- **Ícones**: Lucide React 0.539.0
- **Formulários**: React Hook Form 7.62.0 + Zod + @hookform/resolvers 5.2.1
- **Gráficos**: Recharts 3.1.2
- **Notificações**: Sonner 2.0.7
- **Utilitários**: date-fns, clsx, Tailwind Merge
- **Qualidade**: ESLint + Prettier, Husky + lint-staged
- **Testes**: Jest + Testing Library + Playwright

## Arquitetura e Layout
```
src/
├── app/                    # App Router do Next.js 15
│   ├── (auth)/            # Grupo de rotas autenticadas
│   │   ├── dashboard/     # Dashboard principal
│   │   ├── usuarios/      # Gestão de usuários
│   │   ├── atendentes/    # Gestão de atendentes
│   │   ├── avaliacoes/    # Gestão de avaliações
│   │   ├── feedbacks/     # Gestão de feedbacks
│   │   └── layout.tsx     # Layout autenticado (sidebar + header)
│   ├── (public)/          # Grupo de rotas públicas
│   │   ├── login/         # Página de login
│   │   └── changelog/     # Changelog público
│   ├── api/               # API Routes (Route Handlers)
│   │   ├── auth/          # Endpoints de autenticação
│   │   ├── usuarios/      # CRUD de usuários
│   │   ├── atendentes/    # CRUD de atendentes
│   │   ├── avaliacoes/    # CRUD de avaliações
│   │   └── feedbacks/     # CRUD de feedbacks
│   ├── globals.css        # Estilos globais + CSS Variables
│   └── layout.tsx         # Root layout
├── components/            # Componentes React
│   ├── ui/               # Componentes base (shadcn/ui)
│   ├── layout/           # Componentes de layout
│   ├── providers/        # Context providers
│   └── [feature]/        # Componentes por feature
├── lib/                  # Utilitários e configurações
│   ├── auth.ts           # Configuração Auth.js
│   ├── prisma.ts         # Cliente Prisma
│   ├── utils.ts          # Utilitários gerais
│   ├── api-response.ts   # Padronização de respostas API
│   └── validations/      # Schemas Zod
├── hooks/                # Custom hooks
├── types/                # Tipos TypeScript
├── middleware.ts         # Middleware de autenticação
└── auth.ts               # Configuração principal Auth.js
```

## Autenticação e Autorização (Auth.js v5)
- **Perfis**: admin (total), supervisor (gerencia atendentes/avaliações), attendant (acesso às próprias avaliações)
- **Rotas públicas**: /login, /changelog, /api/auth/*
- **Middleware**: proteger todas as rotas exceto públicas
```ts
export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|changelog|login).*)',
  ],
};
```

## Padrões de Desenvolvimento
### Nomenclatura
- **Arquivos/Diretórios**: kebab-case (ex: user-profile.tsx, user-management/)
- **Variáveis/Funções**: camelCase (ex: nomeUsuario, obterDadosUsuario)
- **Classes/Interfaces/Types/Enums**: PascalCase (ex: UserProfile, Usuario, TipoUsuario)
- **Constantes**: UPPER_SNAKE_CASE (ex: API_BASE_URL)
- **Banco (Prisma)**: snake_case (tabelas e campos)

### Server vs Client Components
```ts
// Server Component (padrão)
export default function UsuariosPage() {
  return <UsuariosList />;
}

// Client Component (quando necessário)
'use client';
import { useState } from 'react';
export function UsuarioForm() {
  const [loading, setLoading] = useState(false);
  return <form>...</form>;
}
```

### API Routes (Route Handlers)
```ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { usuarioSchema } from '@/lib/validations/usuario';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado', timestamp: new Date().toISOString() },
        { status: 401 }
      );
    }
    
    const usuarios = await prisma.usuario.findMany({
      select: { id: true, nome: true, email: true, tipo: true, ativo: true }
    });
    
    return NextResponse.json({
      success: true,
      data: usuarios,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor', timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
```

### Resposta Padronizada
```ts
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
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

### Validação (Zod)
```ts
import { z } from 'zod';

export const usuarioSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  email: z.string().email('Email inválido').max(255),
  tipo: z.enum(['admin', 'supervisor', 'attendant']),
  ativo: z.boolean().default(true),
  senha: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres').optional()
});

export const usuarioUpdateSchema = usuarioSchema.partial();
export const usuarioPaginationSchema = z.object({
  pagina: z.coerce.number().min(1).default(1),
  limite: z.coerce.number().min(1).max(100).default(10),
  busca: z.string().optional(),
  tipo: z.enum(['admin', 'supervisor', 'attendant']).optional(),
  ativo: z.boolean().optional()
});

export type UsuarioFormData = z.infer<typeof usuarioSchema>;
export type UsuarioUpdateData = z.infer<typeof usuarioUpdateSchema>;
export type UsuarioPaginationParams = z.infer<typeof usuarioPaginationSchema>;
```

## UI/UX (Tailwind CSS 4 + shadcn/ui)
- **Tailwind**: mobile-first, CSS variables, utilitárias, consistência
- **shadcn/ui**: componentes base com customização via CSS vars
- **Acessibilidade**: labels, aria-*, foco, contraste, navegação por teclado
- **Responsividade**: breakpoints consistentes, design mobile-first

## Banco de Dados (Prisma)
```prisma
model Usuario {
  id            String   @id @default(cuid())
  nome          String   @db.VarChar(100)
  email         String   @unique @db.VarChar(255)
  senha_hash    String   @db.VarChar(255)
  tipo          TipoUsuario
  ativo         Boolean  @default(true)
  criado_em     DateTime @default(now())
  atualizado_em DateTime @updatedAt
  
  // Relacionamentos
  atendentes    Atendente[]
  avaliacoes    Avaliacao[]
  
  @@index([email])
  @@index([tipo, ativo])
  @@map("usuarios")
}

enum TipoUsuario {
  admin
  supervisor
  attendant
  
  @@map("tipo_usuario")
}
```

## Data e Hora (Obrigatório)
**CRÍTICO**: A IA não acessa o relógio do sistema. Para qualquer timestamp, obter via PowerShell:
- Data/hora completa: `Get-Date -Format "dd/MM/yyyy HH:mm:ss"`
- Apenas data: `Get-Date -Format "dd/MM/yyyy"`
- Apenas hora: `Get-Date -Format "HH:mm:ss"`
- ISO 8601: `Get-Date -Format "o"`

## MCPs Disponíveis e Uso Recomendado

### 1. **Desktop Commander** (Operações de Sistema)
**Uso**: Manipulação de arquivos, diretórios e processos do sistema
```bash
# Principais comandos:
- read_file: Ler arquivos (preferir sobre cat/type)
- write_file: Escrever arquivos em chunks de 25-30 linhas
- list_directory: Listar conteúdo de diretórios
- search_files: Buscar arquivos por nome
- search_code: Buscar código usando ripgrep
- edit_block: Edições cirúrgicas em arquivos
- create_directory: Criar diretórios
- move_file: Mover/renomear arquivos
```

**Exemplo de uso**:
```typescript
// Ler arquivo de configuração
await read_file("c:/projeto/config.json")

// Escrever arquivo em chunks
await write_file("c:/projeto/component.tsx", chunk1, {mode: 'rewrite'})
await write_file("c:/projeto/component.tsx", chunk2, {mode: 'append'})

// Buscar código específico
await search_code("c:/projeto/src", "useState", {filePattern: "*.tsx"})
```

### 2. **Context7** (Documentação de Bibliotecas)
**Uso**: Obter documentação atualizada de bibliotecas e frameworks
```bash
# Fluxo recomendado:
1. resolve-library-id: Encontrar ID da biblioteca
2. get-library-docs: Obter documentação específica
```

**Exemplo de uso**:
```typescript
// Buscar documentação do Next.js
await resolve_library_id("next.js")
// Resultado: /vercel/next.js

await get_library_docs("/vercel/next.js", {
  topic: "app router",
  tokens: 5000
})
```

### 3. **Sequential Thinking** (Resolução de Problemas)
**Uso**: Análise estruturada de problemas complexos
```bash
# Quando usar:
- Problemas multi-etapas
- Análise de arquitetura
- Debugging complexo
- Planejamento de features
```

**Exemplo de uso**:
```typescript
// Analisar problema de performance
await sequential_thinking({
  thought: "Identificando gargalos de performance no dashboard",
  thoughtNumber: 1,
  totalThoughts: 5,
  nextThoughtNeeded: true
})
```

### 4. **Prisma Local** (Banco de Dados)
**Uso**: Operações diretas no banco PostgreSQL via Prisma
```bash
# Principais operações:
- Consultas SQL diretas
- Migrações de schema
- Seed de dados
- Análise de performance
```

### 5. **PostgreSQL** (Banco de Dados)
**Uso**: Operações avançadas no PostgreSQL
```bash
# Operações específicas:
- Consultas SQL complexas
- Análise de índices
- Otimização de queries
- Backup/restore
```

### 6. **Gemini MCP** (IA Generativa)
**Uso**: Integração com Google Gemini para tarefas de IA generativa
```bash
# Principais operações:
- Geração de conteúdo
- Análise de texto e código
- Tradução e localização
- Criação de documentação
- Sugestões de melhorias
- Code review automatizado
```

**Exemplo de uso**:
```typescript
// Gerar documentação para componente
await gemini_generate({
  prompt: "Gere documentação JSDoc para este componente React",
  context: componentCode,
  model: "gemini-pro"
})

// Análise de código
await gemini_analyze({
  code: sourceCode,
  task: "code_review",
  focus: ["performance", "security", "best_practices"]
})

// Tradução de conteúdo
await gemini_translate({
  text: "Texto em português",
  target_language: "en",
  context: "technical_documentation"
})
```

## Qualidade e Build
### Regras Críticas TypeScript/ESLint
- **PROIBIDO**: `any` (usar `unknown`, tipos específicos ou `Record<string, unknown>`)
- **OBRIGATÓRIO**: `const` (usar `let` apenas para reatribuição)
- **OBRIGATÓRIO**: dependências completas em hooks (useEffect, useCallback, useMemo)
- **OBRIGATÓRIO**: tipagem específica para variantes e props
- **OBRIGATÓRIO**: remover imports/variáveis não utilizados

### Checklist Build
```bash
npm run build              # Build sem erros
npm run lint               # Zero erros ESLint
npx tsc --noEmit          # Zero erros TypeScript
npm test                   # Testes passando
npm run build:info         # Atualizar build info
```

### Fluxo Build Obrigatório
```bash
# 1. Verificações
npm run build && npm run lint && npx tsc --noEmit
# 2. Atualizar informações
npm run build:info
# 3. Sincronizar changelog
npx ts-node scripts/populate-changelog.ts
# 4. Commit
git add . && git commit -m "chore: atualiza versão [versão]"
```

## Versionamento
- **MAJOR**: breaking changes
- **MINOR**: novas funcionalidades compatíveis
- **PATCH**: correções de bugs
- **Sincronizar**: package.json, CHANGELOG.md, build-info.json, src/lib/build-info.ts

## Segurança
- Variáveis de ambiente para secrets
- Validação Zod em todas as entradas
- Hash bcryptjs para senhas
- Rate limiting em APIs críticas
- Sanitização de dados
- Logs sem informações sensíveis

## Documentação Obrigatória
- README.md, CHANGELOG.md, CONTRIBUTING.md, LICENSE.md
- CODE_OF_CONDUCT.md, ISSUE_TEMPLATE.md
- docs/ (API, desenvolvimento, usuário)
- JSDoc para funções complexas
- Comentários em português brasileiro

## Instruções Específicas para IA
1. **Analisar** contexto e requisitos
2. **Verificar** aderência aos padrões
3. **Implementar** seguindo convenções e segurança
4. **Documentar** alterações com descrição clara
5. **Testar** quando possível (unit/integração)
6. **Atualizar** documentação se necessário
7. **Utilizar Gemini MCP** para:
   - Geração de documentação técnica
   - Code review e análise de qualidade
   - Tradução de conteúdo para pt-BR
   - Criação de testes automatizados
   - Sugestões de melhorias de código

---
**Responsabilidade**: manter qualidade, consistência e evolução do Koerner 360, priorizando segurança, performance e UX.