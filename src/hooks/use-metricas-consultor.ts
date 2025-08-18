import { useState, useEffect, useCallback } from 'react'
import type { MetricasAtendente, EstatisticasGerais } from '@/lib/services/metricas-service'

interface UseMetricasParams {
  atendenteId?: string
  periodo?: 'semanal' | 'mensal' | 'trimestral' | 'anual'
  cargo?: string
  portaria?: string
  dataInicio?: string
  dataFim?: string
  temporal?: boolean
  agrupamento?: string
}

interface MetricasResponse {
  metricas: MetricasAtendente[]
  periodo: {
    inicio: string
    fim: string
    nome: string
  }
  estatisticasGerais: EstatisticasGerais
}

interface UseMetricasReturn {
  data: MetricasResponse | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook customizado para buscar métricas de consultores
 */
export function useMetricasConsultor(params: UseMetricasParams = {}): UseMetricasReturn {
  const [data, setData] = useState<MetricasResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMetricas = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const searchParams = new URLSearchParams()
      
      // Adicionar parâmetros à query string
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })

      const response = await fetch(`/api/consultor/metricas?${searchParams.toString()}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Erro ao buscar métricas')
      }

      setData(result.data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      console.error('Erro ao buscar métricas:', err)
    } finally {
      setLoading(false)
    }
  }, [
    params.atendenteId,
    params.periodo,
    params.cargo,
    params.portaria,
    params.dataInicio,
    params.dataFim,
    params.temporal,
    params.agrupamento
  ])

  useEffect(() => {
    fetchMetricas()
  }, [fetchMetricas])

  return {
    data,
    loading,
    error,
    refetch: fetchMetricas,
  }
}

/**
 * Hook para buscar métricas de um atendente específico
 */
export function useMetricasAtendente(
  atendenteId: string, 
  periodo?: 'semanal' | 'mensal' | 'trimestral' | 'anual'
) {
  return useMetricasConsultor({ atendenteId, periodo })
}

/**
 * Hook para buscar métricas por cargo
 */
export function useMetricasPorCargo(
  cargo: string, 
  periodo?: 'semanal' | 'mensal' | 'trimestral' | 'anual'
) {
  return useMetricasConsultor({ cargo, periodo })
}

/**
 * Hook para buscar métricas por portaria
 */
export function useMetricasPorPortaria(
  portaria: string, 
  periodo?: 'semanal' | 'mensal' | 'trimestral' | 'anual'
) {
  return useMetricasConsultor({ portaria, periodo })
}