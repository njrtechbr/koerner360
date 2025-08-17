'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Brush,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Activity,
  Target,
  Users,
  Calendar,
  Filter,
  Download,
  Settings,
  Maximize2,
  Minimize2,
  RefreshCw,
  Info,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUp,
  ArrowDown,
  Equal,
  Zap,
  Award,
  Star,
  Eye,
  MousePointer,
  Percent,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type TipoGrafico = 
  | 'linha' 
  | 'area' 
  | 'barra' 
  | 'pizza' 
  | 'radar' 
  | 'scatter' 
  | 'composto' 
  | 'funil'

type PeriodoTempo = 
  | '24h' 
  | '7d' 
  | '30d' 
  | '90d' 
  | '1y' 
  | 'personalizado'

type TipoMetrica = 
  | 'absoluto' 
  | 'percentual' 
  | 'media' 
  | 'total' 
  | 'taxa' 
  | 'crescimento'

type StatusTendencia = 'crescimento' | 'declinio' | 'estavel'

interface DadosGrafico {
  [key: string]: any
  timestamp?: string | Date
  data?: string | Date
}

interface ConfiguracaoMetrica {
  chave: string
  nome: string
  tipo: TipoMetrica
  cor: string
  formato?: 'numero' | 'moeda' | 'percentual' | 'tempo'
  prefixo?: string
  sufixo?: string
  decimais?: number
  meta?: number
  visivel?: boolean
  eixo?: 'esquerda' | 'direita'
}

interface ConfiguracaoGrafico {
  tipo: TipoGrafico
  titulo: string
  descricao?: string
  metricas: ConfiguracaoMetrica[]
  altura?: number
  mostrarLegenda?: boolean
  mostrarGrid?: boolean
  mostrarTooltip?: boolean
  mostrarBrush?: boolean
  animacao?: boolean
  zoom?: boolean
  referencia?: {
    linhas?: { valor: number; cor: string; label?: string }[]
    areas?: { inicio: number; fim: number; cor: string; label?: string }[]
  }
  personalizacao?: {
    corFundo?: string
    corTexto?: string
    corGrid?: string
    gradiente?: boolean
    curva?: 'linear' | 'monotone' | 'step'
  }
}

interface EstatisticaResumo {
  titulo: string
  valor: number | string
  valorAnterior?: number
  formato: 'numero' | 'moeda' | 'percentual' | 'tempo'
  tendencia?: StatusTendencia
  meta?: number
  icone?: React.ComponentType<{ className?: string }>
  cor?: string
  descricao?: string
  detalhes?: {
    label: string
    valor: string | number
  }[]
}

interface AnalyticsDashboardProps {
  dados: DadosGrafico[]
  configuracoes: ConfiguracaoGrafico[]
  estatisticas?: EstatisticaResumo[]
  periodo?: PeriodoTempo
  loading?: boolean
  erro?: string
  titulo?: string
  descricao?: string
  onPeriodoChange?: (periodo: PeriodoTempo) => void
  onExportar?: (formato: 'png' | 'pdf' | 'csv' | 'excel') => void
  onAtualizar?: () => void
  className?: string
}

const coresGrafico = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00',
  '#ff0000', '#00ffff', '#ff00ff', '#ffff00', '#0000ff'
]

const formatadores = {
  numero: (valor: number, decimais = 0) => 
    valor.toLocaleString('pt-BR', { minimumFractionDigits: decimais, maximumFractionDigits: decimais }),
  moeda: (valor: number) => 
    valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
  percentual: (valor: number, decimais = 1) => 
    `${valor.toFixed(decimais)}%`,
  tempo: (valor: number) => {
    if (valor < 60) return `${valor}s`
    if (valor < 3600) return `${Math.floor(valor / 60)}min`
    return `${Math.floor(valor / 3600)}h`
  },
}

function calcularTendencia(valorAtual: number, valorAnterior: number): StatusTendencia {
  const diferenca = ((valorAtual - valorAnterior) / valorAnterior) * 100
  if (Math.abs(diferenca) < 1) return 'estavel'
  return diferenca > 0 ? 'crescimento' : 'declinio'
}

