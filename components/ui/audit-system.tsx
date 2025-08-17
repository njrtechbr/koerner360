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
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  AlertTriangle,
  Shield,
  Eye,
  Search,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  Clock,
  User,
  Users,
  Settings,
  Database,
  FileText,
  Edit,
  Trash2,
  Plus,
  Minus,
  Check,
  X,
  Info,
  AlertCircle,
  CheckCircle,
  XCircle,
  Activity,
  Lock,
  Unlock,
  LogIn,
  LogOut,
  UserPlus,
  UserMinus,
  Mail,
  Phone,
  MapPin,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Server,
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  Wifi,
  WifiOff,
  Zap,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  LineChart,
  Archive,
  History,
  ExternalLink,
  Copy,
  Share2,
  Flag,
  Star,
  Heart,
  Bookmark,
  Tag,
  Folder,
  FolderOpen,
  File,
  Image,
  Video,
  Music,
  Code,
  Terminal,
  Command,
  MousePointer,
  Keyboard,
  Gamepad2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, subDays, startOfDay, endOfDay, isToday, isYesterday } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type TipoAcao = 
  | 'login' 
  | 'logout' 
  | 'create' 
  | 'read' 
  | 'update' 
  | 'delete' 
  | 'export' 
  | 'import' 
  | 'permission_change' 
  | 'password_change' 
  | 'email_change' 
  | 'profile_update' 
  | 'system_config' 
  | 'backup' 
  | 'restore' 
  | 'error' 
  | 'warning' 
  | 'info'

type NivelSeveridade = 'baixo' | 'medio' | 'alto' | 'critico'

type StatusAuditoria = 'sucesso' | 'falha' | 'pendente' | 'cancelado'

type CategoriaRecurso = 
  | 'usuario' 
  | 'atendente' 
  | 'avaliacao' 
  | 'feedback' 
  | 'relatorio' 
  | 'configuracao' 
  | 'sistema' 
  | 'seguranca' 
  | 'backup'

interface DadosDispositivo {
  tipo: 'desktop' | 'mobile' | 'tablet'
  sistema_operacional: string
  navegador: string
  versao_navegador: string
  resolucao: string
  user_agent: string
}

interface DadosLocalizacao {
  ip: string
  pais?: string
  estado?: string
  cidade?: string
  latitude?: number
  longitude?: number
  provedor?: string
}

interface DadosPerformance {
  tempo_resposta: number
  uso_memoria: number
  uso_cpu: number
  tamanho_payload?: number
  cache_hit?: boolean
}

interface LogAuditoria {
  id: string
  usuario_id: string
  usuario_nome: string
  usuario_email: string
  usuario_tipo: 'admin' | 'supervisor' | 'attendant' | 'consultor'
  acao: TipoAcao
  categoria: CategoriaRecurso
  recurso_tipo: string
  recurso_id?: string
  recurso_nome?: string
  descricao: string
  detalhes?: Record<string, any>
  valores_anteriores?: Record<string, any>
  valores_novos?: Record<string, any>
  status: StatusAuditoria
  severidade: NivelSeveridade
  sessao_id: string
  dispositivo: DadosDispositivo
  localizacao: DadosLocalizacao
  performance: DadosPerformance
  timestamp: Date
  duracao?: number
  erro?: string
  tags?: string[]
  metadata?: Record<string, any>
}

interface FiltroAuditoria {
  usuario_id?: string
  acao?: TipoAcao[]
  categoria?: CategoriaRecurso[]
  status?: StatusAuditoria[]
  severidade?: NivelSeveridade[]
  periodo_inicio?: Date
  periodo_fim?: Date
  ip?: string
  dispositivo_tipo?: string[]
  busca?: string
  tags?: string[]
}

