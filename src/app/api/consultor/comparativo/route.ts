import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { comparativoParamsSchema } from '@/lib/validations/consultor'
import { hasPermission } from '@/hooks/use-permissions'
import type { TipoUsuario } from '@/hooks/use-permissions'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado', timestamp: new Date().toISOString() },
        { status: 401 }
      )
    }

    // Verificar permissões
    const userType = session.user.userType as TipoUsuario
    if (!hasPermission(userType, 'podeVisualizarComparativos')) {
      return NextResponse.json(
        { success: false, error: 'Sem permissão para visualizar comparativos', timestamp: new Date().toISOString() },
        { status: 403 }
      )
    }

    // Validar parâmetros do body
    const body = await request.json()
    const validatedParams = comparativoParamsSchema.parse(body)

    // Calcular período
    const agora = new Date()
    let dataInicio: Date
    let dataFim: Date
    let nomePeriodo: string

    switch (validatedParams.periodo) {
      case 'semanal':
        const inicioSemana = new Date(agora)
        inicioSemana.setDate(agora.getDate() - agora.getDay())
        inicioSemana.setHours(0, 0, 0, 0)
        dataInicio = inicioSemana
        dataFim = new Date(inicioSemana)
        dataFim.setDate(inicioSemana.getDate() + 6)
        dataFim.setHours(23, 59, 59, 999)
        nomePeriodo = 'Semana Atual'
        break
      
      case 'trimestral':
        const trimestre = Math.floor(agora.getMonth() / 3)
        dataInicio = new Date(agora.getFullYear(), trimestre * 3, 1)
        dataFim = new Date(agora.getFullYear(), (trimestre + 1) * 3, 0)
        dataFim.setHours(23, 59, 59, 999)
        nomePeriodo = `${trimestre + 1}º Trimestre ${agora.getFullYear()}`
        break
      
      case 'anual':
        dataInicio = new Date(agora.getFullYear(), 0, 1)
        dataFim = new Date(agora.getFullYear(), 11, 31, 23, 59, 59, 999)
        nomePeriodo = `Ano ${agora.getFullYear()}`
        break
      
      default: // mensal
        dataInicio = new Date(agora.getFullYear(), agora.getMonth(), 1)
        dataFim = new Date(agora.getFullYear(), agora.getMonth() + 1, 0)
        dataFim.setHours(23, 59, 59, 999)
        nomePeriodo = `${agora.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`
        break
    }

    // Buscar atendentes selecionados
    const atendentes = await prisma.atendente.findMany({
      where: {
        id: { in: validatedParams.atendenteIds },
        ativo: true,
      },
      include: {
        gamificacao: true,
        avaliacoes: {
          where: {
            dataAvaliacao: {
              gte: dataInicio,
              lte: dataFim,
            },
          },
        },
        usuario: {
          select: {
            avatarUrl: true,
          },
        },
      },
    })

    if (atendentes.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Nenhum atendente encontrado', timestamp: new Date().toISOString() },
        { status: 404 }
      )
    }

    // Calcular métricas para cada atendente
    const atendentesDados = atendentes.map(atendente => {
      const avaliacoes = atendente.avaliacoes
      const totalAvaliacoes = avaliacoes.length
      const mediaNotas = totalAvaliacoes > 0 
        ? avaliacoes.reduce((sum, av) => sum + av.notaGeral, 0) / totalAvaliacoes 
        : 0
      const percentualSatisfacao = totalAvaliacoes > 0
        ? (avaliacoes.filter(av => av.notaGeral >= 4).length / totalAvaliacoes) * 100
        : 0

      // Calcular métricas solicitadas
      const metricas: Record<string, number | string> = {}
      
      for (const metrica of validatedParams.metricas) {
        switch (metrica) {
          case 'pontuacao_total':
            metricas[metrica] = atendente.gamificacao?.pontuacaoTotal || 0
            break
          case 'media_notas':
            metricas[metrica] = Math.round(mediaNotas * 100) / 100
            break
          case 'total_avaliacoes':
            metricas[metrica] = totalAvaliacoes
            break
          case 'percentual_satisfacao':
            metricas[metrica] = Math.round(percentualSatisfacao * 100) / 100
            break
          case 'sequencia_atual':
            metricas[metrica] = atendente.gamificacao?.sequenciaAtual || 0
            break
          case 'melhor_sequencia':
            metricas[metrica] = atendente.gamificacao?.melhorSequencia || 0
            break
          case 'nivel':
            metricas[metrica] = atendente.gamificacao?.nivel || 1
            break
          case 'experiencia':
            metricas[metrica] = atendente.gamificacao?.experiencia || 0
            break
        }
      }

      return {
        id: atendente.id,
        nome: atendente.nome,
        cargo: atendente.cargo,
        portaria: atendente.portaria,
        avatarUrl: atendente.usuario?.avatarUrl,
        metricas,
        posicaoRanking: undefined, // TODO: Calcular posição no ranking geral
      }
    })

    // Calcular comparações (melhor, pior, média)
    const comparacao: Record<string, Record<string, unknown>> = {
      melhor: {},
      pior: {},
      media: {},
    }

    for (const metrica of validatedParams.metricas) {
      const valores = atendentesDados.map(a => a.metricas[metrica] as number)
      const valoresNumericos = valores.filter(v => typeof v === 'number')
      
      if (valoresNumericos.length > 0) {
        const valorMaximo = Math.max(...valoresNumericos)
        const valorMinimo = Math.min(...valoresNumericos)
        const valorMedio = valoresNumericos.reduce((sum, v) => sum + v, 0) / valoresNumericos.length

        const melhorAtendente = atendentesDados.find(a => a.metricas[metrica] === valorMaximo)
        const piorAtendente = atendentesDados.find(a => a.metricas[metrica] === valorMinimo)

        comparacao.melhor[metrica] = {
          atendenteId: melhorAtendente?.id,
          valor: valorMaximo,
        }

        comparacao.pior[metrica] = {
          atendenteId: piorAtendente?.id,
          valor: valorMinimo,
        }

        comparacao.media[metrica] = Math.round(valorMedio * 100) / 100
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        atendentes: atendentesDados,
        periodo: {
          inicio: dataInicio.toISOString(),
          fim: dataFim.toISOString(),
          nome: nomePeriodo,
        },
        comparacao,
      },
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Erro ao buscar comparativo:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Parâmetros inválidos', 
          details: error.message,
          timestamp: new Date().toISOString() 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor', timestamp: new Date().toISOString() },
      { status: 500 }
    )
  }
}