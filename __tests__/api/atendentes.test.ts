import { NextRequest } from 'next/server';
import { GET, POST, PUT, DELETE } from '@/app/api/atendentes/route';
import { GET as GET_BY_ID, PUT as PUT_BY_ID, DELETE as DELETE_BY_ID } from '@/app/api/atendentes/[id]/route';
import { prisma } from '../../src/lib/prisma';
import { getServerSession } from 'next-auth';

// Mock das dependências
jest.mock('@/lib/prisma', () => ({
  prisma: {
    atendente: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  },
}));

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockGetServerSession = getServerSession as jest.Mock;

describe('/api/atendentes', () => {
  const mockSession = {
    user: {
      id: '1',
      email: 'admin@empresa.com',
      role: 'ADMIN',
    },
  };

  const mockAtendente = {
    id: '1',
    nome: 'João Silva',
    email: 'joao@empresa.com',
    cpf: '123.456.789-00',
    telefone: '(11) 99999-9999',
    data_admissao: new Date('2024-01-15'),
    status: 'ATIVO',
    foto_url: null,
    criado_em: new Date(),
    atualizado_em: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/atendentes', () => {
    it('deve retornar lista de atendentes com sucesso', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      mockPrisma.atendente.findMany.mockResolvedValue([mockAtendente]);
      mockPrisma.atendente.count.mockResolvedValue(1);

      const request = new NextRequest('http://localhost:3000/api/atendentes');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(data.data[0]).toEqual(mockAtendente);
      expect(data.paginacao).toBeDefined();
    });

    it('deve retornar erro 401 se não autenticado', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/atendentes');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Não autorizado');
    });

    it('deve aplicar filtros de busca', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      mockPrisma.atendente.findMany.mockResolvedValue([mockAtendente]);
      mockPrisma.atendente.count.mockResolvedValue(1);

      const request = new NextRequest('http://localhost:3000/api/atendentes?busca=João&status=ATIVO');
      const response = await GET(request);

      expect(mockPrisma.atendente.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: [
              {
                OR: [
                  { nome: { contains: 'João', mode: 'insensitive' } },
                  { email: { contains: 'João', mode: 'insensitive' } },
                  { cpf: { contains: 'João' } },
                ],
              },
              { status: 'ATIVO' },
            ],
          }),
        })
      );
    });

    it('deve aplicar paginação corretamente', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      mockPrisma.atendente.findMany.mockResolvedValue([mockAtendente]);
      mockPrisma.atendente.count.mockResolvedValue(25);

      const request = new NextRequest('http://localhost:3000/api/atendentes?pagina=2&limite=10');
      const response = await GET(request);
      const data = await response.json();

      expect(mockPrisma.atendente.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        })
      );

      expect(data.paginacao).toEqual({
        paginaAtual: 2,
        totalPaginas: 3,
        totalItens: 25,
        itensPorPagina: 10,
        temProximaPagina: true,
        temPaginaAnterior: true,
      });
    });

    it('deve tratar erro interno do servidor', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      mockPrisma.atendente.findMany.mockRejectedValue(new Error('Erro de banco'));

      const request = new NextRequest('http://localhost:3000/api/atendentes');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Erro interno do servidor');
    });
  });

  describe('POST /api/atendentes', () => {
    const novoAtendente = {
      nome: 'Maria Santos',
      email: 'maria@empresa.com',
      cpf: '987.654.321-00',
      telefone: '(11) 88888-8888',
      dataAdmissao: '2024-02-01',
      status: 'ATIVO',
    };

    it('deve criar atendente com sucesso', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      mockPrisma.atendente.create.mockResolvedValue({
        ...mockAtendente,
        ...novoAtendente,
        id: '2',
      });

      const request = new NextRequest('http://localhost:3000/api/atendentes', {
        method: 'POST',
        body: JSON.stringify(novoAtendente),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.nome).toBe(novoAtendente.nome);
      expect(data.data.email).toBe(novoAtendente.email);
    });

    it('deve validar dados obrigatórios', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);

      const dadosInvalidos = {
        nome: '', // Nome vazio
        email: 'email-inválido', // Email inválido
        cpf: '123', // CPF inválido
      };

      const request = new NextRequest('http://localhost:3000/api/atendentes', {
        method: 'POST',
        body: JSON.stringify(dadosInvalidos),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Dados inválidos');
    });

    it('deve verificar email duplicado', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      mockPrisma.atendente.create.mockRejectedValue({
        code: 'P2002',
        meta: { target: ['email'] },
      });

      const request = new NextRequest('http://localhost:3000/api/atendentes', {
        method: 'POST',
        body: JSON.stringify(novoAtendente),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Email já está em uso');
    });

    it('deve verificar CPF duplicado', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      mockPrisma.atendente.create.mockRejectedValue({
        code: 'P2002',
        meta: { target: ['cpf'] },
      });

      const request = new NextRequest('http://localhost:3000/api/atendentes', {
        method: 'POST',
        body: JSON.stringify(novoAtendente),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.error).toBe('CPF já está em uso');
    });
  });

  describe('GET /api/atendentes/[id]', () => {
    it('deve retornar atendente por ID', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      mockPrisma.atendente.findUnique.mockResolvedValue(mockAtendente);

      const response = await GET_BY_ID(
        new NextRequest('http://localhost:3000/api/atendentes/1'),
        { params: { id: '1' } }
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockAtendente);
    });

    it('deve retornar 404 se atendente não encontrado', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      mockPrisma.atendente.findUnique.mockResolvedValue(null);

      const response = await GET_BY_ID(
        new NextRequest('http://localhost:3000/api/atendentes/999'),
        { params: { id: '999' } }
      );
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Atendente não encontrado');
    });
  });

  describe('PUT /api/atendentes/[id]', () => {
    const dadosAtualizacao = {
      nome: 'João Silva Santos',
      telefone: '(11) 77777-7777',
      status: 'INATIVO',
    };

    it('deve atualizar atendente com sucesso', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      mockPrisma.atendente.findUnique.mockResolvedValue(mockAtendente);
      mockPrisma.atendente.update.mockResolvedValue({
        ...mockAtendente,
        ...dadosAtualizacao,
      });

      const request = new NextRequest('http://localhost:3000/api/atendentes/1', {
        method: 'PUT',
        body: JSON.stringify(dadosAtualizacao),
      });
      const response = await PUT_BY_ID(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.nome).toBe(dadosAtualizacao.nome);
      expect(data.data.status).toBe(dadosAtualizacao.status);
    });

    it('deve retornar 404 se atendente não encontrado', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      mockPrisma.atendente.findUnique.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/atendentes/999', {
        method: 'PUT',
        body: JSON.stringify(dadosAtualizacao),
      });
      const response = await PUT_BY_ID(request, { params: { id: '999' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Atendente não encontrado');
    });
  });

  describe('DELETE /api/atendentes/[id]', () => {
    it('deve excluir atendente com sucesso', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      mockPrisma.atendente.findUnique.mockResolvedValue(mockAtendente);
      mockPrisma.atendente.delete.mockResolvedValue(mockAtendente);

      const response = await DELETE_BY_ID(
        new NextRequest('http://localhost:3000/api/atendentes/1', { method: 'DELETE' }),
        { params: { id: '1' } }
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Atendente excluído com sucesso');
    });

    it('deve retornar 404 se atendente não encontrado', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      mockPrisma.atendente.findUnique.mockResolvedValue(null);

      const response = await DELETE_BY_ID(
        new NextRequest('http://localhost:3000/api/atendentes/999', { method: 'DELETE' }),
        { params: { id: '999' } }
      );
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Atendente não encontrado');
    });
  });

  describe('Controle de Acesso', () => {
    it('deve permitir acesso para ADMIN', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { ...mockSession.user, role: 'ADMIN' },
      });
      mockPrisma.atendente.findMany.mockResolvedValue([]);
      mockPrisma.atendente.count.mockResolvedValue(0);

      const request = new NextRequest('http://localhost:3000/api/atendentes');
      const response = await GET(request);

      expect(response.status).toBe(200);
    });

    it('deve permitir acesso para SUPERVISOR', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { ...mockSession.user, role: 'SUPERVISOR' },
      });
      mockPrisma.atendente.findMany.mockResolvedValue([]);
      mockPrisma.atendente.count.mockResolvedValue(0);

      const request = new NextRequest('http://localhost:3000/api/atendentes');
      const response = await GET(request);

      expect(response.status).toBe(200);
    });

    it('deve negar acesso para ATTENDANT', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { ...mockSession.user, role: 'ATTENDANT' },
      });

      const request = new NextRequest('http://localhost:3000/api/atendentes');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Acesso negado');
    });
  });
});