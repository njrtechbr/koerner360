import { z } from 'zod'

// ===== VALIDAÇÕES PARA RANKINGS =====

export const rankingParamsSchema = z.object({
  periodo: z.string().optional().default('mensal'),
  cargo: z.string().optional(),
  portaria: z.string().optional(),
  limite: z.coerce.number().min(1).max(100).default(10),
  ordenacao: z.enum(['pontuacao', 'media_notas', 'total_avaliacoes']).default('pontuacao'),
  direcao: z.enum(['asc', 'desc']).default('desc'),
})

export const rankingResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    ranking: z.array(z.object({
      posicao: z.number(),
      atendente: z.object({
        id: z.string(),
        nome: z.string(),
        cargo: z.string().optional(),
        portaria: z.string().optional(),
        avatarUrl: z.string().optional(),
      }),
      metricas: z.object({
        pontuacaoTotal: z.number(),
        mediaNotas: z.number(),
        totalAvaliacoes: z.number(),
        percentualSatisfacao: z.number(),
        nivel: z.number(),
        experiencia: z.number(),
      }),
      variacao: z.object({
        posicao: z.number().optional(),
        pontuacao: z.number().optional(),
      }).optional(),
    })),
    periodo: z.object({
      inicio: z.string(),
      fim: z.string(),
      nome: z.string(),
    }),
    estatisticas: z.object({
      totalAtendentes: z.number(),
      mediaPontuacao: z.number(),
      mediaAvaliacoes: z.number(),
      mediaNotas: z.number(),
    }),
  }),
  timestamp: z.string(),
})

// ===== VALIDAÇÕES PARA COMPARATIVOS =====

export const comparativoParamsSchema = z.object({
  atendenteIds: z.array(z.string()).min(2).max(5),
  periodo: z.string().optional().default('mensal'),
  metricas: z.array(z.enum([
    'pontuacao_total',
    'media_notas',
    'total_avaliacoes',
    'percentual_satisfacao',
    'sequencia_atual',
    'melhor_sequencia',
    'nivel',
    'experiencia'
  ])).default(['pontuacao_total', 'media_notas', 'total_avaliacoes']),
})

export const comparativoResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    atendentes: z.array(z.object({
      id: z.string(),
      nome: z.string(),
      cargo: z.string().optional(),
      portaria: z.string().optional(),
      avatarUrl: z.string().optional(),
      metricas: z.record(z.union([z.number(), z.string()])),
      posicaoRanking: z.number().optional(),
    })),
    periodo: z.object({
      inicio: z.string(),
      fim: z.string(),
      nome: z.string(),
    }),
    comparacao: z.object({
      melhor: z.record(z.object({
        atendenteId: z.string(),
        valor: z.union([z.number(), z.string()]),
      })),
      pior: z.record(z.object({
        atendenteId: z.string(),
        valor: z.union([z.number(), z.string()]),
      })),
      media: z.record(z.union([z.number(), z.string()])),
    }),
  }),
  timestamp: z.string(),
})

// ===== VALIDAÇÕES PARA GAMIFICAÇÃO =====

export const gamificacaoParamsSchema = z.object({
  atendenteId: z.string().optional(),
  incluirConquistas: z.boolean().default(true),
  incluirHistorico: z.boolean().default(false),
  periodo: z.string().optional(),
})

export const gamificacaoResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    atendente: z.object({
      id: z.string(),
      nome: z.string(),
      cargo: z.string().optional(),
      portaria: z.string().optional(),
      avatarUrl: z.string().optional(),
    }),
    gamificacao: z.object({
      pontuacaoTotal: z.number(),
      nivel: z.number(),
      experiencia: z.number(),
      experienciaProximoNivel: z.number(),
      percentualNivel: z.number(),
      sequenciaAtual: z.number(),
      melhorSequencia: z.number(),
      posicaoRanking: z.number().optional(),
      posicaoRankingSetor: z.number().optional(),
    }),
    conquistas: z.array(z.object({
      id: z.string(),
      nome: z.string(),
      descricao: z.string(),
      icone: z.string(),
      tipo: z.enum(['BRONZE', 'PRATA', 'OURO', 'PLATINA', 'DIAMANTE']),
      categoria: z.enum(['VOLUME', 'QUALIDADE', 'CONSISTENCIA', 'ESPECIAL', 'TEMPO_SERVICO']),
      pontosGanhos: z.number(),
      obtidaEm: z.string(),
    })).optional(),
    historico: z.array(z.object({
      periodo: z.string(),
      pontuacao: z.number(),
      nivel: z.number(),
      posicaoRanking: z.number().optional(),
    })).optional(),
  }),
  timestamp: z.string(),
})

