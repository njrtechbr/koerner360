import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { conquistasParamsSchema } from '@/lib/validations/consultor';
import { hasPermission } from '@/lib/permissions';
import {
  TipoUsuario,
  CategoriaConquista,
  TipoConquista,
} from '@prisma/client';
import type { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !session?.user?.userType) {
      return NextResponse.json(
        {
          success: false,
          error: 'Não autorizado',
          timestamp: new Date().toISOString(),
        },
        { status: 401 },
      );
    }

    // Verificar permissões
    const userType = session!.user.userType as TipoUsuario;
    if (!hasPermission(userType, 'podeVisualizarConquistas')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Sem permissão para visualizar conquistas',
          timestamp: new Date().toISOString(),
        },
        { status: 403 },
      );
    }

    // Validar parâmetros da query
    const { searchParams } = new URL(request.url);
    const validatedParams = conquistasParamsSchema.safeParse({
      atendenteId: searchParams.get('atendenteId') || undefined,
      categoria: searchParams.get('categoria') || undefined,
      tipo: searchParams.get('tipo') || undefined,
      limite: searchParams.get('limite')
        ? parseInt(searchParams.get('limite')!, 10)
        : undefined,
      periodo: searchParams.get('periodo') || undefined,
    });

    if (!validatedParams.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Parâmetros inválidos',
          details: validatedParams.error.flatten(),
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      );
    }

    const { data: params } = validatedParams;

    // Construir filtros
    const whereConquistas: Prisma.ConquistaWhereInput = {};

    if (params.categoria) {
      whereConquistas.categoria = params.categoria;
    }

    if (params.tipo) {
      whereConquistas.tipo = params.tipo;
    }

    // Se atendenteId for fornecido, buscar conquistas específicas do atendente
    if (params.atendenteId) {
      const conquistasAtendente = await prisma.conquistaAtendente.findMany({
        where: {
          atendenteId: params.atendenteId,
          conquista: whereConquistas,
        },
        include: {
          conquista: true,
          atendente: {
            select: {
              id: true,
              nome: true,
              cargo: true,
              portaria: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: {
          obtidaEm: 'desc',
        },
        take: params.limite,
      });

      const conquistasFormatadas = conquistasAtendente.map(ca => ({
        id: ca.conquista.id,
        nome: ca.conquista.nome,
        descricao: ca.conquista.descricao,
        icone: ca.conquista.icone,
        categoria: ca.conquista.categoria,
        tipo: ca.conquista.tipo,
        pontos: ca.conquista.pontos,
        obtidaEm: ca.obtidaEm.toISOString(),
        atendente: {
          id: ca.atendente.id,
          nome: ca.atendente.nome,
          cargo: ca.atendente.cargo ?? undefined,
          portaria: ca.atendente.portaria ?? undefined,
          avatarUrl: ca.atendente.avatarUrl ?? undefined,
        },
      }));

      const total = await prisma.conquistaAtendente.count({
        where: {
          atendenteId: params.atendenteId,
          conquista: whereConquistas,
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          conquistas: conquistasFormatadas,
          total,
          atendenteId: params.atendenteId,
        },
        timestamp: new Date().toISOString(),
      });
    }

    // Buscar todas as conquistas disponíveis
    const [conquistas, totalConquistas] = await Promise.all([
      prisma.conquista.findMany({
        where: whereConquistas,
        include: {
          _count: {
            select: {
              atendentes: true,
            },
          },
        },
        orderBy: [{ categoria: 'asc' }, { tipo: 'asc' }, { pontos: 'asc' }],
        take: params.limite,
      }),
      prisma.conquista.count({ where: whereConquistas }),
    ]);

    const conquistasFormatadas = conquistas.map(conquista => ({
      id: conquista.id,
      nome: conquista.nome,
      descricao: conquista.descricao,
      icone: conquista.icone,
      categoria: conquista.categoria,
      tipo: conquista.tipo,
      pontos: conquista.pontos,
      totalConquistadores: conquista._count.atendentes,
      criadoEm: conquista.criadoEm.toISOString(),
      atualizadoEm: conquista.atualizadoEm.toISOString(),
    }));

    // Estatísticas gerais
    const [estatisticasPorCategoria, estatisticasPorTipo] = await Promise.all([
      prisma.conquista.groupBy({
        by: ['categoria'],
        _count: { id: true },
        where: whereConquistas,
      }),
      prisma.conquista.groupBy({
        by: ['tipo'],
        _count: { id: true },
        where: whereConquistas,
      }),
    ]);

    const porCategoria = estatisticasPorCategoria.reduce(
      (acc, item) => {
        acc[item.categoria] = item._count.id;
        return acc;
      },
      {} as Record<CategoriaConquista, number>,
    );

    const porTipo = estatisticasPorTipo.reduce(
      (acc, item) => {
        acc[item.tipo] = item._count.id;
        return acc;
      },
      {} as Record<TipoConquista, number>,
    );

    return NextResponse.json({
      success: true,
      data: {
        conquistas: conquistasFormatadas,
        estatisticas: {
          totalConquistas,
          conquistasPorCategoria: porCategoria,
          conquistasPorTipo: porTipo,
          pontosTotais: 0, // TODO: Implementar cálculo de pontos totais
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro ao buscar conquistas:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}