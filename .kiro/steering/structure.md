---
inclusion: always
---

# Estrutura do Projeto & Padrões de Desenvolvimento

## Organização de Diretórios

### Estrutura Raiz
```
koerner360/
├── src/                    # Código fonte principal (Next.js App Router)
├── prisma/                 # Schema do banco, migrations, seed
├── scripts/                # Scripts utilitários (DB, build, changelog)
├── docs/                   # Documentação do projeto
├── __tests__/              # Arquivos de teste por domínio
├── components/             # Componentes legados (migrando para src/)
├── public/                 # Assets estáticos
└── .kiro/                  # Configuração do assistente IA
```

### Código Fonte (`src/`)
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # Rotas da API (/api/*)
│   ├── dashboard/         # Páginas protegidas do dashboard
│   ├── login/            # Páginas de autenticação
│   └── layout.tsx        # Layout raiz
├── components/           # Componentes reutilizáveis
│   ├── layout/          # Navegação, cabeçalhos, rodapés
│   ├── providers/       # Provedores de contexto
│   └── ui/             # Componentes shadcn/ui
├── lib/                # Utilitários principais
│   ├── auth.ts         # Configuração NextAuth
│   ├── prisma.ts       # Cliente do banco
│   └── utils.ts        # Helpers
├── hooks/              # Hooks customizados do React
└── types/              # Definições TypeScript
```

## Aliases de Caminho & Imports

Sempre use estes aliases para imports limpos:
- `@/*` → `./src/*` ou `./*` (arquivos raiz)
- `@/components/*` → `./src/components/*`
- `@/lib/*` → `./src/lib/*`
- `@/app/*` → `./src/app/*`
- `@/types/*` → `./src/types/*`

## Convenções de Nomenclatura de Arquivos

- **Componentes**: PascalCase (`UserProfile.tsx`)
- **Páginas**: diretórios kebab-case, arquivos minúsculos
- **Rotas da API**: kebab-case (`user-management/route.ts`)
- **Utilitários**: camelCase (`formatDate.ts`)
- **Tipos**: PascalCase com `.d.ts` para declarações

## Arquitetura de Componentes

### Regras de Localização
- **Componentes UI**: `src/components/ui/` (apenas shadcn/ui)
- **Componentes de Layout**: `src/components/layout/`
- **Componentes de Funcionalidade**: `src/components/` (organizados por domínio)
- **Componentes de Página**: Co-localizados em `src/app/`

### Padrões de Componentes
- Use interfaces TypeScript para props
- Exporte componentes como padrão
- Mantenha componentes focados e com responsabilidade única
- Use composição ao invés de herança

## Estrutura de Rotas da API

```
src/app/api/
├── auth/                  # Endpoints de autenticação
├── users/                 # Gerenciamento de usuários
├── evaluations/           # Sistema de feedback 360°
├── gamification/          # Pontos, conquistas
└── admin/                 # Endpoints exclusivos para admin
```

### Convenções da API
- Use rotas da API do Next.js 15 App Router
- Implemente métodos HTTP apropriados (GET, POST, PUT, DELETE)
- Retorne respostas JSON consistentes
- Use Zod para validação de requisições
- Inclua tratamento adequado de erros

## Padrões de Banco de Dados

### Uso do Prisma
- Sempre use o cliente Prisma compartilhado de `@/lib/prisma`
- Use transações para operações multi-tabela
- Implemente tratamento adequado de erros para operações do BD
- Siga o padrão de audit logging para mudanças de dados

### Estratégia de Migration
- Use migrations do Prisma para mudanças de schema
- Mantenha arquivos de migration descritivos
- Teste migrations em dados de desenvolvimento primeiro
- Documente mudanças críticas no CHANGELOG.md

## Organização de Testes

```
__tests__/
├── api/                   # Testes de rotas da API
├── components/            # Testes unitários de componentes
└── lib/                   # Testes de funções utilitárias
```

### Padrões de Teste
- Use Jest com React Testing Library
- Teste interações do usuário, não detalhes de implementação
- Mocke dependências externas (BD, APIs)
- Siga o padrão AAA (Arrange, Act, Assert)

## Gerenciamento de Configuração

### Variáveis de Ambiente
- Use `.env.local` para desenvolvimento
- Documente variáveis necessárias em `.env.example`
- Nunca commite valores sensíveis
- Use validação de env type-safe

### Configuração de Build
- Modo strict do TypeScript habilitado
- ESLint com regras abrangentes
- Prettier para formatação consistente
- Tailwind com sistema de design customizado

## Fluxo de Desenvolvimento

### Organização de Código
1. Crie branch de feature a partir da main
2. Implemente mudanças seguindo padrões de estrutura
3. Adicione testes para nova funcionalidade
4. Atualize documentação se necessário
5. Execute linting e verificação de tipos
6. Submeta PR com descrição clara

### Uso de Scripts
- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build de produção
- `npm run db:push` - Atualizar schema do banco
- `npm run test` - Executar suite de testes
- `npm run lint:fix` - Corrigir problemas de linting
