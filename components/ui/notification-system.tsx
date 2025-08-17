'use client'

import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { toast, Toaster } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Bell,
  BellRing,
  Check,
  X,
  Trash2,
  Settings,
  Filter,
  Search,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  Star,
  MessageSquare,
  TrendingUp,
  Award,
  Users,
  Calendar,
  Clock,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Smartphone,
  Mail,
  Monitor,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type TipoNotificacao = 
  | 'info' 
  | 'sucesso' 
  | 'aviso' 
  | 'erro' 
  | 'conquista' 
  | 'ranking' 
  | 'avaliacao' 
  | 'sistema' 
  | 'lembrete'

type PrioridadeNotificacao = 'baixa' | 'media' | 'alta' | 'critica'

type StatusNotificacao = 'nao_lida' | 'lida' | 'arquivada' | 'removida'

type CanalNotificacao = 'app' | 'email' | 'push' | 'sms'

interface Notificacao {
  id: string
  titulo: string
  mensagem: string
  tipo: TipoNotificacao
  prioridade: PrioridadeNotificacao
  status: StatusNotificacao
  canais: CanalNotificacao[]
  criadaEm: Date
  lidaEm?: Date
  expiresEm?: Date
  dados?: Record<string, unknown>
  acoes?: {
    label: string
    acao: () => void
    variante?: 'default' | 'destructive' | 'outline' | 'secondary'
  }[]
  remetente?: {
    id: string
    nome: string
    avatar?: string
    cargo?: string
  }
  categoria?: string
  tags?: string[]
  url?: string
  iconePersonalizado?: React.ComponentType<{ className?: string }>
}

interface ConfiguracaoNotificacao {
  canaisAtivos: CanalNotificacao[]
  tiposAtivos: TipoNotificacao[]
  prioridadeMinima: PrioridadeNotificacao
  horarioSilencioso: {
    ativo: boolean
    inicio: string // HH:mm
    fim: string // HH:mm
  }
  agrupamento: boolean
  autoArquivar: {
    ativo: boolean
    diasAposLeitura: number
  }
  sons: {
    ativo: boolean
    volume: number
    somPersonalizado?: string
  }
  preview: {
    mostrarConteudo: boolean
    limitarCaracteres: number
  }
}

interface NotificationContextType {
  notificacoes: Notificacao[]
  configuracao: ConfiguracaoNotificacao
  naoLidas: number
  adicionarNotificacao: (notificacao: Omit<Notificacao, 'id' | 'criadaEm' | 'status'>) => void
  marcarComoLida: (id: string) => void
  marcarTodasComoLidas: () => void
  arquivarNotificacao: (id: string) => void
  removerNotificacao: (id: string) => void
  atualizarConfiguracao: (config: Partial<ConfiguracaoNotificacao>) => void
  limparNotificacoes: () => void
  obterNotificacoesPorTipo: (tipo: TipoNotificacao) => Notificacao[]
  obterNotificacoesPorPrioridade: (prioridade: PrioridadeNotificacao) => Notificacao[]
}

const NotificationContext = createContext<NotificationContextType | null>(null)

const iconesPorTipo: Record<TipoNotificacao, React.ComponentType<{ className?: string }>> = {
  info: Info,
  sucesso: CheckCircle,
  aviso: AlertTriangle,
  erro: AlertCircle,
  conquista: Award,
  ranking: TrendingUp,
  avaliacao: Star,
  sistema: Settings,
  lembrete: Clock,
}

const coresPorTipo: Record<TipoNotificacao, string> = {
  info: 'text-blue-500',
  sucesso: 'text-green-500',
  aviso: 'text-yellow-500',
  erro: 'text-red-500',
  conquista: 'text-purple-500',
  ranking: 'text-orange-500',
  avaliacao: 'text-pink-500',
  sistema: 'text-gray-500',
  lembrete: 'text-indigo-500',
}

const coresPorPrioridade: Record<PrioridadeNotificacao, string> = {
  baixa: 'border-l-gray-300',
  media: 'border-l-blue-400',
  alta: 'border-l-orange-400',
  critica: 'border-l-red-500',
}

