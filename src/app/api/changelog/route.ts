import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
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
    const busca = searchParams.get('busca');
    const tipo = searchParams.get('tipo');
    const prioridade = searchParams.get('prioridade');
    const categoria = searchParams.get('categoria');
    const limite = parseInt(searchParams.get('limite') || '10');
    const pagina = parseInt(searchParams.get('pagina') || '1');
    
    const where: Record<string, unknown> = {};
    
    if (publicadoApenas) {
      where.publicado = true;
    }
    
    if (versao) {
      where.versao = {
        contains: versao,
        mode: 'insensitive'
      };
    }
    
    // Busca geral por versão, título ou descrição
    if (busca) {
      where.OR = [
        {
          versao: {
            contains: busca,
            mode: 'insensitive'
          }
        },
        {
          titulo: {
            contains: busca,
            mode: 'insensitive'
          }
        },
        {
          descricao: {
            contains: busca,
            mode: 'insensitive'
          }
        }
      ];
    }
    
    // Filtro por tipo
    if (tipo && tipo !== 'all') {
      where.tipo = tipo;
    }
    
    // Filtro por prioridade
    if (prioridade && prioridade !== 'all') {
      where.prioridade = prioridade;
    }
    
    // Filtro por categoria
    if (categoria && categoria !== 'all') {
      where.categoria = categoria;
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
    
    const totalPaginas = Math.ceil(total / limite);
    
    return NextResponse.json({
      success: true,
      data: {
        changelogs,
        paginacao: {
          paginaAtual: pagina,
          itensPorPagina: limite,
          totalItens: total,
          totalPaginas,
          temProximaPagina: pagina < totalPaginas,
          temPaginaAnterior: pagina > 1,
        },
      },
      timestamp: new Date().toISOString(),
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
    if (session.user.userType !== 'ADMIN') {
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
        { erro: 'Dados inválidos', detalhes: error.issues },
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