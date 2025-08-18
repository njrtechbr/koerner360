# Stack Tecnológico & Sistema de Build

## Tecnologias Principais

- **Framework**: Next.js 15.4.6 com App Router
- **Linguagem**: TypeScript 5+ com configuração strict
- **Banco de Dados**: PostgreSQL com Prisma ORM 6.14.0
- **Autenticação**: NextAuth.js v5 (beta) com estratégia JWT
- **Estilização**: Tailwind CSS 3.4.17 com componentes shadcn/ui
- **Formulários**: React Hook Form com validação Zod
- **Gráficos**: Recharts para visualização de dados
- **Ícones**: Lucide React
- **Runtime**: Node.js 18+

## Ferramentas de Desenvolvimento

- **Linting**: ESLint com regras Next.js e TypeScript
- **Formatação**: Prettier com configuração consistente
- **Testes**: Jest com React Testing Library
- **Gerenciador de Pacotes**: npm com package-lock.json
- **Git Hooks**: Husky para hooks pre-commit e post-commit
- **Containerização**: Docker com docker-compose.yml

## Comandos Comuns

### Desenvolvimento
```bash
npm run dev              # Iniciar servidor de desenvolvimento
npm run build           # Build de produção
npm run start           # Iniciar servidor de produção
npm run type-check      # Verificação de tipos TypeScript
npm run lint            # Executar ESLint
npm run lint:fix        # Corrigir problemas ESLint
npm run format          # Formatar com Prettier
npm run test            # Executar testes Jest
npm run test:watch      # Executar testes em modo watch
```

### Operações de Banco de Dados
```bash
npm run db:generate     # Gerar cliente Prisma
npm run db:push         # Aplicar mudanças de schema
npm run db:migrate      # Executar migrations
npm run db:reset        # Resetar banco de dados
npm run db:seed         # Popular banco de dados
npm run db:studio       # Abrir Prisma Studio
```

### Versionamento & Changelog
```bash
npm run version:patch   # Incrementar versão patch
npm run version:minor   # Incrementar versão minor
npm run version:major   # Incrementar versão major
npm run changelog:create # Criar changelog a partir de commits
npm run release:patch   # Release patch completo com tags
```

## Bibliotecas & Padrões Principais

- **Componentes UI**: Primitivos Radix UI com estilização shadcn/ui
- **Gerenciamento de Estado**: React hooks e context (sem biblioteca externa)
- **Busca de Dados**: Fetch nativo com rotas API Next.js
- **Hash de Senhas**: bcryptjs para autenticação segura
- **Manipulação de Datas**: date-fns para manipulação de datas
- **Notificações**: Sonner para notificações toast
- **Tema**: next-themes para suporte a modo escuro/claro

## Configuração de Build

- **TypeScript**: Modo strict habilitado com mapeamento de caminhos (aliases @/*)
- **Next.js**: App Router com configuração de pacotes externos do servidor
- **Tailwind**: Sistema de design customizado com variáveis CSS
- **ESLint**: Regras abrangentes para TypeScript, React e Next.js
- **Prettier**: Formatação consistente com aspas simples e ponto e vírgula