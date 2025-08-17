'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
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
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Cpu,
  HardDrive,
  MemoryStick,
  Network,
  Database,
  Server,
  Globe,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  EyeOff,
  Settings,
  Bell,
  BellOff,
  Play,
  Pause,
  Square,
  RefreshCw,
  Download,
  Upload,
  Wifi,
  WifiOff,
  Shield,
  ShieldAlert,
  Users,
  FileText,
  BarChart3,
  LineChart,
  PieChart,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Calendar,
  Timer,
  MapPin,
  Info,
  AlertCircle,
  CheckCircle2,
  XOctagon,
  Thermometer,
  Gauge,
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium,
  Layers,
  Cloud,
  CloudOff,
  Lock,
  Unlock,
  Key,
  Search,
  Filter,
  MoreHorizontal,
  ExternalLink,
  Home,
  Building,
  MapIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, formatDistanceToNow, subMinutes, subHours, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts'

type StatusSistema = 'online' | 'offline' | 'manutencao' | 'degradado' | 'critico'

type TipoMetrica = 'cpu' | 'memoria' | 'disco' | 'rede' | 'database' | 'api' | 'usuarios' | 'custom'

type SeveridadeAlerta = 'info' | 'warning' | 'error' | 'critical'

type TipoAlerta = 'threshold' | 'anomaly' | 'downtime' | 'security' | 'performance' | 'custom'

interface MetricaSistema {
  id: string
  nome: string
  tipo: TipoMetrica
  valor_atual: number
  valor_anterior: number
  unidade: string
  limite_warning: number
  limite_critical: number
  status: 'normal' | 'warning' | 'critical'
  tendencia: 'up' | 'down' | 'stable'
  timestamp: Date
  historico: {
    timestamp: Date
    valor: number
  }[]
  metadata: {
    descricao?: string
    categoria?: string
    fonte?: string
    intervalo_coleta?: number
    precisao?: number
  }
}

interface AlertaSistema {
  id: string
  titulo: string
  descricao: string
  severidade: SeveridadeAlerta
  tipo: TipoAlerta
  status: 'ativo' | 'resolvido' | 'silenciado' | 'reconhecido'
  metrica_id?: string
  valor_trigger?: number
  condicao?: string
  criado_em: Date
  resolvido_em?: Date
  reconhecido_em?: Date
  reconhecido_por?: string
  silenciado_ate?: Date
  acoes_tomadas: {
    timestamp: Date
    acao: string
    usuario: string
    detalhes?: string
  }[]
  impacto: {
    usuarios_afetados?: number
    servicos_afetados?: string[]
    tempo_inatividade?: number
    perda_estimada?: number
  }
  localizacao?: {
    servidor?: string
    datacenter?: string
    regiao?: string
    ip?: string
  }
  metadata: Record<string, any>
}

interface StatusServico {
  id: string
  nome: string
  tipo: 'api' | 'database' | 'cache' | 'queue' | 'storage' | 'external' | 'custom'
  status: StatusSistema
  url?: string
  versao?: string
  uptime: number
  tempo_resposta: number
  ultima_verificacao: Date
  proxima_verificacao: Date
  historico_status: {
    timestamp: Date
    status: StatusSistema
    tempo_resposta?: number
    erro?: string
  }[]
  dependencias: string[]
  configuracao: {
    intervalo_verificacao: number
    timeout: number
    tentativas: number
    endpoint_health?: string
    metodo_verificacao: 'http' | 'tcp' | 'ping' | 'custom'
  }
  metricas: {
    disponibilidade_24h: number
    disponibilidade_7d: number
    disponibilidade_30d: number
    tempo_resposta_medio: number
    total_requests_24h: number
    erro_rate_24h: number
  }
}

