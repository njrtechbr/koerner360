import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { ApiResponseUtils } from '@/lib/utils/api-response';
import { USER_ERROR_MESSAGES } from '@/lib/validations/usuario';
import { logError } from '@/lib/error-utils';
import { NextRequest } from 'next/server';

/**
 * GET /api/usuarios/verificar-email
 * Verifica se um email é único (não está em uso por outro usuário)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return ApiResponseUtils.unauthorized(USER_ERROR_MESSAGES.NAO_AUTORIZADO);
    }

    // Verificar permissões (apenas Admin)
    if (session.user.userType !== 'ADMIN') {
      return ApiResponseUtils.forbidden(USER_ERROR_MESSAGES.PERMISSAO_NEGADA);
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const usuarioId = searchParams.get('usuarioId');

    if (!email) {
      return ApiResponseUtils.badRequest('Email é obrigatório');
    }

    const where: any = {
      email: email.toLowerCase()
    };

    // Se estiver atualizando um usuário, excluí-lo da verificação
    if (usuarioId) {
      where.id = { not: usuarioId };
    }

    const usuarioExistente = await prisma.usuario.findFirst({
      where
    });

    const emailUnico = !usuarioExistente;

    return ApiResponseUtils.success({ emailUnico }, 200);
  } catch (error) {
    logError('Erro ao verificar email único', error);
    return ApiResponseUtils.internalError(USER_ERROR_MESSAGES.ERRO_INTERNO);
  }
}