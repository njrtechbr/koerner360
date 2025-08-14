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

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run start` - Inicia servidor de produção
- `npm run lint` - Executa linting do código

---

**Koerner 360** - Transformando feedback em crescimento! 🚀
