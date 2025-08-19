import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { UsuarioService } from '@/lib/services/usuario-service';
import {
  type TipoUsuario,
  type ValidacaoEmailUnico,
  MENSAGENS_ERRO_USUARIO
} from '@/lib/validations/usuario';
import { logError } from '@/lib/error-utils';
import { z } from 'zod';

// Schema para validar parâmetros de consulta
const verificarEmailSchema = z.object({
  email: z.string().email('Email inválido'),
  usuarioId: z.string().optional()
});

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

// GET /api/usuarios/verificar-email - Verificar se email é único
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

    // Verificar permissões - apenas ADMIN e SUPERVISOR podem verificar emails
    if (!['ADMIN', 'SUPERVISOR'].includes(usuarioLogado.tipoUsuario)) {
      return criarRespostaErro(MENSAGENS_ERRO_USUARIO.PERMISSAO_NEGADA, 403);
    }

    // Extrair parâmetros da URL
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const usuarioId = searchParams.get('usuarioId') || undefined;

    // Validar parâmetros
    const validacao = verificarEmailSchema.safeParse({ email, usuarioId });
    if (!validacao.success) {
      return criarRespostaErro(
        `Parâmetros inválidos: ${validacao.error.errors[0]?.message}`,
        400
      );
    }

    // Verificar email usando o serviço
    const resultado = await UsuarioService.verificarEmailUnico(
      validacao.data.email,
      validacao.data.usuarioId,
      usuarioLogado
    );

    const response: { validacao: ValidacaoEmailUnico } = {
      validacao: resultado
    };

    return criarRespostaSucesso(response);
  } catch (error) {
    logError('Erro na API GET /usuarios/verificar-email', error);
    
    if (error instanceof Error && 'statusCode' in error) {
      return criarRespostaErro(error.message, (error as any).statusCode);
    }
    
    return criarRespostaErro(MENSAGENS_ERRO_USUARIO.ERRO_INTERNO, 500);
  }
}