'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
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
  Target,
  Flame,
  Crown,
  ExternalLink,
  Filter,
} from 'lucide-react'
import Link from 'next/link'

interface TopAtendente {
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
  experienciaProximoNivel: number
  posicao: number
  sequenciaAtual: number
  melhorSequencia: number
  conquistasDesbloqueadas: number
  tendencia: 'crescente' | 'decrescente' | 'estavel'
  destaque: 'mvp' | 'destaque' | 'promessa' | null
}

interface TopAtendentesProps {
  periodo?: 'semanal' | 'mensal' | 'trimestral' | 'anual'
  limite?: number
  filtros?: {
    cargo?: string
    portaria?: string
    nivel?: number
  }
}

type CriterioOrdenacao = 'pontuacao' | 'mediaNotas' | 'satisfacao' | 'avaliacoes' | 'nivel'

export function TopAtendentes({ 
  periodo = 'mensal', 
  limite = 10,
  filtros = {}
}: TopAtendentesProps) {
  const [atendentes, setAtendentes] = useState<TopAtendente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [criterioOrdenacao, setCriterioOrdenacao] = useState<CriterioOrdenacao>('pontuacao')
  const [periodoSelecionado, setPeriodoSelecionado] = useState(periodo)
  const [filtrosCargos, setFiltrosCargos] = useState<string[]>([])
  const [filtrosPortarias, setFiltrosPortarias] = useState<string[]>([])
  const [cargoSelecionado, setCargoSelecionado] = useState<string>('')
  const [portariaSelecionada, setPortariaSelecionada] = useState<string>('')

  useEffect(() => {
    const buscarTopAtendentes = async () => {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams({
          periodo: periodoSelecionado,
          limite: limite.toString(),
          ordenacao: criterioOrdenacao,
          direcao: 'desc',
        })

        if (cargoSelecionado) params.append('cargo', cargoSelecionado)
        if (portariaSelecionada) params.append('portaria', portariaSelecionada)

        const response = await fetch(`/api/consultor/rankings?${params.toString()}`)
        
        if (!response.ok) {
          throw new Error('Erro ao carregar top atendentes')
        }

        const result = await response.json()
        
        if (!result.success) {
          throw new Error(result.error || 'Erro desconhecido')
        }

        const atendentesData = result.data.atendentes || []
        
        // Adicionar destaques e tendências
        const atendentesComDestaques = atendentesData.map((atendente: any, index: number) => {
          let destaque = null
          
          if (index === 0 && atendente.pontuacaoTotal > 1000) {
            destaque = 'mvp'
          } else if (index < 3 && atendente.mediaNotas >= 4.5) {
            destaque = 'destaque'
          } else if (atendente.nivel <= 3 && atendente.mediaNotas >= 4.0) {
            destaque = 'promessa'
          }
          
          // Simular tendência baseada na posição e métricas
          let tendencia: 'crescente' | 'decrescente' | 'estavel' = 'estavel'
          if (atendente.sequenciaAtual > 5) tendencia = 'crescente'
          else if (atendente.mediaNotas < 3.5) tendencia = 'decrescente'
          
          return {
            ...atendente,
            destaque,
            tendencia,
            conquistasDesbloqueadas: Math.floor(Math.random() * 20) + 5, // Simular conquistas
            experienciaProximoNivel: 1000 - (atendente.experiencia % 1000),
          }
        })

        setAtendentes(atendentesComDestaques)
        
        // Extrair filtros únicos
        const cargosUnicos = [...new Set(atendentesData.map((a: any) => a.cargo))]
        const portariasUnicas = [...new Set(atendentesData.map((a: any) => a.portaria))]
        
        setFiltrosCargos(cargosUnicos)
        setFiltrosPortarias(portariasUnicas)
        
      } catch (err) {
        console.error('Erro ao buscar top atendentes:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    buscarTopAtendentes()
  }, [periodoSelecionado, limite, criterioOrdenacao, cargoSelecionado, portariaSelecionada])

  const getPosicaoIcon = (posicao: number, destaque: string | null) => {
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
        return <span className="text-sm font-bold text-muted-foreground">#{posicao}</span>
    }
  }

  const getDestaqueColor = (destaque: string | null) => {
    switch (destaque) {
      case 'mvp':
        return 'border-l-yellow-500 bg-gradient-to-r from-yellow-50 to-orange-50'
      case 'destaque':
        return 'border-l-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50'
      case 'promessa':
        return 'border-l-green-500 bg-gradient-to-r from-green-50 to-emerald-50'
      default:
        return 'border-l-gray-300 bg-white'
    }
  }

  const getDestaqueBadge = (destaque: string | null) => {
    switch (destaque) {
      case 'mvp':
        return <Badge className="bg-yellow-500 text-white">MVP</Badge>
      case 'destaque':
        return <Badge className="bg-blue-500 text-white">Destaque</Badge>
      case 'promessa':
        return <Badge className="bg-green-500 text-white">Promessa</Badge>
      default:
        return null
    }
  }

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'crescente':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'decrescente':
        return <TrendingUp className="h-4 w-4 rotate-180 text-red-500" />
      default:
        return <Target className="h-4 w-4 text-blue-500" />
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

  const getProgressoNivel = (experiencia: number, experienciaProximoNivel: number) => {
    const experienciaAtual = experiencia % 1000
    return (experienciaAtual / 1000) * 100
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Top Atendentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSpinner text="Carregando top atendentes..." />
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
            Top Atendentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-destructive">
            <p>Erro ao carregar top atendentes: {error}</p>
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
          Top Atendentes - {periodoSelecionado.charAt(0).toUpperCase() + periodoSelecionado.slice(1)}
        </CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link href="/consultor/rankings" className="flex items-center gap-1">
            Ver ranking completo
            <ExternalLink className="h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {/* Filtros e Controles */}
        <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filtros:</span>
          </div>
          
          <Select value={periodoSelecionado} onValueChange={setPeriodoSelecionado}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semanal">Semanal</SelectItem>
              <SelectItem value="mensal">Mensal</SelectItem>
              <SelectItem value="trimestral">Trimestral</SelectItem>
              <SelectItem value="anual">Anual</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={criterioOrdenacao} onValueChange={(value: CriterioOrdenacao) => setCriterioOrdenacao(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pontuacao">Pontuação</SelectItem>
              <SelectItem value="mediaNotas">Média de Notas</SelectItem>
              <SelectItem value="satisfacao">Satisfação</SelectItem>
              <SelectItem value="avaliacoes">Avaliações</SelectItem>
              <SelectItem value="nivel">Nível</SelectItem>
            </SelectContent>
          </Select>
          
          {filtrosCargos.length > 0 && (
            <Select value={cargoSelecionado} onValueChange={setCargoSelecionado}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Todos os cargos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os cargos</SelectItem>
                {filtrosCargos.map(cargo => (
                  <SelectItem key={cargo} value={cargo}>{cargo}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          {filtrosPortarias.length > 0 && (
            <Select value={portariaSelecionada} onValueChange={setPortariaSelecionada}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Todas as portarias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as portarias</SelectItem>
                {filtrosPortarias.map(portaria => (
                  <SelectItem key={portaria} value={portaria}>{portaria}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Lista de Top Atendentes */}
        <div className="space-y-4">
          {atendentes.map((atendente) => (
            <div
              key={atendente.id}
              className={`flex items-center gap-4 p-4 rounded-lg border-l-4 transition-all hover:shadow-md ${
                getDestaqueColor(atendente.destaque)
              }`}
            >
              {/* Posição e Avatar */}
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8">
                  {getPosicaoIcon(atendente.posicao, atendente.destaque)}
                </div>
                
                <Avatar className="h-12 w-12">
                  <AvatarImage src={`/avatars/${atendente.id}.jpg`} />
                  <AvatarFallback className="text-sm font-medium">
                    {getIniciais(atendente.nome)}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Informações do Atendente */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-sm truncate">{atendente.nome}</h4>
                  {getDestaqueBadge(atendente.destaque)}
                  <Badge variant="outline" className="text-xs">
                    Nível {atendente.nivel}
                  </Badge>
                  {getTendenciaIcon(atendente.tendencia)}
                </div>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <span>{atendente.cargo}</span>
                  <span>•</span>
                  <span>{atendente.portaria}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Award className="h-3 w-3" />
                    {atendente.conquistasDesbloqueadas} conquistas
                  </span>
                </div>
                
                {/* Progresso do Nível */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-muted-foreground">XP:</span>
                  <Progress 
                    value={getProgressoNivel(atendente.experiencia, atendente.experienciaProximoNivel)} 
                    className="flex-1 h-2"
                  />
                  <span className="text-xs text-muted-foreground">
                    {atendente.experienciaProximoNivel} para próximo nível
                  </span>
                </div>
              </div>

              {/* Métricas */}
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <div className="font-bold text-primary text-lg">{atendente.pontuacaoTotal}</div>
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
                    <Flame className="h-3 w-3 text-orange-500" />
                    {atendente.sequenciaAtual}
                  </div>
                  <div className="text-xs text-muted-foreground">Sequência</div>
                </div>
                
                <div className="text-center">
                  <div className="font-medium text-blue-600">
                    {atendente.totalAvaliacoes}
                  </div>
                  <div className="text-xs text-muted-foreground">Avaliações</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {atendentes.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <Trophy className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum atendente encontrado com os filtros selecionados.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}