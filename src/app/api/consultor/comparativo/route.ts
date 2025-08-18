import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getPeriodo } from '@/lib/get-periodo';
import { PermissionsUtils } from '@/lib/permissions/permissions-utils';
import { TipoUsuario } from '@prisma/client';
import { comparativoParamsSchema } from '@/lib/validations/consultor';
import { Prisma } from '@prisma/client';

// Usando Prisma.validator para criar um tipo preciso diretamente da estrutura da query.
const atendenteComDadosValidator = Prisma.validator<Prisma.AtendenteDefaultArgs>()({
  include: {
    usuario: { select: { nome: true, avatarUrl: true } },
    gamificacao: { select: { pontuacaoTotal: true, nivel: true } },
    avaliacoes: { select: { nota: true } },
  },
});

// O tipo é inferido diretamente do validator, garantindo 100% de correspondência com a query.
type AtendenteComDados = Prisma.AtendenteGetPayload<typeof atendenteComDadosValidator>;

// Interface para a estrutura final das métricas, mantida para clareza.
interface MetricasAtendente {
  id: string;
  nome: string;
  avatarUrl: string | null;
  cargo: string | null;
  portaria: string | null;
  metricas: {
    pontuacaoTotal: number;
    nivel: number;
    mediaNotas: number;
    totalAvaliacoes: number;
    percentualSatisfacao: number;
  };
}

// A função de cálculo agora opera sobre o tipo seguro e preciso do Prisma.validator.
const calcularMetricas = (atendente: AtendenteComDados): MetricasAtendente => {
  const totalAvaliacoes = atendente.avaliacoes.length;
  const somaNotas = atendente.avaliacoes.reduce((acc, ava) => acc + ava.nota, 0);
  const mediaNotas = totalAvaliacoes > 0 ? somaNotas / totalAvaliacoes : 0;
  const notasBoas = atendente.avaliacoes.filter((ava) => ava.nota >= 4).length;
  const percentualSatisfacao =
    totalAvaliacoes > 0 ? (notasBoas / totalAvaliacoes) * 100 : 0;

  // A conversão de `Decimal` para `number` é feita de forma segura.
  const pontuacaoTotal = Number(atendente.gamificacao?.pontuacaoTotal ?? 0);

  return {
    id: atendente.id,
    nome: atendente.usuario?.nome ?? '',
    avatarUrl: atendente.usuario?.avatarUrl ?? null,
    cargo: atendente.cargo ?? null,
    portaria: atendente.portaria ?? null,
    metricas: {
      pontuacaoTotal,
      nivel: atendente.gamificacao?.nivel ?? 0,
      mediaNotas: parseFloat(mediaNotas.toFixed(2)),
      totalAvaliacoes,
      percentualSatisfacao: parseFloat(percentualSatisfacao.toFixed(2)),
    },
  };
};

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.userType) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }

    if (!PermissionsUtils.podeVisualizarEquipe(session!.user.userType as TipoUsuario)) {
      return NextResponse.json({ success: false, error: 'Acesso negado' }, { status: 403 });
    }

    const body = await request.json();
    const validation = comparativoParamsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Dados de entrada inválidos', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { atendenteIds, periodo } = validation.data;
    const { dataInicio, dataFim, nomePeriodo } = getPeriodo(periodo);

    // A query é executada diretamente no handler, com o `include` definido pelo validator.
    const atendentes = await prisma.atendente.findMany({
      where: {
        id: { in: atendenteIds },
        status: 'ATIVO',
      },
      // O objeto do validator é reutilizado aqui para manter a consistência.
      include: atendenteComDadosValidator.include,
    });

    if (atendentes.length !== atendenteIds.length) {
      const idsEncontrados = new Set(atendentes.map((a) => a.id));
      const idsFaltantes = atendenteIds.filter((id) => !idsEncontrados.has(id));
      return NextResponse.json({
        success: false,
        error: `Os seguintes atendentes não foram encontrados ou estão inativos: ${idsFaltantes.join(', ')}.`,
      }, { status: 404 });
    }

    // O `map` agora opera sobre um tipo totalmente seguro, sem necessidade de casts ou inferências complexas.
    const dadosComparativos = atendentes.map(calcularMetricas);

    return NextResponse.json({
      success: true,
      data: {
        comparativo: dadosComparativos,
        periodo: {
          inicio: dataInicio.toISOString(),
          fim: dataFim.toISOString(),
          nome: nomePeriodo,
        },
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Erro na API de Comparativo:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Erro de validação', details: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 });
  }
}