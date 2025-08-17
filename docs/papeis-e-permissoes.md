# Papéis e Permissões - Sistema Koerner 360

## 📋 Visão Geral

O Sistema Koerner 360 é uma plataforma de gestão de feedback e avaliações que opera com duas entidades principais distintas: **Usuários** e **Atendentes**. Cada entidade possui funções, responsabilidades e fluxos de trabalho independentes, embora interajam no contexto das avaliações.

### Conceito Fundamental

**Usuários** e **Atendentes** são entidades completamente separadas no sistema:

- **Atendentes**: São registrados no sistema para serem **avaliados** em pesquisas de satisfação
- **Usuários**: Têm acesso ao sistema para **consultar** os dados das avaliações realizadas

## 🎭 Definição de Entidades

### 👤 Atendente

**Propósito**: Profissionais que prestam atendimento e são objeto de avaliação.

**Características**:
- Cadastrados no sistema para serem avaliados
- Não possuem acesso direto ao sistema
- São o foco das pesquisas de satisfação
- Têm dados pessoais e profissionais registrados
- Podem ter múltiplas avaliações associadas

**Dados Armazenados**:
- Informações pessoais (nome, email, telefone)
- Dados profissionais (cargo, departamento, supervisor)
- Endereço e observações
- Status (ativo/inativo)
- Histórico de avaliações recebidas

### 👥 Usuário

**Propósito**: Pessoas autorizadas a acessar o sistema para consultar e gerenciar dados de avaliações.

**Características**:
- Possuem credenciais de acesso ao sistema
- Podem consultar dados de avaliações
- Têm diferentes níveis de permissão
- Gerenciam o sistema e seus dados
- Não são objeto de avaliação

**Dados Armazenados**:
- Credenciais de acesso (email, senha)
- Informações básicas (nome, tipo)
- Permissões e nível de acesso
- Logs de atividade no sistema

## 🔐 Tipos de Usuário e Permissões

### 1. Usuário Administrador

**Responsabilidades**:
- Gestão completa do sistema
- Criação e gerenciamento de outros usuários
- Configuração de parâmetros do sistema
- Acesso a todos os dados e relatórios
- Gestão de atendentes

**Permissões**:
- ✅ Criar, editar e excluir usuários
- ✅ Criar, editar e excluir atendentes
- ✅ Visualizar todas as avaliações
- ✅ Gerar relatórios completos
- ✅ Configurar sistema
- ✅ Gerenciar permissões
- ✅ Acesso ao painel administrativo

### 2. Usuário Supervisor

**Responsabilidades**:
- Supervisão de atendentes específicos
- Análise de avaliações de sua equipe
- Geração de relatórios departamentais
- Gestão limitada de atendentes

**Permissões**:
- ✅ Visualizar atendentes de sua supervisão
- ✅ Editar dados de atendentes supervisionados
- ✅ Visualizar avaliações de sua equipe
- ✅ Gerar relatórios departamentais
- ❌ Criar/excluir usuários
- ❌ Configurar sistema
- ❌ Acesso a dados de outras equipes

### 3. Usuário Consultor

**Características:**
- Acesso somente leitura ao sistema com foco em gamificação
- Especialista em análise competitiva entre atendentes
- Responsável por promover competitividade saudável
- Acesso a dashboards de ranking e comparação
- Foco em métricas de gamificação e performance

**Responsabilidades:**
- Consultar avaliações com foco em comparação entre atendentes
- Gerar relatórios de ranking e performance competitiva
- Analisar métricas de gamificação (pontos, níveis, conquistas)
- Acompanhar evolução temporal de atendentes
- Promover competitividade através de insights
- Identificar oportunidades de melhoria baseadas em comparações

**Permissões Específicas:**
- ✅ Visualizar rankings de atendentes por diferentes métricas
- ✅ Acessar sistema de gamificação (pontos, níveis, conquistas)
- ✅ Gerar relatórios comparativos entre atendentes
- ✅ Visualizar dashboards de competitividade
- ✅ Exportar dados de performance e rankings
- ✅ Acessar métricas avançadas de comparação
- ✅ Visualizar evolução temporal de performance
- ❌ Criar/editar/excluir qualquer registro
- ❌ Gerenciar usuários ou atendentes
- ❌ Modificar sistema de pontuação ou conquistas
- ❌ Configurar parâmetros de gamificação

