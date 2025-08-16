# Regras do Projeto Koerner 360

## 📋 Visão Geral

Este documento define as regras e padrões de desenvolvimento para o projeto **Koerner 360**, um sistema de gestão de feedback e avaliações desenvolvido com Next.js, TypeScript e PostgreSQL.

## 🏗️ Arquitetura e Estrutura

### Stack Tecnológica
- **Framework**: Next.js 15 (App Router)
- **Linguagem**: TypeScript
- **Banco de Dados**: PostgreSQL com Prisma ORM
- **Autenticação**: NextAuth.js v5
- **Estilização**: Tailwind CSS
- **Componentes UI**: shadcn/ui
- **Ícones**: Lucide React
- **Formulários**: React Hook Form + Zod
- **Gráficos**: Recharts

### Estrutura de Diretórios
```
src/
├── app/                    # App Router do Next.js
│   ├── api/               # API Routes
│   ├── (auth)/            # Grupo de rotas autenticadas
│   └── (public)/          # Grupo de rotas públicas
├── components/            # Componentes React
│   ├── ui/               # Componentes base (shadcn/ui)
│   ├── layout/           # Componentes de layout
│   └── [feature]/        # Componentes específicos por funcionalidade
├── lib/                  # Utilitários e configurações
├── hooks/                # Custom hooks
├── types/                # Definições de tipos TypeScript
└── auth.ts              # Configuração do NextAuth
```

### Layout Principal
**REGRA OBRIGATÓRIA**: Todas as páginas do sistema devem utilizar o layout principal (`src/app/layout.tsx`), que inclui:
- Sidebar de navegação
- Header com informações do usuário
- Área de conteúdo principal
- Sistema de autenticação integrado

**EXCEÇÃO**: Apenas a página de login (`/login`) deve ficar fora do layout principal, utilizando seu próprio layout específico.

**Implementação**:
- Páginas autenticadas: Usar o layout padrão do App Router
- Página de login: Implementar layout próprio sem sidebar/header
- Componentes de layout: Reutilizar componentes em `src/components/layout/`

## 🎯 Padrões de Desenvolvimento

### 1. Nomenclatura e Convenções

#### Arquivos e Diretórios
- **Arquivos**: `kebab-case` (ex: `user-profile.tsx`)
- **Diretórios**: `kebab-case` (ex: `user-management/`)
- **Componentes**: `PascalCase` (ex: `UserProfile.tsx`)
- **Pages**: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`

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

### Níveis de Acesso
- **admin**: Acesso total ao sistema
- **supervisor**: Gerencia atendentes e suas avaliações
- **attendant**: Acesso apenas às próprias avaliações

### Middleware de Autenticação
```typescript
// middleware.ts
export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|changelog|login).*)',
  ],
};
```

### Rotas Públicas
- `/login`
- `/changelog`
- `/api/auth/*`

## 🎨 Estilização e UI

### Tailwind CSS
- Usar classes utilitárias do Tailwind
- Seguir sistema de design consistente
- Responsividade mobile-first

### Componentes shadcn/ui
- Usar componentes base do shadcn/ui
- Customizar através de CSS variables
- Manter consistência visual

### Tema e Cores
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  /* ... outras variáveis */
}
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
# Resultado: 15/01/2025 14:30:25

# Obter apenas data
Get-Date -Format "dd/MM/yyyy"
# Resultado: 15/01/2025

# Obter apenas hora
Get-Date -Format "HH:mm:ss"
# Resultado: 14:30:25

# Formato ISO 8601 para APIs
Get-Date -Format "o"
# Resultado: 2025-01-15T14:30:25.1234567-03:00
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
// IA recebe: "2025-01-15T14:30:25.1234567-03:00"
const timestamp = "2025-01-15T14:30:25.1234567-03:00";
const agora = new Date(timestamp);
```

## 🧪 Testes e Qualidade

### ESLint e Prettier
- Seguir configurações definidas em `.eslintrc.json`
- Formatação automática com Prettier
- Pre-commit hooks com Husky

### Estrutura de Testes
```typescript
// __tests__/components/MinhaComponente.test.tsx
import { render, screen } from '@testing-library/react';
import { MinhaComponente } from '@/components/MinhaComponente';

describe('MinhaComponente', () => {
  it('deve renderizar corretamente', () => {
    render(<MinhaComponente titulo="Teste" />);
    expect(screen.getByText('Teste')).toBeInTheDocument();
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
- `npm run dev` - Desenvolvimento com Turbopack
- `npm run build` - Build de produção
- `npm run build:info` - Gera informações de build
- `npm run version:patch/minor/major` - Versionamento automático

### Fluxo de Build Obrigatório
**SEQUÊNCIA OBRIGATÓRIA** - Sempre seguir esta ordem:

```bash
# 1. Verificar e corrigir erros de build
npm run build

# 2. Atualizar informações de build
npm run build:info

# 3. Sincronizar changelog com banco de dados
npx ts-node scripts/populate-changelog.ts

# 4. Adicionar alterações ao stage
git add .

# 5. Fazer commit das alterações
git commit -m "chore: atualiza versão e changelog para [versão] - [descrição das alterações]"
```

**⚠️ IMPORTANTE**: Este fluxo é obrigatório para manter a consistência entre o código, documentação e banco de dados.

### CI/CD Pipeline
- GitHub Actions para CI/CD
- Testes automatizados
- Deploy automático em produção
- Análise de segurança com Snyk

## 📝 Documentação

### Arquivos de Documentação Obrigatórios
Manter atualizados os seguintes arquivos após cada alteração significativa:
- `README.md`: Visão geral e instruções do projeto
- `CHANGELOG.md`: Registro de alterações e versões
- `CONTRIBUTING.md`: Guia de contribuição
- `LICENSE.md`: Termos de licenciamento
- `CODE_OF_CONDUCT.md`: Diretrizes de conduta
- `ISSUE_TEMPLATE.md`: Modelo para reportar problemas
- `docs/`: Documentação técnica detalhada

**⚠️ IMPORTANTE**: A atualização destes arquivos é obrigatória e deve ser feita sempre que houver mudanças significativas no projeto.

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
 * Componente para exibir lista de usuários com paginação
 * 
 * @example
 * ```tsx
 * <ListaUsuarios 
 *   usuarios={usuarios} 
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 * />
 * ```
 */
export function ListaUsuarios({ usuarios, onEdit, onDelete }: ListaUsuariosProps) {
  // Implementação
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

**Última atualização**: 15/08/2025 21:21:43  
**Versão das regras**: 1.3.0

### Histórico de Versões
- **v1.3.0** (15/08/2025): Adicionada seção completa de controle de versionamento com sincronização de arquivos
- **v1.2.0** (15/08/2025): Adicionada seção de manipulação de data e hora com comandos PowerShell obrigatórios
- **v1.1.0** (15/08/2025): Adicionada seção completa de prevenção de erros de build
- **v1.0.0** (Agosto 2024): Versão inicial das regras do projeto

Para dúvidas ou sugestões sobre estas regras, abra uma issue no repositório.