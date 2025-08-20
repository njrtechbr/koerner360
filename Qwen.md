# Koerner 360 - Project Overview

Este documento fornece uma visão abrangente do projeto Koerner 360 para Qwen Code, detalhando sua arquitetura, funcionalidades e implementação.

## Resumo do Projeto

Koerner 360 é um sistema completo de gestão de feedback e avaliações 360° construído com Next.js 15.4.6 (App Router) e Prisma ORM. Apresenta um sistema robusto de autenticação com controle de acesso baseado em funções, sistema automatizado de changelog, dashboard abrangente para métricas de performance e sistema completo de gamificação.

## Tecnologias Principais

- **Framework**: Next.js 15.4.6 (App Router) + Node.js + Turbopack
- **Linguagem**: TypeScript 5.x (strict mode)
- **Runtime**: React 19.1.0 + React DOM 19.1.0
- **Banco de Dados**: PostgreSQL com Prisma ORM 6.14.0
- **Autenticação**: Auth.js v5.0.0-beta.29 (NextAuth.js) + bcryptjs 3.0.2
- **Estilização**: Tailwind CSS 3.4.17 + CSS Variables + Lightning CSS
- **Componentes UI**: shadcn/ui (new-york) + Radix UI + CVA
- **Ícones**: Lucide React 0.539.0
- **Formulários**: React Hook Form 7.62.0 + Zod 4.0.17 + @hookform/resolvers 5.2.1
- **Gráficos**: Recharts 3.1.2
- **Notificações**: Sonner 2.0.7
- **Utilitários**: date-fns 4.1.0, clsx 2.1.1, Tailwind Merge 3.3.1
- **Qualidade**: ESLint 9 + Prettier 3.6.2, Husky + lint-staged
- **Testes**: Jest 29.7.0 + Testing Library + Playwright
- **Containerização**: Docker

## Funcionalidades Principais

### Autenticação e Autorização
- Login seguro com Auth.js v5 (NextAuth.js)
- Controle de acesso baseado em funções (Admin, Supervisor, Atendente, Consultor)
- Gerenciamento de sessão JWT com tratamento de erros
- Limpeza automática de tokens corrompidos
- Rotas públicas para changelog e páginas de login
- Middleware de proteção de rotas

### Dashboard e Métricas
- Dashboard interativo com métricas específicas por função
- Gráficos e estatísticas de performance
- Sistema de gamificação com conquistas e rankings
- Rastreamento de métricas em tempo real
- Análise de performance por período (mensal, trimestral, anual)

### Gestão de Usuários
- Operações CRUD completas para usuários
- Gerenciamento de funções e permissões
- Rastreamento de status (ativo/inativo)
- Hierarquia Supervisor/Atendente
- Migração de dados do Supabase

### Sistema de Feedback 360°
- Criação de avaliações periódicas
- Avaliações detalhadas com notas e comentários
- Rastreamento de metas
- Opções de feedback anônimo
- Histórico completo de feedbacks
- Tipos de feedback: Elogio, Sugestão, Reclamação, Melhoria

### Sistema Automatizado de Changelog
- Geração automática de informações de build
- Criação de changelog baseada em Git
- Página pública de changelog com paginação
- API para gerenciamento de changelog
- Suporte a versionamento semântico
- Classificação de Conventional Commits
- Categorização automática de mudanças

### Sistema de Gamificação
- Sistema de pontos e níveis
- Conquistas e badges
- Rankings de performance
- Rastreamento de sequências (streaks)
- Competições baseadas em períodos
- Métricas de performance detalhadas
- Configuração flexível de regras

