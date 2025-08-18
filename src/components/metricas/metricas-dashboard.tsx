'use client'

import { useState } from 'react'
import { useMetricasConsultor } from '@/hooks/use-metricas-consultor'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { RefreshCw, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface MetricasDashboardProps {
  atendenteId?: string
  cargo?: string
  portaria?: string
}

/**
 * Dashboard de métricas com filtros e visualização
 */
export function MetricasDashboard({ atendenteId, cargo, portaria }: MetricasDashboardProps) {
  const [periodo, setPeriodo] = useState<string>('mensal')
  
  const { data, loading, error, refetch } = useMetricasConsultor({
    atendenteId,
    cargo,
    portaria,
    periodo: periodo as any,
  })

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'crescente':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'decrescente':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getTendenciaColor = (tendencia: string) => {
    switch (tendencia) {
      case 'crescente':
        return 'text-green-600'
      case 'decrescente':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando métricas...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-600 mb-4">Erro ao carregar métricas: {error}</p>
            <Button onClick={refetch} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

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
      {/* Controles */}
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
        </div>

        <Button onClick={refetch} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total de Atendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.estatisticasGerais.totalAtendentes}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total de Avaliações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.estatisticasGerais.totalAvaliacoes}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Média Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.estatisticasGerais.mediaGeralNotas.toFixed(1)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Satisfação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.estatisticasGerais.percentualSatisfacaoGeral.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Atendentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {data.metricas.map((metrica) => (
          <Card key={metrica.atendente.id}>
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