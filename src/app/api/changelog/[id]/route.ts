import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '../../../../../auth.ts';
import { z } from 'zod';

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
      return NextResponse.json(
        { erro: 'Changelog não encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(changelog);
  } catch (error) {
    console.error('Erro ao buscar changelog:', error);
    return NextResponse.json(
      { erro: 'Erro interno do servidor' },
      { status: 500 }
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
    
    if (!session?.user) {
      return NextResponse.json(
        { erro: 'Não autorizado' },
        { status: 401 }
      );
    }
    
    // Apenas admins podem atualizar changelogs
    if (session.user.userType !== 'ADMIN') {
      return NextResponse.json(
        { erro: 'Acesso negado. Apenas administradores podem atualizar changelogs.' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const dadosValidados = atualizarChangelogSchema.parse(body);
    
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
    
    // Se está atualizando a versão, verificar se não existe outra com a mesma versão
    if (dadosValidados.versao && dadosValidados.versao !== changelogExistente.versao) {
      const versaoExistente = await prisma.changelog.findUnique({
        where: { versao: dadosValidados.versao }
      });
      
      if (versaoExistente) {
        return NextResponse.json(
          { erro: 'Versão já existe' },
          { status: 400 }
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
    
    return NextResponse.json(changelog);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { erro: 'Dados inválidos', detalhes: error.issues },
        { status: 400 }
      );
    }
    
    console.error('Erro ao atualizar changelog:', error);
    return NextResponse.json(
      { erro: 'Erro interno do servidor' },
      { status: 500 }
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
    
    if (!session?.user) {
      return NextResponse.json(
        { erro: 'Não autorizado' },
        { status: 401 }
      );
    }
    
    // Apenas admins podem deletar changelogs
    if (session.user.userType !== 'ADMIN') {
      return NextResponse.json(
        { erro: 'Acesso negado. Apenas administradores podem deletar changelogs.' },
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
    
    await prisma.changelog.delete({
      where: { id: params.id }
    });
    
    return NextResponse.json(
      { mensagem: 'Changelog deletado com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao deletar changelog:', error);
    return NextResponse.json(
      { erro: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}