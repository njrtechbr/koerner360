'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Line,
  Area,
  AreaChart,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  ExternalLink,
} from 'lucide-react'
import Link from 'next/link'

interface MetricasData {
  distribuicaoNotas: Array<{
    nota: number
    quantidade: number
    percentual: number
  }>
  tendenciaMensal: Array<{
    mes: string
    avaliacoes: number
    mediaNotas: number
    satisfacao: number
  }>
  performancePorCargo: Array<{
    cargo: string
    totalAtendentes: number
    mediaNotas: number
    totalAvaliacoes: number
    satisfacao: number
  }>
  performancePorPortaria: Array<{
    portaria: string
    totalAtendentes: number
    mediaNotas: number
    totalAvaliacoes: number
    satisfacao: number
  }>
  estatisticasGerais: {
    totalAtendentes: number
    totalAvaliacoes: number
    mediaGeralNotas: number
    percentualSatisfacaoGeral: number
    tendenciaGeral: 'crescente' | 'decrescente' | 'estavel'
    melhorNota: number
    piorNota: number
  }
}

interface MetricasGeraisProps {
  periodo?: 'semanal' | 'mensal' | 'trimestral' | 'anual'
}

export function MetricasGerais({ periodo = 'mensal' }: MetricasGeraisProps) {
  const [dados, setDados] = useState<MetricasData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const buscarMetricas = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/consultor/metricas?periodo=${periodo}&detalhado=true`)
        
        if (!response.ok) {
          throw new Error('Erro ao carregar métricas')
        }

        const result = await response.json()
        
        if (!result.success) {
          throw new Error(result.error || 'Erro desconhecido')
        }

        setDados(result.data)
      } catch (err) {
        console.error('Erro ao buscar métricas:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    buscarMetricas()
  }, [periodo])

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <LoadingSpinner text="Carregando métricas..." />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            <p>Erro ao carregar métricas: {error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!dados) {
    return null
  }

  // Cores para os gráficos
  const coresNotas = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a']
  const corPrimaria = '#3b82f6'
  const corSecundaria = '#10b981'

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'crescente':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'decrescente':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-blue-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Resumo Executivo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Resumo Executivo - {periodo.charAt(0).toUpperCase() + periodo.slice(1)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {dados.estatisticasGerais.totalAvaliacoes}
              </div>
              <div className="text-sm text-muted-foreground">Total de Avaliações</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {dados.estatisticasGerais.mediaGeralNotas.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">Média Geral</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {dados.estatisticasGerais.percentualSatisfacaoGeral.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Satisfação</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center gap-2">
                {getTendenciaIcon(dados.estatisticasGerais.tendenciaGeral)}
                <Badge 
                  variant={dados.estatisticasGerais.tendenciaGeral === 'crescente' ? 'default' : 
                          dados.estatisticasGerais.tendenciaGeral === 'decrescente' ? 'destructive' : 'secondary'}
                >
                  {dados.estatisticasGerais.tendenciaGeral === 'crescente' ? 'Crescente' : 
                   dados.estatisticasGerais.tendenciaGeral === 'decrescente' ? 'Decrescente' : 'Estável'}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground mt-1">Tendência</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Distribuição de Notas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Distribuição de Notas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dados.distribuicaoNotas}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="quantidade"
                    label={({ nota, percentual }) => `${nota}★ (${percentual.toFixed(1)}%)`}
                  >
                    {dados.distribuicaoNotas.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={coresNotas[index]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [value, 'Avaliações']}
                    labelFormatter={(label) => `Nota ${label}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tendência Mensal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tendência de Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dados.tendenciaMensal}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="avaliacoes"
                    stackId="1"
                    stroke={corPrimaria}
                    fill={corPrimaria}
                    fillOpacity={0.3}
                    name="Avaliações"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="mediaNotas"
                    stroke={corSecundaria}
                    strokeWidth={3}
                    name="Média de Notas"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Performance por Cargo */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Performance por Cargo</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/consultor/performance" className="flex items-center gap-1">
                Detalhes
                <ExternalLink className="h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dados.performancePorCargo}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="cargo" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="mediaNotas" fill={corPrimaria} name="Média de Notas" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Performance por Portaria */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Performance por Portaria</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/consultor/performance" className="flex items-center gap-1">
                Detalhes
                <ExternalLink className="h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dados.performancePorPortaria}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="portaria" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="satisfacao" fill={corSecundaria} name="% Satisfação" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}