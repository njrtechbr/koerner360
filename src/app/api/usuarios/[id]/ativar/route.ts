import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { ApiResponseUtils } from '@/lib/utils/api-response';
import { validarRegrasNegocio, USER_ERROR_MESSAGES } from '@/lib/validations/usuario';
import { logError } from '@/lib/error-utils';
import { NextRequest } from 'next/server';

/**
 * PATCH /api/usuarios/[id]/ativar
 * Ativa um usuário
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticação e permissões
    const session = await auth();
    
    if (!session?.user) {
      return ApiResponseUtils.unauthorized(USER_ERROR_MESSAGES.NAO_AUTORIZADO);
    }

    // Verificar permissões de negócio
    const podeAtivar = validarRegrasNegocio.podeDesativarUsuario(
      session.user.userType as any,
      session.user.userType as any // UserType do usuário a ser ativado (não disponível aqui)
    );

    if (!podeAtivar) {
      return ApiResponseUtils.forbidden('Permissão negada para ativar este usuário.');
    }

    // Atualizar usuário
    const usuario = await prisma.usuario.update({
      where: { id: params.id },
      data: { ativo: true },
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

    if (!usuario) {
      return ApiResponseUtils.badRequest(USER_ERROR_MESSAGES.USUARIO_NAO_ENCONTRADO);
    }

    return ApiResponseUtils.success(
      { usuario, message: 'Usuário ativado com sucesso!' },
      200
    );
  } catch (error) {
    logError('Erro ao ativar usuário', error);
    return ApiResponseUtils.internalError(USER_ERROR_MESSAGES.ERRO_INTERNO);
  }
}