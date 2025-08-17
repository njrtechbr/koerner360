'use client'

import { useState } from 'react'
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
import {
  Trophy,
  Medal,
  Award,
  Star,
  TrendingUp,
  TrendingDown,
  Minus,
  Crown,
  Flame,
  Target,
  Users,
  Calendar,
  Filter,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

type CriterioOrdenacao = 'pontuacao' | 'mediaNotas' | 'satisfacao' | 'avaliacoes' | 'nivel' | 'sequencia'
type DirecaoOrdenacao = 'asc' | 'desc'
type TipoRanking = 'geral' | 'mensal' | 'semanal' | 'categoria'

interface ItemRanking {
  id: string
  nome: string
  cargo?: string
  portaria?: string
  posicao: number
  posicaoAnterior?: number
  pontuacaoTotal: number
  mediaNotas: number
  totalAvaliacoes: number
  percentualSatisfacao: number
  nivel: number
  experiencia: number
  sequenciaAtual: number
  melhorSequencia: number
  conquistasDesbloqueadas: number
  tendencia: 'crescente' | 'decrescente' | 'estavel'
  destaque?: 'mvp' | 'destaque' | 'promessa' | 'novato'
  avatar?: string
  ativo: boolean
}

interface RankingDisplayProps {
  itens: ItemRanking[]
  titulo?: string
  tipo?: TipoRanking
  criterioOrdenacao?: CriterioOrdenacao
  direcaoOrdenacao?: DirecaoOrdenacao
  showControls?: boolean
  showPosicaoAnterior?: boolean
  showProgresso?: boolean
  showDetalhes?: boolean
  maxItens?: number
  compacto?: boolean
  className?: string
  onItemClick?: (item: ItemRanking) => void
  onOrdenacaoChange?: (criterio: CriterioOrdenacao, direcao: DirecaoOrdenacao) => void
}

const criteriosOrdenacao = [
  { value: 'pontuacao', label: 'Pontuação', icon: Trophy },
  { value: 'mediaNotas', label: 'Média de Notas', icon: Star },
  { value: 'satisfacao', label: 'Satisfação', icon: Target },
  { value: 'avaliacoes', label: 'Avaliações', icon: Users },
  { value: 'nivel', label: 'Nível', icon: Award },
  { value: 'sequencia', label: 'Sequência', icon: Flame },
]

const coresDestaque = {
  mvp: {
    bg: 'bg-gradient-to-r from-yellow-50 to-orange-50',
    border: 'border-l-yellow-500',
    badge: 'bg-yellow-500 text-white',
    glow: 'shadow-yellow-200',
  },
  destaque: {
    bg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
    border: 'border-l-blue-500',
    badge: 'bg-blue-500 text-white',
    glow: 'shadow-blue-200',
  },
  promessa: {
    bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
    border: 'border-l-green-500',
    badge: 'bg-green-500 text-white',
    glow: 'shadow-green-200',
  },
  novato: {
    bg: 'bg-gradient-to-r from-purple-50 to-violet-50',
    border: 'border-l-purple-500',
    badge: 'bg-purple-500 text-white',
    glow: 'shadow-purple-200',
  },
}

export function RankingDisplay({
  itens,
  titulo = 'Ranking',
  tipo = 'geral',
  criterioOrdenacao = 'pontuacao',
  direcaoOrdenacao = 'desc',
  showControls = true,
  showPosicaoAnterior = true,
  showProgresso = true,
  showDetalhes = true,
  maxItens,
  compacto = false,
  className,
  onItemClick,
  onOrdenacaoChange,
}: RankingDisplayProps) {
  const [criterio, setCriterio] = useState<CriterioOrdenacao>(criterioOrdenacao)
  const [direcao, setDirecao] = useState<DirecaoOrdenacao>(direcaoOrdenacao)
  const [filtroAtivo, setFiltroAtivo] = useState<boolean | null>(null)

  const itensExibidos = maxItens ? itens.slice(0, maxItens) : itens
  const itensFiltrados = filtroAtivo !== null 
    ? itensExibidos.filter(item => item.ativo === filtroAtivo)
    : itensExibidos

  const getPosicaoIcon = (posicao: number, destaque?: string) => {
    if (destaque === 'mvp') {
      return <Crown className="h-5 w-5 text-yellow-500" />
    }
    
    switch (posicao) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold text-sm">
            {posicao}
          </div>
        )
    }
  }

  const getVariacaoPosicao = (posicao: number, posicaoAnterior?: number) => {
    if (!posicaoAnterior || posicaoAnterior === posicao) {
      return <Minus className="h-4 w-4 text-gray-400" />
    }
    
    if (posicao < posicaoAnterior) {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <ChevronUp className="h-4 w-4" />
          <span className="text-xs font-medium">+{posicaoAnterior - posicao}</span>
        </div>
      )
    }
    
    return (
      <div className="flex items-center gap-1 text-red-600">
        <ChevronDown className="h-4 w-4" />
        <span className="text-xs font-medium">-{posicao - posicaoAnterior}</span>
      </div>
    )
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

  const getDestaqueBadge = (destaque?: string) => {
    if (!destaque) return null
    
    const config = coresDestaque[destaque as keyof typeof coresDestaque]
    const labels = {
      mvp: 'MVP',
      destaque: 'Destaque',
      promessa: 'Promessa',
      novato: 'Novato',
    }
    
    return (
      <Badge className={config.badge}>
        {labels[destaque as keyof typeof labels]}
      </Badge>
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

  const getProgressoNivel = (experiencia: number) => {
    const experienciaAtual = experiencia % 1000
    return (experienciaAtual / 1000) * 100
  }

  const handleOrdenacaoChange = (novoCriterio: CriterioOrdenacao) => {
    const novaDirecao = criterio === novoCriterio && direcao === 'desc' ? 'asc' : 'desc'
    setCriterio(novoCriterio)
    setDirecao(novaDirecao)
    onOrdenacaoChange?.(novoCriterio, novaDirecao)
  }

  const getValorMetrica = (item: ItemRanking, criterio: CriterioOrdenacao) => {
    switch (criterio) {
      case 'pontuacao':
        return item.pontuacaoTotal.toLocaleString()
      case 'mediaNotas':
        return item.mediaNotas.toFixed(1)
      case 'satisfacao':
        return `${item.percentualSatisfacao.toFixed(0)}%`
      case 'avaliacoes':
        return item.totalAvaliacoes.toString()
      case 'nivel':
        return item.nivel.toString()
      case 'sequencia':
        return item.sequenciaAtual.toString()
      default:
        return '-'
    }
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            {titulo}
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span className="capitalize">{tipo}</span>
            <span>•</span>
            <span>{itensFiltrados.length} atendentes</span>
          </div>
        </div>
        
        {showControls && (
          <div className="flex items-center gap-2">
            <Select value={filtroAtivo?.toString() || 'todos'} onValueChange={(value) => {
              setFiltroAtivo(value === 'todos' ? null : value === 'true')
            }}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="true">Ativos</SelectItem>
                <SelectItem value="false">Inativos</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={criterio} onValueChange={(value: CriterioOrdenacao) => handleOrdenacaoChange(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {criteriosOrdenacao.map((item) => {
                  const Icon = item.icon
                  return (
                    <SelectItem key={item.value} value={item.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const novaDirecao = direcao === 'desc' ? 'asc' : 'desc'
                setDirecao(novaDirecao)
                onOrdenacaoChange?.(criterio, novaDirecao)
              }}
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          {itensFiltrados.map((item, index) => {
            const destaque = item.destaque
            const configDestaque = destaque ? coresDestaque[destaque] : null
            
            return (
              <div
                key={item.id}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-lg border-l-4 transition-all hover:shadow-md cursor-pointer',
                  configDestaque ? configDestaque.bg : 'bg-white',
                  configDestaque ? configDestaque.border : 'border-l-gray-300',
                  configDestaque?.glow,
                  !item.ativo && 'opacity-60',
                  compacto && 'p-2'
                )}
                onClick={() => onItemClick?.(item)}
              >
                {/* Posição e Variação */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-12">
                    {getPosicaoIcon(item.posicao, item.destaque)}
                  </div>
                  
                  {showPosicaoAnterior && (
                    <div className="flex flex-col items-center">
                      {getVariacaoPosicao(item.posicao, item.posicaoAnterior)}
                    </div>
                  )}
                </div>

                {/* Avatar e Info Básica */}
                <div className="flex items-center gap-3">
                  <Avatar className={cn('h-12 w-12', compacto && 'h-8 w-8')}>
                    <AvatarImage src={item.avatar || `/avatars/${item.id}.jpg`} />
                    <AvatarFallback className="text-sm font-medium">
                      {getIniciais(item.nome)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={cn('font-semibold truncate', compacto ? 'text-sm' : 'text-base')}>
                        {item.nome}
                      </h4>
                      {getDestaqueBadge(item.destaque)}
                      <Badge variant="outline" className="text-xs">
                        Nível {item.nivel}
                      </Badge>
                      {getTendenciaIcon(item.tendencia)}
                    </div>
                    
                    {showDetalhes && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        {item.cargo && <span>{item.cargo}</span>}
                        {item.cargo && item.portaria && <span>•</span>}
                        {item.portaria && <span>{item.portaria}</span>}
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          {item.conquistasDesbloqueadas} conquistas
                        </span>
                      </div>
                    )}
                    
                    {showProgresso && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">XP:</span>
                        <Progress 
                          value={getProgressoNivel(item.experiencia)} 
                          className={cn('flex-1 h-2', compacto && 'h-1')}
                        />
                        <span className="text-xs text-muted-foreground">
                          {1000 - (item.experiencia % 1000)} para próximo
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Métricas */}
                <div className="flex items-center gap-6">
                  {/* Métrica Principal */}
                  <div className="text-center">
                    <div className={cn('font-bold text-primary', compacto ? 'text-lg' : 'text-xl')}>
                      {getValorMetrica(item, criterio)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {criteriosOrdenacao.find(c => c.value === criterio)?.label}
                    </div>
                  </div>
                  
                  {!compacto && (
                    <>
                      <div className="text-center">
                        <div className="flex items-center gap-1 font-medium">
                          <Star className="h-3 w-3 text-yellow-500" />
                          {item.mediaNotas.toFixed(1)}
                        </div>
                        <div className="text-xs text-muted-foreground">Média</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="font-medium text-green-600">
                          {item.percentualSatisfacao.toFixed(0)}%
                        </div>
                        <div className="text-xs text-muted-foreground">Satisfação</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center gap-1 font-medium">
                          <Flame className="h-3 w-3 text-orange-500" />
                          {item.sequenciaAtual}
                        </div>
                        <div className="text-xs text-muted-foreground">Sequência</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="font-medium text-blue-600">
                          {item.totalAvaliacoes}
                        </div>
                        <div className="text-xs text-muted-foreground">Avaliações</div>
                      </div>
                    </>
                  )}
                </div>

                {/* Link para detalhes */}
                <div className="flex items-center">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/consultor/atendentes/${item.id}`}>
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        {itensFiltrados.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <Trophy className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum atendente encontrado.</p>
          </div>
        )}
        
        {maxItens && itens.length > maxItens && (
          <div className="text-center mt-4 pt-4 border-t">
            <Button variant="outline" asChild>
              <Link href="/consultor/rankings">
                Ver ranking completo ({itens.length - maxItens} restantes)
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Componente para ranking compacto/resumido
interface RankingResumoProps {
  itens: ItemRanking[]
  titulo?: string
  maxItens?: number
  criterio?: CriterioOrdenacao
  className?: string
}

export function RankingResumo({
  itens,
  titulo = 'Top Performers',
  maxItens = 5,
  criterio = 'pontuacao',
  className,
}: RankingResumoProps) {
  const itensExibidos = itens.slice(0, maxItens)
  
  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          {titulo}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-2">
        {itensExibidos.map((item, index) => (
          <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
            <div className="flex items-center justify-center w-8">
              {getPosicaoIcon(item.posicao, item.destaque)}
            </div>
            
            <Avatar className="h-8 w-8">
              <AvatarImage src={item.avatar || `/avatars/${item.id}.jpg`} />
              <AvatarFallback className="text-xs">
                {getIniciais(item.nome)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{item.nome}</div>
              <div className="text-xs text-muted-foreground">
                {item.cargo} • Nível {item.nivel}
              </div>
            </div>
            
            <div className="text-right">
              <div className="font-bold text-sm text-primary">
                {getValorMetrica(item, criterio)}
              </div>
              <div className="text-xs text-muted-foreground">
                {criteriosOrdenacao.find(c => c.value === criterio)?.label}
              </div>
            </div>
          </div>
        ))}
        
        <div className="text-center pt-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/consultor/rankings" className="flex items-center gap-1">
              Ver todos
              <ExternalLink className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
  
  function getPosicaoIcon(posicao: number, destaque?: string) {
    if (destaque === 'mvp') {
      return <Crown className="h-4 w-4 text-yellow-500" />
    }
    
    switch (posicao) {
      case 1:
        return <Trophy className="h-4 w-4 text-yellow-500" />
      case 2:
        return <Medal className="h-4 w-4 text-gray-400" />
      case 3:
        return <Award className="h-4 w-4 text-amber-600" />
      default:
        return (
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-600 font-bold text-xs">
            {posicao}
          </div>
        )
    }
  }
  
  function getIniciais(nome: string) {
    return nome
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  
  function getValorMetrica(item: ItemRanking, criterio: CriterioOrdenacao) {
    switch (criterio) {
      case 'pontuacao':
        return item.pontuacaoTotal.toLocaleString()
      case 'mediaNotas':
        return item.mediaNotas.toFixed(1)
      case 'satisfacao':
        return `${item.percentualSatisfacao.toFixed(0)}%`
      case 'avaliacoes':
        return item.totalAvaliacoes.toString()
      case 'nivel':
        return item.nivel.toString()
      case 'sequencia':
        return item.sequenciaAtual.toString()
      default:
        return '-'
    }
  }
}