interface EstatisticasAuditoria {
  total_logs: number
  logs_por_dia: { data: string; total: number }[]
  acoes_mais_comuns: { acao: TipoAcao; total: number }[]
  usuarios_mais_ativos: { usuario_id: string; nome: string; total: number }[]
  ips_mais_frequentes: { ip: string; total: number; localizacao?: string }[]
  dispositivos_por_tipo: { tipo: string; total: number }[]
  status_distribuicao: { status: StatusAuditoria; total: number }[]
  severidade_distribuicao: { severidade: NivelSeveridade; total: number }[]
  tempo_resposta_medio: number
  picos_atividade: { hora: number; total: number }[]
  tendencia_semanal: { dia: string; total: number }[]
}

interface AuditSystemProps {
  logs?: LogAuditoria[]
  estatisticas?: EstatisticasAuditoria
  loading?: boolean
  onExportarLogs?: (filtros: FiltroAuditoria, formato: 'csv' | 'json' | 'pdf') => Promise<void>
  onLimparLogs?: (antes_de: Date) => Promise<void>
  onMarcarComoRevisado?: (ids: string[]) => Promise<void>
  className?: string
}

const tiposAcao = [
  { valor: 'login', label: 'Login', icone: LogIn, cor: 'bg-green-100 text-green-800' },
  { valor: 'logout', label: 'Logout', icone: LogOut, cor: 'bg-gray-100 text-gray-800' },
  { valor: 'create', label: 'Criar', icone: Plus, cor: 'bg-blue-100 text-blue-800' },
  { valor: 'read', label: 'Visualizar', icone: Eye, cor: 'bg-cyan-100 text-cyan-800' },
  { valor: 'update', label: 'Atualizar', icone: Edit, cor: 'bg-yellow-100 text-yellow-800' },
  { valor: 'delete', label: 'Excluir', icone: Trash2, cor: 'bg-red-100 text-red-800' },
  { valor: 'export', label: 'Exportar', icone: Download, cor: 'bg-purple-100 text-purple-800' },
  { valor: 'import', label: 'Importar', icone: Upload, cor: 'bg-indigo-100 text-indigo-800' },
  { valor: 'permission_change', label: 'Alterar Permissão', icone: Shield, cor: 'bg-orange-100 text-orange-800' },
  { valor: 'password_change', label: 'Alterar Senha', icone: Lock, cor: 'bg-red-100 text-red-800' },
  { valor: 'email_change', label: 'Alterar Email', icone: Mail, cor: 'bg-blue-100 text-blue-800' },
  { valor: 'profile_update', label: 'Atualizar Perfil', icone: User, cor: 'bg-green-100 text-green-800' },
  { valor: 'system_config', label: 'Configuração Sistema', icone: Settings, cor: 'bg-gray-100 text-gray-800' },
  { valor: 'backup', label: 'Backup', icone: Archive, cor: 'bg-teal-100 text-teal-800' },
  { valor: 'restore', label: 'Restaurar', icone: RefreshCw, cor: 'bg-emerald-100 text-emerald-800' },
  { valor: 'error', label: 'Erro', icone: AlertCircle, cor: 'bg-red-100 text-red-800' },
  { valor: 'warning', label: 'Aviso', icone: AlertTriangle, cor: 'bg-yellow-100 text-yellow-800' },
  { valor: 'info', label: 'Informação', icone: Info, cor: 'bg-blue-100 text-blue-800' },
]

const categoriasRecurso = [
  { valor: 'usuario', label: 'Usuário', icone: User },
  { valor: 'atendente', label: 'Atendente', icone: Users },
  { valor: 'avaliacao', label: 'Avaliação', icone: Star },
  { valor: 'feedback', label: 'Feedback', icone: Heart },
  { valor: 'relatorio', label: 'Relatório', icone: FileText },
  { valor: 'configuracao', label: 'Configuração', icone: Settings },
  { valor: 'sistema', label: 'Sistema', icone: Server },
  { valor: 'seguranca', label: 'Segurança', icone: Shield },
  { valor: 'backup', label: 'Backup', icone: Archive },
]

