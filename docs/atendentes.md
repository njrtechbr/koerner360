# Sistema de Atendentes - Koerner 360

## 📋 Visão Geral

O sistema de atendentes do Koerner 360 permite o gerenciamento completo de funcionários que prestam atendimento, incluindo cadastro, edição, visualização e controle de acesso baseado em perfis.

## 🏗️ Arquitetura

### Estrutura de Arquivos

```
src/
├── app/
│   ├── api/
│   │   ├── atendentes/
│   │   │   ├── route.ts              # CRUD básico
│   │   │   ├── [id]/route.ts         # Operações por ID
│   │   │   └── estatisticas/route.ts # Estatísticas
│   │   └── upload/route.ts           # Upload de fotos
│   └── atendentes/
│       ├── page.tsx                  # Lista de atendentes
│       ├── [id]/page.tsx            # Detalhes do atendente
│       └── novo/page.tsx            # Cadastro de atendente
├── components/
│   ├── atendentes/
│   │   ├── tabela-atendentes.tsx    # Tabela principal
│   │   ├── formulario-atendente.tsx # Formulário de cadastro/edição
│   │   ├── detalhes-atendente.tsx   # Visualização de detalhes
│   │   ├── filtros-atendentes.tsx   # Filtros de busca
│   │   ├── estatisticas-atendentes.tsx # Dashboard de estatísticas
│   │   └── validacao-campo.tsx      # Validação em tempo real
│   └── ui/
│       └── upload-foto.tsx          # Componente de upload
├── hooks/
│   └── use-atendente-form.ts        # Hook para formulários
├── lib/
│   └── validations/
│       └── atendente.ts             # Schemas Zod
└── types/
    └── atendente.ts                 # Tipos TypeScript
```

### Modelo de Dados

```prisma
model Atendente {
  id              String   @id @default(cuid())
  nome            String
  email           String   @unique
  telefone        String?
  cpf             String   @unique
  rg              String?
  data_nascimento DateTime?
  data_admissao   DateTime
  endereco        String?
  setor           String?
  cargo           String?
  portaria        String?
  status          StatusAtendente @default(ATIVO)
  observacoes     String?
  foto_url        String?
  criado_em       DateTime @default(now())
  atualizado_em   DateTime @updatedAt
  
  @@map("atendentes")
}

enum StatusAtendente {
  ATIVO
  INATIVO
  AFASTADO
  DEMITIDO
}
```

## 🔐 Controle de Acesso

### Permissões por Perfil

| Ação | Admin | Supervisor | Atendente |
|------|-------|------------|----------|
| Listar atendentes | ✅ | ✅ | ❌ |
| Visualizar detalhes | ✅ | ✅ | 🔒* |
| Criar atendente | ✅ | ✅ | ❌ |
| Editar atendente | ✅ | ✅ | 🔒* |
| Excluir atendente | ✅ | ❌ | ❌ |
| Upload de foto | ✅ | ✅ | 🔒* |
| Ver estatísticas | ✅ | ✅ | ❌ |

*🔒 = Apenas próprios dados*

### Middleware de Proteção

```typescript
// middleware.ts
export const config = {
  matcher: [
    '/atendentes/:path*',
    '/api/atendentes/:path*'
  ],
};
```

## 📝 API Endpoints

### GET /api/atendentes

**Descrição**: Lista atendentes com paginação e filtros

**Parâmetros de Query**:
- `page` (number): Página atual (padrão: 1)
- `limit` (number): Itens por página (padrão: 10)
- `search` (string): Busca por nome ou email
- `status` (StatusAtendente): Filtro por status
- `setor` (string): Filtro por setor
- `orderBy` (string): Campo para ordenação
- `orderDirection` ('asc' | 'desc'): Direção da ordenação

**Resposta**:
```json
{
  "success": true,
  "data": [
    {
      "id": "clx123...",
      "nome": "João Silva",
      "email": "joao@empresa.com",
      "telefone": "(11) 99999-9999",
      "setor": "Atendimento",
      "cargo": "Atendente",
      "status": "ATIVO",
      "foto_url": "/uploads/atendente/avatar/...",
      "criado_em": "2024-01-15T10:00:00Z"
    }
  ],
  "paginacao": {
    "paginaAtual": 1,
    "totalPaginas": 5,
    "totalItens": 50,
    "itensPorPagina": 10,
    "temProximaPagina": true,
    "temPaginaAnterior": false
  },
  "timestamp": "2024-01-15T10:00:00Z"
}
```

