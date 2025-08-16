/**
 * API Routes para operações individuais de atendentes
 * GET /api/atendentes/[id] - Busca atendente por ID
 * PUT /api/atendentes/[id] - Atualiza atendente
 * DELETE /api/atendentes/[id] - Remove atendente (soft delete)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../auth.ts';
import { prisma } from '@/lib/prisma';
import { 
  atualizarAtendenteSchema,
  formatarCPF,
  formatarTelefone
} from '@/lib/validations/atendente';
import { StatusAtendente } from '@/types/atendente';
import { TipoUsuario } from '@prisma/client';

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
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Verificar permissões
    if (session.user.userType === 'ATENDENTE') {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID do atendente é obrigatório' },
        { status: 400 }
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
            detalhes: true,
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
      return NextResponse.json(
        { success: false, error: 'Atendente não encontrado' },
        { status: 404 }
      );
    }

    // Formatar dados
    const atendenteFormatado = {
      ...atendente,
      cpf: formatarCPF(atendente.cpf),
      telefone: formatarTelefone(atendente.telefone)
    };

    return NextResponse.json({
      success: true,
      data: {
        atendente: atendenteFormatado
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro ao buscar atendente:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
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
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Verificar permissões
    if (session.user.userType === 'ATENDENTE') {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID do atendente é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se atendente existe
    const atendenteExistente = await prisma.atendente.findUnique({
      where: { id }
    });

    if (!atendenteExistente) {
      return NextResponse.json(
        { success: false, error: 'Atendente não encontrado' },
        { status: 404 }
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
        return NextResponse.json(
          { success: false, error: 'Email já está em uso' },
          { status: 409 }
        );
      }
    }
    
    if (dadosValidados.cpf && dadosValidados.cpf !== atendenteExistente.cpf) {
      const cpfExistente = await prisma.atendente.findUnique({
        where: { cpf: dadosValidados.cpf }
      });
      
      if (cpfExistente) {
        return NextResponse.json(
          { success: false, error: 'CPF já está em uso' },
          { status: 409 }
        );
      }
    }
    
    if (dadosValidados.rg && dadosValidados.rg !== atendenteExistente.rg) {
      const rgExistente = await prisma.atendente.findUnique({
        where: { rg: dadosValidados.rg }
      });
      
      if (rgExistente) {
        return NextResponse.json(
          { success: false, error: 'RG já está em uso' },
          { status: 409 }
        );
      }
    }

    // Preparar dados para atualização
    const dadosAtualizacao: any = {};
    
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
        entidade: 'Atendente',
        entidadeId: id,
        usuarioId: session.user.id,
        atendenteId: id,
        detalhes: {
          camposAlterados: Object.keys(dadosAtualizacao),
          valoresAnteriores: Object.keys(dadosAtualizacao).reduce((acc, key) => {
            acc[key] = atendenteExistente[key as keyof typeof atendenteExistente];
            return acc;
          }, {} as any),
          valoresNovos: dadosAtualizacao
        }
      }
    });

    // Formatar dados de resposta
    const atendenteFormatado = {
      ...atendenteAtualizado,
      cpf: formatarCPF(atendenteAtualizado.cpf),
      telefone: formatarTelefone(atendenteAtualizado.telefone)
    };

    return NextResponse.json({
      success: true,
      data: {
        atendente: atendenteFormatado
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro ao atualizar atendente:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Dados inválidos', details: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
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
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Verificar permissões - apenas admin pode deletar
    if (session.user.userType !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Acesso negado. Apenas administradores podem remover atendentes' },
        { status: 403 }
      );
    }

    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID do atendente é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se atendente existe
    const atendenteExistente = await prisma.atendente.findUnique({
      where: { id }
    });

    if (!atendenteExistente) {
      return NextResponse.json(
        { success: false, error: 'Atendente não encontrado' },
        { status: 404 }
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
        entidade: 'Atendente',
        entidadeId: id,
        usuarioId: session.user.id,
        atendenteId: id,
        detalhes: {
          motivo: 'Atendente inativado via soft delete',
          statusAnterior: atendenteExistente.status,
          statusNovo: StatusAtendente.INATIVO
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        message: 'Atendente inativado com sucesso',
        atendente: {
          id: atendenteInativado.id,
          nome: atendenteInativado.nome,
          status: atendenteInativado.status
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro ao remover atendente:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}