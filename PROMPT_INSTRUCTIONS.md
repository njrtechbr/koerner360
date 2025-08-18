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

## MCPs Disponíveis e Uso Prioritário

### 1. **Desktop Commander** (PRINCIPAL - Operações de Sistema)
**Uso obrigatório para**: Manipulação de arquivos, diretórios e processos
```bash
# Comandos essenciais:
- read_file: Ler arquivos (SEMPRE preferir sobre cat/type)
- write_file: Escrever em chunks de 25-30 linhas (OBRIGATÓRIO)
- list_directory: Listar conteúdo (preferir sobre ls/dir)
- search_files: Buscar arquivos por nome
- search_code: Buscar código usando ripgrep (MUITO EFICIENTE)
- edit_block: Edições cirúrgicas precisas
- create_directory: Criar diretórios
- move_file: Mover/renomear arquivos
```

**Padrão obrigatório para escrita**:
```typescript
// 1. PRIMEIRO chunk (rewrite)
await write_file("arquivo.tsx", chunk1, {mode: 'rewrite'})
// 2. DEMAIS chunks (append)
await write_file("arquivo.tsx", chunk2, {mode: 'append'})
await write_file("arquivo.tsx", chunk3, {mode: 'append'})
```

### 2. **Context7** (Documentação de Bibliotecas)
**Uso**: Obter documentação atualizada e específica
```bash
# Fluxo obrigatório:
1. resolve_library_id("next.js") → /vercel/next.js
2. get_library_docs("/vercel/next.js", {topic: "app router", tokens: 5000})
```

### 3. **Sequential Thinking** (Problemas Complexos)
**Uso**: Análise estruturada para debugging e arquitetura
```bash
# Quando usar OBRIGATORIAMENTE:
- Problemas multi-etapas
- Debugging complexo
- Planejamento de features grandes
- Análise de performance
```

### 4. **Prisma Local + PostgreSQL** (Banco de Dados)
**Uso**: Operações diretas no banco, migrações, análise de performance

### 5. **Gemini MCP** (IA Generativa)
**Uso**: Integração com Google Gemini para tarefas de IA generativa
```bash
# Principais operações:
- Geração de conteúdo e documentação
- Análise e review de código
- Tradução e localização
- Sugestões de melhorias
- Criação de testes automatizados
```

**Exemplo de uso**:
```typescript
// Gerar documentação JSDoc
await gemini_generate({
  prompt: "Documente este componente React",
  context: componentCode
})

// Code review automatizado
await gemini_analyze({
  code: sourceCode,
  task: "review",
  focus: ["performance", "security"]
})
```

## Padrões de Desenvolvimento Críticos

### Nomenclatura (OBRIGATÓRIA)
- **Arquivos/Diretórios**: kebab-case (user-profile.tsx)
- **Variáveis/Funções**: camelCase (nomeUsuario)
- **Classes/Interfaces/Types**: PascalCase (Usuario, TipoUsuario)
- **Constantes**: UPPER_SNAKE_CASE (API_BASE_URL)
- **Banco (Prisma)**: snake_case (tabelas e campos)

### API Routes (Padrão Obrigatório)
```ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado', timestamp: new Date().toISOString() },
        { status: 401 }
      );
    }
    
    const data = await prisma.usuario.findMany({
      select: { id: true, nome: true, email: true, tipo: true, ativo: true }
    });
    
    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno', timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
```

### Validação Zod (OBRIGATÓRIA)
```ts
import { z } from 'zod';

export const usuarioSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  email: z.string().email('Email inválido').max(255),
  tipo: z.enum(['admin', 'supervisor', 'attendant']),
  ativo: z.boolean().default(true),
  senha: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres').optional()
});

export type UsuarioFormData = z.infer<typeof usuarioSchema>;
```

## Autenticação e Autorização (Auth.js v5)
- **Perfis**: admin (total), supervisor (gerencia atendentes/avaliações), attendant (próprias avaliações)
- **Middleware**: proteger todas as rotas exceto públicas (/login, /changelog, /api/auth/*)

## Data e Hora (CRÍTICO)
**OBRIGATÓRIO**: IA não acessa relógio do sistema. Para timestamps, usar PowerShell:
```bash
Get-Date -Format "dd/MM/yyyy HH:mm:ss"  # Data/hora completa
Get-Date -Format "o"                    # ISO 8601
```

## Regras Críticas TypeScript/ESLint
- **PROIBIDO**: `any` (usar `unknown`, tipos específicos)
- **OBRIGATÓRIO**: `const` (usar `let` apenas para reatribuição)
- **OBRIGATÓRIO**: dependências completas em hooks
- **OBRIGATÓRIO**: tipagem específica para props/variantes
- **OBRIGATÓRIO**: remover imports/variáveis não utilizados

## Fluxo Build Obrigatório
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

## Instruções Específicas para IA
1. **SEMPRE usar MCPs** para operações de arquivo (Desktop Commander prioritário)
2. **Analisar** contexto e requisitos com Sequential Thinking se complexo
3. **Verificar** aderência aos padrões TypeScript/ESLint
4. **Implementar** seguindo convenções de segurança
5. **Documentar** alterações com descrição clara
6. **Testar** quando possível (unit/integração)
7. **Utilizar Gemini MCP** para:
   - Geração automática de documentação
   - Code review e análise de qualidade
   - Tradução para pt-BR
   - Criação de testes
   - Sugestões de otimização

---
**Responsabilidade**: manter qualidade, consistência e evolução do Koerner 360, priorizando segurança, performance e UX com uso otimizado dos MCPs.
