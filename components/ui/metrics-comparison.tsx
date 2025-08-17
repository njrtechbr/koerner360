'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Star,
  Target,
  Users,
  Trophy,
  Award,
  Flame,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Equal,
  Filter,
  Download,
  RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type TipoComparacao = 'individual' | 'equipe' | 'periodo' | 'categoria'
type MetricaComparacao = 'pontuacao' | 'mediaNotas' | 'satisfacao' | 'avaliacoes' | 'nivel' | 'conquistas'
type PeriodoComparacao = 'semanal' | 'mensal' | 'trimestral' | 'anual' | 'personalizado'

interface DadosComparacao {
  id: string
  nome: string
  tipo: 'atendente' | 'equipe' | 'periodo'
  avatar?: string
  cor?: string
  metricas: {
    pontuacao: number
    mediaNotas: number
    satisfacao: number
    avaliacoes: number
    nivel: number
    conquistas: number
    tendencia: 'crescente' | 'decrescente' | 'estavel'
    variacao: number // percentual de variação
  }
  detalhes?: {
    cargo?: string
    portaria?: string
    dataInicio?: string
    dataFim?: string
    membros?: number
  }
}

interface MetricsComparisonProps {
  dados: DadosComparacao[]
  tipo?: TipoComparacao
  metricaPrincipal?: MetricaComparacao
  periodo?: PeriodoComparacao
  titulo?: string
  showControls?: boolean
  showTendencias?: boolean
  showDetalhes?: boolean
  maxItens?: number
  className?: string
  onDadosChange?: (dados: DadosComparacao[]) => void
  onExportar?: () => void
}

const metricasConfig = {
  pontuacao: {
    label: 'Pontuação',
    icon: Trophy,
    cor: '#f59e0b',
    formato: (valor: number) => valor.toLocaleString(),
    unidade: 'pts',
  },
  mediaNotas: {
    label: 'Média de Notas',
    icon: Star,
    cor: '#eab308',
    formato: (valor: number) => valor.toFixed(1),
    unidade: '/5',
  },
  satisfacao: {
    label: 'Satisfação',
    icon: Target,
    cor: '#22c55e',
    formato: (valor: number) => `${valor.toFixed(0)}%`,
    unidade: '%',
  },
  avaliacoes: {
    label: 'Avaliações',
    icon: Users,
    cor: '#3b82f6',
    formato: (valor: number) => valor.toString(),
    unidade: '',
  },
  nivel: {
    label: 'Nível',
    icon: Award,
    cor: '#8b5cf6',
    formato: (valor: number) => valor.toString(),
    unidade: '',
  },
  conquistas: {
    label: 'Conquistas',
    icon: Flame,
    cor: '#f97316',
    formato: (valor: number) => valor.toString(),
    unidade: '',
  },
}

const coresGrafico = [
  '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#06b6d4',
  '#f97316', '#84cc16', '#ec4899', '#6366f1', '#14b8a6', '#f43f5e'
]

