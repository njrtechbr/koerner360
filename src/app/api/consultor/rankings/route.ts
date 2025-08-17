import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { rankingParamsSchema } from '@/lib/validations/consultor'
import { hasPermission } from '@/hooks/use-permissions'
import type { TipoUsuario } from '@/hooks/use-permissions'

export async function GET(request: NextRequest) {
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
    if (!hasPermission(userType, 'podeVisualizarRankings')) {
      return NextResponse.json(
        { success: false, error: 'Sem permissão para visualizar rankings', timestamp: new Date().toISOString() },
        { status: 403 }
      )
    }

    // Validar parâmetros
    const { searchParams } = new URL(request.url)
    const params = {
      periodo: searchParams.get('periodo') || 'mensal',
      cargo: searchParams.get('cargo') || undefined,
      portaria: searchParams.get('portaria') || undefined,
      limite: searchParams.get('limite') || '10',
      ordenacao: searchParams.get('ordenacao') || 'pontuacao',
      direcao: searchParams.get('direcao') || 'desc',
    }

    const validatedParams = rankingParamsSchema.parse(params)

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

    // Construir filtros
    const whereClause: Record<string, unknown> = {
      ativo: true,
    }

    if (validatedParams.cargo) {
      whereClause.cargo = validatedParams.cargo
    }

    if (validatedParams.portaria) {
      whereClause.portaria = validatedParams.portaria
    }

    // Buscar atendentes com gamificação e avaliações do período
    const atendentes = await prisma.atendente.findMany({
      where: whereClause,
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

    // Calcular métricas para cada atendente
    const rankingData = atendentes.map(atendente => {
      const avaliacoes = atendente.avaliacoes
      const totalAvaliacoes = avaliacoes.length
      const mediaNotas = totalAvaliacoes > 0 
        ? avaliacoes.reduce((sum, av) => sum + av.notaGeral, 0) / totalAvaliacoes 
        : 0
      const percentualSatisfacao = totalAvaliacoes > 0
        ? (avaliacoes.filter(av => av.notaGeral >= 4).length / totalAvaliacoes) * 100
        : 0

      return {
        atendente: {
          id: atendente.id,
          nome: atendente.nome,
          cargo: atendente.cargo,
          portaria: atendente.portaria,
          avatarUrl: atendente.usuario?.avatarUrl,
        },
        metricas: {
          pontuacaoTotal: atendente.gamificacao?.pontuacaoTotal || 0,
          mediaNotas: Math.round(mediaNotas * 100) / 100,
          totalAvaliacoes,
          percentualSatisfacao: Math.round(percentualSatisfacao * 100) / 100,
          nivel: atendente.gamificacao?.nivel || 1,
          experiencia: atendente.gamificacao?.experiencia || 0,
        },
      }
    })

    // Ordenar ranking
    const ordenacaoMap = {
      pontuacao: 'pontuacaoTotal',
      media_notas: 'mediaNotas',
      total_avaliacoes: 'totalAvaliacoes',
    } as const

    const campoOrdenacao = ordenacaoMap[validatedParams.ordenacao as keyof typeof ordenacaoMap] || 'pontuacaoTotal'
    
    rankingData.sort((a, b) => {
      const valorA = a.metricas[campoOrdenacao as keyof typeof a.metricas]
      const valorB = b.metricas[campoOrdenacao as keyof typeof b.metricas]
      
      return validatedParams.direcao === 'desc' 
        ? (valorB as number) - (valorA as number)
        : (valorA as number) - (valorB as number)
    })

    // Adicionar posições e limitar resultados
    const ranking = rankingData
      .slice(0, validatedParams.limite)
      .map((item, index) => ({
        posicao: index + 1,
        ...item,
        variacao: {
          // TODO: Implementar cálculo de variação comparando com período anterior
          posicao: 0,
          pontuacao: 0,
        },
      }))

    // Calcular estatísticas gerais
    const estatisticas = {
      totalAtendentes: rankingData.length,
      mediaPontuacao: rankingData.length > 0
        ? Math.round(rankingData.reduce((sum, item) => sum + item.metricas.pontuacaoTotal, 0) / rankingData.length)
        : 0,
      mediaAvaliacoes: rankingData.length > 0
        ? Math.round(rankingData.reduce((sum, item) => sum + item.metricas.totalAvaliacoes, 0) / rankingData.length)
        : 0,
      mediaNotas: rankingData.length > 0
        ? Math.round((rankingData.reduce((sum, item) => sum + item.metricas.mediaNotas, 0) / rankingData.length) * 100) / 100
        : 0,
    }

    return NextResponse.json({
      success: true,
      data: {
        ranking,
        periodo: {
          inicio: dataInicio.toISOString(),
          fim: dataFim.toISOString(),
          nome: nomePeriodo,
        },
        estatisticas,
      },
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Erro ao buscar ranking:', error)
    
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