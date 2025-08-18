import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { rankingParamsSchema } from '@/lib/validations/consultor';
import { Prisma } from '@prisma/client';
import { subDays, startOfDay, endOfDay, subWeeks, startOfWeek, endOfWeek, subMonths, startOfMonth, endOfMonth } from 'date-fns';

// Tipagem para o payload do atendente com as relações necessárias
type AtendenteComAvaliacoesGamificacao = Prisma.AtendenteGetPayload<{
  include: {
    avaliacoes: {
      select: { nota: true };
    };
    gamificacao: {
      select: { pontuacaoTotal: true; nivel: true; experiencia: true };
    };
  };
}>;

// Função para calcular o período
const calcularPeriodo = (periodo: string) => {
  const agora = new Date();
  switch (periodo) {
    case 'semanal':
      return { inicio: startOfWeek(subWeeks(agora, 1)), fim: endOfWeek(subWeeks(agora, 1)), nome: 'Semana Anterior' };
    case 'mensal':
      return { inicio: startOfMonth(subMonths(agora, 1)), fim: endOfMonth(subMonths(agora, 1)), nome: 'Mês Anterior' };
    case 'diario':
    default:
      return { inicio: startOfDay(subDays(agora, 1)), fim: endOfDay(subDays(agora, 1)), nome: 'Últimas 24 horas' };
  }
};

// Função para calcular as métricas de um atendente
const calcularMetricas = (atendente: AtendenteComAvaliacoesGamificacao) => {
  const totalAvaliacoes = atendente.avaliacoes.length;
  const mediaNotas = totalAvaliacoes > 0
    ? atendente.avaliacoes.reduce((acc, ava) => acc + ava.nota, 0) / totalAvaliacoes
    : 0;
  const percentualSatisfacao = totalAvaliacoes > 0
    ? (atendente.avaliacoes.filter(ava => ava.nota >= 4).length / totalAvaliacoes) * 100
    : 0;

  return {
    pontuacaoTotal: atendente.gamificacao?.pontuacaoTotal ?? 0,
    mediaNotas: parseFloat(mediaNotas.toFixed(2)),
    totalAvaliacoes,
    percentualSatisfacao: parseFloat(percentualSatisfacao.toFixed(2)),
    nivel: atendente.gamificacao?.nivel ?? 0,
    experiencia: atendente.gamificacao?.experiencia ?? 0,
  };
};

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const params = Object.fromEntries(searchParams.entries());

    const validationResult = rankingParamsSchema.safeParse(params);

    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: validationResult.error.flatten(),
      }, { status: 400 });
    }

    const { periodo, cargo, portaria, limite, ordenacao, direcao } = validationResult.data;
    const { inicio, fim, nome: nomePeriodo } = calcularPeriodo(periodo);

    const where: Prisma.AtendenteWhereInput = {
      status: 'ATIVO',
      avaliacoes: {
        some: {
          criadoEm: {
            gte: inicio,
            lte: fim,
          }
        },
      },
      ...(cargo && { cargo }),
      ...(portaria && { portaria }),
    };

    const atendentes = await prisma.atendente.findMany({
      where,
      include: {
        avaliacoes: {
          where: { criadoEm: { gte: inicio, lte: fim } },
          select: { nota: true },
        },
        gamificacao: {
          select: { pontuacaoTotal: true, nivel: true, experiencia: true },
        },
      },
      take: limite,
    });

    const rankingComMetricas = atendentes.map(atendente => ({
      atendente: {
        id: atendente.id,
        nome: atendente.nome,
        cargo: atendente.cargo,
        portaria: atendente.portaria,
        avatarUrl: atendente.avatarUrl,
      },
      metricas: calcularMetricas(atendente as AtendenteComAvaliacoesGamificacao),
    }));

    // Ordenação
    rankingComMetricas.sort((a, b) => {
      const valorA = ordenacao === 'pontuacao' ? a.metricas.pontuacaoTotal : ordenacao === 'media_notas' ? a.metricas.mediaNotas : a.metricas.totalAvaliacoes;
      const valorB = ordenacao === 'pontuacao' ? b.metricas.pontuacaoTotal : ordenacao === 'media_notas' ? b.metricas.mediaNotas : b.metricas.totalAvaliacoes;
      return direcao === 'desc' ? valorB - valorA : valorA - valorB;
    });

    const rankingFinal = rankingComMetricas.map((item, index) => ({
      ...item,
      posicao: index + 1,
    }));

    // Estatísticas Gerais
    const totalAtendentes = await prisma.atendente.count({ where });
    const mediaPontuacao = rankingFinal.reduce((acc, item) => acc + item.metricas.pontuacaoTotal, 0) / (rankingFinal.length || 1);
    const mediaAvaliacoes = rankingFinal.reduce((acc, item) => acc + item.metricas.totalAvaliacoes, 0) / (rankingFinal.length || 1);
    const mediaNotasGeral = rankingFinal.reduce((acc, item) => acc + item.metricas.mediaNotas, 0) / (rankingFinal.length || 1);

    return NextResponse.json({
      success: true,
      data: {
        ranking: rankingFinal,
        periodo: { inicio: inicio.toISOString(), fim: fim.toISOString(), nome: nomePeriodo },
        estatisticas: {
          totalAtendentes,
          mediaPontuacao: parseFloat(mediaPontuacao.toFixed(2)),
          mediaAvaliacoes: parseFloat(mediaAvaliacoes.toFixed(2)),
          mediaNotas: parseFloat(mediaNotasGeral.toFixed(2)),
        },
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Erro ao buscar ranking de consultores:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Erro de validação', details: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 });
  }
}