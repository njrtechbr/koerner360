import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { ApiResponseUtils } from '@/lib/utils/api-response';
import { createPaginatedResponse } from '@/lib/utils/api-response'; // Adicionando importação
import {
  validarCriarUsuario,
  validarFiltrosUsuario,
  validarRegrasNegocio,
  USER_ERROR_MESSAGES,
  type CriarUsuarioData,
  type FiltrosUsuario,
  type UsuarioResponse
} from '@/lib/validations/usuario';
import { logError } from '@/lib/error-utils';
import { hashSenha } from '@/lib/auth-utils';
import { NextRequest } from 'next/server';

/**
 * GET /api/usuarios
 * Lista usuários com filtros, paginação e ordenação
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return ApiResponseUtils.unauthorized(USER_ERROR_MESSAGES.NAO_AUTORIZADO);
    }

    // Verificar permissões (apenas Admin e Supervisor)
    if (!['ADMIN', 'SUPERVISOR'].includes(session.user.userType)) {
      return ApiResponseUtils.forbidden(USER_ERROR_MESSAGES.PERMISSAO_NEGADA);
    }

    // Parsear parâmetros da query
    const { searchParams } = new URL(request.url);
    const pagina = parseInt(searchParams.get('pagina') || '1');
    const limite = parseInt(searchParams.get('limite') || '10');
    const ordenacao = searchParams.get('ordenacao') || 'nome';
    const direcao = searchParams.get('direcao') || 'asc';
    const busca = searchParams.get('busca') || undefined;
    const userType = searchParams.get('userType') || undefined;
    const ativo = searchParams.get('ativo') || undefined;
    const supervisorId = searchParams.get('supervisorId') || undefined;

    // Validar filtros
    const validacaoFiltros = validarFiltrosUsuario({
      pagina,
      limite,
      ordenacao,
      direcao,
      busca,
      userType,
      ativo: ativo !== undefined ? ativo === 'true' : undefined,
      supervisorId
    });

    if (!validacaoFiltros.success) {
      return ApiResponseUtils.badRequest('Dados inválidos', JSON.stringify(validacaoFiltros.error.flatten()));
    }

    const filtros: FiltrosUsuario = validacaoFiltros.data;

    // Construir query Prisma
    const where: any = {
      // Supervisor só pode ver atendentes
      ...(session.user.userType === 'SUPERVISOR' && {
        userType: 'ATENDENTE'
      }),
      // Filtros opcionais
      ...(filtros.busca && {
        OR: [
          { nome: { contains: filtros.busca, mode: 'insensitive' } },
          { email: { contains: filtros.busca, mode: 'insensitive' } }
        ]
      }),
      ...(filtros.userType && { userType: filtros.userType }),
      ...(filtros.ativo !== undefined && { ativo: filtros.ativo }),
      ...(filtros.supervisorId && { supervisorId: filtros.supervisorId })
    };

    // Obter total de registros
    const total = await prisma.usuario.count({ where });

    // Obter usuários
    const usuarios = await prisma.usuario.findMany({
      where,
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
      },
      orderBy: {
        [filtros.ordenacao]: filtros.direcao
      },
      skip: (filtros.pagina - 1) * filtros.limite,
      take: filtros.limite
    });

    // Criar resposta paginada
    const resposta = createPaginatedResponse<UsuarioResponse>(
      usuarios as UsuarioResponse[],
      total,
      filtros.pagina,
      filtros.limite
    );

    return ApiResponseUtils.success(resposta, 200);
  } catch (error) {
    logError('Erro ao listar usuários', error);
    return ApiResponseUtils.internalError(USER_ERROR_MESSAGES.ERRO_INTERNO);
  }
}

/**
 * POST /api/usuarios
 * Cria um novo usuário
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return ApiResponseUtils.unauthorized(USER_ERROR_MESSAGES.NAO_AUTORIZADO);
    }

    // Verificar permissões (apenas Admin)
    if (session.user.userType !== 'ADMIN') {
      return ApiResponseUtils.forbidden(USER_ERROR_MESSAGES.PERMISSAO_NEGADA);
    }

    const body = await request.json();
    const validacao = validarCriarUsuario(body);

    if (!validacao.success) {
      return ApiResponseUtils.badRequest('Dados inválidos', JSON.stringify(validacao.error.flatten()));
    }

    const dadosValidados: CriarUsuarioData = validacao.data;

    // Verificar permissões de negócio
    const podeCriar = validarRegrasNegocio.podeGerenciarUsuario(
      session.user.userType as any,
      dadosValidados.userType
    );

    if (!podeCriar) {
      return ApiResponseUtils.forbidden('Permissão negada para criar este tipo de usuário.');
    }

    // Verificar se email já existe
    const emailExistente = await prisma.usuario.findUnique({
      where: { email: dadosValidados.email }
    });

    if (emailExistente) {
      return ApiResponseUtils.badRequest(USER_ERROR_MESSAGES.EMAIL_JA_EXISTE);
    }

    // Hash da senha
    const senhaHash = await hashSenha(dadosValidados.senha);

    // Criar usuário
    const usuario = await prisma.usuario.create({
      data: {
        nome: dadosValidados.nome,
        email: dadosValidados.email,
        senha: senhaHash,
        userType: dadosValidados.userType,
        ativo: dadosValidados.ativo,
        supervisorId: dadosValidados.supervisorId
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
      { usuario, message: 'Usuário criado com sucesso!' },
      201
    );
  } catch (error) {
    logError('Erro ao criar usuário', error);
    return ApiResponseUtils.internalError(USER_ERROR_MESSAGES.ERRO_INTERNO);
  }
}