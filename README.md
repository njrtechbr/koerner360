# Koerner 360

Sistema de gestão de feedback e avaliações 360° desenvolvido com Next.js e Prisma.

## 🚀 Tecnologias

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Banco de Dados**: PostgreSQL + Prisma ORM
- **Autenticação**: NextAuth.js v5
- **Estilização**: Tailwind CSS
- **Componentes**: shadcn/ui
- **Ícones**: Lucide React
- **Formulários**: React Hook Form + Zod
- **Gráficos**: Recharts
- **Containerização**: Docker

## 📋 Funcionalidades

### Sistema de Autenticação
- Login seguro com NextAuth.js
- Três níveis de acesso:
  - **Admin**: Acesso total ao sistema
  - **Supervisor**: Gerenciamento de atendentes e avaliações
  - **Atendente**: Visualização de avaliações próprias

### Dashboard Interativo
- Métricas personalizadas por tipo de usuário
- Gráficos de performance e estatísticas
- Ações rápidas contextuais

### Gestão de Usuários
- Cadastro e edição de usuários
- Controle de permissões por função
- Status ativo/inativo

### Sistema de Avaliações
- Criação de avaliações periódicas
- Notas e comentários detalhados
- Acompanhamento de metas

### Feedback 360°
- Feedback positivo, construtivo e sugestões
- Opção de feedback anônimo
- Histórico completo de feedbacks

### Sistema de Versionamento e Changelog
- Geração automática de informações de build
- Criação automática de changelogs baseada em commits Git
- Interface web para gerenciamento de changelogs
- Versionamento semântico automatizado
- Suporte a Conventional Commits

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Conta no Supabase

### 1. Instale as dependências
```bash
npm install
```

### 2. Configure as variáveis de ambiente
Configure o arquivo `.env.local` com suas credenciais:

```env
# NextAuth.js
NEXTAUTH_SECRET=sua-chave-secreta-aqui
NEXTAUTH_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=sua-url-do-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-do-supabase
SUPABASE_SERVICE_ROLE_KEY=sua-chave-de-servico-do-supabase

# Database
DATABASE_URL=sua-url-do-banco-de-dados
```

### 3. Execute o projeto
```bash
npm run dev
```

O sistema estará disponível em `http://localhost:3000`

## 👥 Usuários de Demonstração

- **Admin**: admin@koerner.com / admin123
- **Supervisor**: supervisor@koerner.com / super123
- **Atendente**: atendente@koerner.com / atend123

## 📁 Estrutura do Projeto

```
src/
├── app/                    # App Router do Next.js
│   ├── api/               # Rotas da API
│   ├── dashboard/         # Página principal
│   ├── login/            # Página de login
│   └── layout.tsx        # Layout raiz
├── components/           # Componentes React
│   ├── layout/          # Componentes de layout
│   ├── providers/       # Providers (Session, etc.)
│   └── ui/             # Componentes UI (shadcn/ui)
├── lib/                # Utilitários e configurações
│   ├── auth.ts         # Configuração NextAuth
│   ├── supabase.ts     # Cliente Supabase
│   └── utils.ts        # Utilitários gerais
└── types/              # Definições de tipos TypeScript
```

## 🔧 Scripts Disponíveis

### Desenvolvimento
- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run start` - Inicia servidor de produção
- `npm run lint` - Executa linting do código
- `npm run format` - Formata código com Prettier

### Banco de Dados
- `npm run db:generate` - Gera cliente Prisma
- `npm run db:push` - Aplica mudanças no banco
- `npm run db:migrate` - Executa migrações
- `npm run db:reset` - Reseta banco de dados
- `npm run db:seed` - Popula banco com dados iniciais
- `npm run db:studio` - Abre Prisma Studio

### Versionamento e Changelog
- `npm run build:info` - Gera informações de build
- `npm run changelog:create` - Cria changelog baseado em commits
- `npm run changelog:publish` - Publica último changelog
- `npm run changelog:auto` - Cria e publica changelog automaticamente
- `npm run version:patch` - Incrementa versão patch
- `npm run version:minor` - Incrementa versão minor
- `npm run version:major` - Incrementa versão major

## 📚 Documentação

- [Sistema de Versionamento e Changelog](./docs/versionamento.md) - Guia completo do sistema automatizado
- [Conventional Commits](https://www.conventionalcommits.org/) - Padrão de mensagens de commit
- [Semantic Versioning](https://semver.org/) - Padrão de versionamento

---

**Koerner 360** - Transformando feedback em crescimento! 🚀
