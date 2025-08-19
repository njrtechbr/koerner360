import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { UsuarioService } from '@/lib/services/usuario-service';
import {
  validarCriarUsuario,
  validarFiltrosUsuario,
  type TipoUsuario
} from '@/lib/validations/usuario';
import {
  type CriarUsuarioRequest,
  type BuscarUsuariosParams,
  type ListarUsuariosResponse,
  type MutarUsuarioResponse,
  MENSAGENS_ERRO_USUARIO
} from '@/types/usuario';
import { logError } from '@/lib/error-utils';

// Função auxiliar para criar resposta de erro
function criarRespostaErro(message: string, status: number = 500) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      timestamp: new Date().toISOString()
    },
    { status }
  );
}

// Função auxiliar para criar resposta de sucesso
function criarRespostaSucesso<T>(data: T, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString()
    },
    { status }
  );
}

// Schema removido - não utilizado nesta rota

// GET /api/usuarios - Listar usuários
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await auth();
    if (!session?.user) {
      return criarRespostaErro(MENSAGENS_ERRO_USUARIO.NAO_AUTORIZADO, 401);
    }

    const usuarioLogado = {
      id: session.user.id!,
      tipoUsuario: session.user.tipoUsuario as TipoUsuario
    };

    // Verificar permissões básicas
    const podeGerenciarUsuarios = usuarioLogado.tipoUsuario === 'ADMIN';
    const podeGerenciarAtendentes = ['ADMIN', 'SUPERVISOR'].includes(usuarioLogado.tipoUsuario);
    
    if (!podeGerenciarUsuarios && !podeGerenciarAtendentes) {
      return criarRespostaErro(MENSAGENS_ERRO_USUARIO.PERMISSAO_NEGADA, 403);
    }

    // Extrair e validar parâmetros da URL
    const { searchParams } = new URL(request.url);
    const params = {
      busca: searchParams.get('busca') || undefined,
      tipoUsuario: searchParams.get('tipoUsuario') as TipoUsuario | undefined,
      ativo: searchParams.get('ativo') ? searchParams.get('ativo') === 'true' : undefined,
      supervisorId: searchParams.get('supervisorId') || undefined,
      pagina: parseInt(searchParams.get('pagina') || '1'),
      limite: parseInt(searchParams.get('limite') || '10'),
      ordenacao: searchParams.get('ordenacao') || 'nome',
      direcao: (searchParams.get('direcao') || 'asc') as 'asc' | 'desc'
    };

    // Validar parâmetros
    const validacao = validarFiltrosUsuario(params);
    if (!validacao.success) {
      return criarRespostaErro(
        `Parâmetros inválidos: ${validacao.error.errors[0]?.message}`,
        400
      );
    }

    // Preparar parâmetros para o serviço
    const buscarParams: BuscarUsuariosParams = {
      filtros: {
        busca: params.busca,
        tipoUsuario: params.tipoUsuario,
        ativo: params.ativo,
        supervisorId: params.supervisorId
      },
      ordenacao: {
        coluna: params.ordenacao,
        direcao: params.direcao
      },
      paginacao: {
        paginaAtual: params.pagina,
        itensPorPagina: params.limite,
        totalPaginas: 1,
        totalItens: 0,
        temProximaPagina: false,
        temPaginaAnterior: false
      },
      incluirInativos: params.ativo === undefined,
      incluirContadores: true
    };

    // Buscar usuários usando o serviço
    const resultado = await UsuarioService.buscarUsuarios(buscarParams, usuarioLogado);

    const response: ListarUsuariosResponse = {
      usuarios: resultado.usuarios,
      paginacao: resultado.paginacao,
      total: resultado.total
    };

    return criarRespostaSucesso(response);
  } catch (error) {
    logError('Erro na API GET /usuarios', error);
    
    if (error instanceof Error && 'statusCode' in error) {
      return criarRespostaErro(error.message, (error as any).statusCode);
    }
    
    return criarRespostaErro(MENSAGENS_ERRO_USUARIO.ERRO_INTERNO, 500);
  }
}

// POST /api/usuarios - Criar usuário
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await auth();
    if (!session?.user) {
      return criarRespostaErro(MENSAGENS_ERRO_USUARIO.NAO_AUTORIZADO, 401);
    }

    const usuarioLogado = {
      id: session.user.id!,
      tipoUsuario: session.user.tipoUsuario as TipoUsuario
    };

    // Verificar permissões - apenas ADMIN pode criar usuários
    if (usuarioLogado.tipoUsuario !== 'ADMIN') {
      return criarRespostaErro(MENSAGENS_ERRO_USUARIO.PERMISSAO_NEGADA, 403);
    }

    // Extrair e validar dados do corpo da requisição
    let body: CriarUsuarioRequest;
    try {
      body = await request.json();
    } catch {
      return criarRespostaErro('Corpo da requisição inválido', 400);
    }

    // Validar dados usando Zod
    const validacao = validarCriarUsuario(body);
    if (!validacao.success) {
      return criarRespostaErro(
        `Dados inválidos: ${validacao.error.errors[0]?.message}`,
        400
      );
    }

    // Criar usuário usando o serviço
    const novoUsuario = await UsuarioService.criar(validacao.data, usuarioLogado);

    const response: MutarUsuarioResponse = {
      usuario: novoUsuario,
      message: 'Usuário criado com sucesso'
    };

    return criarRespostaSucesso(response, 201);
  } catch (error) {
    logError('Erro na API POST /usuarios', error);
    
    if (error instanceof Error && 'statusCode' in error) {
      return criarRespostaErro(error.message, (error as any).statusCode);
    }
    
    return criarRespostaErro(MENSAGENS_ERRO_USUARIO.ERRO_INTERNO, 500);
  }
}