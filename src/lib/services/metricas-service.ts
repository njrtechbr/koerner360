import { prisma } from '@/lib/prisma'
import type { MetricasParams } from '@/lib/validations/consultor'

// Constantes para evitar magic numbers
const TENDENCIA_THRESHOLD = 0.2
const NOTA_SATISFACAO_MINIMA = 4

// Tipos para melhor type safety
export interface PeriodoCalculado {
  dataInicio: Date
  dataFim: Date
  nomePeriodo: string
}

export interface MetricasAtendente {
  atendente: {
    id: string
    nome: string
    cargo?: string | null
    portaria?: string | null
    avatarUrl?: string | null
  }
  metricas: MetricaFormatada[]
  resumo: ResumoMetricas
}

export interface MetricaFormatada {
  id: string
  periodo: string
  totalAvaliacoes: number
  mediaNotas: number
  percentualSatisfacao: number
  pontuacaoPeriodo: number
  criadoEm: string
}

export interface ResumoMetricas {
  totalAvaliacoes: number
  mediaNotas: number
  percentualSatisfacao: number
  pontuacaoTotal: number
  melhorNota: number
  piorNota: number
  tendencia: 'crescente' | 'decrescente' | 'estavel'
}

export interface EstatisticasGerais {
  totalAtendentes: number
  totalAvaliacoes: number
  mediaGeralNotas: number
  percentualSatisfacaoGeral: number
  distribuicaoNotas: {
    nota1: number
    nota2: number
    nota3: number
    nota4: number
    nota5: number
  }
}

/**
 * Service para operações relacionadas a métricas de consultores
 */
export class MetricasService {
  /**
   * Calcula o período baseado nos parâmetros fornecidos
   */
  static calcularPeriodo(params: MetricasParams): PeriodoCalculado {
    if (params.dataInicio && params.dataFim) {
      return {
        dataInicio: new Date(params.dataInicio),
        dataFim: new Date(params.dataFim),
        nomePeriodo: 'Período Personalizado'
      }
    }

    const agora = new Date()
    
    switch (params.periodo) {
      case 'semanal':
        return this.calcularPeriodoSemanal(agora)
      case 'trimestral':
        return this.calcularPeriodoTrimestral(agora)
      case 'anual':
        return this.calcularPeriodoAnual(agora)
      default:
        return this.calcularPeriodoMensal(agora)
    }
  }

  private static calcularPeriodoSemanal(agora: Date): PeriodoCalculado {
    const inicioSemana = new Date(agora)
    inicioSemana.setDate(agora.getDate() - agora.getDay())
    inicioSemana.setHours(0, 0, 0, 0)
    
    const fimSemana = new Date(inicioSemana)
    fimSemana.setDate(inicioSemana.getDate() + 6)
    fimSemana.setHours(23, 59, 59, 999)
    
    return {
      dataInicio: inicioSemana,
      dataFim: fimSemana,
      nomePeriodo: 'Semana Atual'
    }
  }

  private static calcularPeriodoTrimestral(agora: Date): PeriodoCalculado {
    const trimestre = Math.floor(agora.getMonth() / 3)
    const dataInicio = new Date(agora.getFullYear(), trimestre * 3, 1)
    const dataFim = new Date(agora.getFullYear(), (trimestre + 1) * 3, 0)
    dataFim.setHours(23, 59, 59, 999)
    
    return {
      dataInicio,
      dataFim,
      nomePeriodo: `${trimestre + 1}º Trimestre ${agora.getFullYear()}`
    }
  }

  private static calcularPeriodoAnual(agora: Date): PeriodoCalculado {
    return {
      dataInicio: new Date(agora.getFullYear(), 0, 1),
      dataFim: new Date(agora.getFullYear(), 11, 31, 23, 59, 59, 999),
      nomePeriodo: `Ano ${agora.getFullYear()}`
    }
  }

  private static calcularPeriodoMensal(agora: Date): PeriodoCalculado {
    const dataInicio = new Date(agora.getFullYear(), agora.getMonth(), 1)
    const dataFim = new Date(agora.getFullYear(), agora.getMonth() + 1, 0)
    dataFim.setHours(23, 59, 59, 999)
    
    return {
      dataInicio,
      dataFim,
      nomePeriodo: agora.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    }
  }

