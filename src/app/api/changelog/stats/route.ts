import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/changelog/stats
 * Retorna estatísticas do changelog
 */
export async function GET() {
  try {
    // Buscar estatísticas básicas
    const [totalVersions, totalChanges, lastUpdate, typeDistribution] = await Promise.all([
      // Total de versões publicadas
      prisma.changelog.count({
        where: { publicado: true }
      }),
      
      // Total de mudanças (itens de changelog)
      prisma.changelogItem.count({
        where: {
          changelog: {
            publicado: true
          }
        }
      }),
      
      // Última atualização
      prisma.changelog.findFirst({
        where: { publicado: true },
        orderBy: { dataLancamento: 'desc' },
        select: { dataLancamento: true }
      }),
      
      // Distribuição por tipo
      prisma.changelogItem.groupBy({
        by: ['tipo'],
        where: {
          changelog: {
            publicado: true
          }
        },
        _count: {
          tipo: true
        }
      })
    ]);

    // Processar distribuição por tipo
    const typeDistributionMap = typeDistribution.reduce((acc, item) => {
      acc[item.tipo] = item._count.tipo;
      return acc;
    }, {} as Record<string, number>);

    const estatisticas = {
      totalVersions,
      totalChanges,
      lastUpdate: lastUpdate?.dataLancamento || new Date().toISOString(),
      typeDistribution: typeDistributionMap
    };

    return NextResponse.json({
      success: true,
      data: estatisticas,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas do changelog:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}