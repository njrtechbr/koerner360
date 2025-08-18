import { prisma } from '@/lib/prisma'
import type { MetricasParams } from '@/lib/validations/consultor'

// Constantes para evitar magic numbers
const TENDENCIA_THRESHOLD = 0.2
const NOTA_SATISFACAO_MINIMA = 4
const LIMITE_MAXIMO_RESULTADOS = 1000

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
 * Service melhorado para operações relacionadas a métricas de consultores
 * Implementa padrões de design como Strategy, Factory e Builder
 */
export class MetricasServiceImproved {
  /**
   * Factory method para calcular período baseado nos parâmetros
   */
  static calcularPeriodo(params: MetricasParams): PeriodoCalculado {
    if (params.dataInicio && params.dataFim) {
      return this.criarPeriodoPersonalizado(params.dataInicio, params.dataFim)
    }

    const estrategia = this.obterEstrategiaPeriodo(params.periodo || 'mensal')
    return estrategia(new Date())
  }

  /**
   * Strategy pattern para diferentes tipos de período
   */
  private static obterEstrategiaPeriodo(periodo: string) {
    const estrategias = {
      semanal: this.calcularPeriodoSemanal,
      mensal: this.calcularPeriodoMensal,
      trimestral: this.calcularPeriodoTrimestral,
      anual: this.calcularPeriodoAnual,
    }

    return estrategias[periodo as keyof typeof estrategias] || estrategias.mensal
  }

  private static criarPeriodoPersonalizado(dataInicio: string, dataFim: string): PeriodoCalculado {
    return {
      dataInicio: new Date(dataInicio),
      dataFim: new Date(dataFim),
      nomePeriodo: 'Período Personalizado'
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

  /**
   * Builder pattern para construir filtros de consulta
   */
  static construirFiltrosAtendente(params: MetricasParams): Record<string, unknown> {
    const builder = new FiltroBuilder()
    
    return builder
      .adicionarFiltroSeExistir('id', params.atendenteId)
      .adicionarFiltroSeExistir('cargo', params.cargo)
      .adicionarFiltroSeExistir('portaria', params.portaria)
      .adicionarFiltro('status', 'ATIVO')
      .construir()
  }

  /**
   * Busca métricas de performance com tratamento de erro robusto
   */
  static async buscarMetricasPerformance(
    filtrosAtendente: Record<string, unknown>,
    periodo: PeriodoCalculado
  ) {
    try {
      return await prisma.metricaPerformance.findMany({
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
        take: LIMITE_MAXIMO_RESULTADOS,
      })
    } catch (error) {
      console.error('Erro ao buscar métricas de performance:', error)
      throw new Error('Falha ao buscar métricas de performance')
    }
  }

  /**
   * Busca avaliações com otimização de consulta
   */
  static async buscarAvaliacoes(
    filtrosAtendente: Record<string, unknown>,
    periodo: PeriodoCalculado
  ) {
    try {
      return await prisma.avaliacao.findMany({
        where: {
          atendente: filtrosAtendente,
          criadoEm: {
            gte: periodo.dataInicio,
            lte: periodo.dataFim,
          },
        },
        select: {
          id: true,
          nota: true,
          criadoEm: true,
          atendenteId: true,
          atendente: {
            select: {
              id: true,
              nome: true,
              cargo: true,
              portaria: true,
            },
          },
        },
        take: LIMITE_MAXIMO_RESULTADOS,
      })
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error)
      throw new Error('Falha ao buscar avaliações')
    }
  }

  /**
   * Processa métricas usando Map para melhor performance
   */
  static processarMetricasPorAtendente(metricas: any[]): Map<string, MetricasAtendente> {
    const metricasPorAtendente = new Map<string, MetricasAtendente>()

    for (const metrica of metricas) {
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
    }

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
   * Calcula resumos usando algoritmos otimizados
   */
  static calcularResumos(metricasPorAtendente: Map<string, MetricasAtendente>): void {
    for (const dados of metricasPorAtendente.values()) {
      const metricas = dados.metricas
      
      if (metricas.length === 0) continue

      this.calcularTotais(dados, metricas)
      this.calcularMedias(dados, metricas)
      this.calcularExtremos(dados, metricas)
      this.calcularTendencia(dados, metricas)
      this.arredondarValores(dados.resumo)
    }
  }

  private static calcularTotais(dados: MetricasAtendente, metricas: MetricaFormatada[]): void {
    dados.resumo.totalAvaliacoes = metricas.reduce((sum, m) => sum + m.totalAvaliacoes, 0)
    dados.resumo.pontuacaoTotal = metricas.reduce((sum, m) => sum + m.pontuacaoPeriodo, 0)
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

  private static calcularExtremos(dados: MetricasAtendente, metricas: MetricaFormatada[]): void {
    const notas = metricas.map(m => m.mediaNotas).filter(n => n > 0)
    if (notas.length > 0) {
      dados.resumo.melhorNota = Math.max(...notas)
      dados.resumo.piorNota = Math.min(...notas)
    }
  }

  private static calcularTendencia(dados: MetricasAtendente, metricas: MetricaFormatada[]): void {
    if (metricas.length < 2) {
      dados.resumo.tendencia = 'estavel'
      return
    }

    const primeira = metricas[metricas.length - 1] // Mais antiga
    const ultima = metricas[0] // Mais recente
    
    const diferencaMedia = ultima.mediaNotas - primeira.mediaNotas
    
    if (diferencaMedia > TENDENCIA_THRESHOLD) {
      dados.resumo.tendencia = 'crescente'
    } else if (diferencaMedia < -TENDENCIA_THRESHOLD) {
      dados.resumo.tendencia = 'decrescente'
    } else {
      dados.resumo.tendencia = 'estavel'
    }
  }

  private static arredondarValores(resumo: ResumoMetricas): void {
    resumo.mediaNotas = Math.round(resumo.mediaNotas * 100) / 100
    resumo.percentualSatisfacao = Math.round(resumo.percentualSatisfacao * 100) / 100
  }

  /**
   * Calcula estatísticas gerais com algoritmos eficientes
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

    // Usar reduce para calcular tudo em uma passada
    const { somaNotas, notasSatisfeitas, distribuicao } = avaliacoes.reduce((acc, av) => {
      acc.somaNotas += av.nota
      if (av.nota >= NOTA_SATISFACAO_MINIMA) acc.notasSatisfeitas++
      acc.distribuicao[av.nota - 1]++
      return acc
    }, {
      somaNotas: 0,
      notasSatisfeitas: 0,
      distribuicao: [0, 0, 0, 0, 0]
    })

    estatisticas.mediaGeralNotas = Math.round((somaNotas / avaliacoes.length) * 100) / 100
    estatisticas.percentualSatisfacaoGeral = Math.round((notasSatisfeitas / avaliacoes.length) * 100 * 100) / 100

    // Mapear distribuição
    estatisticas.distribuicaoNotas = {
      nota1: distribuicao[0],
      nota2: distribuicao[1],
      nota3: distribuicao[2],
      nota4: distribuicao[3],
      nota5: distribuicao[4],
    }

    return estatisticas
  }
}

/**
 * Builder pattern para construção de filtros
 */
class FiltroBuilder {
  private filtros: Record<string, unknown> = {}

  adicionarFiltro(chave: string, valor: unknown): this {
    this.filtros[chave] = valor
    return this
  }

  adicionarFiltroSeExistir(chave: string, valor: unknown): this {
    if (valor !== undefined && valor !== null && valor !== '') {
      this.filtros[chave] = valor
    }
    return this
  }

  construir(): Record<string, unknown> {
    return { ...this.filtros }
  }
}