## 🎮 Sistema de Gamificação

### Visão Geral
O Sistema Koerner 360 implementa um robusto sistema de gamificação focado em promover competitividade saudável entre atendentes e fornecer insights valiosos para usuários consultores.

### Componentes do Sistema

#### 1. Sistema de Pontuação
- **Pontos por Avaliação**: Baseado na nota recebida (1-5)
- **Bônus de Sequência**: Pontos extras por consistência
- **Multiplicadores**: Fatores baseados em período e contexto
- **Penalizações**: Redução por performance baixa

#### 2. Níveis e Progressão
- **7 Níveis**: Iniciante → Lenda
- **Experiência Acumulativa**: Baseada em pontos totais
- **Títulos Especiais**: Reconhecimento por conquistas
- **Benefícios por Nível**: Vantagens progressivas

#### 3. Sistema de Conquistas
- **5 Categorias**: Bronze, Prata, Ouro, Platina, Diamante
- **Tipos de Conquista**: Volume, Qualidade, Consistência, Especiais
- **Requisitos Dinâmicos**: Critérios adaptativos
- **Recompensas**: Pontos e reconhecimento

#### 4. Rankings e Competição
- **Rankings Globais**: Posição entre todos os atendentes
- **Rankings Setoriais**: Competição por departamento
- **Rankings Temporais**: Mensal, trimestral, anual
- **Métricas Múltiplas**: Diferentes critérios de ordenação

### Permissões por Papel

#### Usuário Consultor (Foco Principal)
- ✅ **Visualização Completa**: Acesso a todos os rankings e métricas
- ✅ **Análise Comparativa**: Ferramentas de comparação entre atendentes
- ✅ **Relatórios Especializados**: Relatórios focados em competitividade
- ✅ **Dashboards Interativos**: Visualizações dinâmicas de performance
- ✅ **Exportação de Dados**: Dados para análises externas
- ❌ **Modificação**: Não pode alterar pontuações ou conquistas

#### Administrador
- ✅ **Configuração Completa**: Definir regras de pontuação
- ✅ **Gestão de Conquistas**: Criar/editar/remover conquistas
- ✅ **Ajustes de Sistema**: Modificar algoritmos e parâmetros
- ✅ **Relatórios Administrativos**: Métricas de engajamento
- ✅ **Auditoria**: Logs de atividades do sistema

#### Supervisor
- ✅ **Visualização Setorial**: Rankings e métricas do seu setor
- ✅ **Relatórios Departamentais**: Performance da sua equipe
- ✅ **Acompanhamento**: Evolução dos atendentes supervisionados
- ❌ **Configuração**: Não pode alterar regras globais

### Métricas de Gamificação

#### Métricas Individuais
- **Pontuação Total**: Soma acumulada de pontos
- **Nível Atual**: Baseado na experiência
- **Posição no Ranking**: Posição relativa
- **Conquistas Obtidas**: Badges e reconhecimentos
- **Sequência Atual**: Dias consecutivos de boa performance
- **Taxa de Crescimento**: Evolução da pontuação

#### Métricas Comparativas
- **Gap de Performance**: Diferença para líderes
- **Percentil**: Posição percentual
- **Tendência**: Direção da evolução
- **Consistência**: Variabilidade da performance
- **Velocidade de Progressão**: Taxa de subida de nível

#### Métricas de Equipe
- **Ranking Setorial**: Posições por departamento
- **Média do Setor**: Comparação com pares
- **Distribuição de Níveis**: Composição da equipe
- **Conquistas Coletivas**: Achievements de grupo

## 🔄 Fluxos de Trabalho

### Fluxo de Cadastro de Atendente

