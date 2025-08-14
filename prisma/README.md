# Prisma - Koerner 360

Este diretório contém a configuração do Prisma ORM para o sistema Koerner 360.

## 📁 Estrutura

- `schema.prisma` - Schema do banco de dados com modelos e relacionamentos
- `seed.ts` - Script para popular o banco com dados iniciais
- `migrations/` - Histórico de migrações do banco (criado automaticamente)

## 🚀 Comandos Úteis

### Desenvolvimento
```bash
# Gerar cliente Prisma
npm run db:generate

# Aplicar mudanças no schema ao banco (desenvolvimento)
npm run db:push

# Criar e aplicar migração
npm run db:migrate

# Popular banco com dados iniciais
npm run db:seed

# Abrir Prisma Studio (interface visual)
npm run db:studio

# Resetar banco de dados
npm run db:reset
```

### Comandos Diretos
```bash
# Gerar cliente
npx prisma generate

# Aplicar schema
npx prisma db push

# Criar migração
npx prisma migrate dev --name nome_da_migracao

# Executar seed
npx tsx prisma/seed.ts

# Abrir Studio
npx prisma studio
```

## 📊 Modelos de Dados

### Usuario
- **Campos**: id, email, nome, senha, tipoUsuario, ativo, criadoEm, atualizadoEm
- **Tipos**: ADMIN, SUPERVISOR, ATENDENTE
- **Relacionamentos**: supervisor/atendentes, avaliações, feedbacks

### Avaliacao
- **Campos**: id, nota (1-5), comentario, periodo, criadoEm, atualizadoEm
- **Relacionamentos**: avaliado, avaliador
- **Restrição**: única por avaliado/avaliador/período

### Feedback
- **Campos**: id, titulo, conteudo, tipo, prioridade, status, criadoEm, atualizadoEm
- **Tipos**: ELOGIO, SUGESTAO, RECLAMACAO, MELHORIA
- **Prioridades**: BAIXA, MEDIA, ALTA, URGENTE
- **Status**: PENDENTE, EM_ANALISE, RESOLVIDO, REJEITADO

## 🔧 Configuração

### Variáveis de Ambiente
```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/koerner360?schema=public"
```

### Banco de Dados
O sistema utiliza PostgreSQL. Certifique-se de ter:
1. PostgreSQL instalado e rodando
2. Banco de dados `koerner360` criado
3. Usuário com permissões adequadas

## 👥 Usuários Padrão (Seed)

- **Admin**: admin@koerner360.com / admin123
- **Supervisor**: supervisor@koerner360.com / supervisor123
- **Atendente**: atendente@koerner360.com / atendente123

## 🔍 Prisma Studio

Para visualizar e editar dados graficamente:
```bash
npm run db:studio
```
Acesse: http://localhost:5555

## 📝 Migrações

Para ambientes de produção, sempre use migrações:
```bash
# Criar migração
npx prisma migrate dev --name descricao_da_mudanca

# Aplicar migrações em produção
npx prisma migrate deploy
```

## 🚨 Troubleshooting

### Erro de Conexão
1. Verifique se o PostgreSQL está rodando
2. Confirme a DATABASE_URL no .env.local
3. Teste a conexão: `npx prisma db pull`

### Cliente Desatualizado
```bash
npm run db:generate
```

### Reset Completo
```bash
npm run db:reset
npm run db:seed
```