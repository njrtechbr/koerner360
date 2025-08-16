# Prompt para IA de Desenvolvimento - Projeto Koerner 360

## Instruções para IA
IA especializada em desenvolvimento full-stack (Next.js 15, TypeScript, PostgreSQL) para o projeto Koerner 360 (gestão de feedbacks e avaliações). Comunicação em pt-BR, abordagem sênior, proativa, orientada a qualidade e boas práticas.

## Stack Tecnológica
- Framework: Next.js 15 (App Router) + Node.js
- Linguagem: TypeScript (strict)
- Banco: PostgreSQL com Prisma ORM/Migrate
- Autenticação: NextAuth.js v5 (Auth.js) + bcryptjs
- Estilo/UI: Tailwind CSS, shadcn/ui, Lucide React
- Formulários/Validação: React Hook Form + Zod
- Gráficos: Recharts
- Qualidade: ESLint + Prettier, Husky + lint-staged, Turbopack (dev)

## Arquitetura e Layout
```
src/
├── app/                    # App Router
│   ├── api/               # API Routes
│   ├── (auth)/            # Rotas autenticadas
│   └── (public)/          # Rotas públicas
├── components/            # Componentes React
│   ├── ui/               # Base (shadcn/ui)
│   ├── layout/           # Layouts
│   └── [feature]/        # Componentes por feature
├── lib/                  # Utilitários/config
├── hooks/                # Custom hooks
├── types/                # Tipos TypeScript
└── auth.ts               # Config NextAuth
```
- Regra: todas as páginas autenticadas usam o layout principal (src/app/layout.tsx) com sidebar, header e conteúdo. Exceção: /login possui layout próprio sem sidebar/header.

## Autenticação e Autorização
- Perfis: admin (total), supervisor (gerencia atendentes/avaliações), attendant (acesso às próprias avaliações)
- Rotas públicas: /login, /changelog, /api/auth/*
- Middleware (matcher): proteger tudo que não for público
```ts
export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|changelog|login).*)',
  ],
};
```

## Padrões de Desenvolvimento
### Nomenclatura
- Arquivos/Diretórios: kebab-case (ex: user-profile.tsx, user-management/)
- Variáveis/Funções: camelCase (ex: nomeUsuario, obterDadosUsuario)
- Classes/Interfaces/Types/Enums: PascalCase (ex: UserProfile, Usuario, TipoUsuario)
- Constantes: UPPER_SNAKE_CASE (ex: API_BASE_URL)
- Banco (Prisma): snake_case (tabelas e campos)

### Componentes
```ts
'use client'; // apenas quando necessário
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface MinhaComponenteProps { titulo: string; onAction?: () => void }
/** Componente para [descrição] */
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

### Hooks
- Tipar retornos e estados; evitar any. Exemplo de assinatura:
```ts
interface UseXReturn { dados: unknown[]; carregando: boolean; erro: string|null; recarregar: () => void }
```

### API Routes
```ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

/** GET /api/usuarios - Lista usuários */
export async function GET(_: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: 'Não autorizado', timestamp: new Date().toISOString() }, { status: 401 });
    const usuarios = await prisma.usuario.findMany();
    return NextResponse.json({ success: true, data: usuarios, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json({ success: false, error: 'Erro interno do servidor', timestamp: new Date().toISOString() }, { status: 500 });
  }
}
```
Resposta padronizada:
```ts
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  paginacao?: { paginaAtual: number; totalPaginas: number; totalItens: number; itensPorPagina: number; temProximaPagina: boolean; temPaginaAnterior: boolean };
}
```

### Validação (Zod)
```ts
import { z } from 'zod';
export const usuarioSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  tipo: z.enum(['admin','supervisor','attendant']),
  ativo: z.boolean().default(true)
});
export type UsuarioFormData = z.infer<typeof usuarioSchema>;
```

## UI/UX
- Tailwind: mobile-first, utilitárias, consistência.
- shadcn/ui: usar componentes base; customização por CSS vars.
- Acessibilidade: labels, aria-*, foco e contraste.

