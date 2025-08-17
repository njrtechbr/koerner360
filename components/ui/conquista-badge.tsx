'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Trophy,
  Medal,
  Award,
  Star,
  Target,
  Flame,
  Crown,
  Shield,
  Zap,
  Heart,
  Sparkles,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  Gift,
  Gem,
  Rocket,
  ThumbsUp,
  Calendar,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type CategoriaConquista = 'performance' | 'consistencia' | 'melhoria' | 'colaboracao' | 'especial'
type TipoConquista = 'bronze' | 'prata' | 'ouro' | 'platina' | 'diamante'

interface Conquista {
  id: string
  titulo: string
  descricao: string
  categoria: CategoriaConquista
  tipo: TipoConquista
  pontos: number
  icone?: string
  desbloqueadaEm?: string
  progresso?: {
    atual: number
    total: number
  }
  rara?: boolean
}

interface ConquistaBadgeProps {
  conquista: Conquista
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'compact' | 'detailed'
  showProgress?: boolean
  className?: string
}

const iconesCategoria = {
  performance: Trophy,
  consistencia: Target,
  melhoria: TrendingUp,
  colaboracao: Users,
  especial: Crown,
}

const coresCategoria = {
  performance: {
    bg: 'bg-gradient-to-br from-yellow-100 to-orange-100',
    border: 'border-yellow-300',
    text: 'text-yellow-800',
    icon: 'text-yellow-600',
  },
  consistencia: {
    bg: 'bg-gradient-to-br from-blue-100 to-indigo-100',
    border: 'border-blue-300',
    text: 'text-blue-800',
    icon: 'text-blue-600',
  },
  melhoria: {
    bg: 'bg-gradient-to-br from-green-100 to-emerald-100',
    border: 'border-green-300',
    text: 'text-green-800',
    icon: 'text-green-600',
  },
  colaboracao: {
    bg: 'bg-gradient-to-br from-purple-100 to-violet-100',
    border: 'border-purple-300',
    text: 'text-purple-800',
    icon: 'text-purple-600',
  },
  especial: {
    bg: 'bg-gradient-to-br from-pink-100 to-rose-100',
    border: 'border-pink-300',
    text: 'text-pink-800',
    icon: 'text-pink-600',
  },
}

const coresTipo = {
  bronze: {
    bg: 'bg-gradient-to-br from-amber-600 to-orange-700',
    text: 'text-white',
    shadow: 'shadow-amber-200',
  },
  prata: {
    bg: 'bg-gradient-to-br from-gray-400 to-gray-600',
    text: 'text-white',
    shadow: 'shadow-gray-200',
  },
  ouro: {
    bg: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
    text: 'text-white',
    shadow: 'shadow-yellow-200',
  },
  platina: {
    bg: 'bg-gradient-to-br from-slate-300 to-slate-500',
    text: 'text-white',
    shadow: 'shadow-slate-200',
  },
  diamante: {
    bg: 'bg-gradient-to-br from-cyan-400 to-blue-600',
    text: 'text-white',
    shadow: 'shadow-cyan-200',
  },
}

const tamanhos = {
  sm: {
    card: 'w-16 h-16',
    icon: 'h-6 w-6',
    text: 'text-xs',
    badge: 'text-xs px-1',
  },
  md: {
    card: 'w-20 h-20',
    icon: 'h-8 w-8',
    text: 'text-sm',
    badge: 'text-xs px-2',
  },
  lg: {
    card: 'w-24 h-24',
    icon: 'h-10 w-10',
    text: 'text-base',
    badge: 'text-sm px-2',
  },
}

