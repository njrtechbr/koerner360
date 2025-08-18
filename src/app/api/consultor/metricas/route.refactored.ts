import { NextRequest } from 'next/server'
import { metricasParamsSchema } from '@/lib/validations/consultor'
import { AuthUtils } from '@/lib/auth/auth-utils'
import { ApiResponseUtils } from '@/lib/utils/api-response'
import { MetricasService } from '@/lib/services/metricas-service'

/**
 * GET /api/consultor/metricas
 * 
 * Endpoint para buscar métricas de performance de atendentes
 * Suporta filtros por período, cargo, portaria e atendente específico
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação e permissões
    const authResult = await AuthUtils.verificarAutenticacaoEPermissao('podeVisualizarMetricas')
    if (!authResult.success) {
      return authResult.error!
    }

    // Validar e extrair parâmetros da query
    const { searchParams } = new URL(request.url)
    const validatedParams = metricasParamsSchema.parse({
      atendenteId: searchParams.get('atendenteId'),
      periodo: searchParams.get('periodo') || 'mensal',
      cargo: searchParams.get('cargo'),
      portaria: searchParams.get('portaria'),
      dataInicio: searchParams.get('dataInicio'),
      dataFim: searchParams.get('dataFim'),
    })

    // Parâmetros adicionais para diferentes tipos de resposta
    const temporal = searchParams.get('temporal') === 'true'
    const agrupamento = searchParams.get('agrupamento')

    // Calcular período baseado nos parâmetros
    const periodo = MetricasService.calcularPeriodo(validatedParams)

    // Construir filtros para consulta
    const filtrosAtendente = MetricasService.construirFiltrosAtendente(validatedParams)

    // Buscar dados do banco de forma paralela
    const [metricasPerformance, avaliacoes] = await Promise.all([
      MetricasService.buscarMetricasPerformance(filtrosAtendente, periodo),
      MetricasService.buscarAvaliacoes(filtrosAtendente, periodo)
    ])

    // Processar métricas agrupando por atendente
    const metricasPorAtendente = MetricasService.processarMetricasPorAtendente(metricasPerformance)

    // Calcular resumos e tendências
    MetricasService.calcularResumos(metricasPorAtendente)

    // Converter Map para Array
    const resultados = Array.from(metricasPorAtendente.values())

    // Calcular estatísticas gerais
    const estatisticasGerais = MetricasService.calcularEstatisticasGerais(resultados, avaliacoes)

    // Preparar resposta
    const responseData = {
      metricas: resultados,
      periodo: {
        inicio: periodo.dataInicio.toISOString(),
        fim: periodo.dataFim.toISOString(),
        nome: periodo.nomePeriodo,
      },
      estatisticasGerais,
      // Incluir parâmetros adicionais se fornecidos
      ...(temporal && { temporal }),
      ...(agrupamento && { agrupamento }),
    }

    return ApiResponseUtils.success(responseData)

  } catch (error) {
    return ApiResponseUtils.handleError(error)
  }
}