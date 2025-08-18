import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import {
  createSuccessResponse,
  createErrorResponse,
  validateAuthentication,
  validatePermissions,
  ErrorCodes,
  withErrorHandling
} from '@/lib/api-response';

// Schema de validação para atualização de usuário
const atualizarUsuarioSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
  email: z.string().email('Email inválido').optional(),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').optional(),
  tipoUsuario: z.enum(['ADMIN', 'SUPERVISOR', 'ATENDENTE', 'CONSULTOR']).optional(),
  ativo: z.boolean().optional(),
  supervisorId: z.string().nullable().optional(),
});

// GET /api/usuarios/[id] - Buscar usuário por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withErrorHandling(async () => {
    const session = await auth();
    
    // Validar autenticação
    const authError = validateAuthentication(session?.user);
    if (authError) return authError;

    // Validar permissões
    const permissionError = validatePermissions(
      session!.user.userType,
      ['ADMIN', 'SUPERVISOR']
    );
    if (permissionError) return permissionError;

    const { id } = params;

    // Verificar se o usuário existe
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
            tipoUsuario: true,
            ativo: true,
          },
        },
        _count: {
          select: {
            supervisoes: true,
            avaliacoesFeitas: true,
            avaliacoesRecebidas: true,
          }
        }
      },
    });

    if (!usuario) {
      return createErrorResponse(
        ErrorCodes.NOT_FOUND,
        'Usuário não encontrado'
      );
    }

    // Verificar se o supervisor pode acessar este usuário
    if (session!.user.userType === 'SUPERVISOR') {
      const podeAcessar = usuario.supervisorId === session!.user.id || usuario.id === session!.user.id;
      if (!podeAcessar) {
        return createErrorResponse(
          ErrorCodes.FORBIDDEN,
          'Você não tem permissão para acessar este usuário'
        );
      }
    }

    return createSuccessResponse(
      { usuario },
      'Usuário encontrado com sucesso'
    );
  }, 'buscar usuário');
}

// PATCH /api/usuarios/[id] - Atualizar usuário
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withErrorHandling(async () => {
    const session = await auth();
    
    // Validar autenticação
    const authError = validateAuthentication(session?.user);
    if (authError) return authError;

    // Validar permissões
    const permissionError = validatePermissions(
      session!.user.userType,
      ['ADMIN', 'SUPERVISOR']
    );
    if (permissionError) return permissionError;

    const { id } = params;
    const body = await request.json();
    const validatedData = atualizarUsuarioSchema.parse(body);

    // Verificar se o usuário existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        tipoUsuario: true,
        supervisorId: true,
      },
    });

    if (!usuarioExistente) {
      return createErrorResponse(
        ErrorCodes.NOT_FOUND,
        'Usuário não encontrado'
      );
    }

    // Verificar se o supervisor pode editar este usuário
    if (session!.user.userType === 'SUPERVISOR') {
      const podeEditar = usuarioExistente.supervisorId === session!.user.id || usuarioExistente.id === session!.user.id;
      if (!podeEditar) {
        return createErrorResponse(
          ErrorCodes.FORBIDDEN,
          'Você não tem permissão para editar este usuário'
        );
      }

      // Supervisores não podem alterar tipo de usuário ou promover para ADMIN
      if (validatedData.tipoUsuario && validatedData.tipoUsuario === 'ADMIN') {
        return createErrorResponse(
          ErrorCodes.FORBIDDEN,
          'Supervisores não podem criar administradores'
        );
      }
    }

    // Verificar se email já existe (se está sendo alterado)
    if (validatedData.email && validatedData.email !== usuarioExistente.email) {
      const emailExiste = await prisma.usuario.findUnique({
        where: { email: validatedData.email },
      });

      if (emailExiste) {
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

    // Preparar dados para atualização
    const dadosAtualizacao: any = {};
    
    if (validatedData.nome) dadosAtualizacao.nome = validatedData.nome;
    if (validatedData.email) dadosAtualizacao.email = validatedData.email;
    if (validatedData.tipoUsuario) dadosAtualizacao.tipoUsuario = validatedData.tipoUsuario;
    if (validatedData.ativo !== undefined) dadosAtualizacao.ativo = validatedData.ativo;
    if (validatedData.supervisorId !== undefined) dadosAtualizacao.supervisorId = validatedData.supervisorId;

    // Hash da nova senha se fornecida
    if (validatedData.senha) {
      dadosAtualizacao.senha = await bcrypt.hash(validatedData.senha, 12);
    }

    // Atualizar usuário
    const usuarioAtualizado = await prisma.usuario.update({
      where: { id },
      data: dadosAtualizacao,
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

// DELETE /api/usuarios/[id] - Desativar usuário (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withErrorHandling(async () => {
    const session = await auth();
    
    // Validar autenticação
    const authError = validateAuthentication(session?.user);
    if (authError) return authError;

    // Validar permissões - apenas ADMIN pode deletar
    const permissionError = validatePermissions(
      session!.user.userType,
      ['ADMIN']
    );
    if (permissionError) return permissionError;

    const { id } = params;

    // Verificar se o usuário existe
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        ativo: true,
      },
    });

    if (!usuario) {
      return createErrorResponse(
        ErrorCodes.NOT_FOUND,
        'Usuário não encontrado'
      );
    }

    // Não permitir que o usuário delete a si mesmo
    if (id === session!.user.id) {
      return createErrorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Você não pode desativar sua própria conta'
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
      `Usuário ${usuario.nome} foi desativado com sucesso`
    );
  }, 'desativar usuário');
}