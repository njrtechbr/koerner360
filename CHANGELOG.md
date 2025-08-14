# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Não Lançado]

### 🔧 Em Desenvolvimento
- Sistema de avaliações 360°
- Dashboard com métricas em tempo real
- Relatórios personalizáveis
- Integração com APIs externas

---

## [0.2.1] - 2025-01-14

### ✨ Adicionado
- **Sistema de Changelog Automático**: Criação automática de changelogs baseada em commits Git
- **Geração de Build Info**: Script para capturar informações de build, Git e ambiente
- **Interface Web de Changelog**: Página pública para visualização de changelogs com paginação
- **API de Changelog**: Endpoints completos para CRUD de changelogs e itens
- **Suporte a Conventional Commits**: Classificação automática de mudanças por tipo
- **Versionamento Semântico**: Scripts para incremento automático de versões
- **Documentação Completa**: Guia detalhado do sistema de versionamento

### 🔧 Alterado
- **README.md**: Adicionada seção sobre sistema de versionamento e novos scripts
- **package.json**: Incluídos scripts para build:info, changelog e versionamento
- **Esquema Prisma**: Adicionadas tabelas Changelog e ChangelogItem com enums

### 🛠️ Técnico
- **Scripts Automatizados**: build-info.js e create-changelog.js para automação
- **Migrações de Banco**: Nova migração para tabelas de changelog
- **Tipos TypeScript**: Interfaces para BuildInfo e componentes de changelog

---

## [0.2.0] - 2025-01-13

### ✨ Adicionado
- **Sistema de Versionamento Automático**: Scripts personalizados para build, changelog e tags Git
- **Pipeline CI/CD Completo**: GitHub Actions com workflows de release automático
- **Configuração Docker**: docker-compose.yml para PostgreSQL e PgAdmin
- **Implementação Prisma ORM**: Schema completo com modelos Usuario, Avaliacao e Feedback
- **Sistema de Relacionamentos**: Hierarquia supervisor/atendente com enums tipados
- **Migração Completa do Supabase**: Script automatizado para transferir todas as tabelas
- **Páginas do Sistema**: Avaliações, Feedbacks e Configurações com layout consistente
- **Sistema de Autenticação Robusto**: NextAuth.js/Auth.js v5 com proteção de rotas
- **Gerenciamento de Usuários**: CRUD completo com paginação, filtros e permissões
- **Scripts de Desenvolvimento**: Teste de conexão, seed automático e validação de dados
- **Documentação Expandida**: Guias completos de setup, API e banco de dados

### 🔧 Configuração
- **Prettier e ESLint**: Formatação e qualidade de código automatizadas
- **TypeScript Rigoroso**: Verificações de tipo mais rigorosas
- **Husky Hooks**: Pre-commit e post-commit para qualidade
- **Lint-staged**: Verificações incrementais automáticas
- **Scripts NPM**: Versionamento, release e build automatizados
- **Paths TypeScript**: Imports absolutos configurados
- **Variáveis de Ambiente**: Configuração completa para desenvolvimento

### 🔄 Migrado
- **Supabase → PostgreSQL Local**: 10 usuários, 35 avaliações migrados
- **NextAuth.js v4 → Auth.js v5**: Sistema de autenticação modernizado
- **Dados Mockados → Prisma**: Integração completa com banco de dados
- **Sistema de Roles**: ADMIN, SUPERVISOR, ATENDENTE com permissões granulares

### 🐛 Corrigido
- **Sistema de Permissões**: Inconsistências entre banco e código resolvidas
- **Autenticação**: Configuração corrigida para tabela 'usuarios' PostgreSQL
- **Build de Produção**: Todos os erros TypeScript resolvidos
- **Página de Usuários**: Erros de sessão e paginação corrigidos
- **Layout Principal**: Consistência garantida em todas as páginas
- **Middleware**: Proteção de rotas otimizada e funcional
- **Importações**: Caminhos corrigidos e aliases configurados
- **Componentes**: Verificações de segurança e tratamento de erros

### 🗑️ Removido
- **Dependência Supabase**: Cliente e configurações antigas
- **Dados Mockados**: Substituídos por integração real com banco
- **Configurações Obsoletas**: Limpeza de arquivos não utilizados
- **Tabelas de Sessão**: Removidas do schema (usando JWT)

### 🚀 Automação
- **Deploy Automático**: Vercel em produção e preview
- **Análise de Segurança**: Auditoria npm e Snyk
- **Qualidade de Código**: Verificação automática
- **Artefatos de Build**: Geração automática
- **Releases GitHub**: Criação e notas automáticas
- **Categorização de Commits**: Changelog automático

### 📚 Documentação
- **Guias de Desenvolvimento**: Setup, API e banco de dados
- **Templates de Issues**: Padronização de reportes
- **Código de Conduta**: Diretrizes de contribuição
- **Troubleshooting**: Guias de resolução de problemas
- **README Atualizado**: Informações completas do projeto

### 🛠️ Aspectos Técnicos
- **Build Info**: Integração com informações em tempo real
- **Tags Git**: Sistema automatizado
- **Formatação Consistente**: Prettier configurado
- **Análise Estática**: ESLint aprimorado
- **Ambiente Otimizado**: Configuração de desenvolvimento
- **Validação de Dados**: Verificação automática de integridade

### 📊 Dados Migrados
- 👑 1 Administrador
- 👨‍💼 1 Supervisor
- 👥 8 Atendentes
- ⭐ 35 Avaliações
- 💬 1 Feedback

### ✅ Status Final
- ✅ Sistema de autenticação funcionando completamente
- ✅ Todas as páginas renderizando com layout consistente
- ✅ Build de produção funcionando sem erros
- ✅ Banco de dados PostgreSQL integrado
- ✅ Pipeline CI/CD operacional
- ✅ Documentação completa e atualizada

---

## [0.1.0] - 2024-12-18

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