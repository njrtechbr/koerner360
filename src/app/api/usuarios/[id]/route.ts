import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { ApiResponseUtils } from '@/lib/utils/api-response';
import {
  validarAtualizarUsuario,
  validarRegrasNegocio,
  USER_ERROR_MESSAGES,
  type AtualizarUsuarioData
} from '@/lib/validations/usuario';
import { logError } from '@/lib/error-utils';
import { NextRequest } from 'next/server';

/**
 * GET /api/usuarios/[id]
 * Obtém um usuário específico
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return ApiResponseUtils.unauthorized(USER_ERROR_MESSAGES.NAO_AUTORIZADO);
    }

    // Verificar se o usuário tem permissão para ver este usuário específico
    // Admin pode ver todos, Supervisor pode ver Atendentes
    const usuarioAlvo = await prisma.usuario.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        nome: true,
        email: true,
        userType: true,
        ativo: true,
        criadoEm: true,
        atualizadoEm: true,
        supervisorId: true,
        supervisor: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    });

    if (!usuarioAlvo) {
      return ApiResponseUtils.badRequest(USER_ERROR_MESSAGES.USUARIO_NAO_ENCONTRADO);
    }

    // Verificar permissões de negócio
    const podeVer = validarRegrasNegocio.podeGerenciarUsuario(
      session.user.userType as any,
      usuarioAlvo.userType as any
    );

    if (!podeVer) {
      return ApiResponseUtils.forbidden(USER_ERROR_MESSAGES.PERMISSAO_NEGADA);
    }

    return ApiResponseUtils.success({ usuario: usuarioAlvo }, 200);
  } catch (error) {
    logError('Erro ao obter usuário', error);
    return ApiResponseUtils.internalError(USER_ERROR_MESSAGES.ERRO_INTERNO);
  }
}

/**
 * PUT /api/usuarios/[id]
 * Atualiza um usuário
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return ApiResponseUtils.unauthorized(USER_ERROR_MESSAGES.NAO_AUTORIZADO);
    }

    const body = await request.json();
    const validacao = validarAtualizarUsuario({ ...body, id: params.id });

    if (!validacao.success) {
      return ApiResponseUtils.badRequest('Dados inválidos', JSON.stringify(validacao.error.flatten()));
    }

    const dadosValidados = validacao.data;

    // Verificar permissões de negócio
    const podeEditar = validarRegrasNegocio.podeEditarUsuario(
      session.user.userType as any,
      dadosValidados.userType
    );

    if (!podeEditar) {
      return ApiResponseUtils.forbidden('Permissão negada para editar este usuário.');
    }

    // Atualizar usuário
    const usuario = await prisma.usuario.update({
      where: { id: params.id },
      data: {
        nome: dadosValidados.nome,
        email: dadosValidados.email,
        userType: dadosValidados.userType,
        ativo: dadosValidados.ativo,
        supervisorId: dadosValidados.supervisorId,
        // Só atualizar senha se fornecida
        ...(dadosValidados.senha && {
          senha: await hashSenha(dadosValidados.senha)
        })
      },
      select: {
        id: true,
        nome: true,
        email: true,
        userType: true,
        ativo: true,
        criadoEm: true,
        atualizadoEm: true,
        supervisorId: true,
        supervisor: {
          select: {
            id: true,
            nome: true
          }
        },
        _count: {
          select: {
            supervisoes: true,
            avaliacoesFeitas: true,
            avaliacoesRecebidas: true
          }
        }
      }
    });

    return ApiResponseUtils.success(
      { usuario, message: 'Usuário atualizado com sucesso!' },
      200
    );
  } catch (error) {
    logError('Erro ao atualizar usuário', error);
    return ApiResponseUtils.internalError(USER_ERROR_MESSAGES.ERRO_INTERNO);
  }
}

/**
 * DELETE /api/usuarios/[id]
 * Exclui um usuário (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return ApiResponseUtils.unauthorized(USER_ERROR_MESSAGES.NAO_AUTORIZADO);
    }

    // Verificar permissões de negócio
    const usuarioAlvo = await prisma.usuario.findUnique({
      where: { id: params.id },
      select: { userType: true }
    });

    if (!usuarioAlvo) {
      return ApiResponseUtils.badRequest(USER_ERROR_MESSAGES.USUARIO_NAO_ENCONTRADO);
    }

    const podeExcluir = validarRegrasNegocio.podeGerenciarUsuario(
      session.user.userType as any,
      usuarioAlvo.userType as any
    );

    if (!podeExcluir) {
      return ApiResponseUtils.forbidden('Permissão negada para excluir este usuário.');
    }

    // Soft delete
    const usuario = await prisma.usuario.update({
      where: { id: params.id },
      data: { ativo: false },
      select: {
        id: true,
        nome: true,
        email: true,
        userType: true,
        ativo: true,
        criadoEm: true,
        atualizadoEm: true,
        supervisorId: true,
        supervisor: {
          select: {
            id: true,
            nome: true
          }
        },
        _count: {
          select: {
            supervisoes: true,
            avaliacoesFeitas: true,
            avaliacoesRecebidas: true
          }
        }
      }
    });

    return ApiResponseUtils.success(
      { usuario, message: 'Usuário excluído com sucesso!' },
      200
    );
  } catch (error) {
    logError('Erro ao excluir usuário', error);
    return ApiResponseUtils.internalError(USER_ERROR_MESSAGES.ERRO_INTERNO);
  }
}

// Função auxiliar para hash de senha (não estava importada no código original)
async function hashSenha(senha: string): Promise<string> {
  // Import dinâmico para bcryptjs
  const bcrypt = await import('bcryptjs');
  const saltRounds = 12;
  return bcrypt.hash(senha, saltRounds);
}