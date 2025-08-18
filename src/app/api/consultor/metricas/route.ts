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
 * 
 * Parâmetros de query:
 * - atendenteId: ID específico do atendente
 * - periodo: semanal | mensal | trimestral | anual
 * - cargo: filtro por cargo
 * - portaria: filtro por portaria
 * - dataInicio/dataFim: período personalizado
 * - temporal: true para dados temporais (gráficos)
 * - agrupamento: cargo para dados agrupados por cargo
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação e permissões
    const authResult = await AuthUtils.verificarAutenticacaoEPermissao('podeVisualizarRelatorios')
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

    // Aplicar filtros baseados no tipo de usuário
    const user = authResult.user!
    const filtrosUsuario = AuthUtils.aplicarFiltrosPorUsuario(
      user.userType,
      user.id,
      user.supervisorId
    )

    // Combinar filtros
    const filtrosCombinados = { ...filtrosAtendente, ...filtrosUsuario }

    // Processar dados baseado no tipo de solicitação
    if (temporal) {
      // Retornar dados temporais para gráficos
      const dadosTemporais = await MetricasService.gerarDadosTemporais(
        periodo.dataInicio,
        periodo.dataFim,
        validatedParams.periodo,
        filtrosCombinados
      )

      return ApiResponseUtils.success({
        temporal: dadosTemporais,
        periodo: {
          inicio: periodo.dataInicio.toISOString(),
          fim: periodo.dataFim.toISOString(),
          nome: periodo.nomePeriodo,
        },
      })
    }

    if (agrupamento === 'cargo') {
      // Retornar dados agrupados por cargo
      const dadosPorCargo = await MetricasService.gerarDadosPorCargo(
        periodo.dataInicio,
        periodo.dataFim,
        filtrosCombinados
      )

      return ApiResponseUtils.success({
        porCargo: dadosPorCargo,
        periodo: {
          inicio: periodo.dataInicio.toISOString(),
          fim: periodo.dataFim.toISOString(),
          nome: periodo.nomePeriodo,
        },
      })
    }

    // Resposta padrão: métricas detalhadas
    // Buscar dados do banco de forma paralela
    const [metricasPerformance, avaliacoes] = await Promise.all([
      MetricasService.buscarMetricasPerformance(filtrosCombinados, periodo),
      MetricasService.buscarAvaliacoes(filtrosCombinados, periodo)
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
    }

    return ApiResponseUtils.success(responseData)

  } catch (error) {
    return ApiResponseUtils.handleError(error)
  }
}