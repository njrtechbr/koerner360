# Sistema de Versionamento e Changelog

Este documento descreve o sistema automatizado de versionamento e changelog implementado no Koerner 360.

## Visão Geral

O sistema inclui:
- Geração automática de informações de build
- Criação automática de changelogs baseada em commits Git
- Interface web para gerenciamento de changelogs
- Versionamento semântico automatizado

## Componentes

### 1. Geração de Build Info

**Arquivo:** `scripts/build-info.js`

**Funcionalidade:**
- Captura informações do Git (branch, commit, mensagem)
- Gera versão automática baseada em tags ou timestamp
- Cria arquivo `src/lib/build-info.ts` com dados estruturados
- Detecta mudanças não commitadas
- Inclui informações do ambiente (Node.js, plataforma, etc.)

**Uso:**
```bash
npm run build:info
```

### 2. Criação Automática de Changelog

**Arquivo:** `scripts/create-changelog.js`

**Funcionalidade:**
- Analisa commits desde a última tag Git
- Classifica mudanças usando Conventional Commits
- Cria entradas no banco de dados
- Gera itens detalhados para cada mudança
- Determina prioridade e categoria automaticamente

**Comandos disponíveis:**
```bash
# Criar changelog baseado nos commits
npm run changelog:create

# Publicar o último changelog não publicado
npm run changelog:publish

# Criar e publicar automaticamente
npm run changelog:auto
```

### 3. Interface Web

**Páginas:**
- `/changelog` - Visualização pública dos changelogs
- `/admin/changelog` - Gerenciamento administrativo

**Funcionalidades:**
- Listagem paginada de changelogs
- Filtros por versão e status
- Criação e edição manual
- Publicação/despublicação
- Visualização de informações de build

### 4. API Endpoints

**Rotas principais:**
- `GET /api/changelog` - Listar changelogs
- `POST /api/changelog` - Criar novo changelog
- `GET /api/changelog/[id]` - Obter changelog específico
- `PUT /api/changelog/[id]` - Atualizar changelog
- `DELETE /api/changelog/[id]` - Deletar changelog
- `GET /api/changelog/[id]/itens` - Listar itens do changelog
- `POST /api/changelog/[id]/itens` - Criar item do changelog

## Estrutura do Banco de Dados

### Tabela `Changelog`

```sql
CREATE TABLE changelog (
  id VARCHAR PRIMARY KEY,
  versao VARCHAR NOT NULL,
  data_lancamento TIMESTAMP NOT NULL,
  tipo tipo_mudanca NOT NULL,
  titulo VARCHAR NOT NULL,
  descricao TEXT,
  categoria categoria_changelog,
  prioridade prioridade_changelog NOT NULL,
  publicado BOOLEAN DEFAULT false,
  criado_em TIMESTAMP DEFAULT now(),
  atualizado_em TIMESTAMP DEFAULT now(),
  autor_id VARCHAR REFERENCES usuarios(id)
);
```

### Tabela `ChangelogItem`

```sql
CREATE TABLE changelog_item (
  id VARCHAR PRIMARY KEY,
  changelog_id VARCHAR REFERENCES changelog(id),
  tipo tipo_mudanca NOT NULL,
  titulo VARCHAR NOT NULL,
  descricao TEXT,
  ordem INTEGER NOT NULL
);
```

### Enums

```sql
-- Tipos de mudança
CREATE TYPE tipo_mudanca AS ENUM (
  'ADICIONADO',
  'ALTERADO', 
  'CORRIGIDO',
  'REMOVIDO',
  'DEPRECIADO',
  'SEGURANCA'
);

-- Categorias
CREATE TYPE categoria_changelog AS ENUM (
  'FUNCIONALIDADE',
  'INTERFACE',
  'PERFORMANCE',
  'SEGURANCA',
  'CONFIGURACAO',
  'DOCUMENTACAO',
  'TECNICO'
);

-- Prioridades
CREATE TYPE prioridade_changelog AS ENUM (
  'BAIXA',
  'MEDIA',
  'ALTA',
  'CRITICA'
);
```

## Conventional Commits

O sistema reconhece os seguintes tipos de commit:

