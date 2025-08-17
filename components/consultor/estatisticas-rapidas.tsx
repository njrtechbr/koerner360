'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import {
  Users,
  Star,
  TrendingUp,
  Award,
  Target,
  Activity,
} from 'lucide-react'

interface EstatisticasData {
  totalAtendentes: number
  totalAvaliacoes: number
  mediaGeralNotas: number
  percentualSatisfacao: number
  totalConquistas: number
  atendentesMesAtivo: number
  tendenciaGeral: 'crescente' | 'decrescente' | 'estavel'
}

interface EstatisticasRapidasProps {
  periodo?: 'semanal' | 'mensal' | 'trimestral' | 'anual'
}

export function EstatisticasRapidas({ periodo = 'mensal' }: EstatisticasRapidasProps) {
  const [dados, setDados] = useState<EstatisticasData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const buscarEstatisticas = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/consultor/metricas?periodo=${periodo}&resumo=true`)
        
        if (!response.ok) {
          throw new Error('Erro ao carregar estatísticas')
        }

        const result = await response.json()
        
        if (!result.success) {
          throw new Error(result.error || 'Erro desconhecido')
        }

        // Processar dados das estatísticas
        const estatisticas = result.data.estatisticasGerais
        
        setDados({
          totalAtendentes: estatisticas.totalAtendentes || 0,
          totalAvaliacoes: estatisticas.totalAvaliacoes || 0,
          mediaGeralNotas: estatisticas.mediaGeralNotas || 0,
          percentualSatisfacao: estatisticas.percentualSatisfacaoGeral || 0,
          totalConquistas: estatisticas.totalConquistas || 0,
          atendentesMesAtivo: estatisticas.atendentesMesAtivo || 0,
          tendenciaGeral: estatisticas.tendenciaGeral || 'estavel',
        })
      } catch (err) {
        console.error('Erro ao buscar estatísticas:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    buscarEstatisticas()
  }, [periodo])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <LoadingSpinner size="sm" text="" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            <p>Erro ao carregar estatísticas: {error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!dados) {
    return null
  }

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'crescente':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'decrescente':
        return <TrendingUp className="h-4 w-4 rotate-180 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-blue-500" />
    }
  }

  const getTendenciaColor = (tendencia: string) => {
    switch (tendencia) {
      case 'crescente':
        return 'text-green-600'
      case 'decrescente':
        return 'text-red-600'
      default:
        return 'text-blue-600'
    }
  }

  const estatisticas = [
    {
      titulo: 'Total de Atendentes',
      valor: dados.totalAtendentes,
      icone: Users,
      cor: 'text-blue-600',
      bgCor: 'bg-blue-100',
      descricao: 'Atendentes ativos',
    },
    {
      titulo: 'Avaliações',
      valor: dados.totalAvaliacoes,
      icone: Star,
      cor: 'text-yellow-600',
      bgCor: 'bg-yellow-100',
      descricao: `No período ${periodo}`,
    },
    {
      titulo: 'Média Geral',
      valor: dados.mediaGeralNotas.toFixed(1),
      icone: Target,
      cor: 'text-green-600',
      bgCor: 'bg-green-100',
      descricao: 'Nota média das avaliações',
      sufixo: '/5.0',
    },
    {
      titulo: 'Satisfação',
      valor: `${dados.percentualSatisfacao.toFixed(1)}%`,
      icone: TrendingUp,
      cor: 'text-purple-600',
      bgCor: 'bg-purple-100',
      descricao: 'Notas 4 e 5',
    },
    {
      titulo: 'Conquistas',
      valor: dados.totalConquistas,
      icone: Award,
      cor: 'text-orange-600',
      bgCor: 'bg-orange-100',
      descricao: 'Badges desbloqueadas',
    },
    {
      titulo: 'Tendência',
      valor: dados.tendenciaGeral,
      icone: () => getTendenciaIcon(dados.tendenciaGeral),
      cor: getTendenciaColor(dados.tendenciaGeral),
      bgCor: 'bg-gray-100',
      descricao: 'Performance geral',
      customValor: true,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {estatisticas.map((stat, index) => {
        const IconComponent = typeof stat.icone === 'function' ? stat.icone : stat.icone
        
        return (
          <Card key={index} className="transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.titulo}
              </CardTitle>
              <div className={`rounded-full p-2 ${stat.bgCor}`}>
                <IconComponent className={`h-4 w-4 ${stat.cor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex items-baseline gap-1">
                  {stat.customValor ? (
                    <Badge 
                      variant={stat.valor === 'crescente' ? 'default' : stat.valor === 'decrescente' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {stat.valor === 'crescente' ? 'Crescente' : 
                       stat.valor === 'decrescente' ? 'Decrescente' : 'Estável'}
                    </Badge>
                  ) : (
                    <>
                      <span className="text-2xl font-bold">{stat.valor}</span>
                      {stat.sufixo && (
                        <span className="text-sm text-muted-foreground">{stat.sufixo}</span>
                      )}
                    </>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stat.descricao}
                </p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}