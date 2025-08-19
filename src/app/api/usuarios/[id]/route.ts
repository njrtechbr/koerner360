import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { UsuarioService } from '@/lib/services/usuario-service';
import {
  validarAtualizarUsuario,
  type TipoUsuario,
  type AtualizarUsuarioRequest,
  type ObterUsuarioResponse,
  type MutarUsuarioResponse,
  MENSAGENS_ERRO_USUARIO
} from '@/lib/validations/usuario';
import { logError } from '@/lib/error-utils';

// Funções auxiliares para respostas padronizadas
function criarRespostaSucesso<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    timestamp: new Date().toISOString()
  }, { status });
}

function criarRespostaErro(message: string, status = 400): NextResponse {
  return NextResponse.json({
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  }, { status });
}

// GET /api/usuarios/[id] - Obter usuário por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;

    // Validar ID
    if (!id || typeof id !== 'string') {
      return criarRespostaErro('ID do usuário é obrigatório', 400);
    }

    // Buscar usuário usando o serviço
    const usuario = await UsuarioService.obterPorId(id, usuarioLogado);

    if (!usuario) {
      return criarRespostaErro(MENSAGENS_ERRO_USUARIO.USUARIO_NAO_ENCONTRADO, 404);
    }

    const response: ObterUsuarioResponse = {
      usuario
    };

    return criarRespostaSucesso(response);
  } catch (error) {
    logError('Erro na API GET /usuarios/[id]', error);
    
    if (error instanceof Error && 'statusCode' in error) {
      return criarRespostaErro(error.message, (error as any).statusCode);
    }
    
    return criarRespostaErro(MENSAGENS_ERRO_USUARIO.ERRO_INTERNO, 500);
  }
}

// PUT /api/usuarios/[id] - Atualizar usuário
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;

    // Validar ID
    if (!id || typeof id !== 'string') {
      return criarRespostaErro('ID do usuário é obrigatório', 400);
    }

    // Extrair e validar dados do corpo da requisição
    let body: AtualizarUsuarioRequest;
    try {
      body = await request.json();
    } catch {
      return criarRespostaErro('Corpo da requisição inválido', 400);
    }

    // Validar dados usando Zod
    const validacao = validarAtualizarUsuario(body);
    if (!validacao.success) {
      return criarRespostaErro(
        `Dados inválidos: ${validacao.error.errors[0]?.message}`,
        400
      );
    }

    // Atualizar usuário usando o serviço
    const usuarioAtualizado = await UsuarioService.atualizar(
      id,
      validacao.data,
      usuarioLogado
    );

    const response: MutarUsuarioResponse = {
      usuario: usuarioAtualizado,
      message: 'Usuário atualizado com sucesso'
    };

    return criarRespostaSucesso(response);
  } catch (error) {
    logError('Erro na API PUT /usuarios/[id]', error);
    
    if (error instanceof Error && 'statusCode' in error) {
      return criarRespostaErro(error.message, (error as any).statusCode);
    }
    
    return criarRespostaErro(MENSAGENS_ERRO_USUARIO.ERRO_INTERNO, 500);
  }
}

// DELETE /api/usuarios/[id] - Desativar usuário
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;

    // Validar ID
    if (!id || typeof id !== 'string') {
      return criarRespostaErro('ID do usuário é obrigatório', 400);
    }

    // Desativar usuário usando o serviço
    const usuarioDesativado = await UsuarioService.desativar(id, usuarioLogado);

    const response: MutarUsuarioResponse = {
      usuario: usuarioDesativado,
      message: 'Usuário desativado com sucesso'
    };

    return criarRespostaSucesso(response);
  } catch (error) {
    logError('Erro na API DELETE /usuarios/[id]', error);
    
    if (error instanceof Error && 'statusCode' in error) {
      return criarRespostaErro(error.message, (error as any).statusCode);
    }
    
    return criarRespostaErro(MENSAGENS_ERRO_USUARIO.ERRO_INTERNO, 500);
  }
}