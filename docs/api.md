# Documentação da API - Koerner 360

## Índice

1. [Visão Geral](#visão-geral)
2. [Autenticação](#autenticação)
3. [Estrutura de Dados](#estrutura-de-dados)
4. [Endpoints](#endpoints)
5. [Códigos de Status](#códigos-de-status)
6. [Exemplos de Uso](#exemplos-de-uso)
7. [Rate Limiting](#rate-limiting)
8. [Versionamento](#versionamento)

## Visão Geral

A API do Koerner 360 é construída usando Next.js API Routes e segue os padrões REST. Todas as rotas requerem autenticação via NextAuth.js, exceto as rotas de autenticação.

### Base URL
```
Desenvolvimento: http://localhost:3000/api
Produção: https://koerner360.vercel.app/api
```

### Formato de Resposta

Todas as respostas seguem o formato JSON:

```json
{
  "success": true,
  "data": {},
  "message": "Operação realizada com sucesso",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

Em caso de erro:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos fornecidos",
    "details": [
      {
        "field": "email",
        "message": "Email é obrigatório"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Autenticação

### NextAuth.js Session

A autenticação é gerenciada pelo NextAuth.js. Para acessar rotas protegidas, o usuário deve estar autenticado.

```typescript
// Verificação de sessão em API Route
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return Response.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Não autenticado' } },
      { status: 401 }
    );
  }
  
  // Lógica da API
}
```

### Níveis de Acesso

- **admin**: Acesso total a todas as funcionalidades
- **supervisor**: Pode gerenciar atendentes e suas avaliações
- **attendant**: Pode ver apenas suas próprias avaliações

## Estrutura de Dados

### Usuario

```typescript
interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha: string; // Hash bcrypt
  papel: 'admin' | 'supervisor' | 'attendant';
  ativo: boolean;
  criadoEm: string; // ISO 8601
  atualizadoEm: string; // ISO 8601
  supervisorId?: string; // Para atendentes
}
```

### Avaliacao

```typescript
interface Avaliacao {
  id: string;
  avaliadoId: string; // ID do usuário avaliado
  avaliadorId: string; // ID do usuário avaliador
  periodo: string; // Ex: "2024-Q1"
  status: 'pendente' | 'em_andamento' | 'concluida';
  notaGeral: number; // 1-5
  competencias: {
    comunicacao: number;
    trabalhoEmEquipe: number;
    lideranca: number;
    resolucaoProblemas: number;
    pontualidade: number;
  };
  comentarios: string;
  criadoEm: string;
  atualizadoEm: string;
  concluidoEm?: string;
}
```

### Feedback

```typescript
interface Feedback {
  id: string;
  avaliacaoId: string;
  tipo: 'autoavaliacao' | 'supervisor' | 'par' | 'subordinado';
  remetente: string; // Nome do remetente
  pontosFortesTexto: string;
  pontosDesenvolvimentoTexto: string;
  sugestoesMelhoria: string;
  criadoEm: string;
}
```

## Endpoints

### Autenticação

#### POST /api/auth/signin
Realiza login do usuário.

**Parâmetros:**
```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "123",
      "name": "João Silva",
      "email": "joao@exemplo.com",
      "role": "supervisor"
    }
  }
}
```

#### POST /api/auth/signout
Realiza logout do usuário.

### Usuários

#### GET /api/usuarios
Lista usuários (admin/supervisor apenas).

**Query Parameters:**
- `page`: Número da página (padrão: 1)
- `limit`: Itens por página (padrão: 10)
- `search`: Busca por nome ou email
- `role`: Filtrar por papel
- `active`: Filtrar por status ativo

**Resposta:**
```json
{
  "success": true,
  "data": {
    "usuarios": [
      {
        "id": "123",
        "nome": "João Silva",
        "email": "joao@exemplo.com",
        "papel": "supervisor",
        "ativo": true,
        "criadoEm": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

#### GET /api/usuarios/[id]
Obter usuário específico.

**Resposta:**
```json
{
  "success": true,
  "data": {
    "usuario": {
      "id": "123",
      "nome": "João Silva",
      "email": "joao@exemplo.com",
      "papel": "supervisor",
      "ativo": true,
      "criadoEm": "2024-01-01T00:00:00Z",
      "atualizadoEm": "2024-01-15T10:30:00Z"
    }
  }
}
```

#### POST /api/usuarios
Criar novo usuário (admin apenas).

**Parâmetros:**
```json
{
  "nome": "Maria Santos",
  "email": "maria@exemplo.com",
  "senha": "senha123",
  "papel": "attendant",
  "supervisorId": "456"
}
```

#### PUT /api/usuarios/[id]
Atualizar usuário.

**Parâmetros:**
```json
{
  "nome": "Maria Santos Silva",
  "email": "maria.silva@exemplo.com",
  "ativo": true
}
```

#### DELETE /api/usuarios/[id]
Desativar usuário (admin apenas).

### Avaliações

#### GET /api/avaliacoes
Listar avaliações.

**Query Parameters:**
- `page`: Número da página
- `limit`: Itens por página
- `status`: Filtrar por status
- `periodo`: Filtrar por período
- `avaliadoId`: Filtrar por usuário avaliado
- `avaliadorId`: Filtrar por avaliador

**Resposta:**
```json
{
  "success": true,
  "data": {
    "avaliacoes": [
      {
        "id": "789",
        "avaliadoId": "123",
        "avaliadorId": "456",
        "periodo": "2024-Q1",
        "status": "concluida",
        "notaGeral": 4.2,
        "competencias": {
          "comunicacao": 4,
          "trabalhoEmEquipe": 5,
          "lideranca": 4,
          "resolucaoProblemas": 4,
          "pontualidade": 4
        },
        "criadoEm": "2024-01-01T00:00:00Z",
        "concluidoEm": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 15,
      "totalPages": 2
    }
  }
}
```

#### GET /api/avaliacoes/[id]
Obter avaliação específica.

#### POST /api/avaliacoes
Criar nova avaliação.

**Parâmetros:**
```json
{
  "avaliadoId": "123",
  "periodo": "2024-Q1",
  "competencias": {
    "comunicacao": 4,
    "trabalhoEmEquipe": 5,
    "lideranca": 4,
    "resolucaoProblemas": 4,
    "pontualidade": 4
  },
  "comentarios": "Excelente desempenho no trimestre."
}
```

#### PUT /api/avaliacoes/[id]
Atualizar avaliação.

#### DELETE /api/avaliacoes/[id]
Excluir avaliação (admin apenas).

### Feedbacks

#### GET /api/feedbacks
Listar feedbacks.

**Query Parameters:**
- `avaliacaoId`: Filtrar por avaliação
- `tipo`: Filtrar por tipo de feedback

#### POST /api/feedbacks
Criar novo feedback.

**Parâmetros:**
```json
{
  "avaliacaoId": "789",
  "tipo": "supervisor",
  "remetente": "Carlos Manager",
  "pontosFortesTexto": "Excelente comunicação e liderança.",
  "pontosDesenvolvimentoTexto": "Pode melhorar na gestão de tempo.",
  "sugestoesMelhoria": "Recomendo curso de gestão de projetos."
}
```

### Dashboard

#### GET /api/dashboard/stats
Obter estatísticas do dashboard.

**Resposta:**
```json
{
  "success": true,
  "data": {
    "totalUsuarios": 150,
    "avaliacoesPendentes": 25,
    "avaliacoesConcluidas": 120,
    "mediaGeralAvaliacoes": 4.2,
    "distribuicaoNotas": {
      "1": 2,
      "2": 8,
      "3": 25,
      "4": 45,
      "5": 40
    },
    "competenciasPorMes": [
      {
        "mes": "Janeiro",
        "comunicacao": 4.1,
        "trabalhoEmEquipe": 4.3,
        "lideranca": 3.9,
        "resolucaoProblemas": 4.0,
        "pontualidade": 4.2
      }
    ]
  }
}
```

## Códigos de Status

| Código | Descrição |
|--------|----------|
| 200 | OK - Requisição bem-sucedida |
| 201 | Created - Recurso criado com sucesso |
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - Não autenticado |
| 403 | Forbidden - Sem permissão |
| 404 | Not Found - Recurso não encontrado |
| 409 | Conflict - Conflito de dados |
| 422 | Unprocessable Entity - Erro de validação |
| 429 | Too Many Requests - Rate limit excedido |
| 500 | Internal Server Error - Erro interno |

## Exemplos de Uso

### Autenticação e Uso da API

```typescript
// Cliente TypeScript
class KoernerAPI {
  private baseURL: string;
  private session: any;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async login(email: string, password: string) {
    const response = await fetch(`${this.baseURL}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (data.success) {
      this.session = data.data.user;
    }
    return data;
  }

  async getUsuarios(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.search) searchParams.set('search', params.search);

    const response = await fetch(
      `${this.baseURL}/usuarios?${searchParams}`,
      {
        credentials: 'include', // Para incluir cookies de sessão
      }
    );

    return response.json();
  }

  async criarAvaliacao(dados: {
    avaliadoId: string;
    periodo: string;
    competencias: Record<string, number>;
    comentarios: string;
  }) {
    const response = await fetch(`${this.baseURL}/avaliacoes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(dados),
    });

    return response.json();
  }
}

// Uso
const api = new KoernerAPI('http://localhost:3000/api');

// Login
const loginResult = await api.login('admin@koerner360.com', 'admin123');
if (loginResult.success) {
  console.log('Login realizado com sucesso');
  
  // Buscar usuários
  const usuarios = await api.getUsuarios({ page: 1, limit: 10 });
  console.log('Usuários:', usuarios.data.usuarios);
  
  // Criar avaliação
  const novaAvaliacao = await api.criarAvaliacao({
    avaliadoId: '123',
    periodo: '2024-Q1',
    competencias: {
      comunicacao: 4,
      trabalhoEmEquipe: 5,
      lideranca: 4,
      resolucaoProblemas: 4,
      pontualidade: 4,
    },
    comentarios: 'Excelente desempenho.',
  });
  console.log('Avaliação criada:', novaAvaliacao);
}
```

### Tratamento de Erros

```typescript
async function handleAPICall<T>(apiCall: () => Promise<T>): Promise<T> {
  try {
    const result = await apiCall();
    return result;
  } catch (error) {
    if (error instanceof Response) {
      const errorData = await error.json();
      
      switch (error.status) {
        case 401:
          // Redirecionar para login
          window.location.href = '/login';
          break;
        case 403:
          // Mostrar mensagem de permissão negada
          alert('Você não tem permissão para esta ação');
          break;
        case 422:
          // Mostrar erros de validação
          console.error('Erros de validação:', errorData.error.details);
          break;
        default:
          console.error('Erro na API:', errorData.error.message);
      }
    }
    throw error;
  }
}

// Uso
const usuarios = await handleAPICall(() => api.getUsuarios());
```

## Rate Limiting

A API implementa rate limiting para prevenir abuso:

- **Geral**: 100 requisições por minuto por IP
- **Login**: 5 tentativas por minuto por IP
- **Criação de recursos**: 20 requisições por minuto por usuário

### Headers de Rate Limit

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248000
```

## Versionamento

A API segue versionamento semântico:

- **v1.0.0**: Versão inicial
- **v1.1.0**: Adição de novos endpoints
- **v2.0.0**: Mudanças breaking

### Cabeçalho de Versão

```
API-Version: 1.0.0
```

## Webhooks (Futuro)

Planejamos implementar webhooks para notificações em tempo real:

```json
{
  "event": "avaliacao.concluida",
  "data": {
    "avaliacaoId": "789",
    "avaliadoId": "123",
    "notaGeral": 4.2
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

**Última atualização**: Janeiro 2024
**Versão da API**: 1.0.0