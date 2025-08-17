import { prisma } from '@/lib/prisma'

/**
 * Engine de Pontuação e Conquistas
 * Responsável por calcular pontos, níveis e gerenciar conquistas automaticamente
 */
export class ScoringEngine {
  // Configurações de pontuação
  private static readonly PONTOS_POR_NOTA = {
    1: 10,   // Nota 1 = 10 pontos
    2: 20,   // Nota 2 = 20 pontos
    3: 30,   // Nota 3 = 30 pontos
    4: 50,   // Nota 4 = 50 pontos
    5: 100,  // Nota 5 = 100 pontos
  } as const

  // Bônus por sequência de dias consecutivos
  private static readonly BONUS_SEQUENCIA = {
    7: 50,    // 1 semana = +50 pontos
    14: 100,  // 2 semanas = +100 pontos
    30: 250,  // 1 mês = +250 pontos
    60: 500,  // 2 meses = +500 pontos
    90: 1000, // 3 meses = +1000 pontos
  } as const

  // Configuração de níveis (experiência necessária)
  private static readonly NIVEIS = [
    0,     // Nível 1
    100,   // Nível 2
    300,   // Nível 3
    600,   // Nível 4
    1000,  // Nível 5
    1500,  // Nível 6
    2100,  // Nível 7
    2800,  // Nível 8
    3600,  // Nível 9
    4500,  // Nível 10
    5500,  // Nível 11
    6600,  // Nível 12
    7800,  // Nível 13
    9100,  // Nível 14
    10500, // Nível 15
    12000, // Nível 16
    13600, // Nível 17
    15300, // Nível 18
    17100, // Nível 19
    19000, // Nível 20
  ]

  /**
   * Calcula pontos para uma avaliação
   */
  static calcularPontosAvaliacao(nota: number): number {
    const notaInt = Math.round(nota) as keyof typeof this.PONTOS_POR_NOTA
    return this.PONTOS_POR_NOTA[notaInt] || 0
  }

  /**
   * Calcula bônus por sequência
   */
  static calcularBonusSequencia(diasSequencia: number): number {
    let bonus = 0
    
    for (const [dias, pontos] of Object.entries(this.BONUS_SEQUENCIA)) {
      if (diasSequencia >= parseInt(dias)) {
        bonus = pontos
      }
    }
    
    return bonus
  }

  /**
   * Calcula nível baseado na experiência
   */
  static calcularNivel(experiencia: number): number {
    let nivel = 1
    
    for (let i = 0; i < this.NIVEIS.length; i++) {
      if (experiencia >= this.NIVEIS[i]) {
        nivel = i + 1
      } else {
        break
      }
    }
    
    return Math.min(nivel, this.NIVEIS.length)
  }

  /**
   * Calcula experiência necessária para o próximo nível
   */
  static calcularExperienciaProximoNivel(experienciaAtual: number): number {
    const nivelAtual = this.calcularNivel(experienciaAtual)
    
    if (nivelAtual >= this.NIVEIS.length) {
      return 0 // Nível máximo atingido
    }
    
    return this.NIVEIS[nivelAtual] - experienciaAtual
  }

  /**
   * Calcula percentual de progresso no nível atual
   */
  static calcularPercentualNivel(experienciaAtual: number): number {
    const nivelAtual = this.calcularNivel(experienciaAtual)
    
    if (nivelAtual >= this.NIVEIS.length) {
      return 100 // Nível máximo
    }
    
    const experienciaNivelAnterior = nivelAtual > 1 ? this.NIVEIS[nivelAtual - 2] : 0
    const experienciaProximoNivel = this.NIVEIS[nivelAtual - 1]
    const experienciaNecessaria = experienciaProximoNivel - experienciaNivelAnterior
    const experienciaAtualNivel = experienciaAtual - experienciaNivelAnterior
    
    return Math.round((experienciaAtualNivel / experienciaNecessaria) * 100)
  }

