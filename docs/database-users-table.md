# Tabela Atendentes - Supabase

## Visão Geral

Este documento descreve a estrutura completa da tabela `atendentes` no banco de dados Supabase do projeto Koerner 360.

**Descrição da Tabela**: Tabela de atendentes para avaliação por pesquisa de satisfação

**Schema**: public  
**Nome da Tabela**: atendentes  

## Estrutura das Colunas

| # | Nome | Tipo de Dados | Formato | Obrigatório | Único | Valor Padrão | Descrição |
|---|------|---------------|---------|-------------|-------|--------------|----------|
| 1 | `id` | uuid | uuid | ✅ | ❌ | `gen_random_uuid()` | Identificador único do atendente |
| 2 | `nome` | character varying | varchar | ✅ | ❌ | - | Nome completo do atendente |
| 3 | `email` | character varying | varchar | ✅ | ✅ | - | Email único do atendente |
| 4 | `status` | character varying | varchar | ✅ | ❌ | `'ativo'` | Status do atendente no sistema |
| 5 | `avatarUrl` | text | text | ❌ | ❌ | - | URL da foto do atendente |
| 6 | `foto` | bytea | bytea | ❌ | ❌ | - | Foto do atendente em formato binário |
| 7 | `telefone` | character varying | varchar | ✅ | ❌ | - | Número de telefone |
| 8 | `portaria` | character varying | varchar | ✅ | ❌ | - | Número da portaria |
| 9 | `dataAdmissao` | date | date | ✅ | ❌ | - | Data de admissão |
| 10 | `dataNascimento` | date | date | ✅ | ❌ | - | Data de nascimento |
| 11 | `rg` | character varying | varchar | ✅ | ✅ | - | Número do RG |
| 12 | `cpf` | character varying | varchar | ✅ | ✅ | - | CPF único do atendente |
| 13 | `setor` | character varying | varchar | ✅ | ❌ | - | Setor de atuação |
| 14 | `cargo` | character varying | varchar | ✅ | ❌ | - | Cargo do atendente |


## Chaves e Relacionamentos

### Chave Primária
- **Campo**: `id` (uuid)
- **Tipo**: Primary Key

### Campos Únicos
- `email` - Email único para identificação
- `cpf` - CPF único para identificação
- `rg` - RG único para identificação

### Relacionamentos (Foreign Keys)

A tabela `atendentes` é referenciada por:

1. **Tabela `avaliacoes`**
   - Campo: `atendenteId` → `atendentes.id`
   - Constraint: `avaliacoes_atendenteId_fkey`
   - Descrição: Relaciona avaliações de satisfação com atendentes

2. **Tabela `audit_logs`**
   - Campo: `atendenteId` → `atendentes.id`
   - Constraint: `audit_logs_atendenteId_fkey`
   - Descrição: Relaciona logs de auditoria com atendentes

## Status do Atendente

O campo `status` define o estado do atendente no sistema:

- **`ativo`**: Atendente em atividade normal
- **`ferias`**: Atendente em período de férias
- **`afastado`**: Atendente temporariamente afastado
- **`inativo`**: Atendente desligado da instituição

## Exemplos de Dados

### Atendente Padrão

## SQL para Criar a Tabela

Para criar esta tabela no seu banco de dados Supabase, execute o seguinte comando SQL:

### Atendente Padrão