## Estrutura do Projeto

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Grupo de rotas autenticadas
│   │   ├── dashboard/     # Dashboard principal
│   │   ├── usuarios/      # Gestão de usuários
│   │   ├── atendentes/    # Gestão de atendentes
│   │   ├── avaliacoes/    # Gestão de avaliações
│   │   └── feedbacks/     # Gestão de feedbacks
│   ├── api/               # API Routes (Route Handlers)
│   │   ├── auth/          # Endpoints de autenticação
│   │   ├── usuarios/      # CRUD de usuários
│   │   ├── atendentes/    # CRUD de atendentes
│   │   ├── avaliacoes/    # CRUD de avaliações
│   │   └── feedbacks/     # CRUD de feedbacks
│   ├── auth/              # Páginas de autenticação
│   ├── changelog/         # Página pública de changelog
│   ├── login/             # Página de login
│   ├── globals.css        # Estilos globais + CSS Variables
│   └── layout.tsx         # Root layout
├── components/            # Componentes React
│   ├── layout/            # Componentes de layout
│   ├── providers/         # React providers
│   ├── ui/                # Componentes UI (shadcn/ui)
│   ├── atendentes/        # Componentes de atendentes
│   ├── usuarios/          # Componentes de usuários
│   ├── metricas/          # Componentes de métricas
│   └── error-boundary/    # Componentes de tratamento de erro
├── lib/                   # Utilitários e configurações
│   ├── auth/              # Utilitários de autenticação
│   ├── services/          # Integrações de serviços
│   ├── utils/             # Utilitários gerais
│   ├── validations/       # Schemas de validação
│   ├── permissions/       # Sistema de permissões
│   ├── prisma.ts          # Cliente Prisma
│   ├── api-response.ts    # Padronização de respostas API
│   └── build-info.ts      # Informações de build
├── types/                 # Definições de tipos TypeScript
├── hooks/                 # Custom React hooks
└── prisma/                # Schema e migrações do Prisma
```

## Schema do Banco de Dados

O banco de dados inclui modelos para:

### Modelos Principais
- **Usuario**: usuários com funções (Admin, Supervisor, Atendente, Consultor)
- **Atendente**: dados detalhados dos atendentes
- **Avaliacao**: avaliações 360° com notas e comentários
- **Feedback**: feedbacks categorizados por tipo e prioridade
- **AuditLog**: logs de auditoria para rastreamento de ações

### Sistema de Changelog
- **Changelog**: versões e releases
- **ChangelogItem**: itens individuais de mudança

### Sistema de Gamificação
- **GamificacaoAtendente**: pontuação e níveis dos atendentes
- **Conquista**: definições de conquistas e badges
- **ConquistaAtendente**: conquistas obtidas pelos atendentes
- **MetricaPerformance**: métricas detalhadas de performance
- **ConfiguracaoGamificacao**: configurações do sistema
- **PeriodoGamificacao**: períodos de competição

### Migração e Controle
- **DadosMigracaoSupabase**: controle de migração do Supabase

## Sistema de Autenticação

O sistema de autenticação usa Auth.js v5 com provider de credenciais:
- Validação customizada de credenciais contra banco PostgreSQL
- Gerenciamento de sessão baseado em funções
- Tratamento de erros JWT e limpeza automática
- Configuração de rotas públicas no middleware
- Callbacks personalizados para JWT e sessão

## Sistema de Changelog

O sistema automatizado de changelog inclui:
- Script de geração de informações de build
- Análise e classificação de commits Git
- Armazenamento em banco com rastreamento de versões
- Interface web pública com filtragem e paginação
- Endpoints de API para gerenciamento
- Automação de versionamento semântico
- Suporte a Conventional Commits

## Scripts e Automação

O projeto inclui numerosos scripts npm para:

### Desenvolvimento
- `dev`, `build`, `start`: desenvolvimento e produção
- `lint`, `lint:fix`: qualidade de código
- `type-check`: verificação de tipos TypeScript
- `format`, `format:check`: formatação de código

### Banco de Dados
- `db:generate`, `db:push`, `db:migrate`: gerenciamento do Prisma
- `db:seed`, `db:studio`: população e interface do banco
- `db:test`: teste de conexão

### Versionamento e Changelog
- `version:patch`, `version:minor`, `version:major`: versionamento
- `changelog:create`, `changelog:update`: gerenciamento de changelog
- `build:info`, `build:version`: informações de build

### Testes
- `test`, `test:watch`, `test:coverage`: execução de testes
- `test:components`, `test:api`, `test:lib`: testes específicos

## Tratamento de Erros

O sistema apresenta tratamento abrangente de erros:
- Boundary de erro para autenticação
- Detecção e limpeza de corrupção JWT
- Páginas de erro elegantes
- Logging detalhado
- Mecanismos de recuperação de sessão
- Componentes de error boundary específicos

## Deployment

O sistema suporta:
- Containerização Docker
- Banco de dados PostgreSQL
- Pipeline automatizado de CI/CD
- Configuração baseada em ambiente
- Modos de produção e desenvolvimento
- Headers de segurança configurados

## Práticas de Desenvolvimento

- TypeScript rigoroso com definições de tipos abrangentes
- ESLint e Prettier para qualidade de código
- Hooks do Husky para validação pré-commit
- Suíte de testes abrangente com Jest
- Arquitetura baseada em componentes
- Design responsivo com Tailwind CSS
- Padrões de nomenclatura consistentes
- Documentação em português brasileiro
- Princípios SOLID e DRY
- Validação com Zod em todas as entradas
- Sistema de permissões robusto

## Segurança

- Variáveis de ambiente para secrets
- Hash bcryptjs para senhas
- Rate limiting em APIs críticas
- Sanitização de dados
- Headers de segurança (X-Frame-Options, X-Content-Type-Options)
- Logs sem informações sensíveis
- Validação rigorosa de entrada
- Controle de acesso baseado em funções

## Versão Atual

- **Versão**: 0.2.6
- **Ambiente**: Development
- **Node.js**: v22.18.0
- **Plataforma**: Windows (win32, x64)
- **Última Build**: 2025-08-19T12:54:33.951Z

## Funcionalidades Futuras

- Integração com sistemas externos
- Relatórios avançados e analytics
- Notificações push
- API pública para integrações
- Mobile app companion
- Inteligência artificial para análise de feedback
- Dashboard executivo
- Exportação de dados em múltiplos formatos

---

**Koerner 360** representa uma solução completa e moderna para gestão de feedback e avaliações 360°, construída com as melhores práticas de desenvolvimento e tecnologias de ponta.