// ===== VALIDAÇÕES PARA CONQUISTAS =====

export const conquistasParamsSchema = z.object({
  atendenteId: z.string().optional(),
  categoria: z.enum(['VOLUME', 'QUALIDADE', 'CONSISTENCIA', 'ESPECIAL', 'TEMPO_SERVICO']).optional(),
  tipo: z.enum(['BRONZE', 'PRATA', 'OURO', 'PLATINA', 'DIAMANTE']).optional(),
  periodo: z.string().optional(),
  limite: z.coerce.number().min(1).max(100).default(20),
})

export const conquistasResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    conquistas: z.array(z.object({
      id: z.string(),
      nome: z.string(),
      descricao: z.string(),
      icone: z.string(),
      tipo: z.enum(['BRONZE', 'PRATA', 'OURO', 'PLATINA', 'DIAMANTE']),
      categoria: z.enum(['VOLUME', 'QUALIDADE', 'CONSISTENCIA', 'ESPECIAL', 'TEMPO_SERVICO']),
      pontos: z.number(),
      atendente: z.object({
        id: z.string(),
        nome: z.string(),
        cargo: z.string().optional(),
        portaria: z.string().optional(),
        avatarUrl: z.string().optional(),
      }).optional(),
      obtidaEm: z.string().optional(),
      pontosGanhos: z.number().optional(),
    })),
    estatisticas: z.object({
      totalConquistas: z.number(),
      conquistasPorTipo: z.record(z.number()),
      conquistasPorCategoria: z.record(z.number()),
      pontosTotais: z.number(),
    }),
    periodo: z.object({
      inicio: z.string(),
      fim: z.string(),
      nome: z.string(),
    }).optional(),
  }),
  timestamp: z.string(),
})

// ===== VALIDAÇÕES PARA MÉTRICAS =====

export const metricasParamsSchema = z.object({
  atendenteIds: z.array(z.string()).optional(),
  periodo: z.string().optional().default('mensal'),
  tipoMetrica: z.enum(['individual', 'comparativa', 'setor']).default('individual'),
  cargo: z.string().optional(),
  portaria: z.string().optional(),
  incluirHistorico: z.boolean().default(false),
})

export const metricasResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    metricas: z.array(z.object({
      atendenteId: z.string(),
      atendente: z.object({
        nome: z.string(),
        cargo: z.string().optional(),
        portaria: z.string().optional(),
      }),
      periodo: z.string(),
      dados: z.object({
        totalAvaliacoes: z.number(),
        mediaNotas: z.number(),
        notasExcelentes: z.number(),
        notasBoas: z.number(),
        notasRegulares: z.number(),
        notasRuins: z.number(),
        percentualSatisfacao: z.number(),
        posicaoRanking: z.number().optional(),
        posicaoRankingSetor: z.number().optional(),
        pontuacaoPeriodo: z.number(),
        sequenciaDias: z.number(),
      }),
    })),
    periodo: z.object({
      inicio: z.string(),
      fim: z.string(),
      nome: z.string(),
    }),
    resumo: z.object({
      totalAtendentes: z.number(),
      mediaGeral: z.number(),
      melhorPerformance: z.object({
        atendenteId: z.string(),
        nome: z.string(),
        valor: z.number(),
      }),
      piorPerformance: z.object({
        atendenteId: z.string(),
        nome: z.string(),
        valor: z.number(),
      }),
    }),
  }),
  timestamp: z.string(),
})

// ===== TIPOS TYPESCRIPT =====

export type RankingParams = z.infer<typeof rankingParamsSchema>
export type RankingResponse = z.infer<typeof rankingResponseSchema>
export type ComparativoParams = z.infer<typeof comparativoParamsSchema>
export type ComparativoResponse = z.infer<typeof comparativoResponseSchema>
export type GamificacaoParams = z.infer<typeof gamificacaoParamsSchema>
export type GamificacaoResponse = z.infer<typeof gamificacaoResponseSchema>
export type ConquistasParams = z.infer<typeof conquistasParamsSchema>
export type ConquistasResponse = z.infer<typeof conquistasResponseSchema>
export type MetricasParams = z.infer<typeof metricasParamsSchema>
export type MetricasResponse = z.infer<typeof metricasResponseSchema>