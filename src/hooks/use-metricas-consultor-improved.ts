import { useState, useEffect, useCallback, useRef } from 'react'
import type { MetricasAtendente, EstatisticasGerais } from '@/lib/services/metricas-service-improved'

interface UseMetricasParams {
  atendenteId?: string
  periodo?: 'semanal' | 'mensal' | 'trimestral' | 'anual'
  cargo?: string
  portaria?: string
  dataInicio?: string
  dataFim?: string
  temporal?: boolean
  agrupamento?: string
  // Novos parâmetros para controle avançado
  autoRefresh?: boolean
  refreshInterval?: number
  enabled?: boolean
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
  // Novos retornos para melhor controle
  isStale: boolean
  lastFetch: Date | null
  retryCount: number
  canRetry: boolean
}

// Configurações padrão
const DEFAULT_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  refreshInterval: 5 * 60 * 1000, // 5 minutos
  staleTime: 2 * 60 * 1000, // 2 minutos
}

/**
 * Hook melhorado para buscar métricas de consultores
 * Implementa retry logic, cache, auto-refresh e error recovery
 */
export function useMetricasConsultorImproved(params: UseMetricasParams = {}): UseMetricasReturn {
  const [data, setData] = useState<MetricasResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  
  // Refs para controle de lifecycle
  const abortControllerRef = useRef<AbortController | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const paramsRef = useRef(params)

  // Atualizar ref dos parâmetros
  paramsRef.current = params

  // Verificar se os dados estão stale
  const isStale = lastFetch ? Date.now() - lastFetch.getTime() > DEFAULT_CONFIG.staleTime : true
  const canRetry = retryCount < DEFAULT_CONFIG.maxRetries

  /**
   * Função principal de fetch com retry logic
   */
  const fetchMetricas = useCallback(async (isRetry = false) => {
    // Cancelar requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Criar novo AbortController
    abortControllerRef.current = new AbortController()

    if (!isRetry) {
      setLoading(true)
      setError(null)
    }

    try {
      const searchParams = new URLSearchParams()
      
      // Construir parâmetros da query de forma type-safe
      Object.entries(paramsRef.current).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== 'autoRefresh' && key !== 'refreshInterval' && key !== 'enabled') {
          searchParams.append(key, String(value))
        }
      })

      const response = await fetch(
        `/api/consultor/metricas?${searchParams.toString()}`,
        { 
          signal: abortControllerRef.current.signal,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Erro desconhecido na resposta da API')
      }

      // Sucesso - resetar contador de retry
      setData(result.data)
      setError(null)
      setRetryCount(0)
      setLastFetch(new Date())

    } catch (err) {
      // Ignorar erros de abort
      if (err instanceof Error && err.name === 'AbortError') {
        return
      }

      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      console.error('Erro ao buscar métricas:', err)

      // Implementar retry logic usando valores atuais do estado
      setRetryCount(currentRetryCount => {
        const newRetryCount = currentRetryCount + 1
        const currentCanRetry = currentRetryCount < DEFAULT_CONFIG.maxRetries
        
        if (currentCanRetry && !isRetry) {
          // Delay exponencial para retry
          const delay = DEFAULT_CONFIG.retryDelay * Math.pow(2, newRetryCount - 1)
          
          setTimeout(() => {
            fetchMetricas(true)
          }, delay)
          
          return newRetryCount
        }
        
        // Se não pode fazer retry, definir erro
        if (!currentCanRetry || isRetry) {
          setError(errorMessage)
        }
        
        return currentRetryCount
      })
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Função pública de refetch
   */
  const refetch = useCallback(async () => {
    setRetryCount(0)
    await fetchMetricas()
  }, [fetchMetricas])

  /**
   * Effect para fetch inicial e auto-refresh
   */
  useEffect(() => {
    // Não fazer fetch se disabled
    if (params.enabled === false) {
      return
    }

    // Fazer fetch inicial
    fetchMetricas()

    // Configurar auto-refresh se habilitado
    if (params.autoRefresh) {
      const interval = params.refreshInterval || DEFAULT_CONFIG.refreshInterval
      
      timeoutRef.current = setInterval(() => {
        // Só fazer auto-refresh se não estiver carregando
        fetchMetricas()
      }, interval)
    }

    // Cleanup
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (timeoutRef.current) {
        clearInterval(timeoutRef.current)
      }
    }
  }, [
    params.atendenteId,
    params.periodo,
    params.cargo,
    params.portaria,
    params.dataInicio,
    params.dataFim,
    params.temporal,
    params.agrupamento,
    params.enabled,
    params.autoRefresh,
    params.refreshInterval
  ])

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (timeoutRef.current) {
        clearInterval(timeoutRef.current)
      }
    }
  }, [])

  return {
    data,
    loading,
    error,
    refetch,
    isStale,
    lastFetch,
    retryCount,
    canRetry,
  }
}

/**
 * Hook especializado para métricas de atendente específico
 */
export function useMetricasAtendenteImproved(atendenteId: string, periodo?: UseMetricasParams['periodo']) {
  return useMetricasConsultorImproved({ 
    atendenteId, 
    periodo,
    autoRefresh: true,
    enabled: !!atendenteId 
  })
}

/**
 * Hook especializado para métricas por cargo
 */
export function useMetricasPorCargoImproved(cargo: string, periodo?: UseMetricasParams['periodo']) {
  return useMetricasConsultorImproved({ 
    cargo, 
    periodo,
    enabled: !!cargo 
  })
}

/**
 * Hook especializado para métricas por portaria
 */
export function useMetricasPorPortariaImproved(portaria: string, periodo?: UseMetricasParams['periodo']) {
  return useMetricasConsultorImproved({ 
    portaria, 
    periodo,
    enabled: !!portaria 
  })
}

/**
 * Hook para métricas temporais (gráficos)
 */
export function useMetricasTemporaisImproved(params: Omit<UseMetricasParams, 'temporal'>) {
  return useMetricasConsultorImproved({ 
    ...params, 
    temporal: true,
    autoRefresh: true,
    refreshInterval: 10 * 60 * 1000, // 10 minutos para dados temporais
  })
}