import { MetricasService } from '@/lib/services/metricas-service'

// Função utilitária para calcular período de forma simplificada
// Mantém compatibilidade com rotas que esperam { dataInicio, dataFim, nomePeriodo }
export function getPeriodo(periodo: string = 'mensal') {
    const metricasParams = {
    periodo,
    tipoMetrica: 'individual',
    incluirHistorico: false,
  } as const

  const { dataInicio, dataFim, nomePeriodo } = MetricasService.calcularPeriodo(metricasParams as any)

  return { dataInicio, dataFim, nomePeriodo }
}