interface EstatisticasMonitoramento {
  total_metricas: number
  metricas_normais: number
  metricas_warning: number
  metricas_critical: number
  total_alertas: number
  alertas_ativos: number
  alertas_resolvidos_24h: number
  tempo_medio_resolucao: number
  disponibilidade_geral: number
  tempo_resposta_medio: number
  usuarios_online: number
  pico_usuarios_24h: number
  throughput_atual: number
  uso_recursos: {
    cpu: number
    memoria: number
    disco: number
    rede: number
  }
  tendencias: {
    cpu: 'up' | 'down' | 'stable'
    memoria: 'up' | 'down' | 'stable'
    usuarios: 'up' | 'down' | 'stable'
    performance: 'up' | 'down' | 'stable'
  }
  incidentes_mes: {
    total: number
    resolvidos: number
    tempo_medio_resolucao: number
    impacto_total: number
  }
}

interface MonitoringSystemProps {
  metricas?: MetricaSistema[]
  alertas?: AlertaSistema[]
  servicos?: StatusServico[]
  estatisticas?: EstatisticasMonitoramento
  autoRefresh?: boolean
  refreshInterval?: number
  loading?: boolean
  onReconhecerAlerta?: (alerta_id: string) => Promise<void>
  onSilenciarAlerta?: (alerta_id: string, duracao: number) => Promise<void>
  onResolverAlerta?: (alerta_id: string, resolucao: string) => Promise<void>
  onReiniciarServico?: (servico_id: string) => Promise<void>
  onExportarDados?: (tipo: 'metricas' | 'alertas' | 'servicos', periodo: string) => Promise<void>
  onConfigurarAlerta?: (metrica_id: string, configuracao: any) => Promise<void>
  className?: string
}

const statusCores = {
  online: 'bg-green-100 text-green-800',
  offline: 'bg-red-100 text-red-800',
  manutencao: 'bg-yellow-100 text-yellow-800',
  degradado: 'bg-orange-100 text-orange-800',
  critico: 'bg-red-100 text-red-800',
}

const severidadeCores = {
  info: 'bg-blue-100 text-blue-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
}

const tiposMetrica = [
  { valor: 'cpu', label: 'CPU', icone: Cpu, unidade: '%' },
  { valor: 'memoria', label: 'Memória', icone: MemoryStick, unidade: '%' },
  { valor: 'disco', label: 'Disco', icone: HardDrive, unidade: '%' },
  { valor: 'rede', label: 'Rede', icone: Network, unidade: 'Mbps' },
  { valor: 'database', label: 'Database', icone: Database, unidade: 'ms' },
  { valor: 'api', label: 'API', icone: Globe, unidade: 'ms' },
  { valor: 'usuarios', label: 'Usuários', icone: Users, unidade: 'count' },
  { valor: 'custom', label: 'Personalizada', icone: Settings, unidade: 'custom' },
]

const tiposServico = [
  { valor: 'api', label: 'API', icone: Globe },
  { valor: 'database', label: 'Database', icone: Database },
  { valor: 'cache', label: 'Cache', icone: Zap },
  { valor: 'queue', label: 'Queue', icone: Layers },
  { valor: 'storage', label: 'Storage', icone: HardDrive },
  { valor: 'external', label: 'Externo', icone: ExternalLink },
  { valor: 'custom', label: 'Personalizado', icone: Settings },
]

