import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { gerarSenhaTemporaria, validarCriacaoUsuario } from '@/lib/senha-utils';
import { TipoUsuario } from '@prisma/client';
import bcrypt from 'bcryptjs';
import {
  createSuccessResponse,
  createErrorResponse,
  validateAuthentication,
  validatePermissions,
  ErrorCodes
} from '@/lib/api-response';

/**
 * POST /api/atendentes/[id]/criar-usuario - Cria usuário para atendente
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    const authResult = validateAuthentication(session);
    if (authResult) {
      return authResult;
    }

    // Verificar permissões - apenas admin e supervisor podem criar usuários
    const permissionResult = validatePermissions(
      session?.user?.userType || '',
      [TipoUsuario.ADMIN, TipoUsuario.SUPERVISOR]
    );
    if (permissionResult) {
      return permissionResult;
    }

    const atendenteId = params.id;

    // Validar se o atendente pode ter um usuário criado
    const validacao = await validarCriacaoUsuario(atendenteId);
    
    if (!validacao.valido) {
      return createErrorResponse(
        ErrorCodes.VALIDATION_ERROR,
        validacao.erro,
        400
      );
    }

    const atendente = validacao.atendente!;

    // Gerar senha temporária
    const senhaTemporaria = gerarSenhaTemporaria();
    const senhaHash = await bcrypt.hash(senhaTemporaria, 12);

    // Criar usuário e associar ao atendente em uma transação
    const resultado = await prisma.$transaction(async (tx) => {
      // Criar o usuário
      const novoUsuario = await tx.usuario.create({
        data: {
          nome: atendente.nome,
          email: atendente.email,
          senha: senhaHash,
          tipoUsuario: TipoUsuario.ATENDENTE,
          ativo: true,
          senhaTemporaria: true,
        },
      });

      // Associar o usuário ao atendente
      const atendenteAtualizado = await tx.atendente.update({
        where: { id: atendenteId },
        data: {
          usuarioId: novoUsuario.id,
        },
      });

      // Registrar no audit log
      await tx.auditLog.create({
        data: {
          acao: 'CREATE_USER',
          nomeTabela: 'usuarios',
          registroId: novoUsuario.id,
          usuarioId: session?.user?.id || '',
          atendenteId: atendenteId,
          dadosNovos: {
            atendenteId: atendenteId,
            atendenteNome: atendente.nome,
            atendenteEmail: atendente.email,
            usuarioId: novoUsuario.id,
            tipoUsuario: TipoUsuario.ATENDENTE,
            senhaTemporaria: true,
          },
        },
      });

      return {
        usuario: {
          id: novoUsuario.id,
          nome: novoUsuario.nome,
          email: novoUsuario.email,
          tipoUsuario: novoUsuario.tipoUsuario,
          ativo: novoUsuario.ativo,
          senhaTemporaria: novoUsuario.senhaTemporaria,
        },
        atendente: {
          id: atendenteAtualizado.id,
          nome: atendenteAtualizado.nome,
          email: atendenteAtualizado.email,
          usuarioId: atendenteAtualizado.usuarioId,
        },
        credenciais: {
          email: novoUsuario.email,
          senhaTemporaria: senhaTemporaria,
        },
      };
    });

    return createSuccessResponse(resultado, 'Usuário criado com sucesso', 201);
  } catch (error) {
    console.error('Erro ao criar usuário para atendente:', error);
    return createErrorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Erro interno do servidor',
      500
    );
  }
}