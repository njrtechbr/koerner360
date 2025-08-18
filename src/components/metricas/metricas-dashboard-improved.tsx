'use client'

import { useState, useMemo, useCallback } from 'react'
import { useMetricasConsultorImproved } from '@/hooks/use-metricas-consultor-improved'
import { MetricasErrorBoundary } from '@/components/error-boundary/metricas-error-boundary'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { RefreshCw, TrendingUp, TrendingDown, Minus, Clock, Users, Star, Award } from 'lucide-react'

interface MetricasDashboardImprovedProps {
  atendenteId?: string
  cargo?: string
  portaria?: string
  autoRefresh?: boolean
}

/**
 * Dashboard de métricas melhorado com error handling, loading states e performance otimizada
 */
function MetricasDashboardContent({ 
  atendenteId, 
  cargo, 
  portaria, 
  autoRefresh = false 
}: MetricasDashboardImprovedProps) {
  const [periodo, setPeriodo] = useState<string>('mensal')
  
  const { 
    data, 
    loading, 
    error, 
    refetch, 
    isStale, 
    lastFetch, 
    retryCount,
    canRetry 
  } = useMetricasConsultorImproved({
    atendenteId,
    cargo,
    portaria,
    periodo: periodo as any,
    autoRefresh,
    enabled: true,
  })

  // Memoizar ícones de tendência para evitar re-renders
  const getTendenciaIcon = useCallback((tendencia: string) => {
    const iconProps = { className: "h-4 w-4" }
    switch (tendencia) {
      case 'crescente':
        return <TrendingUp {...iconProps} className="h-4 w-4 text-green-500" />
      case 'decrescente':
        return <TrendingDown {...iconProps} className="h-4 w-4 text-red-500" />
      default:
        return <Minus {...iconProps} className="h-4 w-4 text-gray-500" />
    }
  }, [])

  const getTendenciaColor = useCallback((tendencia: string) => {
    switch (tendencia) {
      case 'crescente':
        return 'text-green-600'
      case 'decrescente':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }, [])

  // Memoizar estatísticas formatadas
  const estatisticasFormatadas = useMemo(() => {
    if (!data?.estatisticasGerais) return null

    return [
      {
        titulo: 'Total de Atendentes',
        valor: data.estatisticasGerais.totalAtendentes,
        icone: Users,
        cor: 'text-blue-600',
      },
      {
        titulo: 'Total de Avaliações',
        valor: data.estatisticasGerais.totalAvaliacoes,
        icone: Star,
        cor: 'text-purple-600',
      },
      {
        titulo: 'Média Geral',
        valor: data.estatisticasGerais.mediaGeralNotas.toFixed(1),
        icone: Award,
        cor: 'text-yellow-600',
      },
      {
        titulo: 'Satisfação',
        valor: `${data.estatisticasGerais.percentualSatisfacaoGeral.toFixed(1)}%`,
        icone: TrendingUp,
        cor: 'text-green-600',
      },
    ]
  }, [data?.estatisticasGerais])

  // Loading skeleton
  if (loading && !data) {
    return <LoadingSkeleton />
  }

  // Error state
  if (error && !data) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <p className="text-red-600">Erro ao carregar métricas: {error}</p>
            {retryCount > 0 && (
              <p className="text-sm text-gray-500">
                Tentativa {retryCount} de 3
              </p>
            )}
            <div className="flex justify-center gap-2">
              {canRetry && (
                <Button onClick={refetch} variant="outline" disabled={loading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Tentar Novamente
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Empty state
  if (!data) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">Nenhuma métrica encontrada</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controles e Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Selecionar período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semanal">Semanal</SelectItem>
              <SelectItem value="mensal">Mensal</SelectItem>
              <SelectItem value="trimestral">Trimestral</SelectItem>
              <SelectItem value="anual">Anual</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="text-sm text-gray-600">
            {data.periodo.nome}
          </div>

          {/* Indicadores de status */}
          <div className="flex items-center gap-2">
            {isStale && (
              <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                <Clock className="h-3 w-3 mr-1" />
                Dados antigos
              </Badge>
            )}
            {autoRefresh && (
              <Badge variant="outline" className="text-green-600 border-green-300">
                Auto-refresh ativo
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {lastFetch && (
            <span className="text-xs text-gray-500">
              Última atualização: {lastFetch.toLocaleTimeString('pt-BR')}
            </span>
          )}
          <Button onClick={refetch} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Estatísticas Gerais */}
      {estatisticasFormatadas && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {estatisticasFormatadas.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <stat.icone className={`h-4 w-4 ${stat.cor}`} />
                  {stat.titulo}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stat.valor}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Lista de Atendentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {data.metricas.map((metrica) => (
          <Card key={metrica.atendente.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {metrica.atendente.nome}
                </CardTitle>
                <div className="flex items-center space-x-1">
                  {getTendenciaIcon(metrica.resumo.tendencia)}
                  <span className={`text-sm ${getTendenciaColor(metrica.resumo.tendencia)}`}>
                    {metrica.resumo.tendencia}
                  </span>
                </div>
              </div>
              {metrica.atendente.cargo && (
                <p className="text-sm text-gray-600">{metrica.atendente.cargo}</p>
              )}
              {metrica.atendente.portaria && (
                <Badge variant="secondary" className="w-fit">
                  {metrica.atendente.portaria}
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Avaliações</p>
                  <p className="font-semibold">{metrica.resumo.totalAvaliacoes}</p>
                </div>
                <div>
                  <p className="text-gray-600">Média</p>
                  <p className="font-semibold">{metrica.resumo.mediaNotas.toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Satisfação</p>
                  <p className="font-semibold">{metrica.resumo.percentualSatisfacao.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-gray-600">Pontuação</p>
                  <p className="font-semibold">{metrica.resumo.pontuacaoTotal}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state para métricas */}
      {data.metricas.length === 0 && (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-gray-500">
              Nenhuma métrica encontrada para o período selecionado
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

/**
 * Skeleton de loading
 */
function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Controles skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-8 w-24" />
      </div>

      {/* Estatísticas skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lista skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j}>
                    <Skeleton className="h-4 w-16 mb-1" />
                    <Skeleton className="h-5 w-12" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

/**
 * Dashboard principal com Error Boundary
 */
export function MetricasDashboardImproved(props: MetricasDashboardImprovedProps) {
  return (
    <MetricasErrorBoundary>
      <MetricasDashboardContent {...props} />
    </MetricasErrorBoundary>
  )
}