### POST /api/atendentes

**Descrição**: Cria novo atendente

**Body**:
```json
{
  "nome": "João Silva",
  "email": "joao@empresa.com",
  "telefone": "(11) 99999-9999",
  "cpf": "123.456.789-00",
  "rg": "12.345.678-9",
  "data_nascimento": "1990-01-15",
  "data_admissao": "2024-01-15",
  "endereco": "Rua das Flores, 123",
  "setor": "Atendimento",
  "cargo": "Atendente",
  "portaria": "Principal",
  "observacoes": "Observações adicionais"
}
```

### GET /api/atendentes/[id]

**Descrição**: Busca atendente por ID

**Resposta**:
```json
{
  "success": true,
  "data": {
    "id": "clx123...",
    "nome": "João Silva",
    "email": "joao@empresa.com",
    "telefone": "(11) 99999-9999",
    "cpf": "123.456.789-00",
    "rg": "12.345.678-9",
    "data_nascimento": "1990-01-15T00:00:00Z",
    "data_admissao": "2024-01-15T00:00:00Z",
    "endereco": "Rua das Flores, 123",
    "setor": "Atendimento",
    "cargo": "Atendente",
    "portaria": "Principal",
    "status": "ATIVO",
    "observacoes": "Observações adicionais",
    "foto_url": "/uploads/atendente/avatar/...",
    "criado_em": "2024-01-15T10:00:00Z",
    "atualizado_em": "2024-01-15T10:00:00Z"
  },
  "timestamp": "2024-01-15T10:00:00Z"
}
```

### PUT /api/atendentes/[id]

**Descrição**: Atualiza atendente existente

**Body**: Mesmo formato do POST, todos os campos opcionais

### DELETE /api/atendentes/[id]

**Descrição**: Remove atendente (soft delete - altera status para DEMITIDO)

### GET /api/atendentes/estatisticas

**Descrição**: Retorna estatísticas dos atendentes

**Resposta**:
```json
{
  "success": true,
  "data": {
    "total": 150,
    "ativos": 120,
    "inativos": 20,
    "afastados": 5,
    "demitidos": 5,
    "porSetor": {
      "Atendimento": 80,
      "Suporte": 40,
      "Vendas": 30
    },
    "admissoesUltimoMes": 5,
    "demissoesUltimoMes": 2
  },
  "timestamp": "2024-01-15T10:00:00Z"
}
```

## 📤 Sistema de Upload

### POST /api/upload

**Descrição**: Upload de fotos de atendentes

**Content-Type**: `multipart/form-data`

**Campos**:
- `arquivo` (File): Arquivo de imagem
- `tipo` (string): "avatar"
- `entidade` (string): "atendente"
- `entidadeId` (string): ID do atendente (opcional)

**Validações**:
- Tipos aceitos: JPG, JPEG, PNG, WebP
- Tamanho máximo: 5MB
- Dimensões recomendadas: 400x400px

**Resposta**:
```json
{
  "success": true,
  "data": {
    "url": "/uploads/atendente/avatar/atendente_avatar_1642234567890.jpg",
    "nomeArquivo": "atendente_avatar_1642234567890.jpg",
    "tamanho": 245760,
    "tipo": "image/jpeg"
  },
  "message": "Arquivo enviado com sucesso",
  "timestamp": "2024-01-15T10:00:00Z"
}
```

### DELETE /api/upload

**Descrição**: Remove arquivo do servidor

**Query Parameters**:
- `url` (string): URL do arquivo a ser removido

## 🎨 Componentes UI

### TabelaAtendentes

**Props**:
```typescript
interface TabelaAtendentesProps {
  atendentes: Atendente[];
  carregando?: boolean;
  onEdit?: (atendente: Atendente) => void;
  onDelete?: (id: string) => void;
  onView?: (atendente: Atendente) => void;
}
```

