import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  validateAuthentication,
  validatePermissions,
  ErrorCodes 
} from '@/lib/api-response';
import { TipoUsuario } from '@prisma/client';

// Schema de validação para criar item do changelog
const criarItemSchema = z.object({
  tipo: z.enum(['ADICIONADO', 'ALTERADO', 'CORRIGIDO', 'REMOVIDO', 'DEPRECIADO', 'SEGURANCA']),
  titulo: z.string().min(1, 'Título é obrigatório'),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  ordem: z.number().default(0)
});

interface RouteParams {
  params: {
    id: string;
  };
}

// GET - Listar itens do changelog
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const itens = await prisma.changelogItem.findMany({
      where: { changelogId: params.id },
      orderBy: {
        ordem: 'asc'
      }
    });
    
    return createSuccessResponse(itens);
  } catch (error) {
    console.error('Erro ao buscar itens do changelog:', error);
    return createErrorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Erro interno do servidor'
    );
  }
}

// POST - Criar novo item do changelog
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth();
    
    const authResult = validateAuthentication(session);
    if (authResult) {
      return authResult;
    }
    
    // Apenas admins podem criar itens de changelog
    const permissionResult = validatePermissions(session?.user?.userType || '', [TipoUsuario.ADMIN]);
    if (permissionResult) {
      return permissionResult;
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
    
    const body = await request.json();
    const dadosValidados = criarItemSchema.parse(body);
    
    const item = await prisma.changelogItem.create({
      data: {
        changelogId: params.id,
        tipo: dadosValidados.tipo,
        titulo: dadosValidados.titulo,
        descricao: dadosValidados.descricao,
        ordem: dadosValidados.ordem
      }
    });
    
    return createSuccessResponse(
      item,
      'Item do changelog criado com sucesso'
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Dados inválidos',
        error.issues
      );
    }
    
    console.error('Erro ao criar item do changelog:', error);
    return createErrorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Erro interno do servidor'
    );
  }
}