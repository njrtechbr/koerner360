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

## 🚀 Build e Deploy

### Scripts Disponíveis
- `npm run dev` - Desenvolvimento com Turbopack
- `npm run build` - Build de produção
- `npm run build:info` - Gera informações de build
- `npm run version:patch/minor/major` - Versionamento automático

### Fluxo de Build Obrigatório
Ao fazer build para produção, SEMPRE seguir esta sequência:

1. **Garantir que o build foi executado com sucesso**
   ```bash
   npm run build
   ```
   - Verificar se não há erros de compilação
   - Confirmar que a pasta `.next` foi gerada corretamente

2. **Atualizar o CHANGELOG.md**
   ```bash
   npm run build:info
   ```
   - Gera informações de build atualizadas
   - Atualiza automaticamente o CHANGELOG.md

3. **Atualizar o banco de dados do changelog**
   ```bash
   npm run ts-node scripts/populate-changelog.ts
   ```
   - Sincroniza as mudanças do CHANGELOG.md com o banco de dados
   - Garante que a página `/changelog` reflita as atualizações

4. **Fazer commit das alterações**
   ```bash
   git add .
   git commit -m "chore: atualiza versão e changelog para [versão]"
   ```
   - Commitar todas as alterações geradas pelo processo de build
   - Usar mensagem de commit padronizada

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

### Semantic Versioning
- **MAJOR**: Mudanças incompatíveis
- **MINOR**: Novas funcionalidades compatíveis
- **PATCH**: Correções de bugs

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
- [ ] Código formatado com Prettier
- [ ] Sem erros de ESLint
- [ ] Tipos TypeScript corretos
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

**Última atualização**: Agosto 2025  
**Versão das regras**: 1.0.0

Para dúvidas ou sugestões sobre estas regras, abra uma issue no repositório.