// Componente para exibir uma métrica individual
function MetricaCard({ metrica }: { metrica: MetricaSistema }) {
  const tipoMetrica = tiposMetrica.find(t => t.valor === metrica.tipo)
  const porcentagemUso = metrica.limite_critical > 0 ? (metrica.valor_atual / metrica.limite_critical) * 100 : 0
  
  const getTendenciaIcon = () => {
    switch (metrica.tendencia) {
      case 'up': return <TrendingUp className="h-4 w-4 text-red-500" />
      case 'down': return <TrendingDown className="h-4 w-4 text-green-500" />
      default: return <Minus className="h-4 w-4 text-gray-500" />
    }
  }
  
  const getStatusColor = () => {
    switch (metrica.status) {
      case 'critical': return 'text-red-600'
      case 'warning': return 'text-yellow-600'
      default: return 'text-green-600'
    }
  }
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {tipoMetrica && <tipoMetrica.icone className="h-4 w-4" />}
            <span className="font-medium text-sm">{metrica.nome}</span>
          </div>
          {getTendenciaIcon()}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className={cn('text-2xl font-bold', getStatusColor())}>
              {metrica.valor_atual.toFixed(1)}
            </span>
            <span className="text-sm text-muted-foreground">{metrica.unidade}</span>
          </div>
          
          {metrica.limite_critical > 0 && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Uso</span>
                <span>{porcentagemUso.toFixed(1)}%</span>
              </div>
              <Progress 
                value={porcentagemUso} 
                className={cn(
                  'h-2',
                  metrica.status === 'critical' && 'bg-red-100',
                  metrica.status === 'warning' && 'bg-yellow-100'
                )}
              />
            </div>
          )}
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Anterior: {metrica.valor_anterior.toFixed(1)}</span>
            <span>{format(metrica.timestamp, 'HH:mm:ss')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Componente para exibir alertas
function AlertaItem({ alerta, onReconhecer, onSilenciar, onResolver }: {
  alerta: AlertaSistema
  onReconhecer?: (id: string) => void
  onSilenciar?: (id: string) => void
  onResolver?: (id: string) => void
}) {
  const getSeveridadeIcon = () => {
    switch (alerta.severidade) {
      case 'critical': return <XOctagon className="h-4 w-4" />
      case 'error': return <XCircle className="h-4 w-4" />
      case 'warning': return <AlertTriangle className="h-4 w-4" />
      default: return <Info className="h-4 w-4" />
    }
  }
  
  const getStatusIcon = () => {
    switch (alerta.status) {
      case 'resolvido': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'silenciado': return <BellOff className="h-4 w-4 text-gray-600" />
      case 'reconhecido': return <Eye className="h-4 w-4 text-blue-600" />
      default: return <Bell className="h-4 w-4 text-red-600" />
    }
  }
  
  return (
    <Card className={cn(
      'border-l-4',
      alerta.severidade === 'critical' && 'border-l-red-500',
      alerta.severidade === 'error' && 'border-l-orange-500',
      alerta.severidade === 'warning' && 'border-l-yellow-500',
      alerta.severidade === 'info' && 'border-l-blue-500'
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getSeveridadeIcon()}
              <h3 className="font-semibold">{alerta.titulo}</h3>
              <Badge className={severidadeCores[alerta.severidade]}>
                {alerta.severidade.toUpperCase()}
              </Badge>
              {getStatusIcon()}
            </div>
            
            <p className="text-sm text-muted-foreground mb-3">{alerta.descricao}</p>
            
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-medium">Criado:</span> {formatDistanceToNow(alerta.criado_em, { addSuffix: true, locale: ptBR })}
              </div>
              
              {alerta.impacto.usuarios_afetados && (
                <div>
                  <span className="font-medium">Usuários afetados:</span> {alerta.impacto.usuarios_afetados.toLocaleString()}
                </div>
              )}
              
              {alerta.localizacao?.servidor && (
                <div>
                  <span className="font-medium">Servidor:</span> {alerta.localizacao.servidor}
                </div>
              )}
              
              {alerta.valor_trigger && (
                <div>
                  <span className="font-medium">Valor trigger:</span> {alerta.valor_trigger}
                </div>
              )}
            </div>
            
            {alerta.impacto.servicos_afetados && alerta.impacto.servicos_afetados.length > 0 && (
              <div className="mt-2">
                <span className="text-xs font-medium">Serviços afetados:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {alerta.impacto.servicos_afetados.map(servico => (
                    <Badge key={servico} variant="outline" className="text-xs">
                      {servico}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {alerta.status === 'ativo' && onReconhecer && (
              <Button 
                onClick={() => onReconhecer(alerta.id)}
                size="sm"
                variant="outline"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            
            {alerta.status === 'ativo' && onSilenciar && (
              <Button 
                onClick={() => onSilenciar(alerta.id)}
                size="sm"
                variant="outline"
              >
                <BellOff className="h-4 w-4" />
              </Button>
            )}
            
            {['ativo', 'reconhecido'].includes(alerta.status) && onResolver && (
              <Button 
                onClick={() => onResolver(alerta.id)}
                size="sm"
                variant="outline"
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Componente para exibir status de serviços
function ServicoStatus({ servico, onReiniciar }: {
  servico: StatusServico
  onReiniciar?: (id: string) => void
}) {
  const tipoServico = tiposServico.find(t => t.valor === servico.tipo)
  
  const getStatusIcon = () => {
    switch (servico.status) {
      case 'online': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'offline': return <XCircle className="h-4 w-4 text-red-600" />
      case 'degradado': return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case 'manutencao': return <Settings className="h-4 w-4 text-yellow-600" />
      default: return <XOctagon className="h-4 w-4 text-red-600" />
    }
  }
  
  const formatarUptime = (segundos: number) => {
    const dias = Math.floor(segundos / 86400)
    const horas = Math.floor((segundos % 86400) / 3600)
    const minutos = Math.floor((segundos % 3600) / 60)
    
    if (dias > 0) {
      return `${dias}d ${horas}h ${minutos}m`
    } else if (horas > 0) {
      return `${horas}h ${minutos}m`
    } else {
      return `${minutos}m`
    }
  }
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {tipoServico && <tipoServico.icone className="h-4 w-4" />}
            <span className="font-medium">{servico.nome}</span>
            {getStatusIcon()}
          </div>
          
          <Badge className={statusCores[servico.status]}>
            {servico.status.toUpperCase()}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Uptime:</span> {formatarUptime(servico.uptime)}
          </div>
          
          <div>
            <span className="font-medium">Resposta:</span> {servico.tempo_resposta}ms
          </div>
          
          <div>
            <span className="font-medium">Disponibilidade 24h:</span> {servico.metricas.disponibilidade_24h.toFixed(2)}%
          </div>
          
          <div>
            <span className="font-medium">Taxa de erro:</span> {servico.metricas.erro_rate_24h.toFixed(2)}%
          </div>
        </div>
        
        {servico.versao && (
          <div className="text-xs text-muted-foreground mt-2">
            Versão: {servico.versao}
          </div>
        )}
        
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-muted-foreground">
            Última verificação: {format(servico.ultima_verificacao, 'HH:mm:ss')}
          </span>
          
          {onReiniciar && servico.status !== 'online' && (
            <Button 
              onClick={() => onReiniciar(servico.id)}
              size="sm"
              variant="outline"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Componente principal do sistema de monitoramento
export function MonitoringSystem({
  metricas = [],
  alertas = [],
  servicos = [],
  estatisticas,
  autoRefresh = true,
  refreshInterval = 30000,
  loading = false,
  onReconhecerAlerta,
  onSilenciarAlerta,
  onResolverAlerta,
  onReiniciarServico,
  onExportarDados,
  onConfigurarAlerta,
  className,
}: MonitoringSystemProps) {
  const [abaSelecionada, setAbaSelecionada] = useState<'overview' | 'metricas' | 'alertas' | 'servicos'>('overview')
  const [filtroSeveridade, setFiltroSeveridade] = useState<SeveridadeAlerta | 'all'>('all')
  const [filtroStatus, setFiltroStatus] = useState<'ativo' | 'resolvido' | 'all'>('all')
  const [autoRefreshAtivo, setAutoRefreshAtivo] = useState(autoRefresh)
  
  // Auto refresh
  useEffect(() => {
    if (!autoRefreshAtivo) return
    
    const interval = setInterval(() => {
      // Aqui você chamaria a função para recarregar os dados
      console.log('Atualizando dados do monitoramento...')
    }, refreshInterval)
    
    return () => clearInterval(interval)
  }, [autoRefreshAtivo, refreshInterval])
  
  const alertasFiltrados = useMemo(() => {
    return alertas.filter(alerta => {
      if (filtroSeveridade !== 'all' && alerta.severidade !== filtroSeveridade) return false
      if (filtroStatus !== 'all' && alerta.status !== filtroStatus) return false
      return true
    })
  }, [alertas, filtroSeveridade, filtroStatus])
  
  const alertasAtivos = useMemo(() => {
    return alertas.filter(a => a.status === 'ativo')
  }, [alertas])
  
  const servicosOffline = useMemo(() => {
    return servicos.filter(s => s.status === 'offline' || s.status === 'critico')
  }, [servicos])
  
  const metricasCriticas = useMemo(() => {
    return metricas.filter(m => m.status === 'critical')
  }, [metricas])
  
  // Dados para gráficos
  const dadosGraficoCpu = useMemo(() => {
    const metricaCpu = metricas.find(m => m.tipo === 'cpu')
    if (!metricaCpu) return []
    
    return metricaCpu.historico.slice(-20).map(item => ({
      timestamp: format(item.timestamp, 'HH:mm'),
      valor: item.valor,
    }))
  }, [metricas])
  
  const dadosGraficoMemoria = useMemo(() => {
    const metricaMemoria = metricas.find(m => m.tipo === 'memoria')
    if (!metricaMemoria) return []
    
    return metricaMemoria.historico.slice(-20).map(item => ({
      timestamp: format(item.timestamp, 'HH:mm'),
      valor: item.valor,
    }))
  }, [metricas])
  
  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monitoramento do Sistema</h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe métricas, alertas e status dos serviços em tempo real
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="auto-refresh" className="text-sm">
              Auto-refresh
            </Label>
            <Switch
              id="auto-refresh"
              checked={autoRefreshAtivo}
              onCheckedChange={setAutoRefreshAtivo}
            />
          </div>
          
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          
          {onExportarDados && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onExportarDados('metricas', '24h')}>
                  Métricas (24h)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExportarDados('alertas', '7d')}>
                  Alertas (7 dias)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExportarDados('servicos', '30d')}>
                  Serviços (30 dias)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      
      {/* Alertas críticos */}
      {alertasAtivos.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertas Ativos ({alertasAtivos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alertasAtivos.slice(0, 3).map(alerta => (
                <div key={alerta.id} className="flex items-center justify-between bg-white p-3 rounded border">
                  <div>
                    <span className="font-medium text-sm">{alerta.titulo}</span>
                    <p className="text-xs text-muted-foreground">{alerta.descricao}</p>
                  </div>
                  <Badge className={severidadeCores[alerta.severidade]}>
                    {alerta.severidade.toUpperCase()}
                  </Badge>
                </div>
              ))}
              
              {alertasAtivos.length > 3 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setAbaSelecionada('alertas')}
                  className="w-full"
                >
                  Ver todos os {alertasAtivos.length} alertas
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Estatísticas rápidas */}
      {estatisticas && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Disponibilidade</p>
                  <p className="text-2xl font-bold text-green-600">{estatisticas.disponibilidade_geral.toFixed(2)}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Usuários Online</p>
                  <p className="text-2xl font-bold">{estatisticas.usuarios_online.toLocaleString()}</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tempo Resposta</p>
                  <p className="text-2xl font-bold">{estatisticas.tempo_resposta_medio}ms</p>
                </div>
                <Zap className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Alertas Ativos</p>
                  <p className="text-2xl font-bold text-red-600">{estatisticas.alertas_ativos}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Abas principais */}
      <div className="border-b">
        <nav className="flex space-x-8">
          <button
            onClick={() => setAbaSelecionada('overview')}
            className={cn(
              'py-2 px-1 border-b-2 font-medium text-sm',
              abaSelecionada === 'overview'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
            )}
          >
            Visão Geral
          </button>
          
          <button
            onClick={() => setAbaSelecionada('metricas')}
            className={cn(
              'py-2 px-1 border-b-2 font-medium text-sm',
              abaSelecionada === 'metricas'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
            )}
          >
            Métricas ({metricas.length})
          </button>
          
          <button
            onClick={() => setAbaSelecionada('alertas')}
            className={cn(
              'py-2 px-1 border-b-2 font-medium text-sm',
              abaSelecionada === 'alertas'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
            )}
          >
            Alertas ({alertas.length})
          </button>
          
          <button
            onClick={() => setAbaSelecionada('servicos')}
            className={cn(
              'py-2 px-1 border-b-2 font-medium text-sm',
              abaSelecionada === 'servicos'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
            )}
          >
            Serviços ({servicos.length})
          </button>
        </nav>
      </div>
      
      {/* Conteúdo das abas */}
      {abaSelecionada === 'overview' && (
        <div className="space-y-6">
          {/* Gráficos de performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  CPU Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsLineChart data={dadosGraficoCpu}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="valor" stroke="#3b82f6" strokeWidth={2} />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MemoryStick className="h-5 w-5" />
                  Memória
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={dadosGraficoMemoria}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="valor" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          {/* Resumo de recursos */}
          {estatisticas && (
            <Card>
              <CardHeader>
                <CardTitle>Uso de Recursos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <Cpu className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <div className="text-2xl font-bold">{estatisticas.uso_recursos.cpu}%</div>
                    <div className="text-sm text-muted-foreground">CPU</div>
                    <Progress value={estatisticas.uso_recursos.cpu} className="mt-2" />
                  </div>
                  
                  <div className="text-center">
                    <MemoryStick className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <div className="text-2xl font-bold">{estatisticas.uso_recursos.memoria}%</div>
                    <div className="text-sm text-muted-foreground">Memória</div>
                    <Progress value={estatisticas.uso_recursos.memoria} className="mt-2" />
                  </div>
                  
                  <div className="text-center">
                    <HardDrive className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <div className="text-2xl font-bold">{estatisticas.uso_recursos.disco}%</div>
                    <div className="text-sm text-muted-foreground">Disco</div>
                    <Progress value={estatisticas.uso_recursos.disco} className="mt-2" />
                  </div>
                  
                  <div className="text-center">
                    <Network className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                    <div className="text-2xl font-bold">{estatisticas.uso_recursos.rede}%</div>
                    <div className="text-sm text-muted-foreground">Rede</div>
                    <Progress value={estatisticas.uso_recursos.rede} className="mt-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Serviços críticos */}
          {servicosOffline.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Serviços com Problemas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {servicosOffline.map(servico => (
                    <ServicoStatus 
                      key={servico.id} 
                      servico={servico} 
                      onReiniciar={onReiniciarServico}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      
      {abaSelecionada === 'metricas' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {metricas.map(metrica => (
              <MetricaCard key={metrica.id} metrica={metrica} />
            ))}
          </div>
          
          {metricas.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Activity className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma métrica encontrada</h3>
                <p className="text-muted-foreground text-center">
                  As métricas do sistema aparecerão aqui
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      
      {abaSelecionada === 'alertas' && (
        <div className="space-y-4">
          {/* Filtros */}
          <div className="flex items-center gap-4">
            <Select value={filtroSeveridade} onValueChange={(value: any) => setFiltroSeveridade(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Severidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="critical">Crítica</SelectItem>
                <SelectItem value="error">Erro</SelectItem>
                <SelectItem value="warning">Aviso</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filtroStatus} onValueChange={(value: any) => setFiltroStatus(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="ativo">Ativos</SelectItem>
                <SelectItem value="resolvido">Resolvidos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Lista de alertas */}
          <div className="space-y-4">
            {alertasFiltrados.map(alerta => (
              <AlertaItem
                key={alerta.id}
                alerta={alerta}
                onReconhecer={onReconhecerAlerta}
                onSilenciar={(id) => onSilenciarAlerta && onSilenciarAlerta(id, 3600)}
                onResolver={onResolverAlerta}
              />
            ))}
          </div>
          
          {alertasFiltrados.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum alerta encontrado</h3>
                <p className="text-muted-foreground text-center">
                  Os alertas do sistema aparecerão aqui
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      
      {abaSelecionada === 'servicos' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {servicos.map(servico => (
              <ServicoStatus 
                key={servico.id} 
                servico={servico} 
                onReiniciar={onReiniciarServico}
              />
            ))}
          </div>
          
          {servicos.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Server className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum serviço encontrado</h3>
                <p className="text-muted-foreground text-center">
                  Os serviços monitorados aparecerão aqui
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

// Hook para gerenciar sistema de monitoramento
export function useMonitoringSystem() {
  const [metricas, setMetricas] = useState<MetricaSistema[]>([])
  const [alertas, setAlertas] = useState<AlertaSistema[]>([])
  const [servicos, setServicos] = useState<StatusServico[]>([])
  const [estatisticas, setEstatisticas] = useState<EstatisticasMonitoramento | null>(null)
  const [loading, setLoading] = useState(false)
  
  const carregarDados = useCallback(async () => {
    setLoading(true)
    try {
      const [metricasResponse, alertasResponse, servicosResponse, estatisticasResponse] = await Promise.all([
        fetch('/api/monitoring/metricas'),
        fetch('/api/monitoring/alertas'),
        fetch('/api/monitoring/servicos'),
        fetch('/api/monitoring/estatisticas'),
      ])
      
      if (metricasResponse.ok) {
        const metricasData = await metricasResponse.json()
        setMetricas(metricasData.data)
      }
      
      if (alertasResponse.ok) {
        const alertasData = await alertasResponse.json()
        setAlertas(alertasData.data)
      }
      
      if (servicosResponse.ok) {
        const servicosData = await servicosResponse.json()
        setServicos(servicosData.data)
      }
      
      if (estatisticasResponse.ok) {
        const estatisticasData = await estatisticasResponse.json()
        setEstatisticas(estatisticasData.data)
      }
    } catch (error) {
      console.error('Erro ao carregar dados do monitoramento:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])
  
  const reconhecerAlerta = useCallback(async (alerta_id: string) => {
    try {
      const response = await fetch(`/api/monitoring/alertas/${alerta_id}/reconhecer`, {
        method: 'POST',
      })
      
      if (!response.ok) {
        throw new Error('Erro ao reconhecer alerta')
      }
      
      await carregarDados()
    } catch (error) {
      console.error('Erro ao reconhecer alerta:', error)
      throw error
    }
  }, [carregarDados])
  
  const resolverAlerta = useCallback(async (alerta_id: string, resolucao: string = '') => {
    try {
      const response = await fetch(`/api/monitoring/alertas/${alerta_id}/resolver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolucao }),
      })
      
      if (!response.ok) {
        throw new Error('Erro ao resolver alerta')
      }
      
      await carregarDados()
    } catch (error) {
      console.error('Erro ao resolver alerta:', error)
      throw error
    }
  }, [carregarDados])
  
  const reiniciarServico = useCallback(async (servico_id: string) => {
    try {
      const response = await fetch(`/api/monitoring/servicos/${servico_id}/reiniciar`, {
        method: 'POST',
      })
      
      if (!response.ok) {
        throw new Error('Erro ao reiniciar serviço')
      }
      
      await carregarDados()
    } catch (error) {
      console.error('Erro ao reiniciar serviço:', error)
      throw error
    }
  }, [carregarDados])
  
  return {
    metricas,
    alertas,
    servicos,
    estatisticas,
    loading,
    carregarDados,
    reconhecerAlerta,
    resolverAlerta,
    reiniciarServico,
  }
}