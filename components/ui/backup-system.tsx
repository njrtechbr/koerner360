'use client'

import { useState, useCallback, useMemo } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
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
  Archive,
  Download,
  Upload,
  RefreshCw,
  Calendar,
  Clock,
  HardDrive,
  Database,
  FileText,
  Settings,
  Play,
  Pause,
  Square,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Trash2,
  Eye,
  Copy,
  Share2,
  Shield,
  Lock,
  Unlock,
  Server,
  Cloud,
  CloudDownload,
  CloudUpload,
  Folder,
  FolderOpen,
  File,
  Zap,
  Activity,
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Timer,
  RotateCcw,
  History,
  Plus,
  Minus,
  Search,
  Filter,
  MoreHorizontal,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type TipoBackup = 'completo' | 'incremental' | 'diferencial' | 'manual'

type StatusBackup = 'pendente' | 'executando' | 'concluido' | 'falha' | 'cancelado' | 'pausado'

type TipoArmazenamento = 'local' | 'cloud' | 's3' | 'ftp' | 'sftp'

type PrioridadeBackup = 'baixa' | 'normal' | 'alta' | 'critica'

interface ConfiguracaoBackup {
  id: string
  nome: string
  descricao?: string
  tipo: TipoBackup
  prioridade: PrioridadeBackup
  ativo: boolean
  agendamento: {
    frequencia: 'diario' | 'semanal' | 'mensal' | 'personalizado'
    hora: string
    dias_semana?: number[]
    dia_mes?: number
    cron_expression?: string
  }
  destinos: {
    tipo: TipoArmazenamento
    configuracao: Record<string, unknown>
    ativo: boolean
    prioridade: number
  }[]
  incluir: {
    banco_dados: boolean
    arquivos_sistema: boolean
    uploads_usuarios: boolean
    logs: boolean
    configuracoes: boolean
    custom_paths?: string[]
  }
  excluir: {
    arquivos_temporarios: boolean
    cache: boolean
    logs_antigos: boolean
    custom_patterns?: string[]
  }
  retencao: {
    manter_diarios: number
    manter_semanais: number
    manter_mensais: number
    manter_anuais: number
  }
  compressao: {
    ativo: boolean
    nivel: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
    algoritmo: 'gzip' | 'bzip2' | 'xz' | 'lz4'
  }
  criptografia: {
    ativo: boolean
    algoritmo: 'aes256' | 'aes128' | 'chacha20'
    chave_publica?: string
  }
  notificacoes: {
    sucesso: boolean
    falha: boolean
    inicio: boolean
    emails: string[]
    webhooks: string[]
  }
  criado_em: Date
  atualizado_em: Date
  criado_por: string
}

interface ExecucaoBackup {
  id: string
  configuracao_id: string
  configuracao_nome: string
  tipo: TipoBackup
  status: StatusBackup
  iniciado_em: Date
  finalizado_em?: Date
  duracao?: number
  tamanho_original?: number
  tamanho_comprimido?: number
  taxa_compressao?: number
  arquivos_incluidos: number
  arquivos_excluidos: number
  progresso: number
  etapa_atual: string
  destinos: {
    tipo: TipoArmazenamento
    status: 'pendente' | 'enviando' | 'concluido' | 'falha'
    progresso: number
    caminho?: string
    tamanho?: number
    erro?: string
  }[]
  logs: {
    timestamp: Date
    nivel: 'info' | 'warning' | 'error'
    mensagem: string
    detalhes?: Record<string, unknown>
  }[]
  estatisticas: {
    velocidade_leitura: number
    velocidade_escrita: number
    uso_cpu: number
    uso_memoria: number
    uso_rede: number
  }
  erro?: string
  metadata: Record<string, unknown>
}

interface EstatisticasBackup {
  total_configuracoes: number
  configuracoes_ativas: number
  execucoes_hoje: number
  execucoes_sucesso_mes: number
  execucoes_falha_mes: number
  taxa_sucesso: number
  tamanho_total_backups: number
  economia_compressao: number
  tempo_medio_execucao: number
  proxima_execucao?: Date
  espaco_disponivel: {
    local: number
    cloud: number
    total: number
  }
  tendencia_crescimento: {
    diario: number
    semanal: number
    mensal: number
  }
  distribuicao_tipos: {
    tipo: TipoBackup
    quantidade: number
    tamanho: number
  }[]
  historico_execucoes: {
    data: string
    sucessos: number
    falhas: number
    tamanho: number
  }[]
}