  /**
   * Processa uma nova avaliação e atualiza gamificação
   */
  static async processarAvaliacao(avaliacaoId: string): Promise<void> {
    try {
      // Buscar avaliação com dados do atendente
      const avaliacao = await prisma.avaliacao.findUnique({
        where: { id: avaliacaoId },
        include: {
          atendente: {
            include: {
              gamificacao: true,
            },
          },
        },
      })

      if (!avaliacao || !avaliacao.atendente) {
        throw new Error('Avaliação ou atendente não encontrado')
      }

      const { atendente, notaGeral } = avaliacao
      const pontosAvaliacao = this.calcularPontosAvaliacao(notaGeral)

      // Buscar ou criar gamificação do atendente
      let gamificacao = atendente.gamificacao
      
      if (!gamificacao) {
        gamificacao = await prisma.gamificacaoAtendente.create({
          data: {
            atendenteId: atendente.id,
            pontuacaoTotal: 0,
            nivel: 1,
            experiencia: 0,
            sequenciaAtual: 0,
            melhorSequencia: 0,
          },
        })
      }

      // Calcular sequência de dias consecutivos
      const sequenciaAtual = await this.calcularSequenciaConsecutiva(atendente.id)
      const bonusSequencia = this.calcularBonusSequencia(sequenciaAtual)
      
      // Calcular nova pontuação e experiência
      const novaPontuacao = gamificacao.pontuacaoTotal + pontosAvaliacao + bonusSequencia
      const novaExperiencia = gamificacao.experiencia + pontosAvaliacao
      const novoNivel = this.calcularNivel(novaExperiencia)
      const melhorSequencia = Math.max(gamificacao.melhorSequencia, sequenciaAtual)

      // Atualizar gamificação
      await prisma.gamificacaoAtendente.update({
        where: { id: gamificacao.id },
        data: {
          pontuacaoTotal: novaPontuacao,
          experiencia: novaExperiencia,
          nivel: novoNivel,
          sequenciaAtual,
          melhorSequencia,
          ultimaAtualizacao: new Date(),
        },
      })

      // Verificar e conceder conquistas
      await this.verificarConquistas(atendente.id, {
        pontuacaoTotal: novaPontuacao,
        experiencia: novaExperiencia,
        nivel: novoNivel,
        sequenciaAtual,
        melhorSequencia,
        notaAvaliacao: notaGeral,
      })

      // Atualizar métricas de performance
      await this.atualizarMetricasPerformance(atendente.id)

    } catch (error) {
      console.error('Erro ao processar avaliação:', error)
      throw error
    }
  }