**Funcionalidades**:
- Exibição em tabela responsiva
- Ordenação por colunas
- Ações por linha (visualizar, editar, excluir)
- Estados de loading e vazio
- Paginação integrada

### FormularioAtendente

**Props**:
```typescript
interface FormularioAtendenteProps {
  atendente?: Atendente;
  modo: 'criar' | 'editar';
  onSubmit: (dados: AtendenteFormData) => Promise<void>;
  onCancel: () => void;
}
```

**Funcionalidades**:
- Validação em tempo real com Zod
- Upload de foto integrado
- Formatação automática de CPF e telefone
- Validação de email e CPF únicos
- Estados de loading e erro

### UploadFoto

**Props**:
```typescript
interface UploadFotoProps {
  fotoUrl?: string;
  nome?: string;
  onUploadCompleto?: (url: string) => void;
  onRemover?: () => void;
  entidade: 'atendente' | 'usuario';
  entidadeId?: string;
  tamanho?: 'sm' | 'md' | 'lg' | 'xl';
  permiteRemover?: boolean;
}
```

**Funcionalidades**:
- Drag & drop de arquivos
- Preview em tempo real
- Validação de tipo e tamanho
- Upload automático
- Remoção de arquivos
- Estados de loading

## 🔍 Validações

### Schemas Zod

```typescript
// Validação de CPF
const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;

// Validação de telefone
const telefoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;

// Schema principal
export const criarAtendenteSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  telefone: z.string().regex(telefoneRegex, 'Telefone inválido').optional(),
  cpf: z.string().regex(cpfRegex, 'CPF inválido'),
  rg: z.string().min(5, 'RG deve ter pelo menos 5 caracteres').optional(),
  dataNascimento: z.string().optional(),
  dataAdmissao: z.string(),
  endereco: z.string().max(255, 'Endereço muito longo').optional(),
  setor: z.string().optional(),
  cargo: z.string().optional(),
  portaria: z.string().optional(),
  observacoes: z.string().max(1000, 'Observações muito longas').optional(),
  avatarUrl: z.string().optional()
});
```

### Validações Customizadas

```typescript
// Validação de CPF
export function validarCPF(cpf: string): boolean {
  const numeros = cpf.replace(/\D/g, '');
  if (numeros.length !== 11) return false;
  
  // Algoritmo de validação do CPF
  // ... implementação completa
}

// Formatação de CPF
export function formatarCPF(valor: string): string {
  const numeros = valor.replace(/\D/g, '');
  return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// Formatação de telefone
export function formatarTelefone(valor: string): string {
  const numeros = valor.replace(/\D/g, '');
  if (numeros.length === 11) {
    return numeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  return numeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
}
```

## 🧪 Testes

### Testes de Componentes

```typescript
// __tests__/components/atendentes/formulario-atendente.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FormularioAtendente } from '@/components/atendentes/formulario-atendente';

describe('FormularioAtendente', () => {
  it('deve renderizar formulário de criação', () => {
    render(
      <FormularioAtendente 
        modo="criar" 
        onSubmit={jest.fn()} 
        onCancel={jest.fn()} 
      />
    );
    
    expect(screen.getByText('Novo Atendente')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('deve validar campos obrigatórios', async () => {
    const onSubmit = jest.fn();
    render(
      <FormularioAtendente 
        modo="criar" 
        onSubmit={onSubmit} 
        onCancel={jest.fn()} 
      />
    );
    
    fireEvent.click(screen.getByText('Salvar'));
    
    await waitFor(() => {
      expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument();
      expect(screen.getByText('Email é obrigatório')).toBeInTheDocument();
    });
    
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
```

### Testes de API

```typescript
// __tests__/api/atendentes.test.ts
import { createMocks } from 'node-mocks-http';
import handler from '@/app/api/atendentes/route';

describe('/api/atendentes', () => {
  it('GET deve retornar lista de atendentes', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: { page: '1', limit: '10' }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.paginacao).toBeDefined();
  });

  it('POST deve criar novo atendente', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        nome: 'João Silva',
        email: 'joao@teste.com',
        cpf: '123.456.789-00',
        dataAdmissao: '2024-01-15'
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(true);
    expect(data.data.nome).toBe('João Silva');
  });
});
```