function formatarValor(valor: number | string, formato: string, decimais = 0): string {
  if (typeof valor === 'string') return valor
  
  switch (formato) {
    case 'numero':
      return formatadores.numero(valor, decimais)
    case 'moeda':
      return formatadores.moeda(valor)
    case 'percentual':
      return formatadores.percentual(valor, decimais)
    case 'tempo':
      return formatadores.tempo(valor)
    default:
      return String(valor)
  }
}

// Componente de estatística resumida
function StatCard({ estatistica }: { estatistica: EstatisticaResumo }) {
  const Icon = estatistica.icone || Activity
  const tendenciaIcon = {
    crescimento: ArrowUp,
    declinio: ArrowDown,
    estavel: Equal,
  }
  
  const TendenciaIcon = estatistica.tendencia ? tendenciaIcon[estatistica.tendencia] : null
  
  const corTendencia = {
    crescimento: 'text-green-500',
    declinio: 'text-red-500',
    estavel: 'text-gray-500',
  }
  
  const valorFormatado = formatarValor(estatistica.valor, estatistica.formato)
  const valorAnteriorFormatado = estatistica.valorAnterior 
    ? formatarValor(estatistica.valorAnterior, estatistica.formato)
    : null
  
  const percentualMeta = estatistica.meta && typeof estatistica.valor === 'number'
    ? (estatistica.valor / estatistica.meta) * 100
    : null

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              'p-2 rounded-lg',
              estatistica.cor ? `bg-${estatistica.cor}-100 text-${estatistica.cor}-600` : 'bg-primary/10 text-primary'
            )}>
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {estatistica.titulo}
              </p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">
                  {valorFormatado}
                </p>
                {TendenciaIcon && estatistica.tendencia && (
                  <div className={cn(
                    'flex items-center gap-1',
                    corTendencia[estatistica.tendencia]
                  )}>
                    <TendenciaIcon className="h-4 w-4" />
                    {valorAnteriorFormatado && (
                      <span className="text-sm font-medium">
                        {valorAnteriorFormatado}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {percentualMeta && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Meta</p>
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      'h-full transition-all duration-300',
                      percentualMeta >= 100 ? 'bg-green-500' : 
                      percentualMeta >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                    )}
                    style={{ width: `${Math.min(percentualMeta, 100)}%` }}
                  />
                </div>
                <span className="text-sm font-medium">
                  {percentualMeta.toFixed(0)}%
                </span>
              </div>
            </div>
          )}
        </div>
        
        {estatistica.descricao && (
          <p className="text-sm text-muted-foreground mt-2">
            {estatistica.descricao}
          </p>
        )}
        
        {estatistica.detalhes && estatistica.detalhes.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-2 gap-4">
              {estatistica.detalhes.map((detalhe, index) => (
                <div key={index}>
                  <p className="text-xs text-muted-foreground">{detalhe.label}</p>
                  <p className="text-sm font-medium">{detalhe.valor}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Componente de gráfico customizável
function ChartComponent({ 
  configuracao, 
  dados, 
  altura = 300 
}: { 
  configuracao: ConfiguracaoGrafico
  dados: DadosGrafico[]
  altura?: number
}) {
  const metricasVisiveis = configuracao.metricas.filter(m => m.visivel !== false)
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null
    
    return (
      <div className="bg-background border rounded-lg shadow-lg p-3">
        <p className="font-medium mb-2">{label}</p>
        {payload.map((entry: any, index: number) => {
          const metrica = metricasVisiveis.find(m => m.chave === entry.dataKey)
          if (!metrica) return null
          
          return (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm">
                {metrica.nome}: {formatarValor(entry.value, metrica.formato || 'numero', metrica.decimais)}
              </span>
            </div>
          )
        })}
      </div>
    )
  }
  
  const renderGrafico = () => {
    const props = {
      data: dados,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    }
    
    switch (configuracao.tipo) {
      case 'linha':
        return (
          <LineChart {...props}>
            {configuracao.mostrarGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey="data" />
            <YAxis />
            {configuracao.mostrarTooltip && <Tooltip content={<CustomTooltip />} />}
            {configuracao.mostrarLegenda && <Legend />}
            {metricasVisiveis.map((metrica, index) => (
              <Line
                key={metrica.chave}
                type={configuracao.personalizacao?.curva || 'monotone'}
                dataKey={metrica.chave}
                stroke={metrica.cor || coresGrafico[index % coresGrafico.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                animationDuration={configuracao.animacao ? 1000 : 0}
              />
            ))}
            {configuracao.referencia?.linhas?.map((linha, index) => (
              <ReferenceLine
                key={index}
                y={linha.valor}
                stroke={linha.cor}
                strokeDasharray="5 5"
                label={linha.label}
              />
            ))}
            {configuracao.mostrarBrush && <Brush />}
          </LineChart>
        )
        
      case 'area':
        return (
          <AreaChart {...props}>
            {configuracao.mostrarGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey="data" />
            <YAxis />
            {configuracao.mostrarTooltip && <Tooltip content={<CustomTooltip />} />}
            {configuracao.mostrarLegenda && <Legend />}
            {metricasVisiveis.map((metrica, index) => (
              <Area
                key={metrica.chave}
                type={configuracao.personalizacao?.curva || 'monotone'}
                dataKey={metrica.chave}
                stackId="1"
                stroke={metrica.cor || coresGrafico[index % coresGrafico.length]}
                fill={metrica.cor || coresGrafico[index % coresGrafico.length]}
                fillOpacity={0.6}
                animationDuration={configuracao.animacao ? 1000 : 0}
              />
            ))}
            {configuracao.mostrarBrush && <Brush />}
          </AreaChart>
        )
        
      case 'barra':
        return (
          <BarChart {...props}>
            {configuracao.mostrarGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey="data" />
            <YAxis />
            {configuracao.mostrarTooltip && <Tooltip content={<CustomTooltip />} />}
            {configuracao.mostrarLegenda && <Legend />}
            {metricasVisiveis.map((metrica, index) => (
              <Bar
                key={metrica.chave}
                dataKey={metrica.chave}
                fill={metrica.cor || coresGrafico[index % coresGrafico.length]}
                animationDuration={configuracao.animacao ? 1000 : 0}
              />
            ))}
          </BarChart>
        )
        
      case 'pizza':
        const dadosPizza = metricasVisiveis.map((metrica, index) => ({
          name: metrica.nome,
          value: dados.reduce((acc, item) => acc + (item[metrica.chave] || 0), 0),
          fill: metrica.cor || coresGrafico[index % coresGrafico.length],
        }))
        
        return (
          <PieChart>
            <Pie
              data={dadosPizza}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              animationDuration={configuracao.animacao ? 1000 : 0}
            >
              {dadosPizza.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            {configuracao.mostrarTooltip && <Tooltip />}
            {configuracao.mostrarLegenda && <Legend />}
          </PieChart>
        )
        
      case 'radar':
        return (
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={dados}>
            <PolarGrid />
            <PolarAngleAxis dataKey="data" />
            <PolarRadiusAxis />
            {metricasVisiveis.map((metrica, index) => (
              <Radar
                key={metrica.chave}
                name={metrica.nome}
                dataKey={metrica.chave}
                stroke={metrica.cor || coresGrafico[index % coresGrafico.length]}
                fill={metrica.cor || coresGrafico[index % coresGrafico.length]}
                fillOpacity={0.6}
                animationDuration={configuracao.animacao ? 1000 : 0}
              />
            ))}
            {configuracao.mostrarTooltip && <Tooltip />}
            {configuracao.mostrarLegenda && <Legend />}
          </RadarChart>
        )
        
      case 'scatter':
        return (
          <ScatterChart {...props}>
            {configuracao.mostrarGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey="data" />
            <YAxis />
            {configuracao.mostrarTooltip && <Tooltip content={<CustomTooltip />} />}
            {configuracao.mostrarLegenda && <Legend />}
            {metricasVisiveis.map((metrica, index) => (
              <Scatter
                key={metrica.chave}
                name={metrica.nome}
                data={dados.map(item => ({ x: item.data, y: item[metrica.chave] }))}
                fill={metrica.cor || coresGrafico[index % coresGrafico.length]}
              />
            ))}
          </ScatterChart>
        )
        
      case 'composto':
        return (
          <ComposedChart {...props}>
            {configuracao.mostrarGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey="data" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            {configuracao.mostrarTooltip && <Tooltip content={<CustomTooltip />} />}
            {configuracao.mostrarLegenda && <Legend />}
            {metricasVisiveis.map((metrica, index) => {
              if (index % 2 === 0) {
                return (
                  <Bar
                    key={metrica.chave}
                    yAxisId={metrica.eixo || 'left'}
                    dataKey={metrica.chave}
                    fill={metrica.cor || coresGrafico[index % coresGrafico.length]}
                  />
                )
              } else {
                return (
                  <Line
                    key={metrica.chave}
                    yAxisId={metrica.eixo || 'right'}
                    type="monotone"
                    dataKey={metrica.chave}
                    stroke={metrica.cor || coresGrafico[index % coresGrafico.length]}
                    strokeWidth={2}
                  />
                )
              }
            })}
          </ComposedChart>
        )
        
      default:
        return <div>Tipo de gráfico não suportado</div>
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{configuracao.titulo}</CardTitle>
            {configuracao.descricao && (
              <p className="text-sm text-muted-foreground mt-1">
                {configuracao.descricao}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {metricasVisiveis.map((metrica, index) => (
              <Badge 
                key={metrica.chave}
                variant="outline"
                style={{ borderColor: metrica.cor || coresGrafico[index % coresGrafico.length] }}
              >
                <div 
                  className="w-2 h-2 rounded-full mr-2"
                  style={{ backgroundColor: metrica.cor || coresGrafico[index % coresGrafico.length] }}
                />
                {metrica.nome}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div style={{ height: altura }}>
          <ResponsiveContainer width="100%" height="100%">
            {renderGrafico()}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

// Componente principal do dashboard
export function AnalyticsDashboard({
  dados,
  configuracoes,
  estatisticas = [],
  periodo = '30d',
  loading = false,
  erro,
  titulo = 'Analytics Dashboard',
  descricao,
  onPeriodoChange,
  onExportar,
  onAtualizar,
  className,
}: AnalyticsDashboardProps) {
  const [graficoExpandido, setGraficoExpandido] = useState<string | null>(null)
  const [metricasVisiveis, setMetricasVisiveis] = useState<Record<string, boolean>>({})
  
  const periodosDisponiveis = [
    { valor: '24h', label: 'Últimas 24h' },
    { valor: '7d', label: 'Últimos 7 dias' },
    { valor: '30d', label: 'Últimos 30 dias' },
    { valor: '90d', label: 'Últimos 90 dias' },
    { valor: '1y', label: 'Último ano' },
  ]
  
  const toggleMetricaVisibilidade = useCallback((configuracaoId: string, metricaChave: string) => {
    setMetricasVisiveis(prev => ({
      ...prev,
      [`${configuracaoId}-${metricaChave}`]: !prev[`${configuracaoId}-${metricaChave}`]
    }))
  }, [])
  
  if (erro) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Erro ao carregar analytics</h3>
          <p className="text-muted-foreground text-center mb-4">{erro}</p>
          {onAtualizar && (
            <Button onClick={onAtualizar} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar Novamente
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }
  
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{titulo}</h1>
          {descricao && (
            <p className="text-muted-foreground mt-1">{descricao}</p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Seletor de período */}
          {onPeriodoChange && (
            <Select value={periodo} onValueChange={onPeriodoChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periodosDisponiveis.map(p => (
                  <SelectItem key={p.valor} value={p.valor}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          {/* Exportar */}
          {onExportar && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onExportar('png')}>
                  Exportar como PNG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExportar('pdf')}>
                  Exportar como PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExportar('csv')}>
                  Exportar dados CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExportar('excel')}>
                  Exportar dados Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {/* Atualizar */}
          {onAtualizar && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onAtualizar}
              disabled={loading}
            >
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            </Button>
          )}
        </div>
      </div>
      
      {/* Estatísticas resumidas */}
      {estatisticas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {estatisticas.map((estatistica, index) => (
            <StatCard key={index} estatistica={estatistica} />
          ))}
        </div>
      )}
      
      {/* Gráficos */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="flex items-center justify-center h-80">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Carregando gráfico...
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className={cn(
          'grid gap-6',
          graficoExpandido ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'
        )}>
          {configuracoes.map((config, index) => {
            const configComMetricasVisiveis = {
              ...config,
              metricas: config.metricas.map(metrica => ({
                ...metrica,
                visivel: metricasVisiveis[`${index}-${metrica.chave}`] !== false
              }))
            }
            
            return (
              <div key={index} className={cn(
                graficoExpandido === `chart-${index}` && 'col-span-full'
              )}>
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 z-10"
                    onClick={() => setGraficoExpandido(
                      graficoExpandido === `chart-${index}` ? null : `chart-${index}`
                    )}
                  >
                    {graficoExpandido === `chart-${index}` ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Maximize2 className="h-4 w-4" />
                    )}
                  </Button>
                  
                  <ChartComponent
                    configuracao={configComMetricasVisiveis}
                    dados={dados}
                    altura={graficoExpandido === `chart-${index}` ? 500 : config.altura || 300}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
      
      {/* Configurações de métricas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações de Métricas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {configuracoes.map((config, configIndex) => (
              <div key={configIndex}>
                <h4 className="font-semibold mb-2">{config.titulo}</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {config.metricas.map((metrica, metricaIndex) => {
                    const chaveVisibilidade = `${configIndex}-${metrica.chave}`
                    const visivel = metricasVisiveis[chaveVisibilidade] !== false
                    
                    return (
                      <Button
                        key={metrica.chave}
                        variant={visivel ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleMetricaVisibilidade(String(configIndex), metrica.chave)}
                        className="justify-start"
                      >
                        <div 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ 
                            backgroundColor: visivel 
                              ? (metrica.cor || coresGrafico[metricaIndex % coresGrafico.length])
                              : 'transparent',
                            border: `2px solid ${metrica.cor || coresGrafico[metricaIndex % coresGrafico.length]}`
                          }}
                        />
                        {metrica.nome}
                      </Button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Hook para gerenciar dados de analytics
export function useAnalytics({
  endpoint,
  periodo = '30d',
  atualizacaoAutomatica = false,
  intervaloAtualizacao = 300000, // 5 minutos
}: {
  endpoint: string
  periodo?: PeriodoTempo
  atualizacaoAutomatica?: boolean
  intervaloAtualizacao?: number
} = { endpoint: '' }) {
  const [dados, setDados] = useState<DadosGrafico[]>([])
  const [estatisticas, setEstatisticas] = useState<EstatisticaResumo[]>([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  
  const carregarDados = useCallback(async () => {
    if (!endpoint) return
    
    setLoading(true)
    setErro(null)
    
    try {
      const response = await fetch(`${endpoint}?periodo=${periodo}`)
      if (!response.ok) {
        throw new Error('Erro ao carregar dados de analytics')
      }
      
      const resultado = await response.json()
      setDados(resultado.dados || [])
      setEstatisticas(resultado.estatisticas || [])
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [endpoint, periodo])
  
  // Carregar dados iniciais
  useState(() => {
    carregarDados()
  })
  
  // Atualização automática
  useState(() => {
    if (!atualizacaoAutomatica) return
    
    const intervalo = setInterval(carregarDados, intervaloAtualizacao)
    return () => clearInterval(intervalo)
  })
  
  return {
    dados,
    estatisticas,
    loading,
    erro,
    recarregar: carregarDados,
  }
}