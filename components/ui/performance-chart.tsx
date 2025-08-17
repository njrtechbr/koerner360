'use client'

import { useState } from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  Maximize2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type TipoGrafico = 'line' | 'area' | 'bar' | 'composed' | 'pie' | 'radial'
type PeriodoTempo = 'diario' | 'semanal' | 'mensal' | 'trimestral'

interface DadosPerformance {
  periodo: string
  avaliacoes: number
  mediaNotas: number
  satisfacao: number
  pontuacao: number
  sequencia?: number
  nivel?: number
  [key: string]: any
}

interface MetricaConfig {
  key: string
  nome: string
  cor: string
  tipo: 'line' | 'bar' | 'area'
  yAxisId?: 'left' | 'right'
  formato?: 'numero' | 'percentual' | 'decimal'
  unidade?: string
}

interface PerformanceChartProps {
  dados: DadosPerformance[]
  titulo?: string
  tipo?: TipoGrafico
  metricas?: MetricaConfig[]
  altura?: number
  periodo?: PeriodoTempo
  showControls?: boolean
  showLegend?: boolean
  showGrid?: boolean
  showTooltip?: boolean
  className?: string
  onExport?: () => void
  onFullscreen?: () => void
}

const metricasDefault: MetricaConfig[] = [
  {
    key: 'avaliacoes',
    nome: 'Avaliações',
    cor: '#3b82f6',
    tipo: 'bar',
    yAxisId: 'right',
    formato: 'numero',
  },
  {
    key: 'mediaNotas',
    nome: 'Média de Notas',
    cor: '#10b981',
    tipo: 'line',
    yAxisId: 'left',
    formato: 'decimal',
  },
  {
    key: 'satisfacao',
    nome: 'Satisfação',
    cor: '#f59e0b',
    tipo: 'area',
    yAxisId: 'left',
    formato: 'percentual',
    unidade: '%',
  },
  {
    key: 'pontuacao',
    nome: 'Pontuação',
    cor: '#8b5cf6',
    tipo: 'line',
    yAxisId: 'right',
    formato: 'numero',
  },
]

const coresPie = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#84cc16',
  '#f97316',
]

