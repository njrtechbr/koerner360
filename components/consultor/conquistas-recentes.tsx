'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import {
  Award,
  Trophy,
  Star,
  Target,
  Zap,
  Crown,
  Medal,
  Flame,
  ExternalLink,
  Calendar,
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ConquistaRecente {
  id: string
  titulo: string
  descricao: string
  categoria: 'performance' | 'sequencia' | 'nivel' | 'especial'
  tipo: 'bronze' | 'prata' | 'ouro' | 'diamante'
  icone: string
  pontos: number
  desbloqueadaEm: string
  atendente: {
    id: string
    nome: string
    cargo: string
    portaria: string
  }
}

interface ConquistasRecentesProps {
  limite?: number
  periodo?: 'semanal' | 'mensal' | 'trimestral'
}

export function ConquistasRecentes({ limite = 10, periodo = 'mensal' }: ConquistasRecentesProps) {
  const [conquistas, setConquistas] = useState<ConquistaRecente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const buscarConquistas = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          `/api/consultor/conquistas?limite=${limite}&status=ativo&recentes=true&periodo=${periodo}`
        )
        
        if (!response.ok) {
          throw new Error('Erro ao carregar conquistas')
        }

        const result = await response.json()
        
        if (!result.success) {
          throw new Error(result.error || 'Erro desconhecido')
        }

        setConquistas(result.data.conquistas || [])
      } catch (err) {
        console.error('Erro ao buscar conquistas:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    buscarConquistas()
  }, [limite, periodo])

  const getIconeConquista = (categoria: string, icone: string) => {
    const iconProps = { className: "h-5 w-5" }
    
    switch (icone) {
      case 'trophy':
        return <Trophy {...iconProps} />
      case 'star':
        return <Star {...iconProps} />
      case 'target':
        return <Target {...iconProps} />
      case 'zap':
        return <Zap {...iconProps} />
      case 'crown':
        return <Crown {...iconProps} />
      case 'medal':
        return <Medal {...iconProps} />
      case 'flame':
        return <Flame {...iconProps} />
      default:
        return <Award {...iconProps} />
    }
  }

  const getCorTipo = (tipo: string) => {
    switch (tipo) {
      case 'bronze':
        return {
          bg: 'bg-amber-100',
          text: 'text-amber-700',
          border: 'border-amber-200',
          badge: 'bg-amber-500'
        }
      case 'prata':
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-700',
          border: 'border-gray-200',
          badge: 'bg-gray-500'
        }
      case 'ouro':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-700',
          border: 'border-yellow-200',
          badge: 'bg-yellow-500'
        }
      case 'diamante':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-700',
          border: 'border-blue-200',
          badge: 'bg-blue-500'
        }
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-700',
          border: 'border-gray-200',
          badge: 'bg-gray-500'
        }
    }
  }

  const getCorCategoria = (categoria: string) => {
    switch (categoria) {
      case 'performance':
        return 'text-green-600'
      case 'sequencia':
        return 'text-orange-600'
      case 'nivel':
        return 'text-purple-600'
      case 'especial':
        return 'text-pink-600'
      default:
        return 'text-blue-600'
    }
  }

  const getIniciais = (nome: string) => {
    return nome
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Conquistas Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSpinner text="Carregando conquistas..." />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Conquistas Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-destructive">
            <p>Erro ao carregar conquistas: {error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (conquistas.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Conquistas Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            <Award className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhuma conquista recente encontrada.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Conquistas Recentes
        </CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link href="/consultor/conquistas" className="flex items-center gap-1">
            Ver todas
            <ExternalLink className="h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {conquistas.map((conquista) => {
            const cores = getCorTipo(conquista.tipo)
            
            return (
              <div
                key={conquista.id}
                className={`flex items-start gap-4 p-4 rounded-lg border transition-all hover:shadow-sm ${
                  cores.bg
                } ${cores.border}`}
              >
                {/* Ícone da Conquista */}
                <div className={`p-3 rounded-full ${cores.badge}`}>
                  <div className="text-white">
                    {getIconeConquista(conquista.categoria, conquista.icone)}
                  </div>
                </div>

                {/* Informações da Conquista */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-semibold text-sm ${cores.text}`}>
                          {conquista.titulo}
                        </h4>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getCorCategoria(conquista.categoria)}`}
                        >
                          {conquista.categoria.charAt(0).toUpperCase() + conquista.categoria.slice(1)}
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mb-2">
                        {conquista.descricao}
                      </p>
                      
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`font-medium ${cores.text}`}>
                          +{conquista.pontos} pontos
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground capitalize">
                          {conquista.tipo}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right text-xs text-muted-foreground">
                      <div className="flex items-center gap-1 mb-1">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(conquista.desbloqueadaEm), {
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </div>
                    </div>
                  </div>
                  
                  {/* Informações do Atendente */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={`/avatars/${conquista.atendente.id}.jpg`} />
                      <AvatarFallback className="text-xs">
                        {getIniciais(conquista.atendente.nome)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">
                        {conquista.atendente.nome}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {conquista.atendente.cargo} • {conquista.atendente.portaria}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {conquistas.length >= limite && (
          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/consultor/conquistas">
                Ver todas as conquistas
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}