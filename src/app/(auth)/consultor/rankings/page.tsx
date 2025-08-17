import { Metadata } from 'next'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trophy, Medal, Award, TrendingUp, Filter, Search } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Rankings - Consultor | Koerner 360',
  description: 'Rankings e classificações de atendentes',
}

export default async function RankingsPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.userType !== 'CONSULTOR') {
    redirect('/dashboard')
  }

  // Dados mockados para demonstração
  const rankingData = [
    {
      posicao: 1,
      nome: 'Maria Silva',
      setor: 'Vendas',
      pontuacao: 9.8,
      avaliacoes: 156,
      tendencia: 'up',
      badge: 'gold'
    },
    {
      posicao: 2,
      nome: 'João Santos',
      setor: 'Suporte',
      pontuacao: 9.6,
      avaliacoes: 142,
      tendencia: 'up',
      badge: 'silver'
    },
    {
      posicao: 3,
      nome: 'Ana Costa',
      setor: 'Vendas',
      pontuacao: 9.4,
      avaliacoes: 138,
      tendencia: 'stable',
      badge: 'bronze'
    },
    {
      posicao: 4,
      nome: 'Carlos Oliveira',
      setor: 'Atendimento',
      pontuacao: 9.2,
      avaliacoes: 134,
      tendencia: 'down',
      badge: null
    },
    {
      posicao: 5,
      nome: 'Lucia Ferreira',
      setor: 'Suporte',
      pontuacao: 9.1,
      avaliacoes: 129,
      tendencia: 'up',
      badge: null
    }
  ]

  const getBadgeIcon = (badge: string | null) => {
    switch (badge) {
      case 'gold':
        return <Trophy className="h-4 w-4 text-yellow-500" />
      case 'silver':
        return <Medal className="h-4 w-4 text-gray-400" />
      case 'bronze':
        return <Award className="h-4 w-4 text-amber-600" />
      default:
        return null
    }
  }

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down':
        return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
      default:
        return <div className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Rankings</h1>
        <p className="text-muted-foreground">
          Classificação dos atendentes baseada em performance e avaliações
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
          <CardDescription>
            Personalize a visualização do ranking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Nome do atendente..." className="pl-10" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Setor</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os setores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os setores</SelectItem>
                  <SelectItem value="vendas">Vendas</SelectItem>
                  <SelectItem value="suporte">Suporte</SelectItem>
                  <SelectItem value="atendimento">Atendimento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Período</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Último mês" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mes">Último mês</SelectItem>
                  <SelectItem value="trimestre">Último trimestre</SelectItem>
                  <SelectItem value="semestre">Último semestre</SelectItem>
                  <SelectItem value="ano">Último ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ordenação</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Pontuação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pontuacao">Pontuação</SelectItem>
                  <SelectItem value="avaliacoes">Nº Avaliações</SelectItem>
                  <SelectItem value="nome">Nome</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm">
              Aplicar Filtros
            </Button>
            <Button variant="ghost" size="sm">
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Ranking Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Ranking de Performance
          </CardTitle>
          <CardDescription>
            Classificação baseada em pontuação e número de avaliações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rankingData.map((item) => (
              <div
                key={item.posicao}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  item.posicao <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20' : 'bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Posição */}
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${
                    item.posicao === 1 ? 'bg-yellow-500 text-white' :
                    item.posicao === 2 ? 'bg-gray-400 text-white' :
                    item.posicao === 3 ? 'bg-amber-600 text-white' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {item.posicao}
                  </div>
                  
                  {/* Badge */}
                  <div className="flex h-6 w-6 items-center justify-center">
                    {getBadgeIcon(item.badge)}
                  </div>
                  
                  {/* Info do Atendente */}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{item.nome}</p>
                      <Badge variant="secondary" className="text-xs">
                        {item.setor}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {item.avaliacoes} avaliações
                    </p>
                  </div>
                </div>
                
                {/* Pontuação e Tendência */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold">{item.pontuacao}</p>
                    <p className="text-xs text-muted-foreground">Pontuação</p>
                  </div>
                  <div className="flex items-center justify-center">
                    {getTendenciaIcon(item.tendencia)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Paginação */}
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-muted-foreground">
              Mostrando 1-5 de 156 atendentes
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Anterior
              </Button>
              <Button variant="outline" size="sm">
                Próximo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}