const niveiseSeveridade = [
  { valor: 'baixo', label: 'Baixo', cor: 'bg-green-100 text-green-800' },
  { valor: 'medio', label: 'Médio', cor: 'bg-yellow-100 text-yellow-800' },
  { valor: 'alto', label: 'Alto', cor: 'bg-orange-100 text-orange-800' },
  { valor: 'critico', label: 'Crítico', cor: 'bg-red-100 text-red-800' },
]

const statusAuditoria = [
  { valor: 'sucesso', label: 'Sucesso', icone: CheckCircle, cor: 'bg-green-100 text-green-800' },
  { valor: 'falha', label: 'Falha', icone: XCircle, cor: 'bg-red-100 text-red-800' },
  { valor: 'pendente', label: 'Pendente', icone: Clock, cor: 'bg-yellow-100 text-yellow-800' },
  { valor: 'cancelado', label: 'Cancelado', icone: X, cor: 'bg-gray-100 text-gray-800' },
]

// Componente para exibir detalhes de um log
function LogDetalhes({ log }: { log: LogAuditoria }) {
  const tipoAcao = tiposAcao.find(t => t.valor === log.acao)
  const categoria = categoriasRecurso.find(c => c.valor === log.categoria)
  const severidade = niveiseSeveridade.find(s => s.valor === log.severidade)
  const status = statusAuditoria.find(s => s.valor === log.status)
  
  const getDeviceIcon = (tipo: string) => {
    switch (tipo) {
      case 'desktop': return Monitor
      case 'mobile': return Smartphone
      case 'tablet': return Tablet
      default: return Monitor
    }
  }
  
  const DeviceIcon = getDeviceIcon(log.dispositivo.tipo)
  
  return (
    <div className="space-y-6">
      {/* Informações básicas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Informações da Ação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              {tipoAcao && <tipoAcao.icone className="h-4 w-4" />}
              <span className="font-medium">{tipoAcao?.label}</span>
              <Badge className={tipoAcao?.cor}>{log.acao}</Badge>
            </div>
            
            <div className="flex items-center gap-2">
              {categoria && <categoria.icone className="h-4 w-4" />}
              <span>{categoria?.label}</span>
            </div>
            
            <div className="flex items-center gap-2">
              {status && <status.icone className="h-4 w-4" />}
              <Badge className={status?.cor}>{status?.label}</Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <Badge className={severidade?.cor}>{severidade?.label}</Badge>
            </div>
            
            <div className="text-sm text-muted-foreground">
              {format(log.timestamp, 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Usuário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="font-medium">{log.usuario_nome}</div>
              <div className="text-sm text-muted-foreground">{log.usuario_email}</div>
            </div>
            
            <Badge variant="outline">{log.usuario_tipo}</Badge>
            
            <div className="text-xs text-muted-foreground">
              ID: {log.usuario_id}
            </div>
            
            <div className="text-xs text-muted-foreground">
              Sessão: {log.sessao_id}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Descrição e detalhes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Descrição</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{log.descricao}</p>
          
          {log.recurso_nome && (
            <div className="mt-3 p-3 bg-muted rounded-lg">
              <div className="text-sm font-medium">Recurso Afetado</div>
              <div className="text-sm text-muted-foreground">
                {log.recurso_tipo}: {log.recurso_nome}
                {log.recurso_id && ` (ID: ${log.recurso_id})`}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Dispositivo e localização */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <DeviceIcon className="h-4 w-4" />
              Dispositivo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm">
              <span className="font-medium">Tipo:</span> {log.dispositivo.tipo}
            </div>
            <div className="text-sm">
              <span className="font-medium">SO:</span> {log.dispositivo.sistema_operacional}
            </div>
            <div className="text-sm">
              <span className="font-medium">Navegador:</span> {log.dispositivo.navegador} {log.dispositivo.versao_navegador}
            </div>
            <div className="text-sm">
              <span className="font-medium">Resolução:</span> {log.dispositivo.resolucao}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Localização
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm">
              <span className="font-medium">IP:</span> {log.localizacao.ip}
            </div>
            {log.localizacao.cidade && (
              <div className="text-sm">
                <span className="font-medium">Local:</span> {log.localizacao.cidade}, {log.localizacao.estado}, {log.localizacao.pais}
              </div>
            )}
            {log.localizacao.provedor && (
              <div className="text-sm">
                <span className="font-medium">Provedor:</span> {log.localizacao.provedor}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold">{log.performance.tempo_resposta}ms</div>
            <div className="text-xs text-muted-foreground">Tempo Resposta</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold">{log.performance.uso_memoria}MB</div>
            <div className="text-xs text-muted-foreground">Uso Memória</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold">{log.performance.uso_cpu}%</div>
            <div className="text-xs text-muted-foreground">Uso CPU</div>
          </div>
          
          {log.performance.cache_hit !== undefined && (
            <div className="text-center">
              <div className="text-lg font-bold">
                {log.performance.cache_hit ? 'HIT' : 'MISS'}
              </div>
              <div className="text-xs text-muted-foreground">Cache</div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Alterações (se houver) */}
      {(log.valores_anteriores || log.valores_novos) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Alterações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {log.valores_anteriores && (
                <div>
                  <div className="text-sm font-medium mb-2">Valores Anteriores</div>
                  <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                    {JSON.stringify(log.valores_anteriores, null, 2)}
                  </pre>
                </div>
              )}
              
              {log.valores_novos && (
                <div>
                  <div className="text-sm font-medium mb-2">Valores Novos</div>
                  <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                    {JSON.stringify(log.valores_novos, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Erro (se houver) */}
      {log.erro && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-red-600">Erro</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-red-50 border border-red-200 p-3 rounded overflow-auto text-red-700">
              {log.erro}
            </pre>
          </CardContent>
        </Card>
      )}
      
      {/* Tags e metadata */}
      {(log.tags || log.metadata) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Informações Adicionais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {log.tags && log.tags.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-2">Tags</div>
                <div className="flex flex-wrap gap-1">
                  {log.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {log.metadata && Object.keys(log.metadata).length > 0 && (
              <div>
                <div className="text-sm font-medium mb-2">Metadata</div>
                <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Componente para filtros avançados
function FiltrosAvancados({ 
  filtros, 
  onChange 
}: { 
  filtros: FiltroAuditoria
  onChange: (filtros: FiltroAuditoria) => void 
}) {
  const atualizarFiltro = (updates: Partial<FiltroAuditoria>) => {
    onChange({ ...filtros, ...updates })
  }
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Período */}
        <div className="space-y-2">
          <Label>Período</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input 
              type="date"
              value={filtros.periodo_inicio ? format(filtros.periodo_inicio, 'yyyy-MM-dd') : ''}
              onChange={(e) => atualizarFiltro({ 
                periodo_inicio: e.target.value ? new Date(e.target.value) : undefined 
              })}
              placeholder="Data início"
            />
            <Input 
              type="date"
              value={filtros.periodo_fim ? format(filtros.periodo_fim, 'yyyy-MM-dd') : ''}
              onChange={(e) => atualizarFiltro({ 
                periodo_fim: e.target.value ? new Date(e.target.value) : undefined 
              })}
              placeholder="Data fim"
            />
          </div>
        </div>
        
        {/* Usuário */}
        <div className="space-y-2">
          <Label>Usuário ID</Label>
          <Input 
            value={filtros.usuario_id || ''}
            onChange={(e) => atualizarFiltro({ usuario_id: e.target.value || undefined })}
            placeholder="ID do usuário"
          />
        </div>
        
        {/* IP */}
        <div className="space-y-2">
          <Label>Endereço IP</Label>
          <Input 
            value={filtros.ip || ''}
            onChange={(e) => atualizarFiltro({ ip: e.target.value || undefined })}
            placeholder="192.168.1.1"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Ações */}
        <div className="space-y-2">
          <Label>Ações</Label>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
            {tiposAcao.map(tipo => (
              <div key={tipo.valor} className="flex items-center space-x-2">
                <Checkbox 
                  id={`acao-${tipo.valor}`}
                  checked={filtros.acao?.includes(tipo.valor as TipoAcao) || false}
                  onCheckedChange={(checked) => {
                    const acoes = filtros.acao || []
                    if (checked) {
                      atualizarFiltro({ acao: [...acoes, tipo.valor as TipoAcao] })
                    } else {
                      atualizarFiltro({ acao: acoes.filter(a => a !== tipo.valor) })
                    }
                  }}
                />
                <Label htmlFor={`acao-${tipo.valor}`} className="text-sm">
                  {tipo.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Categorias */}
        <div className="space-y-2">
          <Label>Categorias</Label>
          <div className="grid grid-cols-2 gap-2">
            {categoriasRecurso.map(categoria => (
              <div key={categoria.valor} className="flex items-center space-x-2">
                <Checkbox 
                  id={`categoria-${categoria.valor}`}
                  checked={filtros.categoria?.includes(categoria.valor as CategoriaRecurso) || false}
                  onCheckedChange={(checked) => {
                    const categorias = filtros.categoria || []
                    if (checked) {
                      atualizarFiltro({ categoria: [...categorias, categoria.valor as CategoriaRecurso] })
                    } else {
                      atualizarFiltro({ categoria: categorias.filter(c => c !== categoria.valor) })
                    }
                  }}
                />
                <Label htmlFor={`categoria-${categoria.valor}`} className="text-sm">
                  {categoria.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Status */}
        <div className="space-y-2">
          <Label>Status</Label>
          <div className="grid grid-cols-2 gap-2">
            {statusAuditoria.map(status => (
              <div key={status.valor} className="flex items-center space-x-2">
                <Checkbox 
                  id={`status-${status.valor}`}
                  checked={filtros.status?.includes(status.valor as StatusAuditoria) || false}
                  onCheckedChange={(checked) => {
                    const statuses = filtros.status || []
                    if (checked) {
                      atualizarFiltro({ status: [...statuses, status.valor as StatusAuditoria] })
                    } else {
                      atualizarFiltro({ status: statuses.filter(s => s !== status.valor) })
                    }
                  }}
                />
                <Label htmlFor={`status-${status.valor}`} className="text-sm">
                  {status.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Severidade */}
        <div className="space-y-2">
          <Label>Severidade</Label>
          <div className="grid grid-cols-2 gap-2">
            {niveiseSeveridade.map(severidade => (
              <div key={severidade.valor} className="flex items-center space-x-2">
                <Checkbox 
                  id={`severidade-${severidade.valor}`}
                  checked={filtros.severidade?.includes(severidade.valor as NivelSeveridade) || false}
                  onCheckedChange={(checked) => {
                    const severidades = filtros.severidade || []
                    if (checked) {
                      atualizarFiltro({ severidade: [...severidades, severidade.valor as NivelSeveridade] })
                    } else {
                      atualizarFiltro({ severidade: severidades.filter(s => s !== severidade.valor) })
                    }
                  }}
                />
                <Label htmlFor={`severidade-${severidade.valor}`} className="text-sm">
                  {severidade.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Busca e tags */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Busca Geral</Label>
          <Input 
            value={filtros.busca || ''}
            onChange={(e) => atualizarFiltro({ busca: e.target.value || undefined })}
            placeholder="Buscar em descrição, usuário, recurso..."
          />
        </div>
        
        <div className="space-y-2">
          <Label>Tags</Label>
          <Input 
            value={filtros.tags?.join(', ') || ''}
            onChange={(e) => atualizarFiltro({ 
              tags: e.target.value ? e.target.value.split(',').map(tag => tag.trim()).filter(Boolean) : undefined 
            })}
            placeholder="tag1, tag2, tag3"
          />
        </div>
      </div>
      
      {/* Botões de ação */}
      <div className="flex gap-2">
        <Button 
          onClick={() => onChange({})}
          variant="outline"
          size="sm"
        >
          Limpar Filtros
        </Button>
        
        <Button 
          onClick={() => atualizarFiltro({
            periodo_inicio: subDays(new Date(), 7),
            periodo_fim: new Date()
          })}
          variant="outline"
          size="sm"
        >
          Últimos 7 dias
        </Button>
        
        <Button 
          onClick={() => atualizarFiltro({
            periodo_inicio: subDays(new Date(), 30),
            periodo_fim: new Date()
          })}
          variant="outline"
          size="sm"
        >
          Últimos 30 dias
        </Button>
      </div>
    </div>
  )
}

// Componente principal do sistema de auditoria
export function AuditSystem({
  logs = [],
  estatisticas,
  loading = false,
  onExportarLogs,
  onLimparLogs,
  onMarcarComoRevisado,
  className,
}: AuditSystemProps) {
  const [filtros, setFiltros] = useState<FiltroAuditoria>({})
  const [logSelecionado, setLogSelecionado] = useState<LogAuditoria | null>(null)
  const [logsSelecionados, setLogsSelecionados] = useState<string[]>([])
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  
  // Filtrar logs
  const logsFiltrados = useMemo(() => {
    let resultado = logs
    
    // Aplicar filtros
    if (filtros.usuario_id) {
      resultado = resultado.filter(log => log.usuario_id === filtros.usuario_id)
    }
    
    if (filtros.acao && filtros.acao.length > 0) {
      resultado = resultado.filter(log => filtros.acao!.includes(log.acao))
    }
    
    if (filtros.categoria && filtros.categoria.length > 0) {
      resultado = resultado.filter(log => filtros.categoria!.includes(log.categoria))
    }
    
    if (filtros.status && filtros.status.length > 0) {
      resultado = resultado.filter(log => filtros.status!.includes(log.status))
    }
    
    if (filtros.severidade && filtros.severidade.length > 0) {
      resultado = resultado.filter(log => filtros.severidade!.includes(log.severidade))
    }
    
    if (filtros.periodo_inicio) {
      resultado = resultado.filter(log => log.timestamp >= filtros.periodo_inicio!)
    }
    
    if (filtros.periodo_fim) {
      resultado = resultado.filter(log => log.timestamp <= filtros.periodo_fim!)
    }
    
    if (filtros.ip) {
      resultado = resultado.filter(log => log.localizacao.ip.includes(filtros.ip!))
    }
    
    if (filtros.busca) {
      const busca = filtros.busca.toLowerCase()
      resultado = resultado.filter(log => 
        log.descricao.toLowerCase().includes(busca) ||
        log.usuario_nome.toLowerCase().includes(busca) ||
        log.usuario_email.toLowerCase().includes(busca) ||
        log.recurso_nome?.toLowerCase().includes(busca) ||
        log.recurso_tipo.toLowerCase().includes(busca)
      )
    }
    
    if (filtros.tags && filtros.tags.length > 0) {
      resultado = resultado.filter(log => 
        log.tags?.some(tag => filtros.tags!.includes(tag))
      )
    }
    
    return resultado.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [logs, filtros])
  
  const handleSelecionarTodos = () => {
    if (logsSelecionados.length === logsFiltrados.length) {
      setLogsSelecionados([])
    } else {
      setLogsSelecionados(logsFiltrados.map(log => log.id))
    }
  }
  
  const handleSelecionarLog = (id: string) => {
    if (logsSelecionados.includes(id)) {
      setLogsSelecionados(logsSelecionados.filter(logId => logId !== id))
    } else {
      setLogsSelecionados([...logsSelecionados, id])
    }
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
          <h1 className="text-3xl font-bold">Sistema de Auditoria</h1>
          <p className="text-muted-foreground mt-1">
            Monitore e analise todas as atividades do sistema
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            variant="outline"
            size="sm"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
          
          {onExportarLogs && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onExportarLogs(filtros, 'csv')}>
                  Exportar CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExportarLogs(filtros, 'json')}>
                  Exportar JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExportarLogs(filtros, 'pdf')}>
                  Exportar PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                  <p className="text-sm text-muted-foreground">Total de Logs</p>
                  <p className="text-2xl font-bold">{estatisticas.total_logs.toLocaleString()}</p>
                </div>
                <Activity className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tempo Resposta Médio</p>
                  <p className="text-2xl font-bold">{estatisticas.tempo_resposta_medio}ms</p>
                </div>
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Usuários Ativos</p>
                  <p className="text-2xl font-bold">{estatisticas.usuarios_mais_ativos.length}</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">IPs Únicos</p>
                  <p className="text-2xl font-bold">{estatisticas.ips_mais_frequentes.length}</p>
                </div>
                <Globe className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Filtros avançados */}
      {mostrarFiltros && (
        <Card>
          <CardHeader>
            <CardTitle>Filtros Avançados</CardTitle>
          </CardHeader>
          <CardContent>
            <FiltrosAvancados filtros={filtros} onChange={setFiltros} />
          </CardContent>
        </Card>
      )}
      
      {/* Ações em lote */}
      {logsSelecionados.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {logsSelecionados.length} log(s) selecionado(s)
              </span>
              
              <div className="flex items-center gap-2">
                {onMarcarComoRevisado && (
                  <Button 
                    onClick={() => onMarcarComoRevisado(logsSelecionados)}
                    size="sm"
                    variant="outline"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Marcar como Revisado
                  </Button>
                )}
                
                <Button 
                  onClick={() => setLogsSelecionados([])}
                  size="sm"
                  variant="outline"
                >
                  Limpar Seleção
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Lista de logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Logs de Auditoria ({logsFiltrados.length})</CardTitle>
            
            <div className="flex items-center gap-2">
              <Checkbox 
                checked={logsSelecionados.length === logsFiltrados.length && logsFiltrados.length > 0}
                onCheckedChange={handleSelecionarTodos}
              />
              <span className="text-sm text-muted-foreground">Selecionar todos</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-2">
              {logsFiltrados.map(log => {
                const tipoAcao = tiposAcao.find(t => t.valor === log.acao)
                const categoria = categoriasRecurso.find(c => c.valor === log.categoria)
                const severidade = niveiseSeveridade.find(s => s.valor === log.severidade)
                const status = statusAuditoria.find(s => s.valor === log.status)
                
                return (
                  <Card key={log.id} className={cn(
                    'transition-colors hover:bg-muted/50',
                    logsSelecionados.includes(log.id) && 'bg-muted'
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox 
                          checked={logsSelecionados.includes(log.id)}
                          onCheckedChange={() => handleSelecionarLog(log.id)}
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            {tipoAcao && <tipoAcao.icone className="h-4 w-4" />}
                            <Badge className={tipoAcao?.cor}>{tipoAcao?.label}</Badge>
                            <Badge className={severidade?.cor}>{severidade?.label}</Badge>
                            <Badge className={status?.cor}>{status?.label}</Badge>
                            {categoria && (
                              <Badge variant="outline">{categoria.label}</Badge>
                            )}
                          </div>
                          
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{log.descricao}</p>
                            
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {log.usuario_nome}
                              </span>
                              
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {log.localizacao.ip}
                              </span>
                              
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatarDataRelativa(log.timestamp)}
                              </span>
                              
                              {log.performance.tempo_resposta > 1000 && (
                                <span className="flex items-center gap-1 text-orange-600">
                                  <AlertTriangle className="h-3 w-3" />
                                  {log.performance.tempo_resposta}ms
                                </span>
                              )}
                            </div>
                            
                            {log.recurso_nome && (
                              <p className="text-xs text-muted-foreground">
                                Recurso: {log.recurso_tipo} - {log.recurso_nome}
                              </p>
                            )}
                            
                            {log.tags && log.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {log.tags.map(tag => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <Button 
                          onClick={() => setLogSelecionado(log)}
                          size="sm"
                          variant="outline"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            
            {logsFiltrados.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12">
                <Activity className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum log encontrado</h3>
                <p className="text-muted-foreground text-center">
                  {Object.keys(filtros).length > 0 
                    ? 'Tente ajustar os filtros de busca'
                    : 'Não há logs de auditoria para exibir'
                  }
                </p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
      
      {/* Dialog para detalhes do log */}
      <Dialog open={!!logSelecionado} onOpenChange={() => setLogSelecionado(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Log de Auditoria</DialogTitle>
            <DialogDescription>
              Informações completas sobre a ação registrada
            </DialogDescription>
          </DialogHeader>
          
          {logSelecionado && <LogDetalhes log={logSelecionado} />}
          
          <DialogFooter>
            <Button onClick={() => setLogSelecionado(null)} variant="outline">
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Hook para gerenciar auditoria
export function useAuditSystem() {
  const [logs, setLogs] = useState<LogAuditoria[]>([])
  const [estatisticas, setEstatisticas] = useState<EstatisticasAuditoria | null>(null)
  const [loading, setLoading] = useState(false)
  
  const carregarLogs = useCallback(async (filtros?: FiltroAuditoria) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      
      if (filtros) {
        Object.entries(filtros).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              params.append(key, value.join(','))
            } else if (value instanceof Date) {
              params.append(key, value.toISOString())
            } else {
              params.append(key, String(value))
            }
          }
        })
      }
      
      const response = await fetch(`/api/auditoria/logs?${params}`)
      if (!response.ok) {
        throw new Error('Erro ao carregar logs')
      }
      
      const data = await response.json()
      setLogs(data.logs)
      setEstatisticas(data.estatisticas)
    } catch (error) {
      console.error('Erro ao carregar logs:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])
  
  const exportarLogs = useCallback(async (filtros: FiltroAuditoria, formato: 'csv' | 'json' | 'pdf') => {
    try {
      const params = new URLSearchParams()
      params.append('formato', formato)
      
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            params.append(key, value.join(','))
          } else if (value instanceof Date) {
            params.append(key, value.toISOString())
          } else {
            params.append(key, String(value))
          }
        }
      })
      
      const response = await fetch(`/api/auditoria/exportar?${params}`)
      if (!response.ok) {
        throw new Error('Erro ao exportar logs')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `logs-auditoria-${format(new Date(), 'yyyy-MM-dd')}.${formato}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Erro ao exportar logs:', error)
      throw error
    }
  }, [])
  
  const limparLogs = useCallback(async (antesDe: Date) => {
    try {
      const response = await fetch('/api/auditoria/limpar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ antes_de: antesDe.toISOString() }),
      })
      
      if (!response.ok) {
        throw new Error('Erro ao limpar logs')
      }
      
      // Recarregar logs após limpeza
      await carregarLogs()
    } catch (error) {
      console.error('Erro ao limpar logs:', error)
      throw error
    }
  }, [carregarLogs])
  
  const marcarComoRevisado = useCallback(async (ids: string[]) => {
    try {
      const response = await fetch('/api/auditoria/revisar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      })
      
      if (!response.ok) {
        throw new Error('Erro ao marcar logs como revisados')
      }
      
      // Atualizar logs localmente
      setLogs(prev => prev.map(log => 
        ids.includes(log.id) 
          ? { ...log, tags: [...(log.tags || []), 'revisado'] }
          : log
      ))
    } catch (error) {
      console.error('Erro ao marcar logs como revisados:', error)
      throw error
    }
  }, [])
  
  return {
    logs,
    estatisticas,
    loading,
    carregarLogs,
    exportarLogs,
    limparLogs,
    marcarComoRevisado,
  }
}