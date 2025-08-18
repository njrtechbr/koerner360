import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { validateAuthentication, validatePermissions } from '@/lib/api-response';
import { TipoUsuario } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  createPaginatedResponse,
  ErrorCodes 
} from '@/lib/api-response';
import { logError } from '@/lib/error-utils';

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
    
    return createPaginatedResponse(
      changelogs,
      {
        paginaAtual: pagina,
        itensPorPagina: limite,
        totalItens: total,
        totalPaginas,
        temProximaPagina: pagina < totalPaginas,
        temPaginaAnterior: pagina > 1,
      }
    );
  } catch (error) {
    logError('Erro ao buscar changelogs', error);
    return createErrorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Erro interno do servidor'
    );
  }
}

// POST - Criar novo changelog
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    const authResult = validateAuthentication(session);
    if (authResult) {
      return authResult;
    }

    // Apenas admins podem criar changelogs
    const permissionResult = validatePermissions(session?.user?.userType || '', [TipoUsuario.ADMIN]);
    if (permissionResult) {
      return permissionResult;
    }
    
    const body = await request.json();
    const dadosValidados = criarChangelogSchema.parse(body);
    
    // Verificar se a versão já existe
    const versaoExistente = await prisma.changelog.findUnique({
      where: { versao: dadosValidados.versao }
    });
    
    if (versaoExistente) {
      return createErrorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Versão já existe'
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
        autorId: session?.user?.id || '',
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
    
    return createSuccessResponse(
      changelog,
      'Changelog criado com sucesso'
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Dados inválidos',
        error.issues
      );
    }
    
    logError('Erro ao criar changelog', error);
    return createErrorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Erro interno do servidor'
    );
  }
}