1. **Usuário Administrador/Supervisor** acessa o sistema
2. Navega para "Gestão de Atendentes"
3. Cadastra novo atendente com dados pessoais e profissionais
4. Atendente fica disponível para receber avaliações
5. Sistema gera identificador único para o atendente

### Fluxo de Avaliação

#### Sistema Atual de Pesquisa de Satisfação

**URL de Acesso**: `https://www.e-koerner.com.br/survey?attendantId={id}`

**Exemplo**: `https://www.e-koerner.com.br/survey?attendantId=4c16287b-8e11-4646-8e9a-bb3ea41c608f`

**Características do Sistema Atual**:
- ✅ **Acesso Público**: Não requer autenticação
- ✅ **Identificação por UUID**: Cada atendente possui ID único
- ✅ **Interface Responsiva**: Compatível com dispositivos móveis
- ⚠️ **Tempo de Carregamento**: Alguns segundos para carregamento completo
- ✅ **Comentários Opcionais**: Campo para feedback adicional
- ✅ **Foco na Melhoria**: "Seu feedback nos ajuda a melhorar nossos serviços"

#### Fluxo Detalhado

1. **Cliente/Avaliador** acessa URL específica do atendente
2. **Sistema** carrega formulário de pesquisa (aguardar carregamento completo)
3. **Avaliador** preenche questionário de satisfação
4. **Avaliador** pode deixar comentário opcional
5. **Sistema** registra avaliação com timestamp
6. **Usuários autenticados** podem consultar a avaliação no dashboard

### Fluxo de Consulta de Dados

1. **Usuário** faz login no sistema
2. Acessa dashboard com métricas gerais
3. Navega para seções específicas conforme permissões
4. Consulta avaliações, relatórios e dados de atendentes
5. Gera relatórios conforme necessário

## 🏗️ Estrutura do Banco de Dados

### Migração de Dados do Supabase

**Contexto da Migração**: O sistema Koerner 360 passou por uma migração completa de dados do Supabase para PostgreSQL local, garantindo a preservação total dos dados históricos e a continuidade operacional. A migração incluiu **37 usuários** e **56 avaliações** com dados completos de perfil profissional.

#### Estrutura das Tabelas no Supabase

**Tabela `users` (Origem)**:
```sql
-- Estrutura completa da tabela users no Supabase
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,
  role VARCHAR NOT NULL,
  accessType VARCHAR NOT NULL,
  status VARCHAR DEFAULT 'ativo',
  avatarUrl TEXT,
  telefone VARCHAR,
  portaria VARCHAR,
  situacao VARCHAR,
  dataAdmissao DATE,
  dataNascimento DATE,
  rg VARCHAR,
  cpf VARCHAR UNIQUE,
  createdAt TIMESTAMPTZ DEFAULT now(),
  updatedAt TIMESTAMPTZ DEFAULT now()
);
```

**Tabela `reviews` (Origem)**:
```sql
-- Estrutura da tabela reviews no Supabase
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attendantId UUID NOT NULL REFERENCES users(id),
  rating INTEGER NOT NULL,
  comment TEXT,
  date TIMESTAMPTZ DEFAULT now()
);
```

#### Mapeamento de Dados

**Tipos de Usuários Identificados**:
- **Admin**: 5 usuários (admin, Assistente administrativo, Tabelião Substituto)
- **Attendant**: 32 usuários (diversos cargos de cartório)

**Cargos Profissionais Mapeados**:
- Escrevente (5), Escrevente I (6), Escrevente II (3)
- Escrevente Agile (1), Escrevente Agile I (1)
- Auxiliar de cartório (3)
- Tabelião Substituto (3)
- Assistente administrativo (2)
- attendant (12) - cargo genérico
- admin (1) - administrador sistema

**Tabelas Migradas**:
- **users** → **usuarios**: 37 usuários com dados completos de perfil
- **reviews** → **avaliacoes**: 56 avaliações históricas com preservação de relacionamentos

**Processo de Migração**:
1. Análise estrutural das tabelas Supabase
2. Mapeamento de campos e tipos de dados
3. Criação de scripts de migração sem perda de dados
4. Validação de integridade referencial
5. Importação completa com verificação de consistência

