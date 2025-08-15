import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Schema de validação para criação de usuário
const criarUsuarioSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  tipoUsuario: z.enum(['ADMIN', 'SUPERVISOR', 'ATENDENTE']),
  supervisorId: z.string().optional(),
});

// Schema removido - não utilizado nesta rota

// GET /api/usuarios - Listar usuários
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar permissões
    if (session.user.userType !== 'ADMIN' && session.user.userType !== 'SUPERVISOR') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    // Filtro baseado no tipo de usuário
    let whereClause = {};
    if (session.user.userType === 'SUPERVISOR') {
      whereClause = {
        OR: [
          { supervisorId: session.user.id },
          { id: session.user.id }
        ]
      };
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const tipoUsuario = searchParams.get('tipoUsuario') || '';
    const ativo = searchParams.get('ativo');
    
    const skip = (page - 1) * limit;

    // Construir filtros
    const where: Record<string, unknown> = { ...whereClause };
    
    if (search) {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (tipoUsuario) {
      where.tipoUsuario = tipoUsuario;
    }
    
    if (ativo !== null && ativo !== undefined) {
      where.ativo = ativo === 'true';
    }

    const [usuarios, total] = await Promise.all([
      prisma.usuario.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          nome: true,
          email: true,
          tipoUsuario: true,
          ativo: true,
          criadoEm: true,
          atualizadoEm: true,
          supervisorId: true,
          supervisor: {
            select: {
              id: true,
              nome: true,
            },
          },
        },
        orderBy: { criadoEm: 'desc' },
      }),
      prisma.usuario.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        usuarios,
        paginacao: {
          paginaAtual: page,
          itensPorPagina: limit,
          totalItens: total,
          totalPaginas: totalPages,
          temProximaPagina: page < totalPages,
          temPaginaAnterior: page > 1,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro interno do servidor',
        },
      },
      { status: 500 }
    );
  }
}

// POST /api/usuarios - Criar usuário
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar permissões - apenas admin pode criar usuários
    if (session.user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = criarUsuarioSchema.parse(body);

    // Verificar se email já existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email: validatedData.email },
    });

    if (usuarioExistente) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CONFLICT',
            message: 'Email já está em uso',
          },
        },
        { status: 409 }
      );
    }

    // Verificar se supervisor existe (se fornecido)
    if (validatedData.supervisorId) {
      const supervisor = await prisma.usuario.findUnique({
        where: { id: validatedData.supervisorId },
      });

      if (!supervisor || supervisor.tipoUsuario !== 'SUPERVISOR') {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Supervisor inválido',
            },
          },
          { status: 400 }
        );
      }
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(validatedData.senha, 12);

    // Criar usuário
    const novoUsuario = await prisma.usuario.create({
      data: {
        nome: validatedData.nome,
        email: validatedData.email,
        senha: senhaHash,
        tipoUsuario: validatedData.tipoUsuario,
        supervisorId: validatedData.supervisorId,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        tipoUsuario: true,
        ativo: true,
        criadoEm: true,
        supervisorId: true,
        supervisor: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: { usuario: novoUsuario },
        message: 'Usuário criado com sucesso',
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Dados inválidos',
            details: error.issues,
          },
        },
        { status: 400 }
      );
    }

    console.error('Erro ao criar usuário:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro interno do servidor',
        },
      },
      { status: 500 }
    );
  }
}