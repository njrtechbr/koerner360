import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// Schema de validação para criar changelog
const criarChangelogSchema = z.object({
  versao: z.string().min(1, 'Versão é obrigatória'),
  dataLancamento: z.string().transform((str) => new Date(str)),
  tipo: z.enum(['ADICIONADO', 'ALTERADO', 'CORRIGIDO', 'REMOVIDO', 'DEPRECIADO', 'SEGURANCA']),
  titulo: z.string().min(1, 'Título é obrigatório'),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  categoria: z.enum(['FUNCIONALIDADE', 'INTERFACE', 'PERFORMANCE', 'SEGURANCA', 'CONFIGURACAO', 'DOCUMENTACAO', 'TECNICO']).optional(),
  prioridade: z.enum(['BAIXA', 'MEDIA', 'ALTA', 'CRITICA']).default('MEDIA'),
  publicado: z.boolean().default(false),
  itens: z.array(z.object({
    tipo: z.enum(['ADICIONADO', 'ALTERADO', 'CORRIGIDO', 'REMOVIDO', 'DEPRECIADO', 'SEGURANCA']),
    titulo: z.string().min(1, 'Título do item é obrigatório'),
    descricao: z.string().min(1, 'Descrição do item é obrigatória'),
    ordem: z.number().default(0)
  })).optional()
});

// GET - Listar changelogs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const publicadoApenas = searchParams.get('publicado') === 'true';
    const versao = searchParams.get('versao');
    const limite = parseInt(searchParams.get('limite') || '10');
    const pagina = parseInt(searchParams.get('pagina') || '1');
    
    const where: any = {};
    
    if (publicadoApenas) {
      where.publicado = true;
    }
    
    if (versao) {
      where.versao = {
        contains: versao,
        mode: 'insensitive'
      };
    }
    
    const [changelogs, total] = await Promise.all([
      prisma.changelog.findMany({
        where,
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
        },
        orderBy: {
          dataLancamento: 'desc'
        },
        skip: (pagina - 1) * limite,
        take: limite
      }),
      prisma.changelog.count({ where })
    ]);
    
    return NextResponse.json({
      changelogs,
      paginacao: {
        total,
        pagina,
        limite,
        totalPaginas: Math.ceil(total / limite)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar changelogs:', error);
    return NextResponse.json(
      { erro: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar novo changelog
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { erro: 'Não autorizado' },
        { status: 401 }
      );
    }
    
    // Apenas admins podem criar changelogs
    if (session.user.tipoUsuario !== 'ADMIN') {
      return NextResponse.json(
        { erro: 'Acesso negado. Apenas administradores podem criar changelogs.' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const dadosValidados = criarChangelogSchema.parse(body);
    
    // Verificar se a versão já existe
    const versaoExistente = await prisma.changelog.findUnique({
      where: { versao: dadosValidados.versao }
    });
    
    if (versaoExistente) {
      return NextResponse.json(
        { erro: 'Versão já existe' },
        { status: 400 }
      );
    }
    
    const changelog = await prisma.changelog.create({
      data: {
        versao: dadosValidados.versao,
        dataLancamento: dadosValidados.dataLancamento,
        tipo: dadosValidados.tipo,
        titulo: dadosValidados.titulo,
        descricao: dadosValidados.descricao,
        categoria: dadosValidados.categoria,
        prioridade: dadosValidados.prioridade,
        publicado: dadosValidados.publicado,
        autorId: session.user.id,
        itens: dadosValidados.itens ? {
          create: dadosValidados.itens
        } : undefined
      },
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
    
    return NextResponse.json(changelog, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { erro: 'Dados inválidos', detalhes: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Erro ao criar changelog:', error);
    return NextResponse.json(
      { erro: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}