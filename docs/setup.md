# Guia de Setup - Koerner 360

## Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- PostgreSQL 15+ (ou Docker)
- Git

## Instalação

### 1. Clone o Repositório

```bash
git clone <repository-url>
cd koerner360
```

### 2. Instale as Dependências

```bash
npm install
```

### 3. Configure o Banco de Dados

#### Opção A: Docker (Recomendado)

```bash
# Inicie o PostgreSQL via Docker
docker-compose up -d postgres

# Verifique se está rodando
docker-compose ps
```

#### Opção B: PostgreSQL Local

1. Instale o PostgreSQL
2. Crie o banco de dados:
   ```sql
   CREATE DATABASE koerner360;
   ```

### 4. Configure as Variáveis de Ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env.local

# Edite as variáveis conforme necessário
```

**Variáveis principais:**
```env
# Banco de Dados
DATABASE_URL="postgresql://postgres:password@localhost:5432/koerner360?schema=public"

# NextAuth.js
NEXTAUTH_SECRET="seu-secret-super-seguro-aqui"
NEXTAUTH_URL="http://localhost:3000"
```

### 5. Configure o Prisma

```bash
# Gere o cliente Prisma
npm run db:generate

# Aplique o schema ao banco (desenvolvimento)
npm run db:push

# Popule com dados iniciais
npm run db:seed
```

### 6. Inicie o Servidor de Desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em: http://localhost:3000

## Usuários Padrão

Após executar o seed, você pode fazer login com:

| Tipo | Email | Senha |
|------|-------|-------|
| Admin | admin@koerner360.com | admin123 |
| Supervisor | supervisor@koerner360.com | supervisor123 |
| Atendente | atendente@koerner360.com | atendente123 |

## Scripts Úteis

### Desenvolvimento
```bash
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Inicia servidor de produção
npm run lint         # Executa ESLint
npm run type-check   # Verifica tipos TypeScript
```

### Banco de Dados
```bash
npm run db:generate  # Gera cliente Prisma
npm run db:push      # Aplica schema (dev)
npm run db:migrate   # Cria migração
npm run db:seed      # Popula com dados
npm run db:studio    # Interface visual
npm run db:reset     # Reset completo
```

### Docker
```bash
# Iniciar serviços
docker-compose up -d

# Parar serviços
docker-compose down

# Ver logs
docker-compose logs -f postgres

# Acessar PgAdmin (opcional)
# http://localhost:5050
# Email: admin@koerner360.com
# Senha: admin123
```

## Estrutura do Projeto

```
koerner360/
├── src/
│   ├── app/                 # App Router (Next.js 13+)
│   ├── components/          # Componentes React
│   │   ├── ui/             # Componentes shadcn/ui
│   │   └── forms/          # Formulários
│   ├── lib/                # Utilitários e configurações
│   │   ├── auth.ts         # Configuração NextAuth.js
│   │   ├── prisma.ts       # Cliente Prisma
│   │   └── utils.ts        # Funções utilitárias
│   └── types/              # Definições de tipos
├── prisma/
│   ├── schema.prisma       # Schema do banco
│   ├── seed.ts            # Dados iniciais
│   └── README.md          # Documentação Prisma
├── docs/                   # Documentação
├── public/                 # Arquivos estáticos
└── ...
```

## Fluxo de Desenvolvimento

### 1. Alterações no Schema

```bash
# 1. Edite prisma/schema.prisma
# 2. Crie migração
npm run db:migrate
# 3. Gere cliente
npm run db:generate
```

### 2. Novos Componentes

```bash
# Use shadcn/ui para componentes base
npx shadcn-ui@latest add button
npx shadcn-ui@latest add form
```

### 3. Testes

```bash
# Execute testes
npm test

# Testes em modo watch
npm run test:watch

# Coverage
npm run test:coverage
```

## Troubleshooting

### Problemas Comuns

#### 1. Erro de Conexão com Banco
```bash
# Verifique se o PostgreSQL está rodando
docker-compose ps

# Teste a conexão
npx prisma db pull
```

#### 2. Cliente Prisma Desatualizado
```bash
npm run db:generate
```

#### 3. Erro de Migração
```bash
# Reset do banco (CUIDADO: apaga dados)
npm run db:reset
```

#### 4. Porta 3000 em Uso
```bash
# Use outra porta
PORT=3001 npm run dev
```

#### 5. Problemas com Node Modules
```bash
# Limpe e reinstale
rm -rf node_modules package-lock.json
npm install
```

### Logs Úteis

```bash
# Logs do Docker
docker-compose logs -f

# Logs do Next.js
# Disponíveis no terminal onde rodou npm run dev

# Logs do Prisma
# Habilitados automaticamente em desenvolvimento
```

## Próximos Passos

1. Explore a aplicação em http://localhost:3000
2. Faça login com os usuários padrão
3. Consulte a documentação em `docs/`
4. Verifique o Prisma Studio em http://localhost:5555 (após `npm run db:studio`)

## Suporte

Para dúvidas ou problemas:

1. Consulte a documentação em `docs/`
2. Verifique os logs de erro
3. Consulte o troubleshooting acima
4. Abra uma issue no repositório

---

**Desenvolvido com ❤️ para o Koerner 360**