import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

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
    
    return NextResponse.json(itens);
  } catch (error) {
    console.error('Erro ao buscar itens do changelog:', error);
    return NextResponse.json(
      { erro: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar novo item do changelog
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { erro: 'Não autorizado' },
        { status: 401 }
      );
    }
    
    // Apenas admins podem criar itens de changelog
    if (session.user.tipoUsuario !== 'ADMIN') {
      return NextResponse.json(
        { erro: 'Acesso negado. Apenas administradores podem criar itens de changelog.' },
        { status: 403 }
      );
    }
    
    // Verificar se o changelog existe
    const changelogExistente = await prisma.changelog.findUnique({
      where: { id: params.id }
    });
    
    if (!changelogExistente) {
      return NextResponse.json(
        { erro: 'Changelog não encontrado' },
        { status: 404 }
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
    
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { erro: 'Dados inválidos', detalhes: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Erro ao criar item do changelog:', error);
    return NextResponse.json(
      { erro: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}