### Testes de Validação

```typescript
// __tests__/lib/validations/atendente.test.ts
import { validarCPF, formatarCPF, criarAtendenteSchema } from '@/lib/validations/atendente';

describe('Validações de Atendente', () => {
  describe('validarCPF', () => {
    it('deve validar CPF correto', () => {
      expect(validarCPF('123.456.789-09')).toBe(true);
    });

    it('deve rejeitar CPF inválido', () => {
      expect(validarCPF('123.456.789-00')).toBe(false);
      expect(validarCPF('111.111.111-11')).toBe(false);
    });
  });

  describe('formatarCPF', () => {
    it('deve formatar CPF corretamente', () => {
      expect(formatarCPF('12345678909')).toBe('123.456.789-09');
    });
  });

  describe('criarAtendenteSchema', () => {
    it('deve validar dados corretos', () => {
      const dados = {
        nome: 'João Silva',
        email: 'joao@teste.com',
        cpf: '123.456.789-09',
        dataAdmissao: '2024-01-15'
      };

      const resultado = criarAtendenteSchema.safeParse(dados);
      expect(resultado.success).toBe(true);
    });

    it('deve rejeitar dados inválidos', () => {
      const dados = {
        nome: 'J',
        email: 'email-inválido',
        cpf: 'cpf-inválido'
      };

      const resultado = criarAtendenteSchema.safeParse(dados);
      expect(resultado.success).toBe(false);
    });
  });
});
```

## 🚀 Deploy e Configuração

### Variáveis de Ambiente

```env
# .env.local
DATABASE_URL="postgresql://user:password@localhost:5432/koerner360"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Configurações de upload
UPLOAD_MAX_SIZE=5242880  # 5MB
UPLOAD_ALLOWED_TYPES="image/jpeg,image/png,image/webp"
```

### Scripts de Build

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build
npm run build:info
npm run ts-node scripts/populate-changelog.ts

# Testes
npm test
npm run test:coverage

# Linting
npm run lint
npm run lint:fix
```

### Migrations

```bash
# Criar nova migration
npx prisma migrate dev --name add_atendentes_table

# Aplicar migrations em produção
npx prisma migrate deploy

# Reset do banco (desenvolvimento)
npx prisma migrate reset
```

## 📊 Monitoramento

### Logs de Auditoria

Todas as operações CRUD são logadas automaticamente:

```typescript
// Exemplo de log
{
  "timestamp": "2024-01-15T10:00:00Z",
  "action": "CREATE_ATENDENTE",
  "userId": "clx123...",
  "targetId": "clx456...",
  "details": {
    "nome": "João Silva",
    "email": "joao@empresa.com"
  },
  "ip": "192.168.1.100",
  "userAgent": "Mozilla/5.0..."
}
```

### Métricas de Performance

- Tempo de resposta das APIs
- Taxa de sucesso de uploads
- Número de atendentes por status
- Frequência de atualizações

## 🔧 Troubleshooting

### Problemas Comuns

1. **Erro de upload de foto**
   - Verificar permissões do diretório `public/uploads`
   - Confirmar tamanho e tipo do arquivo
   - Verificar espaço em disco

2. **Validação de CPF falhando**
   - Verificar formato (xxx.xxx.xxx-xx)
   - Confirmar algoritmo de validação
   - Verificar duplicatas no banco

3. **Erro de permissão**
   - Verificar sessão do usuário
   - Confirmar papel/perfil correto
   - Verificar middleware de autenticação

### Debug

```typescript
// Habilitar logs detalhados
process.env.DEBUG = 'atendentes:*';

// Log de validações
console.log('Validação:', { dados, erros: resultado.error?.errors });

// Log de queries
console.log('Query Prisma:', { where, orderBy, take, skip });
```

## 📚 Referências

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Zod Documentation](https://zod.dev)
- [shadcn/ui Components](https://ui.shadcn.com)
- [React Hook Form](https://react-hook-form.com)

---

**Última atualização**: Agosto 2025  
**Versão**: 1.0.0

Para dúvidas ou sugestões sobre o sistema de atendentes, abra uma issue no repositório.