  /**
   * Constrói filtros para consulta de atendentes
   */
  static construirFiltrosAtendente(params: MetricasParams): Record<string, unknown> {
    const filtros: Record<string, unknown> = { 
      status: 'ATIVO' // Campo correto da tabela Atendente
    }

    if (params.atendenteId) filtros.id = params.atendenteId
    if (params.cargo) filtros.cargo = params.cargo
    if (params.portaria) filtros.portaria = params.portaria

    return filtros
  }

  /**
   * Busca métricas de performance do banco de dados
   */
  static async buscarMetricasPerformance(
    filtrosAtendente: Record<string, unknown>,
    periodo: PeriodoCalculado
  ) {
    return prisma.metricaPerformance.findMany({
      where: {
        atendente: filtrosAtendente,
        criadoEm: {
          gte: periodo.dataInicio,
          lte: periodo.dataFim,
        },
      },
      include: {
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
        criadoEm: 'desc',
      },
    })
  }

  /**
   * Busca avaliações do período
   */
  static async buscarAvaliacoes(
    filtrosAtendente: Record<string, unknown>,
    periodo: PeriodoCalculado
  ) {
    return prisma.avaliacao.findMany({
      where: {
        atendente: filtrosAtendente,
        criadoEm: {
          gte: periodo.dataInicio,
          lte: periodo.dataFim,
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
  }

  /**
   * Processa métricas agrupando por atendente
   */
  static processarMetricasPorAtendente(metricas: any[]): Map<string, MetricasAtendente> {
    const metricasPorAtendente = new Map<string, MetricasAtendente>()

    metricas.forEach(metrica => {
      const atendenteId = metrica.atendenteId
      
      if (!metricasPorAtendente.has(atendenteId)) {
        metricasPorAtendente.set(atendenteId, {
          atendente: {
            id: metrica.atendente.id,
            nome: metrica.atendente.nome,
            cargo: metrica.atendente.cargo,
            portaria: metrica.atendente.portaria,
            avatarUrl: metrica.atendente.avatarUrl,
          },
          metricas: [],
          resumo: this.criarResumoInicial(),
        })
      }

      const metricaFormatada: MetricaFormatada = {
        id: metrica.id,
        periodo: metrica.periodo,
        totalAvaliacoes: metrica.totalAvaliacoes,
        mediaNotas: Number(metrica.mediaNotas),
        percentualSatisfacao: Number(metrica.percentualSatisfacao),
        pontuacaoPeriodo: metrica.pontuacaoPeriodo,
        criadoEm: metrica.criadoEm.toISOString(),
      }

      metricasPorAtendente.get(atendenteId)!.metricas.push(metricaFormatada)
    })

    return metricasPorAtendente
  }

  private static criarResumoInicial(): ResumoMetricas {
    return {
      totalAvaliacoes: 0,
      mediaNotas: 0,
      percentualSatisfacao: 0,
      pontuacaoTotal: 0,
      melhorNota: 0,
      piorNota: 5,
      tendencia: 'estavel',
    }
  }

  /**
   * Calcula resumos e tendências para cada atendente
   */
  static calcularResumos(metricasPorAtendente: Map<string, MetricasAtendente>): void {
    metricasPorAtendente.forEach((dados) => {
      const metricas = dados.metricas
      
      if (metricas.length === 0) return

      // Calcular totais
      dados.resumo.totalAvaliacoes = metricas.reduce((sum, m) => sum + m.totalAvaliacoes, 0)
      dados.resumo.pontuacaoTotal = metricas.reduce((sum, m) => sum + m.pontuacaoPeriodo, 0)
      
      // Calcular médias
      this.calcularMedias(dados, metricas)
      
      // Melhor e pior nota (calculado a partir das médias)
      dados.resumo.melhorNota = Math.max(...metricas.map(m => m.mediaNotas))
      dados.resumo.piorNota = Math.min(...metricas.map(m => m.mediaNotas))
      
      // Calcular tendência
      dados.resumo.tendencia = this.calcularTendencia(metricas)
      
      // Arredondar valores
      this.arredondarValores(dados.resumo)
    })
  }

  private static calcularMedias(dados: MetricasAtendente, metricas: MetricaFormatada[]): void {
    const mediasNotas = metricas.filter(m => m.mediaNotas > 0).map(m => m.mediaNotas)
    dados.resumo.mediaNotas = mediasNotas.length > 0 
      ? mediasNotas.reduce((sum, m) => sum + m, 0) / mediasNotas.length 
      : 0
    
    const percentuaisSatisfacao = metricas.filter(m => m.percentualSatisfacao > 0).map(m => m.percentualSatisfacao)
    dados.resumo.percentualSatisfacao = percentuaisSatisfacao.length > 0
      ? percentuaisSatisfacao.reduce((sum, p) => sum + p, 0) / percentuaisSatisfacao.length
      : 0
  }

  private static calcularTendencia(metricas: MetricaFormatada[]): 'crescente' | 'decrescente' | 'estavel' {
    if (metricas.length < 2) return 'estavel'

    const primeira = metricas[metricas.length - 1] // Mais antiga
    const ultima = metricas[0] // Mais recente
    
    const diferencaMedia = ultima.mediaNotas - primeira.mediaNotas
    
    if (diferencaMedia > TENDENCIA_THRESHOLD) return 'crescente'
    if (diferencaMedia < -TENDENCIA_THRESHOLD) return 'decrescente'
    return 'estavel'
  }

  private static arredondarValores(resumo: ResumoMetricas): void {
    resumo.mediaNotas = Math.round(resumo.mediaNotas * 100) / 100
    resumo.percentualSatisfacao = Math.round(resumo.percentualSatisfacao * 100) / 100
  }

  /**
   * Calcula estatísticas gerais
   */
  static calcularEstatisticasGerais(
    resultados: MetricasAtendente[],
    avaliacoes: any[]
  ): EstatisticasGerais {
    const estatisticas: EstatisticasGerais = {
      totalAtendentes: resultados.length,
      totalAvaliacoes: avaliacoes.length,
      mediaGeralNotas: 0,
      percentualSatisfacaoGeral: 0,
      distribuicaoNotas: {
        nota1: 0,
        nota2: 0,
        nota3: 0,
        nota4: 0,
        nota5: 0,
      },
    }

    if (avaliacoes.length === 0) return estatisticas

    // Calcular média geral
    estatisticas.mediaGeralNotas = avaliacoes.reduce((sum, av) => sum + av.nota, 0) / avaliacoes.length
    
    // Calcular percentual de satisfação
    const avaliacoesSatisfeitas = avaliacoes.filter(av => av.nota >= NOTA_SATISFACAO_MINIMA).length
    estatisticas.percentualSatisfacaoGeral = (avaliacoesSatisfeitas / avaliacoes.length) * 100
    
    // Distribuição de notas
    for (let nota = 1; nota <= 5; nota++) {
      const chave = `nota${nota}` as keyof typeof estatisticas.distribuicaoNotas
      estatisticas.distribuicaoNotas[chave] = avaliacoes.filter(av => av.nota === nota).length
    }

    // Arredondar valores
    estatisticas.mediaGeralNotas = Math.round(estatisticas.mediaGeralNotas * 100) / 100
    estatisticas.percentualSatisfacaoGeral = Math.round(estatisticas.percentualSatisfacaoGeral * 100) / 100

    return estatisticas
  }

  /**
   * Gera dados temporais para gráficos
   */
  static async gerarDadosTemporais(
    dataInicio: Date, 
    dataFim: Date, 
    periodo: string, 
    whereAtendente: Record<string, unknown>
  ) {
    const avaliacoes = await prisma.avaliacao.findMany({
      where: {
        atendente: whereAtendente,
        criadoEm: {
          gte: dataInicio,
          lte: dataFim,
        },
      },
      include: {
        atendente: true,
      },
      orderBy: {
        criadoEm: 'asc',
      },
    })

    // Determinar intervalos baseado no período
    const intervalos = this.calcularIntervalos(dataInicio, dataFim, periodo)

    // Processar cada intervalo
    const dadosTemporais = intervalos.map(intervalo => {
      const avaliacoesIntervalo = avaliacoes.filter(av => 
        av.criadoEm >= intervalo.inicio && av.criadoEm <= intervalo.fim
      )

      const atendentesUnicos = new Set(avaliacoesIntervalo.map(av => av.atendenteId))
      const mediaNotas = avaliacoesIntervalo.length > 0 
        ? avaliacoesIntervalo.reduce((sum, av) => sum + av.nota, 0) / avaliacoesIntervalo.length 
        : 0
      const satisfacao = avaliacoesIntervalo.length > 0
        ? (avaliacoesIntervalo.filter(av => av.nota >= 4).length / avaliacoesIntervalo.length) * 100
        : 0

      return {
        periodo: intervalo.nome,
        avaliacoes: avaliacoesIntervalo.length,
        mediaNotas: Math.round(mediaNotas * 100) / 100,
        satisfacao: Math.round(satisfacao * 100) / 100,
        pontuacao: avaliacoesIntervalo.reduce((sum, av) => sum + (av.nota * 10), 0),
        atendentesAtivos: atendentesUnicos.size,
      }
    })

    return dadosTemporais
  }

  /**
   * Gera dados agrupados por cargo
   */
  static async gerarDadosPorCargo(
    dataInicio: Date, 
    dataFim: Date, 
    whereAtendente: Record<string, unknown>
  ) {
    const avaliacoes = await prisma.avaliacao.findMany({
      where: {
        atendente: whereAtendente,
        criadoEm: {
          gte: dataInicio,
          lte: dataFim,
        },
      },
      include: {
        atendente: {
          select: {
            cargo: true,
          },
        },
      },
    })

    // Agrupar por cargo
    const dadosPorCargo = new Map<string, {
      cargo: string
      avaliacoes: Array<{ nota: number }>
    }>()

    avaliacoes.forEach(av => {
      const cargo = av.atendente?.cargo || 'Não informado'
      
      if (!dadosPorCargo.has(cargo)) {
        dadosPorCargo.set(cargo, {
          cargo,
          avaliacoes: [],
        })
      }
      
      dadosPorCargo.get(cargo)!.avaliacoes.push({ nota: av.nota })
    })

    // Calcular métricas por cargo
    const resultado = Array.from(dadosPorCargo.values()).map(dados => {
      const totalAvaliacoes = dados.avaliacoes.length
      const mediaNotas = totalAvaliacoes > 0 
        ? dados.avaliacoes.reduce((sum, av) => sum + av.nota, 0) / totalAvaliacoes 
        : 0
      const satisfacao = totalAvaliacoes > 0
        ? (dados.avaliacoes.filter(av => av.nota >= 4).length / totalAvaliacoes) * 100
        : 0
      const pontuacaoMedia = totalAvaliacoes > 0
        ? dados.avaliacoes.reduce((sum, av) => sum + (av.nota * 10), 0) / totalAvaliacoes
        : 0

      return {
        cargo: dados.cargo,
        mediaNotas: Math.round(mediaNotas * 100) / 100,
        satisfacao: Math.round(satisfacao * 100) / 100,
        totalAvaliacoes,
        pontuacaoMedia: Math.round(pontuacaoMedia * 100) / 100,
      }
    })

    return resultado.sort((a, b) => b.mediaNotas - a.mediaNotas)
  }

  /**
   * Calcula intervalos de tempo baseado no período
   */
  private static calcularIntervalos(
    dataInicio: Date, 
    dataFim: Date, 
    periodo: string
  ): Array<{ inicio: Date; fim: Date; nome: string }> {
    const intervalos: Array<{ inicio: Date; fim: Date; nome: string }> = []
    
    if (periodo === 'semanal') {
      const atual = new Date(dataInicio)
      let contador = 1
      while (atual <= dataFim) {
        const fimSemana = new Date(atual)
        fimSemana.setDate(atual.getDate() + 6)
        if (fimSemana > dataFim) fimSemana.setTime(dataFim.getTime())
        
        intervalos.push({
          inicio: new Date(atual),
          fim: fimSemana,
          nome: `Semana ${contador}`,
        })
        
        atual.setDate(atual.getDate() + 7)
        contador++
      }
    } else if (periodo === 'mensal') {
      const atual = new Date(dataInicio)
      while (atual <= dataFim) {
        const fimMes = new Date(atual.getFullYear(), atual.getMonth() + 1, 0)
        if (fimMes > dataFim) fimMes.setTime(dataFim.getTime())
        
        intervalos.push({
          inicio: new Date(atual),
          fim: fimMes,
          nome: atual.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        })
        
        atual.setMonth(atual.getMonth() + 1)
        atual.setDate(1)
      }
    } else {
      // Para trimestral e anual, usar o período completo
      intervalos.push({
        inicio: dataInicio,
        fim: dataFim,
        nome: periodo === 'trimestral' ? 'Trimestre' : 'Ano',
      })
    }

    return intervalos
  }
}