export function PerformanceChart({
  dados,
  titulo = 'Performance',
  tipo = 'line',
  metricas = metricasDefault,
  altura = 400,
  periodo = 'mensal',
  showControls = true,
  showLegend = true,
  showGrid = true,
  showTooltip = true,
  className,
  onExport,
  onFullscreen,
}: PerformanceChartProps) {
  const [tipoGrafico, setTipoGrafico] = useState<TipoGrafico>(tipo)
  const [metricasSelecionadas, setMetricasSelecionadas] = useState<string[]>(
    metricas.map(m => m.key)
  )

  const formatarValor = (valor: number, formato?: string, unidade?: string) => {
    if (valor === null || valor === undefined) return 'N/A'
    
    switch (formato) {
      case 'percentual':
        return `${valor.toFixed(1)}${unidade || '%'}`
      case 'decimal':
        return valor.toFixed(2)
      case 'numero':
      default:
        return valor.toLocaleString('pt-BR')
    }
  }

  const formatarPeriodo = (periodo: string) => {
    // Assumindo formato ISO ou similar, adaptar conforme necessário
    try {
      const data = new Date(periodo)
      return data.toLocaleDateString('pt-BR', {
        month: 'short',
        year: '2-digit',
      })
    } catch {
      return periodo
    }
  }

  const calcularTendencia = (dados: DadosPerformance[], metrica: string) => {
    if (dados.length < 2) return 'estavel'
    
    const primeiro = dados[0][metrica]
    const ultimo = dados[dados.length - 1][metrica]
    
    if (ultimo > primeiro * 1.05) return 'crescente'
    if (ultimo < primeiro * 0.95) return 'decrescente'
    return 'estavel'
  }

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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium mb-2">{formatarPeriodo(label)}</p>
          {payload.map((entry: any, index: number) => {
            const metrica = metricas.find(m => m.key === entry.dataKey)
            return (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span>{metrica?.nome || entry.dataKey}:</span>
                <span className="font-medium">
                  {formatarValor(entry.value, metrica?.formato, metrica?.unidade)}
                </span>
              </div>
            )
          })}
        </div>
      )
    }
    return null
  }

  const renderGrafico = () => {
    const metricasAtivas = metricas.filter(m => metricasSelecionadas.includes(m.key))
    
    switch (tipoGrafico) {
      case 'area':
        return (
          <AreaChart data={dados}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.3} />}
            <XAxis 
              dataKey="periodo" 
              tickFormatter={formatarPeriodo}
              fontSize={12}
            />
            <YAxis yAxisId="left" fontSize={12} />
            <YAxis yAxisId="right" orientation="right" fontSize={12} />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend />}
            {metricasAtivas.map((metrica) => (
              <Area
                key={metrica.key}
                yAxisId={metrica.yAxisId || 'left'}
                type="monotone"
                dataKey={metrica.key}
                stackId="1"
                stroke={metrica.cor}
                fill={metrica.cor}
                fillOpacity={0.6}
                name={metrica.nome}
              />
            ))}
          </AreaChart>
        )

      case 'bar':
        return (
          <BarChart data={dados}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.3} />}
            <XAxis 
              dataKey="periodo" 
              tickFormatter={formatarPeriodo}
              fontSize={12}
            />
            <YAxis yAxisId="left" fontSize={12} />
            <YAxis yAxisId="right" orientation="right" fontSize={12} />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend />}
            {metricasAtivas.map((metrica) => (
              <Bar
                key={metrica.key}
                yAxisId={metrica.yAxisId || 'left'}
                dataKey={metrica.key}
                fill={metrica.cor}
                name={metrica.nome}
                radius={[2, 2, 0, 0]}
              />
            ))}
          </BarChart>
        )

      case 'composed':
        return (
          <ComposedChart data={dados}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.3} />}
            <XAxis 
              dataKey="periodo" 
              tickFormatter={formatarPeriodo}
              fontSize={12}
            />
            <YAxis yAxisId="left" fontSize={12} />
            <YAxis yAxisId="right" orientation="right" fontSize={12} />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend />}
            {metricasAtivas.map((metrica) => {
              if (metrica.tipo === 'bar') {
                return (
                  <Bar
                    key={metrica.key}
                    yAxisId={metrica.yAxisId || 'left'}
                    dataKey={metrica.key}
                    fill={metrica.cor}
                    name={metrica.nome}
                    radius={[2, 2, 0, 0]}
                  />
                )
              } else if (metrica.tipo === 'area') {
                return (
                  <Area
                    key={metrica.key}
                    yAxisId={metrica.yAxisId || 'left'}
                    type="monotone"
                    dataKey={metrica.key}
                    stroke={metrica.cor}
                    fill={metrica.cor}
                    fillOpacity={0.3}
                    name={metrica.nome}
                  />
                )
              } else {
                return (
                  <Line
                    key={metrica.key}
                    yAxisId={metrica.yAxisId || 'left'}
                    type="monotone"
                    dataKey={metrica.key}
                    stroke={metrica.cor}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name={metrica.nome}
                  />
                )
              }
            })}
          </ComposedChart>
        )

      case 'pie':
        const dadosPie = metricasAtivas.map((metrica, index) => ({
          name: metrica.nome,
          value: dados.reduce((acc, item) => acc + (item[metrica.key] || 0), 0),
          fill: coresPie[index % coresPie.length],
        }))
        
        return (
          <PieChart>
            <Pie
              data={dadosPie}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {dadosPie.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            {showTooltip && <Tooltip />}
          </PieChart>
        )

      case 'radial':
        const dadosRadial = metricasAtivas.map((metrica, index) => ({
          name: metrica.nome,
          value: dados.reduce((acc, item) => acc + (item[metrica.key] || 0), 0) / dados.length,
          fill: coresPie[index % coresPie.length],
        }))
        
        return (
          <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" data={dadosRadial}>
            <RadialBar
              minAngle={15}
              label={{ position: 'insideStart', fill: '#fff' }}
              background
              clockWise
              dataKey="value"
            />
            {showTooltip && <Tooltip />}
          </RadialBarChart>
        )

      case 'line':
      default:
        return (
          <LineChart data={dados}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.3} />}
            <XAxis 
              dataKey="periodo" 
              tickFormatter={formatarPeriodo}
              fontSize={12}
            />
            <YAxis yAxisId="left" fontSize={12} />
            <YAxis yAxisId="right" orientation="right" fontSize={12} />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend />}
            {metricasAtivas.map((metrica) => (
              <Line
                key={metrica.key}
                yAxisId={metrica.yAxisId || 'left'}
                type="monotone"
                dataKey={metrica.key}
                stroke={metrica.cor}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name={metrica.nome}
              />
            ))}
          </LineChart>
        )
    }
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {titulo}
          </CardTitle>
          <div className="flex items-center gap-4">
            {metricas.map((metrica) => {
              const tendencia = calcularTendencia(dados, metrica.key)
              return (
                <div key={metrica.key} className="flex items-center gap-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: metrica.cor }}
                  />
                  <span className="text-sm text-muted-foreground">{metrica.nome}</span>
                  {getTendenciaIcon(tendencia)}
                </div>
              )
            })}
          </div>
        </div>
        
        {showControls && (
          <div className="flex items-center gap-2">
            <Select value={tipoGrafico} onValueChange={(value: TipoGrafico) => setTipoGrafico(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">
                  <div className="flex items-center gap-2">
                    <LineChartIcon className="h-4 w-4" />
                    Linha
                  </div>
                </SelectItem>
                <SelectItem value="area">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Área
                  </div>
                </SelectItem>
                <SelectItem value="bar">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Barra
                  </div>
                </SelectItem>
                <SelectItem value="composed">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Combinado
                  </div>
                </SelectItem>
                <SelectItem value="pie">
                  <div className="flex items-center gap-2">
                    <PieChartIcon className="h-4 w-4" />
                    Pizza
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="h-4 w-4" />
              </Button>
            )}
            
            {onFullscreen && (
              <Button variant="outline" size="sm" onClick={onFullscreen}>
                <Maximize2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div style={{ height: altura }}>
          <ResponsiveContainer width="100%" height="100%">
            {renderGrafico()}
          </ResponsiveContainer>
        </div>
        
        {/* Métricas Resumo */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
          {metricas.map((metrica) => {
            const valores = dados.map(d => d[metrica.key]).filter(v => v !== null && v !== undefined)
            const media = valores.length > 0 ? valores.reduce((a, b) => a + b, 0) / valores.length : 0
            const maximo = valores.length > 0 ? Math.max(...valores) : 0
            const tendencia = calcularTendencia(dados, metrica.key)
            
            return (
              <div key={metrica.key} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: metrica.cor }}
                />
                <div className="text-sm">
                  <div className="font-medium">{metrica.nome}</div>
                  <div className="text-muted-foreground">
                    Média: {formatarValor(media, metrica.formato, metrica.unidade)} |
                    Máx: {formatarValor(maximo, metrica.formato, metrica.unidade)}
                  </div>
                </div>
                {getTendenciaIcon(tendencia)}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// Componente simplificado para gráficos rápidos
interface QuickChartProps {
  dados: DadosPerformance[]
  metrica: string
  titulo?: string
  cor?: string
  tipo?: 'line' | 'area' | 'bar'
  altura?: number
  className?: string
}

export function QuickChart({
  dados,
  metrica,
  titulo,
  cor = '#3b82f6',
  tipo = 'line',
  altura = 200,
  className,
}: QuickChartProps) {
  const valores = dados.map(d => d[metrica]).filter(v => v !== null && v !== undefined)
  const media = valores.length > 0 ? valores.reduce((a, b) => a + b, 0) / valores.length : 0
  const tendencia = calcularTendencia(dados, metrica)
  
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
  
  const calcularTendencia = (dados: DadosPerformance[], metrica: string) => {
    if (dados.length < 2) return 'estavel'
    
    const primeiro = dados[0][metrica]
    const ultimo = dados[dados.length - 1][metrica]
    
    if (ultimo > primeiro * 1.05) return 'crescente'
    if (ultimo < primeiro * 0.95) return 'decrescente'
    return 'estavel'
  }

  const renderChart = () => {
    switch (tipo) {
      case 'area':
        return (
          <AreaChart data={dados}>
            <Area
              type="monotone"
              dataKey={metrica}
              stroke={cor}
              fill={cor}
              fillOpacity={0.6}
            />
          </AreaChart>
        )
      case 'bar':
        return (
          <BarChart data={dados}>
            <Bar dataKey={metrica} fill={cor} radius={[2, 2, 0, 0]} />
          </BarChart>
        )
      case 'line':
      default:
        return (
          <LineChart data={dados}>
            <Line
              type="monotone"
              dataKey={metrica}
              stroke={cor}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        )
    }
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{titulo || metrica}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{media.toFixed(1)}</Badge>
            {getTendenciaIcon(tendencia)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div style={{ height: altura }}>
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}