interface BackupSystemProps {
  configuracoes?: ConfiguracaoBackup[]
  execucoes?: ExecucaoBackup[]
  estatisticas?: EstatisticasBackup
  loading?: boolean
  onCriarConfiguracao?: (config: Omit<ConfiguracaoBackup, 'id' | 'criado_em' | 'atualizado_em' | 'criado_por'>) => Promise<void>
  onAtualizarConfiguracao?: (id: string, config: Partial<ConfiguracaoBackup>) => Promise<void>
  onExcluirConfiguracao?: (id: string) => Promise<void>
  onExecutarBackup?: (configuracao_id: string) => Promise<void>
  onCancelarBackup?: (execucao_id: string) => Promise<void>
  onPausarBackup?: (execucao_id: string) => Promise<void>
  onRetomarBackup?: (execucao_id: string) => Promise<void>
  onRestaurarBackup?: (execucao_id: string, destino?: string) => Promise<void>
  onDownloadBackup?: (execucao_id: string) => Promise<void>
  onLimparBackupsAntigos?: (antes_de: Date) => Promise<void>
  className?: string
}

const tiposBackup = [
  { valor: 'completo', label: 'Completo', descricao: 'Backup de todos os dados', icone: Archive, cor: 'bg-blue-100 text-blue-800' },
  { valor: 'incremental', label: 'Incremental', descricao: 'Apenas alterações desde o último backup', icone: TrendingUp, cor: 'bg-green-100 text-green-800' },
  { valor: 'diferencial', label: 'Diferencial', descricao: 'Alterações desde o último backup completo', icone: BarChart3, cor: 'bg-yellow-100 text-yellow-800' },
  { valor: 'manual', label: 'Manual', descricao: 'Backup executado manualmente', icone: Play, cor: 'bg-purple-100 text-purple-800' },
]

const statusBackup = [
  { valor: 'pendente', label: 'Pendente', icone: Clock, cor: 'bg-gray-100 text-gray-800' },
  { valor: 'executando', label: 'Executando', icone: Play, cor: 'bg-blue-100 text-blue-800' },
  { valor: 'concluido', label: 'Concluído', icone: CheckCircle, cor: 'bg-green-100 text-green-800' },
  { valor: 'falha', label: 'Falha', icone: XCircle, cor: 'bg-red-100 text-red-800' },
  { valor: 'cancelado', label: 'Cancelado', icone: Square, cor: 'bg-orange-100 text-orange-800' },
  { valor: 'pausado', label: 'Pausado', icone: Pause, cor: 'bg-yellow-100 text-yellow-800' },
]

const tiposArmazenamento = [
  { valor: 'local', label: 'Local', icone: HardDrive, descricao: 'Armazenamento local do servidor' },
  { valor: 'cloud', label: 'Cloud', icone: Cloud, descricao: 'Serviços de nuvem' },
  { valor: 's3', label: 'Amazon S3', icone: CloudUpload, descricao: 'Amazon Simple Storage Service' },
  { valor: 'ftp', label: 'FTP', icone: Server, descricao: 'File Transfer Protocol' },
  { valor: 'sftp', label: 'SFTP', icone: Shield, descricao: 'Secure File Transfer Protocol' },
]

const prioridadesBackup = [
  { valor: 'baixa', label: 'Baixa', cor: 'bg-gray-100 text-gray-800' },
  { valor: 'normal', label: 'Normal', cor: 'bg-blue-100 text-blue-800' },
  { valor: 'alta', label: 'Alta', cor: 'bg-yellow-100 text-yellow-800' },
  { valor: 'critica', label: 'Crítica', cor: 'bg-red-100 text-red-800' },
]

