import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import {
  createSuccessResponse,
  createErrorResponse,
  validateAuthentication,
  validatePermissions,
  ErrorCodes,
  withErrorHandling
} from '@/lib/api-response';
import { TipoUsuario } from '@prisma/client';

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
  return withErrorHandling(async () => {
    const session = await auth();
    
    // Validar autenticação
    const authError = validateAuthentication(session?.user);
    if (authError) return authError;

    const { id } = await params;

    // Verificar permissões - admin, supervisor ou próprio usuário
    if (session!.user.userType !== 'ADMIN' && 
        session!.user.userType !== 'SUPERVISOR' && 
        session!.user.id !== id) {
      return createErrorResponse(
        ErrorCodes.FORBIDDEN,
        'Sem permissão para acessar este usuário'
      );
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
      return createErrorResponse(
        ErrorCodes.NOT_FOUND,
        'Usuário não encontrado'
      );
    }

    return createSuccessResponse(
      { usuario },
      'Usuário encontrado com sucesso'
    );
  }, 'buscar usuário específico');
}

// PUT /api/usuarios/[id] - Atualizar usuário
export async function PUT(request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const session = await auth();
    
    // Validar autenticação
    const authError = validateAuthentication(session?.user);
    if (authError) return authError;

    const { id } = params;
    const body = await request.json();
    const validatedData = atualizarUsuarioSchema.parse(body);

    // Verificar se usuário existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id },
    });

    if (!usuarioExistente) {
      return createErrorResponse(
        ErrorCodes.NOT_FOUND,
        'Usuário não encontrado'
      );
    }

    // Verificar permissões
    if (session!.user.userType !== 'ADMIN' && session!.user.id !== id) {
      // Supervisores podem editar apenas seus subordinados
      if (session!.user.userType === TipoUsuario.SUPERVISOR) {
        if (usuarioExistente.supervisorId !== session!.user.id) {
          return createErrorResponse(
            ErrorCodes.FORBIDDEN,
            'Sem permissão para editar este usuário'
          );
        }
      } else {
        return createErrorResponse(
          ErrorCodes.FORBIDDEN,
          'Sem permissão para editar usuários'
        );
      }
    }

    // Verificar se email já existe (se está sendo alterado)
    if (validatedData.email && validatedData.email !== usuarioExistente.email) {
      const emailExistente = await prisma.usuario.findUnique({
        where: { email: validatedData.email },
      });

      if (emailExistente) {
        return createErrorResponse(
          ErrorCodes.CONFLICT,
          'Email já está em uso'
        );
      }
    }

    // Verificar se supervisor existe (se fornecido)
    if (validatedData.supervisorId) {
      const supervisor = await prisma.usuario.findUnique({
        where: { id: validatedData.supervisorId },
      });

      if (!supervisor || supervisor.tipoUsuario !== 'SUPERVISOR') {
        return createErrorResponse(
          ErrorCodes.VALIDATION_ERROR,
          'Supervisor inválido'
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
    });

    return createSuccessResponse(
      { usuario: usuarioAtualizado },
      'Usuário atualizado com sucesso'
    );
  }, 'atualizar usuário');
}

// DELETE /api/usuarios/[id] - Desativar usuário
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const session = await auth();
    
    // Validar autenticação
    const authError = validateAuthentication(session?.user);
    if (authError) return authError;

    const { id } = params;

    // Verificar se usuário existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id },
    });

    if (!usuarioExistente) {
      return createErrorResponse(
        ErrorCodes.NOT_FOUND,
        'Usuário não encontrado'
      );
    }

    // Verificar permissões - apenas admin pode desativar usuários
    const permissionError = validatePermissions(
      session!.user.userType,
      ['ADMIN']
    );
    if (permissionError) return permissionError;

    // Verificar se usuário está tentando desativar a si mesmo
    if (session!.user.id === id) {
      return createErrorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Não é possível desativar sua própria conta'
      );
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

    return createSuccessResponse(
      { usuario: usuarioDesativado },
      'Usuário desativado com sucesso'
    );
  }, 'desativar usuário');
}