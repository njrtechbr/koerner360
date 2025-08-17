import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { metricasParamsSchema } from '@/lib/validations/consultor'
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
    if (!hasPermission(userType, 'podeVisualizarMetricas')) {
      return NextResponse.json(
        { success: false, error: 'Sem permissão para visualizar métricas', timestamp: new Date().toISOString() },
        { status: 403 }
      )
    }

    // Validar parâmetros da query
    const { searchParams } = new URL(request.url)
    const validatedParams = metricasParamsSchema.parse({
      atendenteId: searchParams.get('atendenteId'),
      periodo: searchParams.get('periodo') || 'mensal',
      cargo: searchParams.get('cargo'),
      portaria: searchParams.get('portaria'),
      dataInicio: searchParams.get('dataInicio'),
      dataFim: searchParams.get('dataFim'),
    })

    // Calcular período se não fornecido
    let dataInicio: Date
    let dataFim: Date
    let nomePeriodo: string

    if (validatedParams.dataInicio && validatedParams.dataFim) {
      dataInicio = new Date(validatedParams.dataInicio)
      dataFim = new Date(validatedParams.dataFim)
      nomePeriodo = 'Período Personalizado'
    } else {
      const agora = new Date()
      
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
    }

    // Construir filtros
    const whereAtendente: Record<string, unknown> = {
      ativo: true,
    }

    if (validatedParams.atendenteId) {
      whereAtendente.id = validatedParams.atendenteId
    }

    if (validatedParams.cargo) {
      whereAtendente.cargo = validatedParams.cargo
    }

    if (validatedParams.portaria) {
      whereAtendente.portaria = validatedParams.portaria
    }

    // Buscar métricas de performance
    const metricasPerformance = await prisma.metricaPerformance.findMany({
      where: {
        atendente: whereAtendente,
        dataReferencia: {
          gte: dataInicio,
          lte: dataFim,
        },
      },
      include: {
        atendente: {
          select: {
            id: true,
            nome: true,
            cargo: true,
            portaria: true,
            usuario: {
              select: {
                avatarUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        dataReferencia: 'desc',
      },
    })

    // Buscar avaliações do período para cálculos adicionais
    const avaliacoes = await prisma.avaliacao.findMany({
      where: {
        atendente: whereAtendente,
        dataAvaliacao: {
          gte: dataInicio,
          lte: dataFim,
        },
      },
      include: {
        atendente: {
          select: {
            id: true,
            nome: true,
            cargo: true,
            portaria: true,
          },
        },
      },
    })

    // Agrupar métricas por atendente
    interface MetricasAtendente {
      atendente: {
        id: string
        nome: string
        cargo?: string | null
      }
      totalAvaliacoes: number
      mediaNotas: number
      pontuacaoTotal: number
      conquistas: number
      nivel: number
      experiencia: number
    }
    
    const metricasPorAtendente = new Map<string, MetricasAtendente>()

    metricasPerformance.forEach(metrica => {
      const atendenteId = metrica.atendenteId
      
      if (!metricasPorAtendente.has(atendenteId)) {
        metricasPorAtendente.set(atendenteId, {
          atendente: metrica.atendente,
          metricas: [],
          resumo: {
            totalAvaliacoes: 0,
            mediaNotas: 0,
            percentualSatisfacao: 0,
            pontuacaoTotal: 0,
            melhorNota: 0,
            piorNota: 5,
            tendencia: 'estavel',
          },
        })
      }

      metricasPorAtendente.get(atendenteId)!.metricas.push({
        id: metrica.id,
        dataReferencia: metrica.dataReferencia.toISOString(),
        totalAvaliacoes: metrica.totalAvaliacoes,
        mediaNotas: metrica.mediaNotas,
        percentualSatisfacao: metrica.percentualSatisfacao,
        pontuacaoGanha: metrica.pontuacaoGanha,
        melhorNota: metrica.melhorNota,
        piorNota: metrica.piorNota,
        criadoEm: metrica.criadoEm.toISOString(),
      })
    })

    // Calcular resumos e tendências
    metricasPorAtendente.forEach((dados) => {
      const metricas = dados.metricas
      
      if (metricas.length > 0) {
        // Calcular totais
        dados.resumo.totalAvaliacoes = metricas.reduce((sum, m) => sum + m.totalAvaliacoes, 0)
        dados.resumo.pontuacaoTotal = metricas.reduce((sum, m) => sum + m.pontuacaoGanha, 0)
        
        // Calcular médias
        const mediasNotas = metricas.filter(m => m.mediaNotas > 0).map(m => m.mediaNotas)
        dados.resumo.mediaNotas = mediasNotas.length > 0 
          ? mediasNotas.reduce((sum, m) => sum + m, 0) / mediasNotas.length 
          : 0
        
        const percentuaisSatisfacao = metricas.filter(m => m.percentualSatisfacao > 0).map(m => m.percentualSatisfacao)
        dados.resumo.percentualSatisfacao = percentuaisSatisfacao.length > 0
          ? percentuaisSatisfacao.reduce((sum, p) => sum + p, 0) / percentuaisSatisfacao.length
          : 0
        
        // Melhor e pior nota
        dados.resumo.melhorNota = Math.max(...metricas.map(m => m.melhorNota))
        dados.resumo.piorNota = Math.min(...metricas.map(m => m.piorNota))
        
        // Calcular tendência (comparar primeira e última métrica)
        if (metricas.length >= 2) {
          const primeira = metricas[metricas.length - 1] // Mais antiga
          const ultima = metricas[0] // Mais recente
          
          const diferencaMedia = ultima.mediaNotas - primeira.mediaNotas
          
          if (diferencaMedia > 0.2) {
            dados.resumo.tendencia = 'crescente'
          } else if (diferencaMedia < -0.2) {
            dados.resumo.tendencia = 'decrescente'
          } else {
            dados.resumo.tendencia = 'estavel'
          }
        }
      }
      
      // Arredondar valores
      dados.resumo.mediaNotas = Math.round(dados.resumo.mediaNotas * 100) / 100
      dados.resumo.percentualSatisfacao = Math.round(dados.resumo.percentualSatisfacao * 100) / 100
    })

    // Converter Map para Array
    const resultados = Array.from(metricasPorAtendente.values())

    // Estatísticas gerais
    const estatisticasGerais = {
      totalAtendentes: resultados.length,
      totalAvaliacoes: avaliacoes.length,
      mediaGeralNotas: avaliacoes.length > 0 
        ? avaliacoes.reduce((sum, av) => sum + av.notaGeral, 0) / avaliacoes.length 
        : 0,
      percentualSatisfacaoGeral: avaliacoes.length > 0
        ? (avaliacoes.filter(av => av.notaGeral >= 4).length / avaliacoes.length) * 100
        : 0,
      distribuicaoNotas: {
        nota1: avaliacoes.filter(av => av.notaGeral === 1).length,
        nota2: avaliacoes.filter(av => av.notaGeral === 2).length,
        nota3: avaliacoes.filter(av => av.notaGeral === 3).length,
        nota4: avaliacoes.filter(av => av.notaGeral === 4).length,
        nota5: avaliacoes.filter(av => av.notaGeral === 5).length,
      },
    }

    // Arredondar estatísticas gerais
    estatisticasGerais.mediaGeralNotas = Math.round(estatisticasGerais.mediaGeralNotas * 100) / 100
    estatisticasGerais.percentualSatisfacaoGeral = Math.round(estatisticasGerais.percentualSatisfacaoGeral * 100) / 100

    return NextResponse.json({
      success: true,
      data: {
        metricas: resultados,
        periodo: {
          inicio: dataInicio.toISOString(),
          fim: dataFim.toISOString(),
          nome: nomePeriodo,
        },
        estatisticasGerais,
      },
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Erro ao buscar métricas:', error)
    
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