### Tabela: usuarios
```sql
CREATE TABLE usuarios (
  id VARCHAR PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  tipo ENUM('admin', 'supervisor', 'consultor') NOT NULL,
  ativo BOOLEAN DEFAULT true,
  -- Campos migrados do Supabase
  telefone VARCHAR(20),
  portaria VARCHAR(100),
  situacao VARCHAR(50),
  data_admissao DATE,
  data_nascimento DATE,
  rg VARCHAR(20),
  cpf VARCHAR(14),
  avatar_url TEXT,
  access_type VARCHAR(50),
  -- Campos de controle
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW(),
  migrado_supabase BOOLEAN DEFAULT false,
  supabase_id VARCHAR -- Referência ao ID original do Supabase
);
```

### Tabela: atendentes
```sql
CREATE TABLE atendentes (
  id VARCHAR PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  telefone VARCHAR(20),
  cargo VARCHAR(100),
  departamento VARCHAR(100),
  supervisor_id VARCHAR REFERENCES usuarios(id),
  endereco TEXT,
  observacoes TEXT,
  status ENUM('ativo', 'inativo', 'licenca') DEFAULT 'ativo',
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);
```

### Tabela: avaliacoes
```sql
CREATE TABLE avaliacoes (
  id VARCHAR PRIMARY KEY,
  atendente_id VARCHAR REFERENCES atendentes(id),
  avaliador_nome VARCHAR(100),
  avaliador_email VARCHAR(255),
  nota_geral INTEGER CHECK (nota_geral >= 1 AND nota_geral <= 5),
  comentarios TEXT,
  data_avaliacao TIMESTAMP DEFAULT NOW(),
  ip_origem INET,
  user_agent TEXT,
  -- Campos de migração do Supabase
  migrado_supabase BOOLEAN DEFAULT false,
  supabase_id VARCHAR, -- Referência ao ID original do Supabase
  supabase_attendant_id VARCHAR -- ID do atendente no Supabase
);
```

### Tabela: dados_migracao_supabase
```sql
CREATE TABLE dados_migracao_supabase (
  id VARCHAR PRIMARY KEY,
  tabela_origem VARCHAR(50) NOT NULL,
  tabela_destino VARCHAR(50) NOT NULL,
  total_registros INTEGER NOT NULL,
  registros_migrados INTEGER NOT NULL,
  registros_com_erro INTEGER DEFAULT 0,
  data_inicio_migracao TIMESTAMP NOT NULL,
  data_fim_migracao TIMESTAMP,
  status VARCHAR(20) DEFAULT 'em_andamento',
  observacoes TEXT,
  checksum_origem VARCHAR(255),
  checksum_destino VARCHAR(255)
);
```

### Sistema de Gamificação Migrado

O Supabase continha configurações avançadas de gamificação que foram preservadas:

#### Configurações de Gamificação
```json
{
  "gamification": {
    "enabled": true,
    "levelSystem": {
      "enabled": true,
      "thresholds": [0, 100, 250, 500, 1000, 2000, 3500, 5000, 7500, 10000]
    },
    "streakSystem": {
      "enabled": true,
      "maxDays": 30
    },
    "currentPeriod": {
      "name": "Período 2025 - 1º Semestre",
      "startDate": "2025-01-01",
      "endDate": "2025-06-30",
      "description": "Período de gamificação do primeiro semestre de 2025"
    }
  }
}
```

#### Conquistas (Achievement Badges)
- **Primeira Avaliação** (Bronze): 1 avaliação
- **Dedicado** (Prata): 10 avaliações
- **Comprometido** (Ouro): 50 avaliações
- **Excepcional** (Platina): 100 avaliações
- **Perfeição** (Platina): Nota 5.0 com 10+ avaliações
- **Excelência** (Ouro): Média 4.5+ com 5+ avaliações
- **Consistente** (Prata): 7 dias consecutivos
- **Satisfação Garantida** (Ouro): 90% avaliações positivas

