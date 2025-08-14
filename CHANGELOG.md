# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [0.1.1] - 2025-01-14

### Corrigido
- **Build de Produção**: Resolvidos todos os erros TypeScript que impediam o build
- **NextAuth v5**: Corrigida configuração do middleware para usar função `auth` em vez de `getToken`
- **Scripts de Migração**: Adicionadas verificações de segurança para evitar erros de `undefined`
- **Importações**: Corrigidos caminhos de importação do arquivo `auth.ts`
- **Arquivo de Teste**: Removido arquivo de teste obsoleto que usava API antiga do NextAuth

### Melhorado
- **Configuração de Autenticação**: Arquivo `auth.ts` movido para raiz do projeto seguindo padrões do NextAuth v5
- **Middleware**: Atualizado para nova API de sessão do NextAuth v5
- **Rotas de API**: Handlers atualizados para usar nova configuração
- **Validação TypeScript**: Todas as verificações de tipo passando com sucesso

### Técnico
- **Tempo de Build**: ~2 segundos
- **Bundle Size**: 99.7 kB compartilhado
- **Páginas**: 8 páginas estáticas e dinâmicas geradas
- **Status**: ✅ Build de produção funcionando

## [1.3.0] - 2025-01-20

### Adicionado
- **Migração Completa do Supabase**: Script automatizado para migrar TODAS as tabelas do Supabase para PostgreSQL local
- **Script de Migração**: `scripts/migrate-from-supabase.ts` para transferência completa de dados
- **Comando NPM**: `npm run db:migrate-supabase` para facilitar futuras migrações
- **Modelo AuditLog**: Adicionado ao schema Prisma para logs de auditoria
- **Tabela audit_logs**: Criada no PostgreSQL local (vazia no Supabase)
- **Mapeamento de Dados**: Conversão automática de tipos e estruturas entre Supabase e Prisma
- **Migração de Usuários**: 10 usuários migrados com mapeamento correto de roles (admin, supervisor, attendant → ADMIN, SUPERVISOR, ATENDENTE)
- **Migração de Avaliações**: 35 avaliações migradas com períodos únicos para evitar conflitos
- **Criação de Feedbacks**: Geração automática de feedbacks baseados em avaliações com comentários
- **Validação de Dados**: Verificação automática de integridade após migração
- **Estatísticas Detalhadas**: Relatório completo por tipo de usuário e dados migrados

#### Tabelas Migradas
- ✅ **users** → **usuarios** (10 registros)
- ✅ **reviews** → **avaliacoes** (35 registros)
- ✅ **system_config** → **feedbacks** (1 registro criado)
- ✅ **system_modules** → **feedbacks** (dados incorporados)
- ✅ **audit_logs** → **audit_logs** (0 registros - tabela vazia no Supabase)

### Corrigido
- **Conflitos de Chave Única**: Resolução de conflitos na constraint única de avaliações (avaliadoId, avaliadorId, periodo)
- **Mapeamento de Tipos**: Correção do mapeamento de enums entre Supabase e Prisma
- **Estrutura de Dados**: Adaptação dos campos para o schema atual do Prisma
- **Variáveis Duplicadas**: Correção de conflitos de nomenclatura no script

### Técnico
- **Limpeza Automática**: Remoção segura de dados existentes antes da migração
- **Transações Seguras**: Migração com rollback automático em caso de erro
- **Logs Detalhados**: Acompanhamento completo do processo de migração
- **Validação de Integridade**: Verificação automática de dados após migração

### Dados Migrados
- 👑 1 Administrador
- 👨‍💼 1 Supervisor  
- 👥 8 Atendentes
- ⭐ 35 Avaliações
- 💬 1 Feedback

## [1.2.1] - 2025-01-20



## [1.2.1] - 2024-12-19

### ✨ Adicionado
- Script de teste de conexão com banco de dados (`scripts/test-db-connection.ts`)
- Validação completa da conexão PostgreSQL
- Teste automatizado de dados do seed

### 🐛 Corrigido
- Configuração da `DATABASE_URL` no arquivo `.env.local`
- Senha padrão do PostgreSQL local (postgres/postgres)
- Carregamento de variáveis de ambiente em scripts standalone
- Mapeamento correto de campos do Prisma

### ✅ Testado
- ✅ Conexão com banco PostgreSQL local
- ✅ Criação automática do banco de dados
- ✅ Aplicação do schema Prisma
- ✅ Execução do seed com dados iniciais
- ✅ Prisma Studio funcionando em http://localhost:5555
- ✅ 3 usuários criados (Admin, Supervisor, Atendente)
- ✅ 2 avaliações e 2 feedbacks de exemplo

## [1.2.0] - 2024-12-19

### ✨ Adicionado
- Configuração Docker com docker-compose.yml para PostgreSQL e PgAdmin
- Arquivo .dockerignore para otimização de builds
- Documentação completa de setup (docs/setup.md)
- Documentação detalhada do banco de dados (docs/database.md)
- README.md atualizado com informações do Prisma
- Guia de troubleshooting e resolução de problemas
- Scripts Docker para gerenciamento de containers
- Instruções de usuários padrão para desenvolvimento
- Seção de contribuição com padrões de commit

### 🔧 Melhorado
- Documentação técnica mais abrangente
- Estrutura de arquivos melhor organizada
- Instruções de instalação mais claras
- Guias de desenvolvimento mais detalhados