const configuracaoPadrao: ConfiguracaoNotificacao = {
  canaisAtivos: ['app'],
  tiposAtivos: ['info', 'sucesso', 'aviso', 'erro', 'conquista', 'ranking', 'avaliacao', 'sistema', 'lembrete'],
  prioridadeMinima: 'baixa',
  horarioSilencioso: {
    ativo: false,
    inicio: '22:00',
    fim: '08:00',
  },
  agrupamento: true,
  autoArquivar: {
    ativo: true,
    diasAposLeitura: 7,
  },
  sons: {
    ativo: true,
    volume: 50,
  },
  preview: {
    mostrarConteudo: true,
    limitarCaracteres: 100,
  },
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [configuracao, setConfiguracao] = useState<ConfiguracaoNotificacao>(configuracaoPadrao)

  const naoLidas = notificacoes.filter(n => n.status === 'nao_lida').length

  const adicionarNotificacao = useCallback((novaNotificacao: Omit<Notificacao, 'id' | 'criadaEm' | 'status'>) => {
    const notificacao: Notificacao = {
      ...novaNotificacao,
      id: crypto.randomUUID(),
      criadaEm: new Date(),
      status: 'nao_lida',
    }

    // Verificar se deve mostrar baseado na configuração
    if (!configuracao.tiposAtivos.includes(notificacao.tipo)) {
      return
    }

    const prioridadeNumerica = {
      baixa: 1,
      media: 2,
      alta: 3,
      critica: 4,
    }

    const prioridadeMinimaNum = prioridadeNumerica[configuracao.prioridadeMinima]
    const prioridadeNotificacaoNum = prioridadeNumerica[notificacao.prioridade]

    if (prioridadeNotificacaoNum < prioridadeMinimaNum) {
      return
    }

    // Verificar horário silencioso
    if (configuracao.horarioSilencioso.ativo) {
      const agora = new Date()
      const horaAtual = agora.getHours() * 60 + agora.getMinutes()
      
      const [inicioH, inicioM] = configuracao.horarioSilencioso.inicio.split(':').map(Number)
      const [fimH, fimM] = configuracao.horarioSilencioso.fim.split(':').map(Number)
      
      const inicioMinutos = inicioH * 60 + inicioM
      const fimMinutos = fimH * 60 + fimM
      
      let dentroHorarioSilencioso = false
      
      if (inicioMinutos <= fimMinutos) {
        // Mesmo dia (ex: 22:00 às 08:00 do dia seguinte)
        dentroHorarioSilencioso = horaAtual >= inicioMinutos && horaAtual <= fimMinutos
      } else {
        // Atravessa meia-noite
        dentroHorarioSilencioso = horaAtual >= inicioMinutos || horaAtual <= fimMinutos
      }
      
      if (dentroHorarioSilencioso && notificacao.prioridade !== 'critica') {
        return
      }
    }

    setNotificacoes(prev => [notificacao, ...prev])

    // Mostrar toast se o canal app estiver ativo
    if (configuracao.canaisAtivos.includes('app')) {
      const Icon = notificacao.iconePersonalizado || iconesPorTipo[notificacao.tipo]
      
      toast(notificacao.titulo, {
        description: notificacao.mensagem,
        icon: <Icon className="h-4 w-4" />,
        action: notificacao.acoes?.[0] ? {
          label: notificacao.acoes[0].label,
          onClick: notificacao.acoes[0].acao,
        } : undefined,
        duration: notificacao.prioridade === 'critica' ? Infinity : 5000,
      })
    }

    // Reproduzir som se ativo
    if (configuracao.sons.ativo && 'Audio' in window) {
      try {
        const audio = new Audio(configuracao.sons.somPersonalizado || '/notification.mp3')
        audio.volume = configuracao.sons.volume / 100
        audio.play().catch(() => {
          // Ignorar erros de reprodução
        })
      } catch {
        // Ignorar erros de áudio
      }
    }
  }, [configuracao])

  const marcarComoLida = useCallback((id: string) => {
    setNotificacoes(prev => prev.map(n => 
      n.id === id ? { ...n, status: 'lida', lidaEm: new Date() } : n
    ))
  }, [])

  const marcarTodasComoLidas = useCallback(() => {
    const agora = new Date()
    setNotificacoes(prev => prev.map(n => 
      n.status === 'nao_lida' ? { ...n, status: 'lida', lidaEm: agora } : n
    ))
  }, [])

  const arquivarNotificacao = useCallback((id: string) => {
    setNotificacoes(prev => prev.map(n => 
      n.id === id ? { ...n, status: 'arquivada' } : n
    ))
  }, [])

  const removerNotificacao = useCallback((id: string) => {
    setNotificacoes(prev => prev.filter(n => n.id !== id))
  }, [])

  const atualizarConfiguracao = useCallback((novaConfig: Partial<ConfiguracaoNotificacao>) => {
    setConfiguracao(prev => ({ ...prev, ...novaConfig }))
  }, [])

  const limparNotificacoes = useCallback(() => {
    setNotificacoes([])
  }, [])

  const obterNotificacoesPorTipo = useCallback((tipo: TipoNotificacao) => {
    return notificacoes.filter(n => n.tipo === tipo && n.status !== 'removida')
  }, [notificacoes])

  const obterNotificacoesPorPrioridade = useCallback((prioridade: PrioridadeNotificacao) => {
    return notificacoes.filter(n => n.prioridade === prioridade && n.status !== 'removida')
  }, [notificacoes])

  // Auto-arquivar notificações lidas antigas
  useEffect(() => {
    if (!configuracao.autoArquivar.ativo) return

    const intervalo = setInterval(() => {
      const agora = new Date()
      const diasEmMs = configuracao.autoArquivar.diasAposLeitura * 24 * 60 * 60 * 1000

      setNotificacoes(prev => prev.map(n => {
        if (n.status === 'lida' && n.lidaEm) {
          const tempoDecorrido = agora.getTime() - n.lidaEm.getTime()
          if (tempoDecorrido > diasEmMs) {
            return { ...n, status: 'arquivada' }
          }
        }
        return n
      }))
    }, 60000) // Verificar a cada minuto

    return () => clearInterval(intervalo)
  }, [configuracao.autoArquivar])

  const value: NotificationContextType = {
    notificacoes,
    configuracao,
    naoLidas,
    adicionarNotificacao,
    marcarComoLida,
    marcarTodasComoLidas,
    arquivarNotificacao,
    removerNotificacao,
    atualizarConfiguracao,
    limparNotificacoes,
    obterNotificacoesPorTipo,
    obterNotificacoesPorPrioridade,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Toaster 
        position="top-right"
        expand={true}
        richColors
        closeButton
      />
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications deve ser usado dentro de NotificationProvider')
  }
  return context
}

