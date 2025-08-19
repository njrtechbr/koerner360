import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { UsuarioService } from '@/lib/services/usuario-service';
import {
  type TipoUsuario,
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

// POST /api/usuarios/[id]/ativar - Ativar usuário
export async function POST(
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

    // Ativar usuário usando o serviço
    const usuarioAtivado = await UsuarioService.ativar(id, usuarioLogado);

    const response: MutarUsuarioResponse = {
      usuario: usuarioAtivado,
      message: 'Usuário ativado com sucesso'
    };

    return criarRespostaSucesso(response);
  } catch (error) {
    logError('Erro na API POST /usuarios/[id]/ativar', error);
    
    if (error instanceof Error && 'statusCode' in error) {
      return criarRespostaErro(error.message, (error as any).statusCode);
    }
    
    return criarRespostaErro(MENSAGENS_ERRO_USUARIO.ERRO_INTERNO, 500);
  }
}