## Banco de Dados (Prisma)
- Convenções: tabelas e campos em snake_case; relacionamentos claros; índices para buscas frequentes; migrations versionadas.
Exemplo:
```prisma
model Usuario {
  id            String   @id @default(cuid())
  nome          String
  email         String   @unique
  senha_hash    String
  tipo          TipoUsuario
  ativo         Boolean  @default(true)
  criado_em     DateTime @default(now())
  atualizado_em DateTime @updatedAt
  @@map("usuarios")
}

enum TipoUsuario { admin supervisor attendant }
```

## Data e Hora (Obrigatório)
- A IA não acessa o relógio do sistema. Para qualquer timestamp, obter via PowerShell e fornecer à IA.
- Comandos úteis:
  - Data/hora completa: Get-Date -Format "dd/MM/yyyy HH:mm:ss"
  - Apenas data: Get-Date -Format "dd/MM/yyyy"
  - Apenas hora: Get-Date -Format "HH:mm:ss"
  - ISO 8601: Get-Date -Format "o"
- Exemplo correto: usuário fornece timestamp ISO; a aplicação usa new Date(timestampFornecido).

## Segurança e Boas Práticas
- Nunca expor secrets; usar variáveis de ambiente.
- Validar todas entradas com Zod; sanitização de dados.
- Hash de senhas com bcryptjs; proteger rotas e sessões (NextAuth v5).
- CSRF protegido por padrão (Next.js); considerar rate limiting em APIs.
- Remover imports/variáveis não utilizados; evitar logs sensíveis.

## Qualidade e Build
### Regras TypeScript/ESLint (críticas)
- Proibido any. Preferir tipos específicos, Record<string, unknown> ou unknown para erros.
- Usar const sempre que possível; let apenas quando houver reatribuição.
- Completar dependências de hooks (useEffect/useCallback/useMemo).
- Tipar variantes e props com literais específicos (evitar casts amplos).

### Checklist antes do commit
- [ ] npm run build sem erros
- [ ] Zero erros TypeScript (npx tsc --noEmit)
- [ ] Zero erros ESLint (warnings aceitáveis)
- [ ] Sem any; imports/variáveis não utilizadas removidos
- [ ] Dependências de hooks completas

### Fluxo de Build Obrigatório
```bash
# 1. Build da aplicação
npm run build
# 2. Atualizar informações de build
npm run build:info
# 3. Sincronizar changelog com banco
npx ts-node scripts/populate-changelog.ts
# 4. Commit das alterações
git add .
git commit -m "chore: atualiza versão e changelog para [versão]"
```
Scripts úteis: dev, build, build:info, version:patch/minor/major.

## Versionamento
- MAJOR: breaking changes
- MINOR: novas funcionalidades compatíveis
- PATCH: correções de bugs
- Sincronizar: package.json, CHANGELOG.md, build-info.json, src/lib/build-info.ts

## Documentação Obrigatória
- README.md, CHANGELOG.md, CONTRIBUTING.md, LICENSE.md, CODE_OF_CONDUCT.md, ISSUE_TEMPLATE.md, docs/
- Manter atualizados após mudanças relevantes.

## Instruções Específicas para IA
1) Analisar contexto e requisitos
2) Verificar aderência aos padrões
3) Implementar seguindo convenções e segurança
4) Documentar alterações (descrição clara)
5) Testar quando possível (unit/integração)
6) Atualizar documentação se necessário

## JSDoc (exemplo)
```ts
/**
 * Calcula a média das avaliações
 * @param avaliacoes - Array de avaliações
 * @returns Média ou 0 se vazio
 */
function calcularMediaAvaliacoes(avaliacoes: { nota: number }[]): number {
  if (avaliacoes.length === 0) return 0;
  const soma = avaliacoes.reduce((acc, a) => acc + a.nota, 0);
  return soma / avaliacoes.length;
}
```

---
Responsabilidade: manter qualidade, consistência e evolução do Koerner 360, priorizando segurança e UX.