## [1.1.0] - 2024-12-19

### ✨ Adicionado
- Implementação completa do Prisma ORM
- Schema de banco de dados com modelos Usuario, Avaliacao e Feedback
- Sistema de relacionamentos entre usuários (supervisor/atendente)
- Enums para TipoUsuario, TipoFeedback, Prioridade e StatusFeedback
- Arquivo de seed (prisma/seed.ts) com dados iniciais
- Scripts npm para gerenciamento do banco de dados
- Cliente Prisma configurado (src/lib/prisma.ts) com logging e tratamento de erros
- Dependência tsx para execução de TypeScript
- Documentação do Prisma (prisma/README.md)

### 🔄 Alterado
- Sistema de autenticação migrado de dados mockados para Prisma
- Configuração de DATABASE_URL no .env.local
- Estrutura de dados normalizada e tipada para compatibilidade com Prisma
- Nomenclatura de campos de usuário (snake_case para camelCase)

### 🗑️ Removido
- Dependência `@supabase/supabase-js`
- Arquivo `src/lib/supabase.ts`
- Variáveis de ambiente do Supabase (.env.local e .env.example)
- Dados mockados de usuários locais
- Configurações de cliente Supabase

### Funcionalidades Planejadas
- Sistema de notificações em tempo real
- Relatórios avançados com exportação
- Integração com APIs externas
- Sistema de backup automático
- Dashboard personalizado por usuário
- Sistema de comentários nas avaliações
- Histórico de mudanças nas avaliações
- Sistema de aprovação de feedbacks
- Integração com calendário
- Sistema de lembretes automáticos

## [0.2.0] - 2024-12-19

### ✨ Adicionado
- Sistema de versionamento automático com scripts personalizados
- Script `build-version.js` para gerar informações de build e versão
- Script `update-changelog.js` para atualização automática do changelog
- Script `git-tag.js` para criação e gerenciamento de tags Git
- Configuração completa do Prettier com `.prettierrc` e `.prettierignore`
- Configuração avançada do ESLint com regras específicas para o projeto
- Configuração robusta do TypeScript com verificações rigorosas
- Hooks do Git com Husky (pre-commit e post-commit)
- Configuração do lint-staged para verificações incrementais
- Pipeline CI/CD completo com GitHub Actions
- Workflow de release automático
- Geração automática de notas de release

### 🔧 Configuração
- Scripts npm para versionamento (`version:patch`, `version:minor`, `version:major`)
- Scripts de release automático (`release:patch`, `release:minor`, `release:major`)
- Hooks de build (`prebuild`, `postversion`)
- Configuração de paths TypeScript para imports absolutos
- Configuração de lint-staged para formatação automática
- Configuração de segurança e qualidade no pipeline CI/CD

### 🚀 Automação
- Deploy automático para Vercel em produção e preview
- Análise de segurança com auditoria npm e Snyk
- Verificação automática de qualidade de código
- Geração automática de artefatos de build
- Notificações automáticas de status do pipeline
- Criação automática de releases no GitHub
- Categorização automática de commits no changelog

### 📚 Documentação
- Documentação expandida com guias de desenvolvimento
- Templates para diferentes tipos de issues
- Código de conduta e diretrizes de contribuição
- Documentação de API e banco de dados
- Guias de troubleshooting e debugging

### 🛠️ Aspectos Técnicos
- Integração com informações de build em tempo real
- Sistema de tags Git automatizado
- Verificações de tipo TypeScript mais rigorosas
- Formatação de código consistente
- Análise estática de código aprimorada
- Configuração de ambiente de desenvolvimento otimizada

## [0.1.0] - 2024-12-19

### ✨ Adicionado
- Configuração inicial do projeto Next.js 15 com TypeScript
- Sistema de autenticação com NextAuth.js v5
- Integração com Supabase para banco de dados PostgreSQL
- Interface de usuário com Tailwind CSS e shadcn/ui
- Página de login com validação usando React Hook Form e Zod
- Dashboard principal com estatísticas e gráficos (Recharts)
- Sistema de roles (admin, supervisor, attendant)
- Middleware de proteção de rotas
- Componentes de UI: Alert, Button, Card, Input, Table, Dialog
- Estrutura de documentação completa

### 🔧 Configuração
- ESLint e Prettier para qualidade de código
- Configuração do TypeScript com strict mode
- Scripts de build e desenvolvimento
- Estrutura de pastas organizada
- Configuração de variáveis de ambiente

### 📚 Documentação
- README.md com instruções de instalação e uso
- Documentação de desenvolvimento (docs/development.md)
- Documentação da API (docs/api.md)
- Documentação do banco de dados (docs/database.md)
- Guias de contribuição e código de conduta
- Templates para issues e pull requests

### 🛠️ Aspectos Técnicos
- Suporte a bcryptjs para hash de senhas
- Configuração de middleware para autenticação
- Estrutura preparada para sistema de avaliações 360°
- Componentes reutilizáveis e tipados
- Integração com Lucide React para ícones

---

### Tipos de Mudanças
- `Adicionado` para novas funcionalidades
- `Alterado` para mudanças em funcionalidades existentes
- `Descontinuado` para funcionalidades que serão removidas
- `Removido` para funcionalidades removidas
- `Corrigido` para correções de bugs
- `Segurança` para vulnerabilidades corrigidas