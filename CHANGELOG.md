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

## [0.2.5] - 2025-08-15

### 🐛 Correções
- **CLIENT_FETCH_ERROR**: Resolvido erro de autenticação que impedia o login no Auth.js v5
  - Corrigida configuração duplicada `baseUrl` no `tsconfig.json`
  - Corrigidos paths de importação relativos longos para aliases padronizados
  - Atualizada importação `@/auth` em `src/app/layout.tsx`
  - Configurado alias `@/auth` para apontar corretamente para arquivo raiz `./auth`

### 🛠️ Melhorias
- **Configuração TypeScript**: Padronizada estrutura de paths para melhor resolução de módulos
- **Sistema de Importações**: Substituídas importações relativas por aliases para melhor manutenção
- **Autenticação**: Otimizada configuração do Auth.js v5 para melhor performance

### 🔧 Técnico
- **tsconfig.json**: Removida duplicação de `baseUrl` que causava conflitos
- **Alias de Paths**: Configurados corretamente todos os aliases `@/*` para resolução adequada
- **Build Process**: Melhorada estabilidade do processo de build com configurações corrigidas

---

## [0.2.4] - 2025-08-15

### ✨ Novas Funcionalidades
- **Página Pública de Changelog**: Implementada página de changelog acessível publicamente sem necessidade de autenticação
- **Layout Público**: Criado componente `PublicLayout` para páginas que não requerem autenticação
- **Navegação Pública**: Adicionado cabeçalho com navegação para páginas públicas

### 🛠️ Melhorias
- **Middleware**: Configurado para permitir acesso público às rotas `/changelog`, `/login` e `/api/auth`
- **Acessibilidade**: Melhorada estrutura semântica da página de changelog
- **Responsividade**: Layout adaptável para dispositivos móveis e desktop
- **Build Info**: Atualizado sistema de informações de build

### 🔧 Configurações
- **Roteamento**: Configurado Next.js para permitir acesso público ao changelog
- **Autenticação**: Ajustado middleware para não bloquear rotas públicas

---

## [0.2.3] - 2025-08-15

### 🔒 Segurança
- **Tratamento de Erros JWT**: Implementado sistema robusto para capturar e tratar erros de descriptografia JWT
- **Middleware de Autenticação**: Adicionado tratamento de erros no middleware com limpeza automática de cookies corrompidos
- **Error Boundary**: Criado componente para capturar erros de autenticação em toda a aplicação
- **Página de Erro Personalizada**: Nova página `/auth/error` para tratar erros de autenticação de forma elegante

### 🐛 Correções
- **Erro de Paginação**: Corrigido erro `Cannot read properties of undefined (reading 'paginaAtual')` na página de usuários
- **Estrutura de API**: Padronizada estrutura de resposta das APIs com nomenclatura em português
- **Consistência de Dados**: Alinhada estrutura de paginação entre frontend e backend
- **Autenticação**: Corrigido erro `CLIENT_FETCH_ERROR` e `net::ERR_ABORTED` na rota `/api/auth/session`
- **Componentes Select**: Corrigido erro `A <Select.Item /> must have a value prop that is not an empty string` nos componentes de filtros e formulários

### 🛠️ Melhorias
- **Utilitários de Autenticação**: Criada biblioteca `auth-utils.ts` com funções para:
  - Limpeza de cookies do NextAuth
  - Detecção de erros JWT
  - Logout forçado com limpeza completa
  - Gerenciamento de sessão
- **Callbacks NextAuth**: Adicionado tratamento de erro nos callbacks `jwt` e `session`
- **Configuração JWT**: Melhorada configuração com `maxAge` e `updateAge` para sessões
- **Modo Debug**: Habilitado debug do NextAuth em desenvolvimento
- **APIs Padronizadas**: Estrutura de resposta consistente em todas as APIs com `success`, `data` e `timestamp`
- **Padronização de APIs**: Implementada nomenclatura consistente em português brasileiro para todas as propriedades de paginação
- **Paginação Robusta**: Adicionadas propriedades `temProximaPagina` e `temPaginaAnterior` para melhor controle de navegação
- **NextAuth**: Removida rota de sessão personalizada conflitante, utilizando apenas a rota padrão do NextAuth v4

### 🧪 Desenvolvimento
- **Página de Teste**: Criada página `/test-jwt` para testar funcionalidades de tratamento JWT
- **Logs Melhorados**: Adicionados logs detalhados para debugging de problemas de autenticação

### 🔧 Técnico
- **Redirecionamento Automático**: Tokens corrompidos agora redirecionam automaticamente para login
- **Limpeza de Cookies**: Implementada limpeza completa de todos os cookies relacionados ao NextAuth
- **Tratamento de Erro Robusto**: Sistema resiliente que previne crashes por tokens JWT corrompidos
- **Paginação Robusta**: Sistema de paginação com valores padrão e tratamento de estados indefinidos

---

## [0.2.2] - 2025-08-14

### 🔧 Alterado
- **Datas do Changelog**: Atualizadas as datas das versões 0.2.1, 0.2.0 e 0.1.0 para agosto de 2025
- **Sistema de Versionamento**: Configurado para usar data atual do sistema para próximos changelogs
- **Build Info**: Geradas novas informações de build com versão 0.2.2

### 🛠️ Técnico
- **Parser de Data**: Atualizado para suportar novas datas e usar data atual como fallback
- **Banco de Dados**: Preparado para repopulação com datas atualizadas
- **Versionamento**: Incremento para versão 0.2.2

---

## [0.2.1] - 2025-08-14

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

## [0.2.0] - 2025-08-13

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

## [0.1.0] - 2025-08-13

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