// Componente para exibir detalhes de uma execução
function ExecucaoDetalhes({ execucao }: { execucao: ExecucaoBackup }) {
  const status = statusBackup.find(s => s.valor === execucao.status)
  const tipo = tiposBackup.find(t => t.valor === execucao.tipo)
  
  const formatarTamanho = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
  }
  
  const formatarVelocidade = (bytesPerSecond: number) => {
    return `${formatarTamanho(bytesPerSecond)}/s`
  }
  
  const formatarDuracao = (segundos: number) => {
    const horas = Math.floor(segundos / 3600)
    const minutos = Math.floor((segundos % 3600) / 60)
    const segs = segundos % 60
    
    if (horas > 0) {
      return `${horas}h ${minutos}m ${segs}s`
    } else if (minutos > 0) {
      return `${minutos}m ${segs}s`
    } else {
      return `${segs}s`
    }
  }
  
  return (
    <div className="space-y-6">
      {/* Informações básicas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Informações da Execução</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              {tipo && <tipo.icone className="h-4 w-4" />}
              <span className="font-medium">{tipo?.label}</span>
              <Badge className={tipo?.cor}>{execucao.tipo}</Badge>
            </div>
            
            <div className="flex items-center gap-2">
              {status && <status.icone className="h-4 w-4" />}
              <Badge className={status?.cor}>{status?.label}</Badge>
            </div>
            
            <div className="text-sm">
              <span className="font-medium">Configuração:</span> {execucao.configuracao_nome}
            </div>
            
            <div className="text-sm">
              <span className="font-medium">Iniciado:</span> {format(execucao.iniciado_em, 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
            </div>
            
            {execucao.finalizado_em && (
              <div className="text-sm">
                <span className="font-medium">Finalizado:</span> {format(execucao.finalizado_em, 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
              </div>
            )}
            
            {execucao.duracao && (
              <div className="text-sm">
                <span className="font-medium">Duração:</span> {formatarDuracao(execucao.duracao)}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Progresso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progresso Geral</span>
                <span>{execucao.progresso}%</span>
              </div>
              <Progress value={execucao.progresso} className="h-2" />
            </div>
            
            <div className="text-sm">
              <span className="font-medium">Etapa Atual:</span> {execucao.etapa_atual}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Incluídos:</span> {execucao.arquivos_incluidos.toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Excluídos:</span> {execucao.arquivos_excluidos.toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tamanhos e compressão */}
      {(execucao.tamanho_original || execucao.tamanho_comprimido) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Tamanhos e Compressão</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {execucao.tamanho_original && (
              <div className="text-center">
                <div className="text-lg font-bold">{formatarTamanho(execucao.tamanho_original)}</div>
                <div className="text-xs text-muted-foreground">Tamanho Original</div>
              </div>
            )}
            
            {execucao.tamanho_comprimido && (
              <div className="text-center">
                <div className="text-lg font-bold">{formatarTamanho(execucao.tamanho_comprimido)}</div>
                <div className="text-xs text-muted-foreground">Comprimido</div>
              </div>
            )}
            
            {execucao.taxa_compressao && (
              <div className="text-center">
                <div className="text-lg font-bold">{execucao.taxa_compressao.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">Taxa Compressão</div>
              </div>
            )}
            
            {execucao.tamanho_original && execucao.tamanho_comprimido && (
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {formatarTamanho(execucao.tamanho_original - execucao.tamanho_comprimido)}
                </div>
                <div className="text-xs text-muted-foreground">Economia</div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Destinos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Destinos de Backup</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {execucao.destinos.map((destino, index) => {
              const tipoArmazenamento = tiposArmazenamento.find(t => t.valor === destino.tipo)
              
              return (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {tipoArmazenamento && <tipoArmazenamento.icone className="h-4 w-4" />}
                      <span className="font-medium">{tipoArmazenamento?.label}</span>
                      <Badge 
                        className={{
                          'pendente': 'bg-gray-100 text-gray-800',
                          'enviando': 'bg-blue-100 text-blue-800',
                          'concluido': 'bg-green-100 text-green-800',
                          'falha': 'bg-red-100 text-red-800',
                        }[destino.status]}
                      >
                        {destino.status}
                      </Badge>
                    </div>
                    
                    {destino.tamanho && (
                      <span className="text-sm text-muted-foreground">
                        {formatarTamanho(destino.tamanho)}
                      </span>
                    )}
                  </div>
                  
                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progresso</span>
                      <span>{destino.progresso}%</span>
                    </div>
                    <Progress value={destino.progresso} className="h-1" />
                  </div>
                  
                  {destino.caminho && (
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">Caminho:</span> {destino.caminho}
                    </div>
                  )}
                  
                  {destino.erro && (
                    <div className="text-xs text-red-600 mt-2">
                      <span className="font-medium">Erro:</span> {destino.erro}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Estatísticas de performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold">{formatarVelocidade(execucao.estatisticas.velocidade_leitura)}</div>
            <div className="text-xs text-muted-foreground">Leitura</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold">{formatarVelocidade(execucao.estatisticas.velocidade_escrita)}</div>
            <div className="text-xs text-muted-foreground">Escrita</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold">{execucao.estatisticas.uso_cpu}%</div>
            <div className="text-xs text-muted-foreground">CPU</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold">{execucao.estatisticas.uso_memoria}%</div>
            <div className="text-xs text-muted-foreground">Memória</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold">{execucao.estatisticas.uso_rede}%</div>
            <div className="text-xs text-muted-foreground">Rede</div>
          </div>
        </CardContent>
      </Card>
      
      {/* Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Logs da Execução</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-60">
            <div className="space-y-2">
              {execucao.logs.map((log, index) => (
                <div key={index} className="text-xs border-l-2 pl-3 py-1" 
                     style={{
                       borderLeftColor: {
                         'info': '#3b82f6',
                         'warning': '#f59e0b',
                         'error': '#ef4444',
                       }[log.nivel]
                     }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-muted-foreground">
                      {format(log.timestamp, 'HH:mm:ss')}
                    </span>
                    <Badge 
                      className={{
                        'info': 'bg-blue-100 text-blue-800',
                        'warning': 'bg-yellow-100 text-yellow-800',
                        'error': 'bg-red-100 text-red-800',
                      }[log.nivel]}
                      variant="outline"
                    >
                      {log.nivel.toUpperCase()}
                    </Badge>
                  </div>
                  <div>{log.mensagem}</div>
                  {log.detalhes && (
                    <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                      {JSON.stringify(log.detalhes, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      
      {/* Erro (se houver) */}
      {execucao.erro && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-red-600">Erro da Execução</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-red-50 border border-red-200 p-3 rounded overflow-auto text-red-700">
              {execucao.erro}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Componente principal do sistema de backup
export function BackupSystem({
  configuracoes = [],
  execucoes = [],
  estatisticas,
  loading = false,
  onCriarConfiguracao,
  onAtualizarConfiguracao,
  onExcluirConfiguracao,
  onExecutarBackup,
  onCancelarBackup,
  onPausarBackup,
  onRetomarBackup,
  onRestaurarBackup,
  onDownloadBackup,
  onLimparBackupsAntigos,
  className,
}: BackupSystemProps) {
  const [abaSelecionada, setAbaSelecionada] = useState<'configuracoes' | 'execucoes' | 'estatisticas'>('configuracoes')
  const [execucaoSelecionada, setExecucaoSelecionada] = useState<ExecucaoBackup | null>(null)
  const [configuracaoSelecionada, setConfiguracaoSelecionada] = useState<ConfiguracaoBackup | null>(null)
  const [mostrarDialogConfiguracao, setMostrarDialogConfiguracao] = useState(false)
  
  const execucoesRecentes = useMemo(() => {
    return execucoes
      .sort((a, b) => new Date(b.iniciado_em).getTime() - new Date(a.iniciado_em).getTime())
      .slice(0, 10)
  }, [execucoes])
  
  const execucoesAtivas = useMemo(() => {
    return execucoes.filter(e => ['pendente', 'executando', 'pausado'].includes(e.status))
  }, [execucoes])
  
  const formatarTamanho = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
  }
  
  const formatarDataRelativa = (data: Date) => {
    if (isToday(data)) {
      return `Hoje às ${format(data, 'HH:mm')}`
    } else if (isYesterday(data)) {
      return `Ontem às ${format(data, 'HH:mm')}`
    } else {
      return format(data, 'dd/MM/yyyy HH:mm', { locale: ptBR })
    }
  }
  
  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sistema de Backup</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie backups automáticos e manuais do sistema
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {onCriarConfiguracao && (
            <Button onClick={() => setMostrarDialogConfiguracao(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Configuração
            </Button>
          )}
        </div>
      </div>
      
      {/* Estatísticas rápidas */}
      {estatisticas && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Configurações</p>
                  <p className="text-2xl font-bold">{estatisticas.configuracoes_ativas}/{estatisticas.total_configuracoes}</p>
                </div>
                <Settings className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
                  <p className="text-2xl font-bold">{estatisticas.taxa_sucesso.toFixed(1)}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tamanho Total</p>
                  <p className="text-2xl font-bold">{formatarTamanho(estatisticas.tamanho_total_backups)}</p>
                </div>
                <Archive className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Economia Compressão</p>
                  <p className="text-2xl font-bold">{estatisticas.economia_compressao.toFixed(1)}%</p>
                </div>
                <Zap className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Execuções ativas */}
      {execucoesAtivas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Execuções Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {execucoesAtivas.map(execucao => {
                const status = statusBackup.find(s => s.valor === execucao.status)
                
                return (
                  <div key={execucao.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {status && <status.icone className="h-4 w-4" />}
                        <span className="font-medium">{execucao.configuracao_nome}</span>
                        <Badge className={status?.cor}>{status?.label}</Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {execucao.status === 'executando' && onPausarBackup && (
                          <Button 
                            onClick={() => onPausarBackup(execucao.id)}
                            size="sm"
                            variant="outline"
                          >
                            <Pause className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {execucao.status === 'pausado' && onRetomarBackup && (
                          <Button 
                            onClick={() => onRetomarBackup(execucao.id)}
                            size="sm"
                            variant="outline"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {['executando', 'pausado'].includes(execucao.status) && onCancelarBackup && (
                          <Button 
                            onClick={() => onCancelarBackup(execucao.id)}
                            size="sm"
                            variant="outline"
                          >
                            <Square className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button 
                          onClick={() => setExecucaoSelecionada(execucao)}
                          size="sm"
                          variant="outline"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progresso Geral</span>
                        <span>{execucao.progresso}%</span>
                      </div>
                      <Progress value={execucao.progresso} className="h-2" />
                      
                      <div className="text-sm text-muted-foreground">
                        {execucao.etapa_atual}
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Iniciado:</span> {formatarDataRelativa(execucao.iniciado_em)}
                        </div>
                        <div>
                          <span className="font-medium">Arquivos:</span> {execucao.arquivos_incluidos.toLocaleString()}
                        </div>
                        <div>
                          <span className="font-medium">Tipo:</span> {execucao.tipo}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Abas principais */}
      <div className="border-b">
        <nav className="flex space-x-8">
          <button
            onClick={() => setAbaSelecionada('configuracoes')}
            className={cn(
              'py-2 px-1 border-b-2 font-medium text-sm',
              abaSelecionada === 'configuracoes'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
            )}
          >
            Configurações ({configuracoes.length})
          </button>
          
          <button
            onClick={() => setAbaSelecionada('execucoes')}
            className={cn(
              'py-2 px-1 border-b-2 font-medium text-sm',
              abaSelecionada === 'execucoes'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
            )}
          >
            Execuções ({execucoes.length})
          </button>
          
          <button
            onClick={() => setAbaSelecionada('estatisticas')}
            className={cn(
              'py-2 px-1 border-b-2 font-medium text-sm',
              abaSelecionada === 'estatisticas'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
            )}
          >
            Estatísticas
          </button>
        </nav>
      </div>
      
      {/* Conteúdo das abas */}
      {abaSelecionada === 'configuracoes' && (
        <div className="space-y-4">
          {configuracoes.map(config => {
            const tipo = tiposBackup.find(t => t.valor === config.tipo)
            const prioridade = prioridadesBackup.find(p => p.valor === config.prioridade)
            
            return (
              <Card key={config.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {tipo && <tipo.icone className="h-4 w-4" />}
                        <h3 className="font-semibold">{config.nome}</h3>
                        <Badge className={tipo?.cor}>{tipo?.label}</Badge>
                        <Badge className={prioridade?.cor}>{prioridade?.label}</Badge>
                        {config.ativo ? (
                          <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">Inativo</Badge>
                        )}
                      </div>
                      
                      {config.descricao && (
                        <p className="text-sm text-muted-foreground mb-3">{config.descricao}</p>
                      )}
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Frequência:</span> {config.agendamento.frequencia}
                        </div>
                        <div>
                          <span className="font-medium">Hora:</span> {config.agendamento.hora}
                        </div>
                        <div>
                          <span className="font-medium">Destinos:</span> {config.destinos.filter(d => d.ativo).length}
                        </div>
                        <div>
                          <span className="font-medium">Compressão:</span> {config.compressao.ativo ? 'Sim' : 'Não'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {onExecutarBackup && (
                        <Button 
                          onClick={() => onExecutarBackup(config.id)}
                          size="sm"
                          variant="outline"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button 
                        onClick={() => setConfiguracaoSelecionada(config)}
                        size="sm"
                        variant="outline"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => {
                            setConfiguracaoSelecionada(config)
                            setMostrarDialogConfiguracao(true)
                          }}>
                            <Settings className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem onClick={() => {
                            if (onAtualizarConfiguracao) {
                              onAtualizarConfiguracao(config.id, { ativo: !config.ativo })
                            }
                          }}>
                            {config.ativo ? (
                              <>
                                <Pause className="mr-2 h-4 w-4" />
                                Desativar
                              </>
                            ) : (
                              <>
                                <Play className="mr-2 h-4 w-4" />
                                Ativar
                              </>
                            )}
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem 
                            onClick={() => onExcluirConfiguracao && onExcluirConfiguracao(config.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
          
          {configuracoes.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Archive className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma configuração encontrada</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Crie sua primeira configuração de backup para começar
                </p>
                {onCriarConfiguracao && (
                  <Button onClick={() => setMostrarDialogConfiguracao(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Configuração
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
      
      {abaSelecionada === 'execucoes' && (
        <div className="space-y-4">
          {execucoesRecentes.map(execucao => {
            const status = statusBackup.find(s => s.valor === execucao.status)
            const tipo = tiposBackup.find(t => t.valor === execucao.tipo)
            
            return (
              <Card key={execucao.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {tipo && <tipo.icone className="h-4 w-4" />}
                        <h3 className="font-semibold">{execucao.configuracao_nome}</h3>
                        <Badge className={tipo?.cor}>{tipo?.label}</Badge>
                        <Badge className={status?.cor}>{status?.label}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <span className="font-medium">Iniciado:</span> {formatarDataRelativa(execucao.iniciado_em)}
                        </div>
                        
                        {execucao.finalizado_em && (
                          <div>
                            <span className="font-medium">Finalizado:</span> {formatarDataRelativa(execucao.finalizado_em)}
                          </div>
                        )}
                        
                        {execucao.duracao && (
                          <div>
                            <span className="font-medium">Duração:</span> {Math.floor(execucao.duracao / 60)}m {execucao.duracao % 60}s
                          </div>
                        )}
                        
                        {execucao.tamanho_comprimido && (
                          <div>
                            <span className="font-medium">Tamanho:</span> {formatarTamanho(execucao.tamanho_comprimido)}
                          </div>
                        )}
                      </div>
                      
                      {execucao.status === 'executando' && (
                        <div className="mb-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progresso</span>
                            <span>{execucao.progresso}%</span>
                          </div>
                          <Progress value={execucao.progresso} className="h-2" />
                        </div>
                      )}
                      
                      {execucao.erro && (
                        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                          <span className="font-medium">Erro:</span> {execucao.erro}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {execucao.status === 'concluido' && onDownloadBackup && (
                        <Button 
                          onClick={() => onDownloadBackup(execucao.id)}
                          size="sm"
                          variant="outline"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {execucao.status === 'concluido' && onRestaurarBackup && (
                        <Button 
                          onClick={() => onRestaurarBackup(execucao.id)}
                          size="sm"
                          variant="outline"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button 
                        onClick={() => setExecucaoSelecionada(execucao)}
                        size="sm"
                        variant="outline"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
          
          {execucoes.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <History className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma execução encontrada</h3>
                <p className="text-muted-foreground text-center">
                  As execuções de backup aparecerão aqui
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      
      {abaSelecionada === 'estatisticas' && estatisticas && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribuição por tipo */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Tipo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {estatisticas.distribuicao_tipos.map(item => {
                  const tipo = tiposBackup.find(t => t.valor === item.tipo)
                  const total = estatisticas.distribuicao_tipos.reduce((acc, curr) => acc + curr.quantidade, 0)
                  const porcentagem = total > 0 ? (item.quantidade / total) * 100 : 0
                  
                  return (
                    <div key={item.tipo} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {tipo && <tipo.icone className="h-4 w-4" />}
                        <span className="text-sm">{tipo?.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${porcentagem}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12 text-right">
                          {item.quantidade}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
          
          {/* Espaço disponível */}
          <Card>
            <CardHeader>
              <CardTitle>Espaço de Armazenamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Local</span>
                  <span>{formatarTamanho(estatisticas.espaco_disponivel.local)}</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Cloud</span>
                  <span>{formatarTamanho(estatisticas.espaco_disponivel.cloud)}</span>
                </div>
                <Progress value={45} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Total</span>
                  <span>{formatarTamanho(estatisticas.espaco_disponivel.total)}</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
            </CardContent>
          </Card>
          
          {/* Tendência de crescimento */}
          <Card>
            <CardHeader>
              <CardTitle>Tendência de Crescimento</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatarTamanho(estatisticas.tendencia_crescimento.diario)}
                </div>
                <div className="text-xs text-muted-foreground">Por Dia</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatarTamanho(estatisticas.tendencia_crescimento.semanal)}
                </div>
                <div className="text-xs text-muted-foreground">Por Semana</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {formatarTamanho(estatisticas.tendencia_crescimento.mensal)}
                </div>
                <div className="text-xs text-muted-foreground">Por Mês</div>
              </div>
            </CardContent>
          </Card>
          
          {/* Próxima execução */}
          {estatisticas.proxima_execucao && (
            <Card>
              <CardHeader>
                <CardTitle>Próxima Execução</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <div className="font-semibold">
                      {format(estatisticas.proxima_execucao, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDistanceToNow(estatisticas.proxima_execucao, { addSuffix: true, locale: ptBR })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      
      {/* Dialog para detalhes da execução */}
      <Dialog open={!!execucaoSelecionada} onOpenChange={() => setExecucaoSelecionada(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Execução de Backup</DialogTitle>
            <DialogDescription>
              Informações completas sobre a execução do backup
            </DialogDescription>
          </DialogHeader>
          
          {execucaoSelecionada && <ExecucaoDetalhes execucao={execucaoSelecionada} />}
          
          <DialogFooter>
            <Button onClick={() => setExecucaoSelecionada(null)} variant="outline">
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Hook para gerenciar sistema de backup
export function useBackupSystem() {
  const [configuracoes, setConfiguracoes] = useState<ConfiguracaoBackup[]>([])
  const [execucoes, setExecucoes] = useState<ExecucaoBackup[]>([])
  const [estatisticas, setEstatisticas] = useState<EstatisticasBackup | null>(null)
  const [loading, setLoading] = useState(false)
  
  const carregarDados = useCallback(async () => {
    setLoading(true)
    try {
      const [configResponse, execucoesResponse, estatisticasResponse] = await Promise.all([
        fetch('/api/backup/configuracoes'),
        fetch('/api/backup/execucoes'),
        fetch('/api/backup/estatisticas'),
      ])
      
      if (configResponse.ok) {
        const configData = await configResponse.json()
        setConfiguracoes(configData.data)
      }
      
      if (execucoesResponse.ok) {
        const execucoesData = await execucoesResponse.json()
        setExecucoes(execucoesData.data)
      }
      
      if (estatisticasResponse.ok) {
        const estatisticasData = await estatisticasResponse.json()
        setEstatisticas(estatisticasData.data)
      }
    } catch (error) {
      console.error('Erro ao carregar dados do backup:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])
  
  const criarConfiguracao = useCallback(async (config: Omit<ConfiguracaoBackup, 'id' | 'criado_em' | 'atualizado_em' | 'criado_por'>) => {
    try {
      const response = await fetch('/api/backup/configuracoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      
      if (!response.ok) {
        throw new Error('Erro ao criar configuração')
      }
      
      await carregarDados()
    } catch (error) {
      console.error('Erro ao criar configuração:', error)
      throw error
    }
  }, [carregarDados])
  
  const executarBackup = useCallback(async (configuracao_id: string) => {
    try {
      const response = await fetch(`/api/backup/executar/${configuracao_id}`, {
        method: 'POST',
      })
      
      if (!response.ok) {
        throw new Error('Erro ao executar backup')
      }
      
      await carregarDados()
    } catch (error) {
      console.error('Erro ao executar backup:', error)
      throw error
    }
  }, [carregarDados])
  
  const cancelarBackup = useCallback(async (execucao_id: string) => {
    try {
      const response = await fetch(`/api/backup/cancelar/${execucao_id}`, {
        method: 'POST',
      })
      
      if (!response.ok) {
        throw new Error('Erro ao cancelar backup')
      }
      
      await carregarDados()
    } catch (error) {
      console.error('Erro ao cancelar backup:', error)
      throw error
    }
  }, [carregarDados])
  
  return {
    configuracoes,
    execucoes,
    estatisticas,
    loading,
    carregarDados,
    criarConfiguracao,
    executarBackup,
    cancelarBackup,
  }
}