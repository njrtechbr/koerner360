import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import {
  createSuccessResponse,
  createErrorResponse,
  ErrorCodes,
  withErrorHandling,
  validateAuthentication
} from '@/lib/api-response';

// Schema de validação para atualizar changelog
const atualizarChangelogSchema = z.object({
  versao: z.string().min(1, 'Versão é obrigatória').optional(),
  dataLancamento: z.string().transform((str) => new Date(str)).optional(),
  tipo: z.enum(['ADICIONADO', 'ALTERADO', 'CORRIGIDO', 'REMOVIDO', 'DEPRECIADO', 'SEGURANCA']).optional(),
  titulo: z.string().min(1, 'Título é obrigatório').optional(),
  descricao: z.string().min(1, 'Descrição é obrigatória').optional(),
  categoria: z.enum(['FUNCIONALIDADE', 'INTERFACE', 'PERFORMANCE', 'SEGURANCA', 'CONFIGURACAO', 'DOCUMENTACAO', 'TECNICO']).optional(),
  prioridade: z.enum(['BAIXA', 'MEDIA', 'ALTA', 'CRITICA']).optional(),
  publicado: z.boolean().optional()
});

interface RouteParams {
  params: {
    id: string;
  };
}

// GET - Buscar changelog específico
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const changelog = await prisma.changelog.findUnique({
      where: { id: params.id },
      include: {
        autor: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        },
        itens: {
          orderBy: {
            ordem: 'asc'
          }
        }
      }
    });
    
    if (!changelog) {
      return createErrorResponse(
        ErrorCodes.NOT_FOUND,
        'Changelog não encontrado'
      );
    }
    
    return createSuccessResponse(changelog, 'Changelog encontrado com sucesso');
  } catch (error) {
    console.error('Erro ao buscar changelog:', error);
    return createErrorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Erro interno do servidor'
    );
  }
}

// PUT - Atualizar changelog
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

    // Apenas admins podem atualizar changelogs
    if (session?.user?.userType !== 'ADMIN') {
      return createErrorResponse(
        ErrorCodes.FORBIDDEN,
        'Acesso negado. Apenas administradores podem atualizar changelogs.'
      );
    }
    
    const body = await request.json();
    const dadosValidados = atualizarChangelogSchema.parse(body);
    
    // Verificar se o changelog existe
    const changelogExistente = await prisma.changelog.findUnique({
      where: { id: params.id }
    });
    
    if (!changelogExistente) {
      return createErrorResponse(
        ErrorCodes.NOT_FOUND,
        'Changelog não encontrado'
      );
    }
    
    // Se está atualizando a versão, verificar se não existe outra com a mesma versão
    if (dadosValidados.versao && dadosValidados.versao !== changelogExistente.versao) {
      const versaoExistente = await prisma.changelog.findUnique({
        where: { versao: dadosValidados.versao }
      });
      
      if (versaoExistente) {
        return createErrorResponse(
          ErrorCodes.VALIDATION_ERROR,
          'Versão já existe'
        );
      }
    }
    
    const changelog = await prisma.changelog.update({
      where: { id: params.id },
      data: dadosValidados,
      include: {
        autor: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        },
        itens: {
          orderBy: {
            ordem: 'asc'
          }
        }
      }
    });
    
    return createSuccessResponse(changelog, 'Changelog atualizado com sucesso');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Dados inválidos',
        error.issues
      );
    }
    
    console.error('Erro ao atualizar changelog:', error);
    return createErrorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Erro interno do servidor'
    );
  }
}

// DELETE - Deletar changelog
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

    // Apenas admins podem deletar changelogs
    if (session?.user?.userType !== 'ADMIN') {
      return createErrorResponse(
        ErrorCodes.FORBIDDEN,
        'Acesso negado. Apenas administradores podem deletar changelogs.'
      );
    }
    
    // Verificar se o changelog existe
    const changelogExistente = await prisma.changelog.findUnique({
      where: { id: params.id }
    });
    
    if (!changelogExistente) {
      return createErrorResponse(
        ErrorCodes.NOT_FOUND,
        'Changelog não encontrado'
      );
    }
    
    await prisma.changelog.delete({
      where: { id: params.id }
    });
    
    return createSuccessResponse(
      { id: params.id },
      'Changelog deletado com sucesso'
    );
  } catch (error) {
    console.error('Erro ao deletar changelog:', error);
    return createErrorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Erro interno do servidor'
    );
  }
}