'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import {
  Trophy,
  Medal,
  Award,
  Star,
  TrendingUp,
  Users,
  ExternalLink,
} from 'lucide-react'
import Link from 'next/link'

interface AtendenteRanking {
  id: string
  nome: string
  cargo: string
  portaria: string
  pontuacaoTotal: number
  mediaNotas: number
  totalAvaliacoes: number
  percentualSatisfacao: number
  nivel: number
  experiencia: number
  posicao: number
  sequenciaAtual: number
  melhorSequencia: number
}

interface RankingOverviewProps {
  periodo?: 'semanal' | 'mensal' | 'trimestral' | 'anual'
  limite?: number
}

export function RankingOverview({ periodo = 'mensal', limite = 5 }: RankingOverviewProps) {
  const [atendentes, setAtendentes] = useState<AtendenteRanking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const buscarRanking = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          `/api/consultor/rankings?periodo=${periodo}&limite=${limite}&ordenacao=pontuacao&direcao=desc`
        )
        
        if (!response.ok) {
          throw new Error('Erro ao carregar ranking')
        }

        const result = await response.json()
        
        if (!result.success) {
          throw new Error(result.error || 'Erro desconhecido')
        }

        setAtendentes(result.data.atendentes || [])
      } catch (err) {
        console.error('Erro ao buscar ranking:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    buscarRanking()
  }, [periodo, limite])

  const getPosicaoIcon = (posicao: number) => {
    switch (posicao) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{posicao}</span>
    }
  }

  const getPosicaoColor = (posicao: number) => {
    switch (posicao) {
      case 1:
        return 'border-l-yellow-500 bg-yellow-50'
      case 2:
        return 'border-l-gray-400 bg-gray-50'
      case 3:
        return 'border-l-amber-600 bg-amber-50'
      default:
        return 'border-l-blue-500 bg-blue-50'
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
            <Trophy className="h-5 w-5" />
            Top Atendentes - {periodo.charAt(0).toUpperCase() + periodo.slice(1)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSpinner text="Carregando ranking..." />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Top Atendentes - {periodo.charAt(0).toUpperCase() + periodo.slice(1)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-destructive">
            <p>Erro ao carregar ranking: {error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (atendentes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Top Atendentes - {periodo.charAt(0).toUpperCase() + periodo.slice(1)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum atendente encontrado para o período selecionado.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Top Atendentes - {periodo.charAt(0).toUpperCase() + periodo.slice(1)}
        </CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link href="/consultor/rankings" className="flex items-center gap-1">
            Ver todos
            <ExternalLink className="h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {atendentes.map((atendente, index) => (
            <div
              key={atendente.id}
              className={`flex items-center gap-4 p-4 rounded-lg border-l-4 transition-all hover:shadow-sm ${
                getPosicaoColor(atendente.posicao)
              }`}
            >
              {/* Posição */}
              <div className="flex items-center justify-center w-8">
                {getPosicaoIcon(atendente.posicao)}
              </div>

              {/* Avatar e Info */}
              <div className="flex items-center gap-3 flex-1">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={`/avatars/${atendente.id}.jpg`} />
                  <AvatarFallback className="text-sm font-medium">
                    {getIniciais(atendente.nome)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm truncate">{atendente.nome}</h4>
                    <Badge variant="outline" className="text-xs">
                      Nível {atendente.nivel}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{atendente.cargo}</span>
                    <span>•</span>
                    <span>{atendente.portaria}</span>
                  </div>
                </div>
              </div>

              {/* Métricas */}
              <div className="flex items-center gap-4 text-sm">
                <div className="text-center">
                  <div className="font-bold text-primary">{atendente.pontuacaoTotal}</div>
                  <div className="text-xs text-muted-foreground">Pontos</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center gap-1 font-medium">
                    <Star className="h-3 w-3 text-yellow-500" />
                    {atendente.mediaNotas.toFixed(1)}
                  </div>
                  <div className="text-xs text-muted-foreground">Média</div>
                </div>
                
                <div className="text-center">
                  <div className="font-medium text-green-600">
                    {atendente.percentualSatisfacao.toFixed(0)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Satisfação</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center gap-1 font-medium">
                    <TrendingUp className="h-3 w-3 text-blue-500" />
                    {atendente.sequenciaAtual}
                  </div>
                  <div className="text-xs text-muted-foreground">Sequência</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {atendentes.length >= limite && (
          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/consultor/rankings">
                Ver ranking completo
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}