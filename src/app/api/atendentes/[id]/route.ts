/**
 * API Routes para operações individuais de atendentes
 * GET /api/atendentes/[id] - Busca atendente por ID
 * PUT /api/atendentes/[id] - Atualiza atendente
 * DELETE /api/atendentes/[id] - Remove atendente (soft delete)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { 
  atualizarAtendenteSchema,
  formatarCPF,
  formatarTelefone
} from '@/lib/validations/atendente';
import { StatusAtendente } from '@/types/atendente';
import { TipoUsuario } from '@prisma/client';
import {
  createSuccessResponse,
  createErrorResponse,
  validateAuthentication,
  validatePermissions,
  ErrorCodes
} from '@/lib/api-response';


interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/atendentes/[id]
 * Busca um atendente específico por ID
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth();
    const authResult = validateAuthentication(session);
    if (authResult) {
      return authResult;
    }

    const permissionResult = validatePermissions(
      session?.user?.userType || '',
      [TipoUsuario.ADMIN, TipoUsuario.SUPERVISOR]
    );
    if (permissionResult) {
      return permissionResult;
    }

    const { id } = params;
    
    if (!id) {
      return createErrorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'ID do atendente é obrigatório',
        400
      );
    }

    // Buscar atendente
    const atendente = await prisma.atendente.findUnique({
      where: { id },
      include: {
        auditLogs: {
          select: {
            id: true,
            acao: true,
            dadosNovos: true,
            criadoEm: true,
            usuario: {
              select: {
                nome: true,
                email: true
              }
            }
          },
          orderBy: {
            criadoEm: 'desc'
          },
          take: 10 // Últimos 10 logs de auditoria
        }
      }
    });

    if (!atendente) {
      return createErrorResponse(
        ErrorCodes.NOT_FOUND,
        'Atendente não encontrado',
        404
      );
    }

    // Formatar dados
    const atendenteFormatado = {
      ...atendente,
      cpf: formatarCPF(atendente.cpf),
      telefone: formatarTelefone(atendente.telefone)
    };

    return createSuccessResponse({ atendente: atendenteFormatado });

  } catch (error) {
    console.error('Erro ao buscar atendente:', error);
    return createErrorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Erro interno do servidor',
      500
    );
  }
}

/**
 * PUT /api/atendentes/[id]
 * Atualiza um atendente existente
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth();
    const authResult = validateAuthentication(session);
    if (authResult) {
      return authResult;
    }

    const permissionResult = validatePermissions(
      session?.user?.userType || '',
      [TipoUsuario.ADMIN, TipoUsuario.SUPERVISOR]
    );
    if (permissionResult) {
      return permissionResult;
    }

    const { id } = params;
    
    if (!id) {
      return createErrorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'ID do atendente é obrigatório',
        400
      );
    }

    // Verificar se atendente existe
    const atendenteExistente = await prisma.atendente.findUnique({
      where: { id }
    });

    if (!atendenteExistente) {
      return createErrorResponse(
        ErrorCodes.NOT_FOUND,
        'Atendente não encontrado',
        404
      );
    }

    const body = await request.json();
    
    // Validar dados de entrada
    const dadosValidados = atualizarAtendenteSchema.parse(body);
    
    // Verificar conflitos apenas se os campos foram alterados
    if (dadosValidados.email && dadosValidados.email !== atendenteExistente.email) {
      const emailExistente = await prisma.atendente.findUnique({
        where: { email: dadosValidados.email }
      });
      
      if (emailExistente) {
        return createErrorResponse(
          ErrorCodes.VALIDATION_ERROR,
          'Email já está em uso',
          409
        );
      }
    }
    
    if (dadosValidados.cpf && dadosValidados.cpf !== atendenteExistente.cpf) {
      const cpfExistente = await prisma.atendente.findUnique({
        where: { cpf: dadosValidados.cpf }
      });
      
      if (cpfExistente) {
        return createErrorResponse(
          ErrorCodes.VALIDATION_ERROR,
          'CPF já está em uso',
          409
        );
      }
    }
    
    if (dadosValidados.rg && dadosValidados.rg !== atendenteExistente.rg) {
      const rgExistente = await prisma.atendente.findUnique({
        where: { rg: dadosValidados.rg }
      });
      
      if (rgExistente) {
        return createErrorResponse(
          ErrorCodes.VALIDATION_ERROR,
          'RG já está em uso',
          409
        );
      }
    }

    // Preparar dados para atualização
    const dadosAtualizacao: Record<string, unknown> = {};
    
    Object.keys(dadosValidados).forEach(key => {
      const valor = dadosValidados[key as keyof typeof dadosValidados];
      if (valor !== undefined) {
        if (key === 'dataAdmissao' || key === 'dataNascimento') {
          dadosAtualizacao[key] = new Date(valor as string);
        } else {
          dadosAtualizacao[key] = valor;
        }
      }
    });

    // Atualizar atendente
    const atendenteAtualizado = await prisma.atendente.update({
      where: { id },
      data: dadosAtualizacao
    });

    // Registrar auditoria
    await prisma.auditLog.create({
      data: {
        acao: 'UPDATE',
        nomeTabela: 'Atendente',
        registroId: id,
        usuarioId: session?.user?.id || '',
        atendenteId: id,
        dadosAnteriores: JSON.stringify(Object.keys(dadosAtualizacao).reduce((acc, key) => {
          acc[key] = atendenteExistente[key as keyof typeof atendenteExistente];
          return acc;
        }, {} as Record<string, unknown>)),
        dadosNovos: JSON.stringify(dadosAtualizacao)
      }
    });

    // Formatar dados de resposta
    const atendenteFormatado = {
      ...atendenteAtualizado,
      cpf: formatarCPF(atendenteAtualizado.cpf),
      telefone: formatarTelefone(atendenteAtualizado.telefone)
    };

    return createSuccessResponse({ atendente: atendenteFormatado });

  } catch (error) {
    console.error('Erro ao atualizar atendente:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return createErrorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Dados inválidos',
        error.message,
        400
      );
    }
    
    return createErrorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Erro interno do servidor',
      500
    );
  }
}

/**
 * DELETE /api/atendentes/[id]
 * Remove um atendente (soft delete - marca como inativo)
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth();
    const authResult = validateAuthentication(session);
    if (authResult) {
      return authResult;
    }

    // Verificar permissões - apenas admin pode deletar
    const permissionResult = validatePermissions(
      session?.user?.userType || '',
      [TipoUsuario.ADMIN]
    );
    if (permissionResult) {
      return permissionResult;
    }

    const { id } = params;
    
    if (!id) {
      return createErrorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'ID do atendente é obrigatório',
        400
      );
    }

    // Verificar se atendente existe
    const atendenteExistente = await prisma.atendente.findUnique({
      where: { id }
    });

    if (!atendenteExistente) {
      return createErrorResponse(
        ErrorCodes.NOT_FOUND,
        'Atendente não encontrado',
        404
      );
    }

    // Soft delete - apenas marcar como inativo
    const atendenteInativado = await prisma.atendente.update({
      where: { id },
      data: {
        status: StatusAtendente.INATIVO
      }
    });

    // Registrar auditoria
    await prisma.auditLog.create({
      data: {
        acao: 'SOFT_DELETE',
        nomeTabela: 'Atendente',
        registroId: id,
        usuarioId: session?.user?.id || '',
        atendenteId: id,
        dadosNovos: JSON.stringify({
          motivo: 'Atendente inativado via soft delete',
          statusAnterior: atendenteExistente.status,
          statusNovo: StatusAtendente.INATIVO
        })
      }
    });

    return createSuccessResponse({
      message: 'Atendente inativado com sucesso',
      atendente: {
        id: atendenteInativado.id,
        nome: atendenteInativado.nome,
        status: atendenteInativado.status
      }
    });

  } catch (error) {
    console.error('Erro ao remover atendente:', error);
    return createErrorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Erro interno do servidor',
      500
    );
  }
}