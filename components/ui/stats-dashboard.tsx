'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Minus,

  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  ArrowUpRight,
  ArrowDownRight,
  Equal,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type PeriodoStats = 'hoje' | 'semana' | 'mes' | 'trimestre' | 'ano' | 'personalizado'
type TipoMetrica = 'absoluto' | 'percentual' | 'media' | 'total'

interface EstatisticaItem {
  id: string
  titulo: string
  valor: number
  valorAnterior?: number
  tipo: TipoMetrica
  unidade?: string
  icone: React.ComponentType<{ className?: string }>
  cor: string
  corFundo: string
  tendencia: 'crescente' | 'decrescente' | 'estavel'
  variacao: number // percentual
  meta?: number
  descricao?: string
  detalhes?: {
    maximo?: number
    minimo?: number
    media?: number
    total?: number
  }
}

interface DadosTemporal {
  periodo: string
  data: string
  valor: number
  meta?: number
}

interface DistribuicaoItem {
  nome: string
  valor: number
  cor: string
  percentual: number
}

interface StatsDashboardProps {
  estatisticas: EstatisticaItem[]
  dadosTemporais?: DadosTemporal[]
  distribuicoes?: {
    titulo: string
    dados: DistribuicaoItem[]
  }[]
  periodo?: PeriodoStats
  titulo?: string
  showControls?: boolean
  showTendencias?: boolean
  showMetas?: boolean
  showDetalhes?: boolean
  compacto?: boolean
  colunas?: 2 | 3 | 4 | 6
  className?: string
  onPeriodoChange?: (periodo: PeriodoStats) => void
  onExportar?: () => void
  onAtualizar?: () => void
}

const formatadores = {
  absoluto: (valor: number, unidade?: string) => `${valor.toLocaleString()}${unidade || ''}`,
  percentual: (valor: number) => `${valor.toFixed(1)}%`,
  media: (valor: number, unidade?: string) => `${valor.toFixed(1)}${unidade || ''}`,
  total: (valor: number, unidade?: string) => `${valor.toLocaleString()}${unidade || ''}`,
}

const coresStatus = {
  sucesso: {
    icone: CheckCircle,
    cor: 'text-green-600',
    fundo: 'bg-green-50',
    borda: 'border-green-200',
  },
  alerta: {
    icone: AlertCircle,
    cor: 'text-yellow-600',
    fundo: 'bg-yellow-50',
    borda: 'border-yellow-200',
  },
  erro: {
    icone: XCircle,
    cor: 'text-red-600',
    fundo: 'bg-red-50',
    borda: 'border-red-200',
  },
  neutro: {
    icone: Activity,
    cor: 'text-blue-600',
    fundo: 'bg-blue-50',
    borda: 'border-blue-200',
  },
}