// Componente do ícone de notificações
export function NotificationBell() {
  const { naoLidas } = useNotifications()

  return (
    <div className="relative">
      {naoLidas > 0 ? (
        <BellRing className="h-5 w-5" />
      ) : (
        <Bell className="h-5 w-5" />
      )}
      {naoLidas > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
        >
          {naoLidas > 99 ? '99+' : naoLidas}
        </Badge>
      )}
    </div>
  )
}

// Componente principal do painel de notificações
export function NotificationPanel() {
  const {
    notificacoes,
    naoLidas,
    marcarComoLida,
    marcarTodasComoLidas,
    arquivarNotificacao,
    removerNotificacao,
    limparNotificacoes,
  } = useNotifications()

  const [filtroTipo, setFiltroTipo] = useState<TipoNotificacao | 'todos'>('todos')
  const [filtroStatus, setFiltroStatus] = useState<StatusNotificacao | 'todos'>('todos')
  const [busca, setBusca] = useState('')

  const notificacoesFiltradas = notificacoes.filter(notificacao => {
    if (filtroTipo !== 'todos' && notificacao.tipo !== filtroTipo) return false
    if (filtroStatus !== 'todos' && notificacao.status !== filtroStatus) return false
    if (busca && !notificacao.titulo.toLowerCase().includes(busca.toLowerCase()) && 
        !notificacao.mensagem.toLowerCase().includes(busca.toLowerCase())) return false
    return notificacao.status !== 'removida'
  })

  const notificacoesAgrupadas = notificacoesFiltradas.reduce((grupos, notificacao) => {
    const hoje = new Date()
    const ontem = new Date(hoje)
    ontem.setDate(hoje.getDate() - 1)
    
    const dataNotificacao = new Date(notificacao.criadaEm)
    
    let grupo: string
    
    if (dataNotificacao.toDateString() === hoje.toDateString()) {
      grupo = 'Hoje'
    } else if (dataNotificacao.toDateString() === ontem.toDateString()) {
      grupo = 'Ontem'
    } else {
      grupo = format(dataNotificacao, 'dd/MM/yyyy', { locale: ptBR })
    }
    
    if (!grupos[grupo]) {
      grupos[grupo] = []
    }
    
    grupos[grupo].push(notificacao)
    
    return grupos
  }, {} as Record<string, Notificacao[]>)

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <NotificationBell />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-96 sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Notificações</span>
            {naoLidas > 0 && (
              <Badge variant="secondary">
                {naoLidas} não lidas
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            Acompanhe suas notificações e atualizações
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-4 mt-6">
          {/* Controles */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filtros
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Tipo</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setFiltroTipo('todos')}>
                    Todos
                  </DropdownMenuItem>
                  {Object.keys(iconesPorTipo).map(tipo => {
                    const Icon = iconesPorTipo[tipo as TipoNotificacao]
                    return (
                      <DropdownMenuItem 
                        key={tipo}
                        onClick={() => setFiltroTipo(tipo as TipoNotificacao)}
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                      </DropdownMenuItem>
                    )
                  })}
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Status</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setFiltroStatus('todos')}>
                    Todos
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFiltroStatus('nao_lida')}>
                    Não lidas
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFiltroStatus('lida')}>
                    Lidas
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFiltroStatus('arquivada')}>
                    Arquivadas
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {naoLidas > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={marcarTodasComoLidas}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Marcar todas como lidas
                </Button>
              )}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={limparNotificacoes}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Limpar todas
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Lista de notificações */}
          <ScrollArea className="h-[600px]">
            {Object.keys(notificacoesAgrupadas).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma notificação</h3>
                <p className="text-muted-foreground">
                  Você está em dia! Não há notificações para exibir.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(notificacoesAgrupadas).map(([grupo, notificacoesGrupo]) => (
                  <div key={grupo}>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                      {grupo}
                    </h4>
                    <div className="space-y-2">
                      {notificacoesGrupo.map(notificacao => (
                        <NotificationItem
                          key={notificacao.id}
                          notificacao={notificacao}
                          onMarcarLida={marcarComoLida}
                          onArquivar={arquivarNotificacao}
                          onRemover={removerNotificacao}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// Componente individual de notificação
function NotificationItem({
  notificacao,
  onMarcarLida,
  onArquivar,
  onRemover,
}: {
  notificacao: Notificacao
  onMarcarLida: (id: string) => void
  onArquivar: (id: string) => void
  onRemover: (id: string) => void
}) {
  const Icon = notificacao.iconePersonalizado || iconesPorTipo[notificacao.tipo]
  const corTipo = coresPorTipo[notificacao.tipo]
  const corPrioridade = coresPorPrioridade[notificacao.prioridade]
  
  const handleClick = () => {
    if (notificacao.status === 'nao_lida') {
      onMarcarLida(notificacao.id)
    }
    
    if (notificacao.url) {
      window.open(notificacao.url, '_blank')
    }
  }

  return (
    <Card 
      className={cn(
        'cursor-pointer transition-all hover:shadow-md border-l-4',
        corPrioridade,
        notificacao.status === 'nao_lida' && 'bg-muted/50'
      )}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn('mt-1', corTipo)}>
            <Icon className="h-5 w-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h4 className={cn(
                  'text-sm font-semibold',
                  notificacao.status === 'nao_lida' && 'font-bold'
                )}>
                  {notificacao.titulo}
                </h4>
                
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {notificacao.mensagem}
                </p>
                
                {notificacao.remetente && (
                  <div className="flex items-center gap-2 mt-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={notificacao.remetente.avatar} />
                      <AvatarFallback className="text-xs">
                        {notificacao.remetente.nome.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">
                      {notificacao.remetente.nome}
                      {notificacao.remetente.cargo && (
                        <span className="ml-1">• {notificacao.remetente.cargo}</span>
                      )}
                    </span>
                  </div>
                )}
                
                {notificacao.tags && notificacao.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {notificacao.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                {notificacao.acoes && notificacao.acoes.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {notificacao.acoes.map((acao, index) => (
                      <Button
                        key={index}
                        variant={acao.variante || 'outline'}
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          acao.acao()
                        }}
                      >
                        {acao.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(notificacao.criadaEm, {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {notificacao.status === 'nao_lida' && (
                      <DropdownMenuItem onClick={() => onMarcarLida(notificacao.id)}>
                        <Check className="mr-2 h-4 w-4" />
                        Marcar como lida
                      </DropdownMenuItem>
                    )}
                    
                    {notificacao.status !== 'arquivada' && (
                      <DropdownMenuItem onClick={() => onArquivar(notificacao.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Arquivar
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuItem 
                      onClick={() => onRemover(notificacao.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remover
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Componente de configurações de notificação
export function NotificationSettings() {
  const { configuracao, atualizarConfiguracao } = useNotifications()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configurações de Notificação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Canais */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Canais de Notificação</h4>
          <div className="space-y-2">
            {[
              { canal: 'app' as CanalNotificacao, label: 'Aplicativo', icon: Monitor },
              { canal: 'email' as CanalNotificacao, label: 'Email', icon: Mail },
              { canal: 'push' as CanalNotificacao, label: 'Push', icon: Smartphone },
              { canal: 'sms' as CanalNotificacao, label: 'SMS', icon: MessageSquare },
            ].map(({ canal, label, icon: Icon }) => (
              <div key={canal} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="text-sm">{label}</span>
                </div>
                <Button
                  variant={configuracao.canaisAtivos.includes(canal) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    const novosCanais = configuracao.canaisAtivos.includes(canal)
                      ? configuracao.canaisAtivos.filter(c => c !== canal)
                      : [...configuracao.canaisAtivos, canal]
                    atualizarConfiguracao({ canaisAtivos: novosCanais })
                  }}
                >
                  {configuracao.canaisAtivos.includes(canal) ? 'Ativo' : 'Inativo'}
                </Button>
              </div>
            ))}
          </div>
        </div>
        
        <Separator />
        
        {/* Sons */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Sons</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Reproduzir sons</span>
              <Button
                variant={configuracao.sons.ativo ? 'default' : 'outline'}
                size="sm"
                onClick={() => atualizarConfiguracao({
                  sons: { ...configuracao.sons, ativo: !configuracao.sons.ativo }
                })}
              >
                {configuracao.sons.ativo ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {configuracao.sons.ativo && (
              <div>
                <label className="text-sm text-muted-foreground">Volume: {configuracao.sons.volume}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={configuracao.sons.volume}
                  onChange={(e) => atualizarConfiguracao({
                    sons: { ...configuracao.sons, volume: Number(e.target.value) }
                  })}
                  className="w-full mt-1"
                />
              </div>
            )}
          </div>
        </div>
        
        <Separator />
        
        {/* Auto-arquivar */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Auto-arquivar</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Arquivar automaticamente</span>
              <Button
                variant={configuracao.autoArquivar.ativo ? 'default' : 'outline'}
                size="sm"
                onClick={() => atualizarConfiguracao({
                  autoArquivar: { 
                    ...configuracao.autoArquivar, 
                    ativo: !configuracao.autoArquivar.ativo 
                  }
                })}
              >
                {configuracao.autoArquivar.ativo ? 'Ativo' : 'Inativo'}
              </Button>
            </div>
            
            {configuracao.autoArquivar.ativo && (
              <div>
                <label className="text-sm text-muted-foreground">
                  Arquivar após {configuracao.autoArquivar.diasAposLeitura} dias da leitura
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={configuracao.autoArquivar.diasAposLeitura}
                  onChange={(e) => atualizarConfiguracao({
                    autoArquivar: { 
                      ...configuracao.autoArquivar, 
                      diasAposLeitura: Number(e.target.value) 
                    }
                  })}
                  className="w-full mt-1"
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Hook para criar notificações facilmente
export function useCreateNotification() {
  const { adicionarNotificacao } = useNotifications()
  
  return {
    sucesso: (titulo: string, mensagem: string, opcoes?: Partial<Notificacao>) => {
      adicionarNotificacao({
        titulo,
        mensagem,
        tipo: 'sucesso',
        prioridade: 'media',
        canais: ['app'],
        ...opcoes,
      })
    },
    
    erro: (titulo: string, mensagem: string, opcoes?: Partial<Notificacao>) => {
      adicionarNotificacao({
        titulo,
        mensagem,
        tipo: 'erro',
        prioridade: 'alta',
        canais: ['app'],
        ...opcoes,
      })
    },
    
    info: (titulo: string, mensagem: string, opcoes?: Partial<Notificacao>) => {
      adicionarNotificacao({
        titulo,
        mensagem,
        tipo: 'info',
        prioridade: 'media',
        canais: ['app'],
        ...opcoes,
      })
    },
    
    aviso: (titulo: string, mensagem: string, opcoes?: Partial<Notificacao>) => {
      adicionarNotificacao({
        titulo,
        mensagem,
        tipo: 'aviso',
        prioridade: 'media',
        canais: ['app'],
        ...opcoes,
      })
    },
    
    conquista: (titulo: string, mensagem: string, opcoes?: Partial<Notificacao>) => {
      adicionarNotificacao({
        titulo,
        mensagem,
        tipo: 'conquista',
        prioridade: 'alta',
        canais: ['app'],
        ...opcoes,
      })
    },
    
    personalizada: adicionarNotificacao,
  }
}