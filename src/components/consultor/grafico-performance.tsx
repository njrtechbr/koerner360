'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  Legend,
} from 'recharts'
import {
  TrendingUp,
  BarChart3,
  LineChart as LineChartIcon,
  Activity,
  ExternalLink,
} from 'lucide-react'
import Link from 'next/link'

interface DadosPerformance {
  periodo: string
  avaliacoes: number
  mediaNotas: number
  satisfacao: number
  pontuacao: number
  atendentesAtivos: number
}

interface ComparativoData {
  cargo: string
  mediaNotas: number
  satisfacao: number
  totalAvaliacoes: number
  pontuacaoMedia: number
}

interface GraficoPerformanceProps {
  periodo?: 'semanal' | 'mensal' | 'trimestral' | 'anual'
}

type TipoGrafico = 'linha' | 'area' | 'barra' | 'combinado'
type MetricaFoco = 'avaliacoes' | 'mediaNotas' | 'satisfacao' | 'pontuacao'

export function GraficoPerformance({ periodo = 'mensal' }: GraficoPerformanceProps) {
  const [dadosPerformance, setDadosPerformance] = useState<DadosPerformance[]>([])
  const [dadosComparativo, setDadosComparativo] = useState<ComparativoData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tipoGrafico, setTipoGrafico] = useState<TipoGrafico>('linha')
  const [metricaFoco, setMetricaFoco] = useState<MetricaFoco>('mediaNotas')
  const [periodoSelecionado, setPeriodoSelecionado] = useState(periodo)

  useEffect(() => {
    const buscarDadosPerformance = async () => {
      try {
        setLoading(true)
        setError(null)

        // Buscar dados de performance temporal
        const responsePerformance = await fetch(
          `/api/consultor/metricas?periodo=${periodoSelecionado}&temporal=true`
        )
        
        if (!responsePerformance.ok) {
          throw new Error('Erro ao carregar dados de performance')
        }

        const resultPerformance = await responsePerformance.json()
        
        if (!resultPerformance.success) {
          throw new Error(resultPerformance.error || 'Erro desconhecido')
        }

        // Buscar dados comparativos por cargo
        const responseComparativo = await fetch(
          `/api/consultor/metricas?periodo=${periodoSelecionado}&agrupamento=cargo`
        )
        
        if (!responseComparativo.ok) {
          throw new Error('Erro ao carregar dados comparativos')
        }

        const resultComparativo = await responseComparativo.json()
        
        if (!resultComparativo.success) {
          throw new Error(resultComparativo.error || 'Erro desconhecido')
        }

        setDadosPerformance(resultPerformance.data.temporal || [])
        setDadosComparativo(resultComparativo.data.porCargo || [])
      } catch (err) {
        console.error('Erro ao buscar dados de performance:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    buscarDadosPerformance()
  }, [periodoSelecionado])

  const renderGraficoTemporal = () => {
    const cores = {
      avaliacoes: '#3b82f6',
      mediaNotas: '#10b981',
      satisfacao: '#8b5cf6',
      pontuacao: '#f59e0b',
    }

    const props = {
      data: dadosPerformance,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    }

    switch (tipoGrafico) {
      case 'area':
        return (
          <AreaChart {...props}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="periodo" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey={metricaFoco}
              stroke={cores[metricaFoco]}
              fill={cores[metricaFoco]}
              fillOpacity={0.3}
            />
          </AreaChart>
        )
      
      case 'barra':
        return (
          <BarChart {...props}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="periodo" />
            <YAxis />
            <Tooltip />
            <Bar dataKey={metricaFoco} fill={cores[metricaFoco]} />
          </BarChart>
        )
      
      case 'combinado':
        return (
          <ComposedChart {...props}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="periodo" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="avaliacoes" fill={cores.avaliacoes} name="Avaliações" />
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="mediaNotas" 
              stroke={cores.mediaNotas} 
              strokeWidth={3}
              name="Média de Notas"
            />
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="satisfacao" 
              stroke={cores.satisfacao} 
              strokeWidth={2}
              strokeDasharray="5 5"
              name="% Satisfação"
            />
          </ComposedChart>
        )
      
      default: // linha
        return (
          <LineChart {...props}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="periodo" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey={metricaFoco}
              stroke={cores[metricaFoco]}
              strokeWidth={3}
              dot={{ fill: cores[metricaFoco], strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        )
    }
  }

  const getMetricaLabel = (metrica: MetricaFoco) => {
    switch (metrica) {
      case 'avaliacoes':
        return 'Número de Avaliações'
      case 'mediaNotas':
        return 'Média de Notas'
      case 'satisfacao':
        return 'Percentual de Satisfação'
      case 'pontuacao':
        return 'Pontuação Total'
      default:
        return 'Métrica'
    }
  }

  const getTipoGraficoIcon = (tipo: TipoGrafico) => {
    switch (tipo) {
      case 'linha':
        return <LineChartIcon className="h-4 w-4" />
      case 'area':
        return <Activity className="h-4 w-4" />
      case 'barra':
        return <BarChart3 className="h-4 w-4" />
      case 'combinado':
        return <TrendingUp className="h-4 w-4" />
      default:
        return <LineChartIcon className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <LoadingSpinner text="Carregando gráficos de performance..." />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <LoadingSpinner text="Carregando comparativos..." />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            <p>Erro ao carregar gráficos: {error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Gráfico de Performance Temporal */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {getTipoGraficoIcon(tipoGrafico)}
            Evolução de Performance - {getMetricaLabel(metricaFoco)}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={periodoSelecionado} onValueChange={(value: string) => setPeriodoSelecionado(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semanal">Semanal</SelectItem>
                <SelectItem value="mensal">Mensal</SelectItem>
                <SelectItem value="trimestral">Trimestral</SelectItem>
                <SelectItem value="anual">Anual</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" asChild>
              <Link href="/consultor/performance" className="flex items-center gap-1">
                Detalhes
                <ExternalLink className="h-3 w-3" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Controles do Gráfico */}
          <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Tipo:</span>
              <div className="flex gap-1">
                {(['linha', 'area', 'barra', 'combinado'] as TipoGrafico[]).map((tipo) => (
                  <Button
                    key={tipo}
                    variant={tipoGrafico === tipo ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTipoGrafico(tipo)}
                    className="flex items-center gap-1"
                  >
                    {getTipoGraficoIcon(tipo)}
                    {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            
            {tipoGrafico !== 'combinado' && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Métrica:</span>
                <Select value={metricaFoco} onValueChange={(value: MetricaFoco) => setMetricaFoco(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="avaliacoes">Avaliações</SelectItem>
                    <SelectItem value="mediaNotas">Média de Notas</SelectItem>
                    <SelectItem value="satisfacao">% Satisfação</SelectItem>
                    <SelectItem value="pontuacao">Pontuação</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Gráfico */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {renderGraficoTemporal()}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Comparativo por Cargo */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance por Cargo
          </CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/consultor/comparativo" className="flex items-center gap-1">
              Comparar
              <ExternalLink className="h-3 w-3" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosComparativo}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="cargo" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar 
                  yAxisId="left" 
                  dataKey="totalAvaliacoes" 
                  fill="#3b82f6" 
                  name="Total de Avaliações"
                />
                <Bar 
                  yAxisId="right" 
                  dataKey="mediaNotas" 
                  fill="#10b981" 
                  name="Média de Notas"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Resumo dos Dados */}
          <div className="mt-4 grid gap-2 md:grid-cols-2 lg:grid-cols-4">
            {dadosComparativo.map((cargo, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-sm mb-1">{cargo.cargo}</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-xs">
                    {cargo.mediaNotas.toFixed(1)}★
                  </Badge>
                  <span>{cargo.satisfacao.toFixed(0)}% satisfação</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}