export function MetricsComparison({
  dados,
  tipo = 'individual',
  metricaPrincipal = 'pontuacao',
  periodo = 'mensal',
  titulo = 'Comparação de Métricas',
  showControls = true,
  showTendencias = true,
  showDetalhes = true,
  maxItens,
  className,
  onDadosChange,
  onExportar,
}: MetricsComparisonProps) {
  const [metricaSelecionada, setMetricaSelecionada] = useState<MetricaComparacao>(metricaPrincipal)
  const [tipoVisualizacao, setTipoVisualizacao] = useState<'barra' | 'linha' | 'radar' | 'pizza'>('barra')
  const [mostrarTodos, setMostrarTodos] = useState(false)

  const dadosExibidos = useMemo(() => {
    let dadosFiltrados = dados
    if (maxItens && !mostrarTodos) {
      dadosFiltrados = dados.slice(0, maxItens)
    }
    return dadosFiltrados.map((item, index) => ({
      ...item,
      cor: item.cor || coresGrafico[index % coresGrafico.length],
    }))
  }, [dados, maxItens, mostrarTodos])

  const dadosGrafico = useMemo(() => {
    return dadosExibidos.map(item => ({
      nome: item.nome,
      valor: item.metricas[metricaSelecionada],
      cor: item.cor,
      tendencia: item.metricas.tendencia,
      variacao: item.metricas.variacao,
    }))
  }, [dadosExibidos, metricaSelecionada])

  const dadosRadar = useMemo(() => {
    const metricas = Object.keys(metricasConfig) as MetricaComparacao[]
    return dadosExibidos.map(item => ({
      nome: item.nome,
      ...metricas.reduce((acc, metrica) => {
        // Normalizar valores para escala 0-100 para o radar
        let valorNormalizado = item.metricas[metrica]
        if (metrica === 'mediaNotas') {
          valorNormalizado = (valorNormalizado / 5) * 100
        } else if (metrica === 'pontuacao') {
          valorNormalizado = Math.min((valorNormalizado / 10000) * 100, 100)
        } else if (metrica === 'avaliacoes') {
          valorNormalizado = Math.min((valorNormalizado / 100) * 100, 100)
        } else if (metrica === 'nivel') {
          valorNormalizado = (valorNormalizado / 50) * 100
        } else if (metrica === 'conquistas') {
          valorNormalizado = Math.min((valorNormalizado / 20) * 100, 100)
        }
        acc[metrica] = Math.round(valorNormalizado)
        return acc
      }, {} as Record<MetricaComparacao, number>),
    }))
  }, [dadosExibidos])

  const estatisticas = useMemo(() => {
    const valores = dadosExibidos.map(item => item.metricas[metricaSelecionada])
    const media = valores.reduce((acc, val) => acc + val, 0) / valores.length
    const maximo = Math.max(...valores)
    const minimo = Math.min(...valores)
    const amplitude = maximo - minimo
    
    return { media, maximo, minimo, amplitude }
  }, [dadosExibidos, metricaSelecionada])

  const getTendenciaIcon = (tendencia: string, variacao: number) => {
    const cor = variacao > 0 ? 'text-green-500' : variacao < 0 ? 'text-red-500' : 'text-gray-500'
    
    switch (tendencia) {
      case 'crescente':
        return <TrendingUp className={cn('h-4 w-4', cor)} />
      case 'decrescente':
        return <TrendingDown className={cn('h-4 w-4', cor)} />
      default:
        return <Minus className={cn('h-4 w-4', cor)} />
    }
  }

  const getVariacaoDisplay = (variacao: number) => {
    const cor = variacao > 0 ? 'text-green-600' : variacao < 0 ? 'text-red-600' : 'text-gray-600'
    const icone = variacao > 0 ? ArrowUpRight : variacao < 0 ? ArrowDownRight : Equal
    const Icon = icone
    
    return (
      <div className={cn('flex items-center gap-1 text-sm font-medium', cor)}>
        <Icon className="h-3 w-3" />
        {Math.abs(variacao).toFixed(1)}%
      </div>
    )
  }

  const getIniciais = (nome: string) => {
    return nome
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const renderGraficoBarra = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={dadosGrafico} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="nome" 
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip 
          formatter={(value: number) => [
            metricasConfig[metricaSelecionada].formato(value),
            metricasConfig[metricaSelecionada].label
          ]}
        />
        <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
          {dadosGrafico.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.cor} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )

  const renderGraficoLinha = () => (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={dadosGrafico} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="nome" 
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip 
          formatter={(value: number) => [
            metricasConfig[metricaSelecionada].formato(value),
            metricasConfig[metricaSelecionada].label
          ]}
        />
        <Line 
          type="monotone" 
          dataKey="valor" 
          stroke={metricasConfig[metricaSelecionada].cor}
          strokeWidth={3}
          dot={{ fill: metricasConfig[metricaSelecionada].cor, strokeWidth: 2, r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )

  const renderGraficoRadar = () => (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart data={dadosRadar}>
        <PolarGrid />
        <PolarAngleAxis 
          dataKey="nome" 
          tick={{ fontSize: 10 }}
        />
        <PolarRadiusAxis 
          angle={90} 
          domain={[0, 100]} 
          tick={{ fontSize: 10 }}
        />
        <Tooltip />
        {Object.keys(metricasConfig).map((metrica, index) => (
          <Radar
            key={metrica}
            name={metricasConfig[metrica as MetricaComparacao].label}
            dataKey={metrica}
            stroke={coresGrafico[index]}
            fill={coresGrafico[index]}
            fillOpacity={0.1}
            strokeWidth={2}
          />
        ))}
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  )

  const renderGraficoPizza = () => (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={dadosGrafico}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ nome, valor }) => `${nome}: ${metricasConfig[metricaSelecionada].formato(valor)}`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="valor"
        >
          {dadosGrafico.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.cor} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: number) => [
            metricasConfig[metricaSelecionada].formato(value),
            metricasConfig[metricaSelecionada].label
          ]}
        />
      </PieChart>
    </ResponsiveContainer>
  )

  const renderGrafico = () => {
    switch (tipoVisualizacao) {
      case 'linha':
        return renderGraficoLinha()
      case 'radar':
        return renderGraficoRadar()
      case 'pizza':
        return renderGraficoPizza()
      default:
        return renderGraficoBarra()
    }
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {titulo}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Activity className="h-4 w-4" />
              <span className="capitalize">{tipo}</span>
              <span>•</span>
              <span>{dadosExibidos.length} itens</span>
              <span>•</span>
              <span className="capitalize">{periodo}</span>
            </div>
          </div>
          
          {showControls && (
            <div className="flex items-center gap-2">
              <Select value={metricaSelecionada} onValueChange={(value: MetricaComparacao) => setMetricaSelecionada(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(metricasConfig).map(([key, config]) => {
                    const Icon = config.icon
                    return (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {config.label}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              
              <Select value={tipoVisualizacao} onValueChange={(value: 'barra' | 'linha' | 'radar' | 'pizza') => setTipoVisualizacao(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="barra">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Barras
                    </div>
                  </SelectItem>
                  <SelectItem value="linha">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Linha
                    </div>
                  </SelectItem>
                  <SelectItem value="radar">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Radar
                    </div>
                  </SelectItem>
                  <SelectItem value="pizza">
                    <div className="flex items-center gap-2">
                      <PieChartIcon className="h-4 w-4" />
                      Pizza
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              
              {onExportar && (
                <Button variant="outline" size="sm" onClick={onExportar}>
                  <Download className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="grafico" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="grafico">Gráfico</TabsTrigger>
            <TabsTrigger value="tabela">Tabela</TabsTrigger>
            <TabsTrigger value="estatisticas">Estatísticas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="grafico" className="space-y-4">
            <div className="w-full">
              {renderGrafico()}
            </div>
          </TabsContent>
          
          <TabsContent value="tabela" className="space-y-4">
            <div className="space-y-2">
              {dadosExibidos.map((item, index) => (
                <div key={item.id} className="flex items-center gap-4 p-4 rounded-lg border hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: item.cor }}
                    />
                    
                    {item.tipo === 'atendente' && (
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={item.avatar || `/avatars/${item.id}.jpg`} />
                        <AvatarFallback className="text-sm">
                          {getIniciais(item.nome)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className="flex-1">
                      <div className="font-semibold">{item.nome}</div>
                      {showDetalhes && item.detalhes && (
                        <div className="text-sm text-muted-foreground">
                          {item.detalhes.cargo && <span>{item.detalhes.cargo}</span>}
                          {item.detalhes.cargo && item.detalhes.portaria && <span> • </span>}
                          {item.detalhes.portaria && <span>{item.detalhes.portaria}</span>}
                          {item.detalhes.membros && <span> • {item.detalhes.membros} membros</span>}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-6 gap-4 text-center">
                    {Object.entries(metricasConfig).map(([key, config]) => {
                      const valor = item.metricas[key as MetricaComparacao]
                      const isSelected = key === metricaSelecionada
                      
                      return (
                        <div key={key} className={cn('space-y-1', isSelected && 'font-bold')}>
                          <div className={cn('text-sm', isSelected ? 'text-primary' : 'text-muted-foreground')}>
                            {config.formato(valor)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {config.label}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  
                  {showTendencias && (
                    <div className="flex items-center gap-2">
                      {getTendenciaIcon(item.metricas.tendencia, item.metricas.variacao)}
                      {getVariacaoDisplay(item.metricas.variacao)}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {maxItens && dados.length > maxItens && !mostrarTodos && (
              <div className="text-center pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setMostrarTodos(true)}
                >
                  Mostrar todos ({dados.length - maxItens} restantes)
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="estatisticas" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {metricasConfig[metricaSelecionada].formato(estatisticas.media)}
                  </div>
                  <div className="text-sm text-muted-foreground">Média</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {metricasConfig[metricaSelecionada].formato(estatisticas.maximo)}
                  </div>
                  <div className="text-sm text-muted-foreground">Máximo</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {metricasConfig[metricaSelecionada].formato(estatisticas.minimo)}
                  </div>
                  <div className="text-sm text-muted-foreground">Mínimo</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {metricasConfig[metricaSelecionada].formato(estatisticas.amplitude)}
                  </div>
                  <div className="text-sm text-muted-foreground">Amplitude</div>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">Ranking por {metricasConfig[metricaSelecionada].label}</h4>
              {dadosExibidos
                .sort((a, b) => b.metricas[metricaSelecionada] - a.metricas[metricaSelecionada])
                .map((item, index) => (
                  <div key={item.id} className="flex items-center gap-3 p-2 rounded">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">{item.nome}</div>
                    <div className="font-semibold">
                      {metricasConfig[metricaSelecionada].formato(item.metricas[metricaSelecionada])}
                    </div>
                  </div>
                ))
              }
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

// Componente para comparação rápida entre dois itens
interface QuickComparisonProps {
  item1: DadosComparacao
  item2: DadosComparacao
  metrica?: MetricaComparacao
  className?: string
}

export function QuickComparison({
  item1,
  item2,
  metrica = 'pontuacao',
  className,
}: QuickComparisonProps) {
  const config = metricasConfig[metrica]
  const valor1 = item1.metricas[metrica]
  const valor2 = item2.metricas[metrica]
  const diferenca = valor1 - valor2
  const percentualDiferenca = valor2 !== 0 ? (diferenca / valor2) * 100 : 0
  
  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <config.icon className="h-5 w-5" />
          Comparação: {config.label}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold text-blue-600">
              {config.formato(valor1)}
            </div>
            <div className="font-medium">{item1.nome}</div>
            {item1.detalhes?.cargo && (
              <div className="text-sm text-muted-foreground">{item1.detalhes.cargo}</div>
            )}
          </div>
          
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold text-green-600">
              {config.formato(valor2)}
            </div>
            <div className="font-medium">{item2.nome}</div>
            {item2.detalhes?.cargo && (
              <div className="text-sm text-muted-foreground">{item2.detalhes.cargo}</div>
            )}
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
          <div className="text-lg font-semibold">
            Diferença: {config.formato(Math.abs(diferenca))}
          </div>
          <div className={cn(
            'text-sm font-medium',
            diferenca > 0 ? 'text-blue-600' : diferenca < 0 ? 'text-green-600' : 'text-gray-600'
          )}>
            {diferenca > 0 
              ? `${item1.nome} está ${percentualDiferenca.toFixed(1)}% à frente`
              : diferenca < 0
              ? `${item2.nome} está ${Math.abs(percentualDiferenca).toFixed(1)}% à frente`
              : 'Empate'
            }
          </div>
        </div>
      </CardContent>
    </Card>
  )
}