#### Badges de Tempo de Serviço
- **Iniciante** (1-2 anos): Azul
- **Dedicado** (3-4 anos): Verde
- **Veterano** (5-6 anos): Roxo
- **Especialista** (7-8 anos): Amarelo
- **Mestre** (9+ anos): Laranja

### Campos Adicionais Migrados

#### Tabela `usuarios`
- `telefone`: Telefone do usuário
- `portaria`: Número da portaria de lotação
- `situacao`: Situação funcional (ex: Nomeação)
- `data_admissao`: Data de admissão na empresa
- `data_nascimento`: Data de nascimento
- `rg`: Registro Geral
- `cpf`: CPF do usuário
- `avatar_url`: URL do avatar
- `access_type`: Tipo de acesso (admin, attendant)
- `migrado_supabase`: Flag indicando migração
- `supabase_id`: ID original no Supabase

#### Tabela `avaliacoes`
- `supabase_attendant_id`: ID original do atendente no Supabase
- `migrado_supabase`: Flag indicando migração

## 🛡️ Segurança e Controle de Acesso

### Autenticação
- Login obrigatório para acesso ao sistema
- Senhas criptografadas com bcrypt
- Sessões com tempo de expiração
- Logout automático por inatividade

### Autorização
- Middleware de verificação de permissões
- Controle de acesso baseado em roles
- Validação de permissões em cada endpoint
- Logs de auditoria para ações sensíveis

### Proteção de Dados
- Validação de entrada com Zod
- Sanitização de dados
- Proteção contra SQL Injection
- Rate limiting em APIs públicas

## 📊 Matriz de Responsabilidades

| Funcionalidade | Admin | Supervisor | Consultor | Atendente |
|---|---|---|---|---|
| **Gestão de Usuários** |
| Criar usuários | ✅ | ❌ | ❌ | ❌ |
| Editar usuários | ✅ | ❌ | ❌ | ❌ |
| Excluir usuários | ✅ | ❌ | ❌ | ❌ |
| **Gestão de Atendentes** |
| Criar atendentes | ✅ | ✅* | ❌ | ❌ |
| Editar atendentes | ✅ | ✅* | ❌ | ❌ |
| Excluir atendentes | ✅ | ❌ | ❌ | ❌ |
| Visualizar atendentes | ✅ | ✅* | ✅ | ❌ |
| **Avaliações** |
| Visualizar avaliações | ✅ | ✅* | ✅ | ❌ |
| Editar avaliações | ✅ | ❌ | ❌ | ❌ |
| Excluir avaliações | ✅ | ❌ | ❌ | ❌ |
| Ser avaliado | ❌ | ❌ | ❌ | ✅ |
| **Relatórios** |
| Relatórios completos | ✅ | ❌ | ❌ | ❌ |
| Relatórios departamentais | ✅ | ✅ | ❌ | ❌ |
| Relatórios básicos | ✅ | ✅ | ❌ | ❌ |
| Relatórios comparativos | ✅ | ✅ | ✅ | ❌ |
| **Gamificação** |
| Rankings de atendentes | ✅ | ✅* | ✅ | ❌ |
| Sistema de pontuação | ✅ | ✅* | ✅ | ❌ |
| Dashboards competitivos | ✅ | ✅* | ✅ | ❌ |
| Métricas de performance | ✅ | ✅* | ✅ | ❌ |
| Configurar gamificação | ✅ | ❌ | ❌ | ❌ |
| **Sistema** |
| Configurações | ✅ | ❌ | ❌ | ❌ |
| Logs de auditoria | ✅ | ❌ | ❌ | ❌ |
| Backup/Restore | ✅ | ❌ | ❌ | ❌ |

*Limitado aos atendentes de sua supervisão

## 🔧 Implementação Técnica

### Middleware de Autorização
```typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(request) {
    const { pathname } = request.nextUrl
    const token = request.nextauth.token

    // Verificar acesso a gestão de usuários
    if (pathname.startsWith('/usuarios')) {
      if (token?.tipo !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    // Verificar acesso a gestão de atendentes
    if (pathname.startsWith('/atendentes')) {
      if (!['admin', 'supervisor'].includes(token?.tipo)) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    return NextResponse.next()
  }
)
```

