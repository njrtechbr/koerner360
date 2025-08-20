import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { ApiResponseUtils } from '@/lib/utils/api-response';
import { USER_ERROR_MESSAGES } from '@/lib/validations/usuario';
import { logError } from '@/lib/error-utils';
import { NextRequest } from 'next/server';

/**
 * GET /api/usuarios/supervisores
 * Lista supervisores disponíveis
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

    const supervisores = await prisma.usuario.findMany({
      where: {
        userType: 'SUPERVISOR',
        ativo: true
      },
      select: {
        id: true,
        nome: true
      },
      orderBy: {
        nome: 'asc'
      }
    });

    return ApiResponseUtils.success(supervisores, 200);
  } catch (error) {
    logError('Erro ao listar supervisores', error);
    return ApiResponseUtils.internalError(USER_ERROR_MESSAGES.ERRO_INTERNO);
  }
}