| Tipo | Mapeamento | Categoria | Prioridade |
|------|------------|-----------|------------|
| `feat:` | ADICIONADO | FUNCIONALIDADE | MEDIA |
| `fix:` | CORRIGIDO | FUNCIONALIDADE | ALTA |
| `docs:` | ADICIONADO | DOCUMENTACAO | BAIXA |
| `style:` | ALTERADO | INTERFACE | BAIXA |
| `refactor:` | ALTERADO | TECNICO | MEDIA |
| `perf:` | ALTERADO | PERFORMANCE | MEDIA |
| `test:` | ALTERADO | TECNICO | BAIXA |
| `chore:` | ALTERADO | CONFIGURACAO | BAIXA |
| `security:` | SEGURANCA | SEGURANCA | ALTA |
| `breaking:` | ALTERADO | FUNCIONALIDADE | CRITICA |

## Fluxo de Trabalho

### 1. Desenvolvimento

```bash
# Durante o desenvolvimento
git add .
git commit -m "feat: adicionar nova funcionalidade X"
```

### 2. Build

```bash
# Gerar informações de build (executado automaticamente no prebuild)
npm run build:info
```

### 3. Release

```bash
# Criar changelog baseado nos commits
npm run changelog:create

# Publicar changelog
npm run changelog:publish

# Ou fazer tudo de uma vez
npm run changelog:auto
```

### 4. Versionamento

```bash
# Versão patch (0.1.0 -> 0.1.1)
npm run version:patch

# Versão minor (0.1.0 -> 0.2.0)
npm run version:minor

# Versão major (0.1.0 -> 1.0.0)
npm run version:major
```

## Configuração

### Variáveis de Ambiente

```env
# Banco de dados (obrigatório)
DATABASE_URL=postgresql://user:password@localhost:5432/koerner360

# Autenticação (obrigatório)
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Build info (opcional)
BUILD_NUMBER=123
CI_COMMIT_SHA=abc123
GITHUB_SHA=abc123
CI_COMMIT_REF_NAME=main
GITHUB_REF_NAME=main
CI_PIPELINE_ID=456
GITHUB_RUN_ID=456
```

### Scripts do Package.json

```json
{
  "scripts": {
    "build:info": "node scripts/build-info.js",
    "changelog:create": "node scripts/create-changelog.js create",
    "changelog:publish": "node scripts/create-changelog.js publish",
    "changelog:auto": "node scripts/create-changelog.js auto",
    "prebuild": "npm run build:info"
  }
}
```

## Permissões

### Visualização
- **Público:** Pode ver changelogs publicados
- **Usuários logados:** Pode ver changelogs publicados

### Gerenciamento
- **Admin:** Acesso total (criar, editar, publicar, deletar)
- **Supervisor:** Apenas visualização
- **Atendente:** Apenas visualização

## Troubleshooting

### Problemas Comuns

1. **Erro: Environment variable not found: DATABASE_URL**
   ```bash
   # Usar dotenv para carregar variáveis
   npx dotenv -e .env.local -- node scripts/create-changelog.js create
   ```

2. **Erro: The table `public.changelog` does not exist**
   ```bash
   # Aplicar migrações
   npx dotenv -e .env.local -- prisma migrate dev
   ```

3. **Erro: Invalid value for argument `tipo`**
   - Verificar se os valores dos enums estão corretos no script
   - Consultar `prisma/schema.prisma` para valores válidos

4. **Erro: No admin user found**
   - O script criará automaticamente um usuário admin
   - Email: `sistema@koerner360.com`
   - Senha: `sistema123`

### Logs e Debug

```bash
# Ver logs detalhados do Prisma
DEBUG=prisma:* npm run changelog:create

# Verificar status do banco
npm run db:studio

# Testar conexão
npm run db:test
```

## Próximos Passos

1. **Integração com CI/CD**
   - Automatizar criação de changelog em pipelines
   - Gerar releases automáticos no GitHub

2. **Notificações**
   - Email para usuários sobre novos changelogs
   - Webhook para sistemas externos

3. **Métricas**
   - Dashboard de estatísticas de changelog
   - Análise de frequência de mudanças

4. **Exportação**
   - Gerar CHANGELOG.md automático
   - Export para diferentes formatos (PDF, JSON)

## Referências

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Next.js Documentation](https://nextjs.org/docs/)