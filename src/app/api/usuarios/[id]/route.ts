import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../auth.ts';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema de validação para atualização de usuário
const atualizarUsuarioSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
  email: z.string().email('Email inválido').optional(),
  tipoUsuario: z.enum(['ADMIN', 'SUPERVISOR', 'ATENDENTE']).optional(),
  ativo: z.boolean().optional(),
  supervisorId: z.string().optional(),
});

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/usuarios/[id] - Obter usuário específico
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = params;

    // Verificar permissões
    if (session.user.userType !== 'ADMIN' && session.user.userType !== 'SUPERVISOR' && session.user.id !== params.id) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id },
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
        supervisoes: {
          select: {
            id: true,
            nome: true,
            email: true,
            ativo: true,
          },
        },

      },
    });

    if (!usuario) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Usuário não encontrado' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { usuario },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
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

// PUT /api/usuarios/[id] - Atualizar usuário
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const validatedData = atualizarUsuarioSchema.parse(body);

    // Verificar se usuário existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id },
    });

    if (!usuarioExistente) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Usuário não encontrado' } },
        { status: 404 }
      );
    }

    // Verificar permissões
    if (session.user.userType !== 'ADMIN' && session.user.id !== id) {
      // Supervisores podem editar apenas seus subordinados
      if (session.user.userType === 'SUPERVISOR') {
        if (usuarioExistente.supervisorId !== session.user.id) {
          return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
        }
      } else {
        return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
      }
    }

    // Verificar se email já existe (se está sendo alterado)
    if (validatedData.email && validatedData.email !== usuarioExistente.email) {
      const emailExistente = await prisma.usuario.findUnique({
        where: { email: validatedData.email },
      });

      if (emailExistente) {
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

    // Atualizar usuário
    const usuarioAtualizado = await prisma.usuario.update({
      where: { id },
      data: validatedData,
      select: {
        id: true,
        nome: true,
        email: true,
        tipoUsuario: true,
        ativo: true,
        criado_em: true,
        atualizado_em: true,
        supervisorId: true,
        supervisor: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: { usuario: usuarioAtualizado },
      message: 'Usuário atualizado com sucesso',
      timestamp: new Date().toISOString(),
    });
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

    console.error('Erro ao atualizar usuário:', error);
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

// DELETE /api/usuarios/[id] - Desativar usuário
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = params;

    // Verificar se usuário existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id },
    });

    if (!usuarioExistente) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Usuário não encontrado' } },
        { status: 404 }
      );
    }

    // Verificar permissões - apenas admin pode desativar usuários
    if (session.user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    // Verificar se usuário está tentando desativar a si mesmo
    if (session.user.id === id) {
      return NextResponse.json({ error: 'Não é possível desativar sua própria conta' }, { status: 400 });
    }

    // Desativar usuário (soft delete)
    const usuarioDesativado = await prisma.usuario.update({
      where: { id },
      data: { ativo: false },
      select: {
        id: true,
        nome: true,
        email: true,
        ativo: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: { usuario: usuarioDesativado },
      message: 'Usuário desativado com sucesso',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro ao desativar usuário:', error);
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