export function StatsDashboard({
  estatisticas,
  dadosTemporais = [],
  distribuicoes = [],
  periodo = 'mes',
  titulo = 'Dashboard de Estatísticas',
  showControls = true,
  showTendencias = true,
  showMetas = true,
  showDetalhes = true,
  compacto = false,
  colunas = 4,
  className,
  onPeriodoChange,
  onExportar,
  onAtualizar,
}: StatsDashboardProps) {
  const [periodoSelecionado, setPeriodoSelecionado] = useState<PeriodoStats>(periodo)
  const [metricaSelecionada, setMetricaSelecionada] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const estatisticasOrdenadas = useMemo(() => {
    return [...estatisticas].sort((a, b) => {
      // Priorizar métricas com tendência crescente
      if (a.tendencia === 'crescente' && b.tendencia !== 'crescente') return -1
      if (b.tendencia === 'crescente' && a.tendencia !== 'crescente') return 1
      
      // Depois por variação
      return Math.abs(b.variacao) - Math.abs(a.variacao)
    })
  }, [estatisticas])

  const resumoGeral = useMemo(() => {
    const totalMetricas = estatisticas.length
    const metricasCrescentes = estatisticas.filter(e => e.tendencia === 'crescente').length
    const metricasDecrescentes = estatisticas.filter(e => e.tendencia === 'decrescente').length
    const metricasEstaveis = estatisticas.filter(e => e.tendencia === 'estavel').length
    
    const metasAtingidas = estatisticas.filter(e => 
      e.meta && e.valor >= e.meta
    ).length
    
    const metasTotal = estatisticas.filter(e => e.meta).length
    
    return {
      totalMetricas,
      metricasCrescentes,
      metricasDecrescentes,
      metricasEstaveis,
      metasAtingidas,
      metasTotal,
      percentualMetas: metasTotal > 0 ? (metasAtingidas / metasTotal) * 100 : 0,
    }
  }, [estatisticas])

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

  const getStatusMeta = (valor: number, meta?: number) => {
    if (!meta) return 'neutro'
    
    const percentual = (valor / meta) * 100
    
    if (percentual >= 100) return 'sucesso'
    if (percentual >= 80) return 'alerta'
    return 'erro'
  }

  const getProgressoMeta = (valor: number, meta?: number) => {
    if (!meta) return 0
    return Math.min((valor / meta) * 100, 100)
  }

  const handlePeriodoChange = (novoPeriodo: PeriodoStats) => {
    setPeriodoSelecionado(novoPeriodo)
    onPeriodoChange?.(novoPeriodo)
  }

  const handleAtualizar = async () => {
    setIsLoading(true)
    try {
      await onAtualizar?.()
    } finally {
      setIsLoading(false)
    }
  }

  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">{titulo}</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Activity className="h-4 w-4" />
            <span className="capitalize">{periodoSelecionado}</span>
            <span>•</span>
            <span>{estatisticas.length} métricas</span>
            {showMetas && resumoGeral.metasTotal > 0 && (
              <>
                <span>•</span>
                <span>{resumoGeral.metasAtingidas}/{resumoGeral.metasTotal} metas atingidas</span>
              </>
            )}
          </div>
        </div>
        
        {showControls && (
          <div className="flex items-center gap-2">
            <Select value={periodoSelecionado} onValueChange={handlePeriodoChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hoje">Hoje</SelectItem>
                <SelectItem value="semana">Semana</SelectItem>
                <SelectItem value="mes">Mês</SelectItem>
                <SelectItem value="trimestre">Trimestre</SelectItem>
                <SelectItem value="ano">Ano</SelectItem>
                <SelectItem value="personalizado">Personalizado</SelectItem>
              </SelectContent>
            </Select>
            
            {onAtualizar && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAtualizar}
                disabled={isLoading}
              >
                <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
              </Button>
            )}
            
            {onExportar && (
              <Button variant="outline" size="sm" onClick={onExportar}>
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Resumo Geral */}
      {!compacto && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {resumoGeral.totalMetricas}
              </div>
              <div className="text-sm text-muted-foreground">Total de Métricas</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {resumoGeral.metricasCrescentes}
              </div>
              <div className="text-sm text-muted-foreground">Em Crescimento</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {resumoGeral.metricasDecrescentes}
              </div>
              <div className="text-sm text-muted-foreground">Em Declínio</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {resumoGeral.percentualMetas.toFixed(0)}%
              </div>
              <div className="text-sm text-muted-foreground">Metas Atingidas</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Grid de Estatísticas */}
      <div className={cn('grid gap-4', gridCols[colunas])}>
        {estatisticasOrdenadas.map((stat) => {
          const statusMeta = getStatusMeta(stat.valor, stat.meta)
          const configStatus = coresStatus[statusMeta]
          const progressoMeta = getProgressoMeta(stat.valor, stat.meta)
          const Icon = stat.icone
          
          return (
            <Card 
              key={stat.id} 
              className={cn(
                'transition-all hover:shadow-md cursor-pointer',
                metricaSelecionada === stat.id && 'ring-2 ring-primary',
                compacto && 'p-2'
              )}
              onClick={() => setMetricaSelecionada(
                metricaSelecionada === stat.id ? null : stat.id
              )}
            >
              <CardContent className={cn('p-4', compacto && 'p-3')}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className={cn(
                        'p-2 rounded-lg',
                        configStatus.fundo,
                        configStatus.borda,
                        'border'
                      )}
                    >
                      <Icon className={cn('h-4 w-4', configStatus.cor)} />
                    </div>
                    
                    {!compacto && (
                      <div>
                        <h3 className="font-semibold text-sm">{stat.titulo}</h3>
                        {stat.descricao && (
                          <p className="text-xs text-muted-foreground">
                            {stat.descricao}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {showTendencias && (
                    <div className="flex items-center gap-1">
                      {getTendenciaIcon(stat.tendencia, stat.variacao)}
                      {getVariacaoDisplay(stat.variacao)}
                    </div>
                  )}
                </div>
                
                {compacto && (
                  <h3 className="font-semibold text-sm mb-2">{stat.titulo}</h3>
                )}
                
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className={cn(
                      'text-2xl font-bold',
                      compacto ? 'text-lg' : 'text-2xl'
                    )}>
                      {formatadores[stat.tipo](stat.valor, stat.unidade)}
                    </span>
                    
                    {stat.valorAnterior && (
                      <span className="text-sm text-muted-foreground">
                        vs {formatadores[stat.tipo](stat.valorAnterior, stat.unidade)}
                      </span>
                    )}
                  </div>
                  
                  {showMetas && stat.meta && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Meta</span>
                        <span className="font-medium">
                          {formatadores[stat.tipo](stat.meta, stat.unidade)}
                        </span>
                      </div>
                      <Progress 
                        value={progressoMeta} 
                        className={cn('h-2', compacto && 'h-1')}
                      />
                      <div className="text-xs text-muted-foreground text-right">
                        {progressoMeta.toFixed(0)}% da meta
                      </div>
                    </div>
                  )}
                  
                  {showDetalhes && stat.detalhes && metricaSelecionada === stat.id && (
                    <div className="pt-2 border-t space-y-1">
                      {stat.detalhes.maximo && (
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Máximo:</span>
                          <span>{formatadores[stat.tipo](stat.detalhes.maximo, stat.unidade)}</span>
                        </div>
                      )}
                      {stat.detalhes.minimo && (
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Mínimo:</span>
                          <span>{formatadores[stat.tipo](stat.detalhes.minimo, stat.unidade)}</span>
                        </div>
                      )}
                      {stat.detalhes.media && (
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Média:</span>
                          <span>{formatadores[stat.tipo](stat.detalhes.media, stat.unidade)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Gráficos Temporais */}
      {dadosTemporais.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Evolução Temporal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dadosTemporais}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="periodo" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  labelFormatter={(label) => `Período: ${label}`}
                  formatter={(value: number, name: string) => [
                    value.toLocaleString(),
                    name === 'valor' ? 'Valor' : 'Meta'
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey="valor" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
                {dadosTemporais.some(d => d.meta) && (
                  <Line 
                    type="monotone" 
                    dataKey="meta" 
                    stroke="#ef4444" 
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    dot={false}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Distribuições */}
      {distribuicoes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {distribuicoes.map((dist, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  {dist.titulo}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={dist.dados}
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="valor"
                        label={false}
                      >
                        {dist.dados.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.cor} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [value.toLocaleString(), 'Valor']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  <div className="space-y-2">
                    {dist.dados.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.cor }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {item.nome}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {item.valor.toLocaleString()} ({item.percentual.toFixed(1)}%)
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// Componente para estatística individual
interface StatCardProps {
  estatistica: EstatisticaItem
  showTendencia?: boolean
  showMeta?: boolean
  showDetalhes?: boolean
  compacto?: boolean
  className?: string
  onClick?: () => void
}

export function StatCard({
  estatistica,
  showTendencia = true,
  showMeta = true,
  compacto = false,
  className,
  onClick,
}: StatCardProps) {
  const statusMeta = getStatusMeta(estatistica.valor, estatistica.meta)
  const configStatus = coresStatus[statusMeta]
  const progressoMeta = getProgressoMeta(estatistica.valor, estatistica.meta)
  const Icon = estatistica.icone
  
  return (
    <Card 
      className={cn(
        'transition-all hover:shadow-md',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <CardContent className={cn('p-4', compacto && 'p-3')}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div 
              className={cn(
                'p-2 rounded-lg border',
                configStatus.fundo,
                configStatus.borda
              )}
            >
              <Icon className={cn('h-4 w-4', configStatus.cor)} />
            </div>
            
            <div>
              <h3 className="font-semibold text-sm">{estatistica.titulo}</h3>
              {estatistica.descricao && (
                <p className="text-xs text-muted-foreground">
                  {estatistica.descricao}
                </p>
              )}
            </div>
          </div>
          
          {showTendencia && (
            <div className="flex items-center gap-1">
              {getTendenciaIcon(estatistica.tendencia, estatistica.variacao)}
              {getVariacaoDisplay(estatistica.variacao)}
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className={cn(
              'font-bold',
              compacto ? 'text-lg' : 'text-2xl'
            )}>
              {formatadores[estatistica.tipo](estatistica.valor, estatistica.unidade)}
            </span>
            
            {estatistica.valorAnterior && (
              <span className="text-sm text-muted-foreground">
                vs {formatadores[estatistica.tipo](estatistica.valorAnterior, estatistica.unidade)}
              </span>
            )}
          </div>
          
          {showMeta && estatistica.meta && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Meta</span>
                <span className="font-medium">
                  {formatadores[estatistica.tipo](estatistica.meta, estatistica.unidade)}
                </span>
              </div>
              <Progress 
                value={progressoMeta} 
                className={cn('h-2', compacto && 'h-1')}
              />
              <div className="text-xs text-muted-foreground text-right">
                {progressoMeta.toFixed(0)}% da meta
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
  
  function getTendenciaIcon(tendencia: string, variacao: number) {
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
  
  function getVariacaoDisplay(variacao: number) {
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
  
  function getStatusMeta(valor: number, meta?: number) {
    if (!meta) return 'neutro'
    
    const percentual = (valor / meta) * 100
    
    if (percentual >= 100) return 'sucesso'
    if (percentual >= 80) return 'alerta'
    return 'erro'
  }
  
  function getProgressoMeta(valor: number, meta?: number) {
    if (!meta) return 0
    return Math.min((valor / meta) * 100, 100)
  }
}