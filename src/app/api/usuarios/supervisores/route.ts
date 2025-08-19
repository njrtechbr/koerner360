import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { UsuarioService } from '@/lib/services/usuario-service';
import {
  type TipoUsuario,
  type SupervisorDisponivel,
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

// GET /api/usuarios/supervisores - Buscar supervisores disponíveis
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

    // Verificar permissões - apenas ADMIN e SUPERVISOR podem acessar
    if (!['ADMIN', 'SUPERVISOR'].includes(usuarioLogado.tipoUsuario)) {
      return criarRespostaErro(MENSAGENS_ERRO_USUARIO.PERMISSAO_NEGADA, 403);
    }

    // Buscar supervisores usando o serviço
    const supervisores = await UsuarioService.buscarSupervisores(usuarioLogado);

    const response: { supervisores: SupervisorDisponivel[] } = {
      supervisores
    };

    return criarRespostaSucesso(response);
  } catch (error) {
    logError('Erro na API GET /usuarios/supervisores', error);
    
    if (error instanceof Error && 'statusCode' in error) {
      return criarRespostaErro(error.message, (error as any).statusCode);
    }
    
    return criarRespostaErro(MENSAGENS_ERRO_USUARIO.ERRO_INTERNO, 500);
  }
}