  /**
   * Calcula sequência de dias consecutivos com avaliações positivas
   */
  private static async calcularSequenciaConsecutiva(atendenteId: string): Promise<number> {
    const avaliacoes = await prisma.avaliacao.findMany({
      where: {
        atendenteId,
        notaGeral: { gte: 4 }, // Considera apenas notas 4 e 5
      },
      orderBy: { dataAvaliacao: 'desc' },
      take: 90, // Últimos 90 dias
    })

    if (avaliacoes.length === 0) return 0

    let sequencia = 0
    let dataAnterior: Date | null = null

    for (const avaliacao of avaliacoes) {
      const dataAvaliacao = new Date(avaliacao.dataAvaliacao)
      
      if (!dataAnterior) {
        sequencia = 1
        dataAnterior = dataAvaliacao
        continue
      }

      const diferencaDias = Math.floor(
        (dataAnterior.getTime() - dataAvaliacao.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (diferencaDias <= 1) {
        sequencia++
        dataAnterior = dataAvaliacao
      } else {
        break
      }
    }

    return sequencia
  }

  /**
   * Verifica e concede conquistas baseadas nas métricas
   */
  private static async verificarConquistas(
    atendenteId: string,
    metricas: {
      pontuacaoTotal: number
      experiencia: number
      nivel: number
      sequenciaAtual: number
      melhorSequencia: number
      notaAvaliacao: number
    }
  ): Promise<void> {
    // Buscar conquistas disponíveis
    const conquistas = await prisma.conquista.findMany({
      where: { ativo: true },
    })

    // Buscar conquistas já obtidas pelo atendente
    const conquistasObtidas = await prisma.conquistaAtendente.findMany({
      where: { atendenteId },
      select: { conquistaId: true },
    })

    const conquistasObtidaIds = new Set(conquistasObtidas.map(c => c.conquistaId))

    for (const conquista of conquistas) {
      // Pular se já obtida
      if (conquistasObtidaIds.has(conquista.id)) continue

      // Verificar se atende aos requisitos
      const requisitos = conquista.requisito as Record<string, unknown>
      let atendeRequisitos = true

      if (requisitos.pontuacaoMinima && metricas.pontuacaoTotal < requisitos.pontuacaoMinima) {
        atendeRequisitos = false
      }

      if (requisitos.nivelMinimo && metricas.nivel < requisitos.nivelMinimo) {
        atendeRequisitos = false
      }

      if (requisitos.sequenciaMinima && metricas.melhorSequencia < requisitos.sequenciaMinima) {
        atendeRequisitos = false
      }

      if (requisitos.notaMinima && metricas.notaAvaliacao < requisitos.notaMinima) {
        atendeRequisitos = false
      }

      // Conceder conquista se atende aos requisitos
      if (atendeRequisitos) {
        await prisma.conquistaAtendente.create({
          data: {
            atendenteId,
            conquistaId: conquista.id,
            pontosGanhos: conquista.pontos,
          },
        })

        // Adicionar pontos da conquista
        await prisma.gamificacaoAtendente.update({
          where: { atendenteId },
          data: {
            pontuacaoTotal: {
              increment: conquista.pontos,
            },
          },
        })
      }
    }
  }

  /**
   * Atualiza métricas de performance do atendente
   */
  private static async atualizarMetricasPerformance(atendenteId: string): Promise<void> {
    const agora = new Date()
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1)
    const fimMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 0)
    const periodo = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}`

    // Buscar avaliações do mês
    const avaliacoes = await prisma.avaliacao.findMany({
      where: {
        atendenteId,
        dataAvaliacao: {
          gte: inicioMes,
          lte: fimMes,
        },
      },
    })

    if (avaliacoes.length === 0) return

    // Calcular métricas
    const totalAvaliacoes = avaliacoes.length
    const somaNotas = avaliacoes.reduce((sum, av) => sum + av.notaGeral, 0)
    const mediaNotas = somaNotas / totalAvaliacoes
    
    const notasExcelentes = avaliacoes.filter(av => av.notaGeral === 5).length
    const notasBoas = avaliacoes.filter(av => av.notaGeral === 4).length
    const notasRegulares = avaliacoes.filter(av => av.notaGeral === 3).length
    const notasRuins = avaliacoes.filter(av => av.notaGeral <= 2).length
    
    const percentualSatisfacao = ((notasExcelentes + notasBoas) / totalAvaliacoes) * 100
    
    // Buscar gamificação para pontuação do período
    const gamificacao = await prisma.gamificacaoAtendente.findUnique({
      where: { atendenteId },
    })

    // Criar ou atualizar métrica
    await prisma.metricaPerformance.upsert({
      where: {
        atendenteId_periodo_tipoPeríodo: {
          atendenteId,
          periodo,
          tipoPeríodo: 'MENSAL',
        },
      },
      update: {
        totalAvaliacoes,
        mediaNotas,
        notasExcelentes,
        notasBoas,
        notasRegulares,
        notasRuins,
        percentualSatisfacao,
        pontuacaoPeriodo: gamificacao?.pontuacaoTotal || 0,
        sequenciaDias: gamificacao?.sequenciaAtual || 0,
      },
      create: {
        atendenteId,
        periodo,
        tipoPeríodo: 'MENSAL',
        totalAvaliacoes,
        mediaNotas,
        notasExcelentes,
        notasBoas,
        notasRegulares,
        notasRuins,
        percentualSatisfacao,
        pontuacaoPeriodo: gamificacao?.pontuacaoTotal || 0,
        sequenciaDias: gamificacao?.sequenciaAtual || 0,
      },
    })
  }

  /**
   * Recalcula todas as métricas de um atendente
   */
  static async recalcularMetricasAtendente(atendenteId: string): Promise<void> {
    try {
      // Buscar todas as avaliações do atendente
      const avaliacoes = await prisma.avaliacao.findMany({
        where: { atendenteId },
        orderBy: { dataAvaliacao: 'asc' },
      })

      // Resetar gamificação
      await prisma.gamificacaoAtendente.upsert({
        where: { atendenteId },
        update: {
          pontuacaoTotal: 0,
          experiencia: 0,
          nivel: 1,
          sequenciaAtual: 0,
          melhorSequencia: 0,
        },
        create: {
          atendenteId,
          pontuacaoTotal: 0,
          experiencia: 0,
          nivel: 1,
          sequenciaAtual: 0,
          melhorSequencia: 0,
        },
      })

      // Remover conquistas existentes
      await prisma.conquistaAtendente.deleteMany({
        where: { atendenteId },
      })

      // Reprocessar cada avaliação
      for (const avaliacao of avaliacoes) {
        await this.processarAvaliacao(avaliacao.id)
      }

    } catch (error) {
      console.error('Erro ao recalcular métricas:', error)
      throw error
    }
  }
}