### Hook de Permissões
```typescript
// hooks/use-permissions.ts
import { useSession } from 'next-auth/react'

export function usePermissions() {
  const { data: session } = useSession()
  const userType = session?.user?.tipo

  return {
    canManageUsers: userType === 'admin',
    canManageAttendants: ['admin', 'supervisor'].includes(userType),
    canViewAllEvaluations: userType === 'admin',
    canViewDepartmentEvaluations: ['admin', 'supervisor'].includes(userType),
    canViewBasicReports: ['admin', 'supervisor', 'consultor'].includes(userType),
    canConfigureSystem: userType === 'admin'
  }
}
```

### Validação de Permissões em API
```typescript
// lib/auth-utils.ts
import { getServerSession } from 'next-auth'

export async function requirePermission(requiredTypes: string[]) {
  const session = await getServerSession()
  
  if (!session) {
    throw new Error('Não autorizado')
  }
  
  if (!requiredTypes.includes(session.user.tipo)) {
    throw new Error('Acesso negado')
  }
  
  return session
}
```

## 📈 Evolução e Manutenção

### Roadmap de Permissões

**Versão 1.1**:
- Permissões granulares por departamento
- Delegação de permissões temporárias
- Auditoria detalhada de ações

**Versão 1.2**:
- Grupos de usuários personalizados
- Permissões baseadas em projetos
- Integração com Active Directory

**Versão 2.0**:
- Sistema de aprovação de ações
- Permissões condicionais
- API de permissões para integrações

### Roadmap de Gamificação

**Q1 2025**: 
- Implementação do sistema básico de pontuação
- Criação de conquistas fundamentais
- Dashboard inicial do consultor

**Q2 2025**: 
- Sistema de níveis e progressão
- Rankings avançados por múltiplas métricas
- Relatórios comparativos detalhados

**Q3 2025**: 
- Conquistas dinâmicas e sazonais
- Sistema de desafios e metas
- Integração com notificações em tempo real

**Q4 2025**: 
- IA para recomendações personalizadas
- Análise preditiva de performance
- Sistema de mentoria baseado em dados

### Manutenção

- **Revisão semanal** das métricas de gamificação
- **Revisão mensal** das permissões ativas e algoritmos de pontuação
- **Auditoria trimestral** dos acessos e introdução de novas conquistas
- **Atualização semestral** da documentação
- **Treinamento anual** para novos usuários e reformulação do sistema

### Monitoramento de Gamificação

- **Logs Operacionais**: Ações de usuários e uso de funcionalidades de gamificação
- **Métricas de Engajamento**: Frequência de acesso e tempo em dashboards
- **Análise de Performance**: Correlação entre gamificação e melhoria de performance
- **Compliance**: Auditoria de alterações e verificação de integridade dos dados

## 🚨 Considerações de Segurança

### Princípios de Segurança

1. **Princípio do Menor Privilégio**: Usuários recebem apenas as permissões mínimas necessárias
2. **Separação de Responsabilidades**: Funções críticas requerem múltiplas aprovações
3. **Defesa em Profundidade**: Múltiplas camadas de segurança
4. **Auditoria Contínua**: Todas as ações são registradas e monitoradas

### Medidas de Proteção

- **Autenticação Multifator** (planejada para v1.1)
- **Rotação de Senhas** obrigatória a cada 90 dias
- **Bloqueio de Conta** após tentativas de login falhadas
- **Monitoramento de Atividades** suspeitas
- **Backup Seguro** dos dados de permissões

### Compliance

- **LGPD**: Controle de acesso a dados pessoais
- **ISO 27001**: Gestão de segurança da informação
- **SOX**: Controles internos para dados financeiros

---

**Documento atualizado em**: Janeiro 2025  
**Versão**: 2.0  
**Responsável**: Equipe de Desenvolvimento Koerner 360  
**Próxima revisão**: Abril 2025