export function ConquistaBadge({
  conquista,
  size = 'md',
  variant = 'default',
  showProgress = false,
  className,
}: ConquistaBadgeProps) {
  const IconeCategoria = iconesCategoria[conquista.categoria]
  const coresCateg = coresCategoria[conquista.categoria]
  const coresTipoAtual = coresTipo[conquista.tipo]
  const tamanho = tamanhos[size]

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const getProgressoPercentual = () => {
    if (!conquista.progresso) return 100
    return (conquista.progresso.atual / conquista.progresso.total) * 100
  }

  const isDesbloqueada = !!conquista.desbloqueadaEm

  if (variant === 'compact') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                'relative inline-flex items-center justify-center rounded-full border-2 transition-all hover:scale-110',
                tamanho.card,
                isDesbloqueada ? coresCateg.bg : 'bg-gray-100',
                isDesbloqueada ? coresCateg.border : 'border-gray-300',
                conquista.rara && isDesbloqueada && 'animate-pulse',
                !isDesbloqueada && 'opacity-50 grayscale',
                className
              )}
            >
              <IconeCategoria
                className={cn(
                  tamanho.icon,
                  isDesbloqueada ? coresCateg.icon : 'text-gray-400'
                )}
              />
              
              {conquista.rara && isDesbloqueada && (
                <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-500" />
              )}
              
              {!isDesbloqueada && showProgress && conquista.progresso && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                  <div className="w-8 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${getProgressoPercentual()}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">{conquista.titulo}</h4>
                <Badge className={cn(coresTipoAtual.bg, coresTipoAtual.text, tamanho.badge)}>
                  {conquista.tipo.toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{conquista.descricao}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  {conquista.pontos} pontos
                </span>
                {conquista.desbloqueadaEm && (
                  <span className="text-green-600">
                    Desbloqueada em {formatarData(conquista.desbloqueadaEm)}
                  </span>
                )}
              </div>
              {!isDesbloqueada && conquista.progresso && (
                <div className="text-xs text-muted-foreground">
                  Progresso: {conquista.progresso.atual}/{conquista.progresso.total}
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  if (variant === 'detailed') {
    return (
      <Card
        className={cn(
          'relative overflow-hidden transition-all hover:shadow-lg',
          isDesbloqueada ? coresCateg.bg : 'bg-gray-50',
          isDesbloqueada ? coresCateg.border : 'border-gray-200',
          !isDesbloqueada && 'opacity-75',
          className
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'flex items-center justify-center rounded-full border-2 flex-shrink-0',
                tamanho.card,
                isDesbloqueada ? coresCateg.border : 'border-gray-300'
              )}
            >
              <IconeCategoria
                className={cn(
                  tamanho.icon,
                  isDesbloqueada ? coresCateg.icon : 'text-gray-400'
                )}
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className={cn('font-semibold truncate', tamanho.text)}>
                  {conquista.titulo}
                </h4>
                <Badge className={cn(coresTipoAtual.bg, coresTipoAtual.text, tamanho.badge)}>
                  {conquista.tipo.toUpperCase()}
                </Badge>
                {conquista.rara && (
                  <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Rara
                  </Badge>
                )}
              </div>
              
              <p className={cn('text-muted-foreground mb-2', tamanho.text)}>
                {conquista.descricao}
              </p>
              
              <div className="flex items-center justify-between">
                <span className={cn('flex items-center gap-1 text-primary', tamanho.text)}>
                  <Star className="h-3 w-3" />
                  {conquista.pontos} pontos
                </span>
                
                {conquista.desbloqueadaEm ? (
                  <span className={cn('text-green-600 flex items-center gap-1', tamanho.text)}>
                    <CheckCircle className="h-3 w-3" />
                    {formatarData(conquista.desbloqueadaEm)}
                  </span>
                ) : (
                  <span className={cn('text-muted-foreground', tamanho.text)}>
                    Não desbloqueada
                  </span>
                )}
              </div>
              
              {!isDesbloqueada && showProgress && conquista.progresso && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Progresso</span>
                    <span className="text-xs text-muted-foreground">
                      {conquista.progresso.atual}/{conquista.progresso.total}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${getProgressoPercentual()}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {conquista.rara && isDesbloqueada && (
            <div className="absolute top-2 right-2">
              <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Variant default
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card
            className={cn(
              'relative cursor-pointer transition-all hover:scale-105 hover:shadow-lg',
              isDesbloqueada ? coresCateg.bg : 'bg-gray-100',
              isDesbloqueada ? coresCateg.border : 'border-gray-300',
              !isDesbloqueada && 'opacity-60',
              conquista.rara && isDesbloqueada && coresTipoAtual.shadow,
              className
            )}
          >
            <CardContent className="p-3">
              <div className="flex flex-col items-center text-center space-y-2">
                <div
                  className={cn(
                    'flex items-center justify-center rounded-full border-2',
                    tamanho.card,
                    isDesbloqueada ? coresCateg.border : 'border-gray-300'
                  )}
                >
                  <IconeCategoria
                    className={cn(
                      tamanho.icon,
                      isDesbloqueada ? coresCateg.icon : 'text-gray-400'
                    )}
                  />
                </div>
                
                <div className="space-y-1">
                  <h4 className={cn('font-semibold line-clamp-2', tamanho.text)}>
                    {conquista.titulo}
                  </h4>
                  
                  <div className="flex items-center justify-center gap-1">
                    <Badge className={cn(coresTipoAtual.bg, coresTipoAtual.text, tamanho.badge)}>
                      {conquista.tipo.toUpperCase()}
                    </Badge>
                    {conquista.rara && (
                      <Sparkles className="h-3 w-3 text-yellow-500" />
                    )}
                  </div>
                  
                  <div className={cn('flex items-center justify-center gap-1 text-primary', tamanho.text)}>
                    <Star className="h-3 w-3" />
                    {conquista.pontos}
                  </div>
                </div>
              </div>
              
              {!isDesbloqueada && showProgress && conquista.progresso && (
                <div className="mt-2">
                  <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${getProgressoPercentual()}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
            
            {conquista.rara && isDesbloqueada && (
              <div className="absolute -top-1 -right-1">
                <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
              </div>
            )}
          </Card>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold">{conquista.titulo}</h4>
              <Badge className={cn(coresTipoAtual.bg, coresTipoAtual.text)}>
                {conquista.tipo.toUpperCase()}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{conquista.descricao}</p>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                {conquista.pontos} pontos
              </span>
              {conquista.desbloqueadaEm && (
                <span className="text-green-600">
                  Desbloqueada em {formatarData(conquista.desbloqueadaEm)}
                </span>
              )}
            </div>
            {!isDesbloqueada && conquista.progresso && (
              <div className="text-xs text-muted-foreground">
                Progresso: {conquista.progresso.atual}/{conquista.progresso.total}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Componente para exibir múltiplas conquistas
interface ConquistasGridProps {
  conquistas: Conquista[]
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'compact' | 'detailed'
  showProgress?: boolean
  maxItems?: number
  className?: string
}

export function ConquistasGrid({
  conquistas,
  size = 'md',
  variant = 'default',
  showProgress = false,
  maxItems,
  className,
}: ConquistasGridProps) {
  const conquistasExibidas = maxItems ? conquistas.slice(0, maxItems) : conquistas
  const conquistasRestantes = maxItems && conquistas.length > maxItems ? conquistas.length - maxItems : 0

  if (variant === 'compact') {
    return (
      <div className={cn('flex flex-wrap gap-2', className)}>
        {conquistasExibidas.map((conquista) => (
          <ConquistaBadge
            key={conquista.id}
            conquista={conquista}
            size={size}
            variant={variant}
            showProgress={showProgress}
          />
        ))}
        {conquistasRestantes > 0 && (
          <div
            className={cn(
              'flex items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500',
              tamanhos[size].card
            )}
          >
            <span className={cn('font-medium', tamanhos[size].text)}>+{conquistasRestantes}</span>
          </div>
        )}
      </div>
    )
  }

  if (variant === 'detailed') {
    return (
      <div className={cn('space-y-4', className)}>
        {conquistasExibidas.map((conquista) => (
          <ConquistaBadge
            key={conquista.id}
            conquista={conquista}
            size={size}
            variant={variant}
            showProgress={showProgress}
          />
        ))}
        {conquistasRestantes > 0 && (
          <Card className="border-dashed">
            <CardContent className="p-4 text-center text-muted-foreground">
              <Gift className="h-8 w-8 mx-auto mb-2" />
              <p>E mais {conquistasRestantes} conquistas...</p>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className={cn('grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4', className)}>
      {conquistasExibidas.map((conquista) => (
        <ConquistaBadge
          key={conquista.id}
          conquista={conquista}
          size={size}
          variant={variant}
          showProgress={showProgress}
        />
      ))}
      {conquistasRestantes > 0 && (
        <Card className="border-dashed hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-3 flex flex-col items-center justify-center text-center h-full">
            <Gift className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-sm font-medium text-muted-foreground">
              +{conquistasRestantes}
            </span>
            <span className="text-xs text-muted-foreground">mais</span>
          </CardContent>
        </Card>
      )}
    </div>
  )
}