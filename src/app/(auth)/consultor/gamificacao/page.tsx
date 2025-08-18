import { Metadata } from 'next'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Trophy, Star, Target, Award, Zap, Crown, Medal, Gift } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Gamificação - Consultor | Koerner 360',
  description: 'Sistema de gamificação e conquistas',
}

export default async function GamificacaoPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.userType !== 'CONSULTOR') {
    redirect('/dashboard')
  }

  // Dados mockados para demonstração
  const conquistas = [
    {
      id: '1',
      nome: 'Estrela do Atendimento',
      descricao: 'Mantenha nota 9+ por 30 dias consecutivos',
      icone: Star,
      progresso: 85,
      meta: 30,
      atual: 25,
      tipo: 'dias',
      desbloqueada: false,
      pontos: 500
    },
    {
      id: '2',
      nome: 'Resolvedor Expert',
      descricao: 'Resolva 100 casos com sucesso',
      icone: Target,
      progresso: 100,
      meta: 100,
      atual: 100,
      tipo: 'casos',
      desbloqueada: true,
      pontos: 300
    },
    {
      id: '3',
      nome: 'Velocidade da Luz',
      descricao: 'Responda em menos de 1 hora por 50 vezes',
      icone: Zap,
      progresso: 60,
      meta: 50,
      atual: 30,
      tipo: 'respostas',
      desbloqueada: false,
      pontos: 400
    },
    {
      id: '4',
      nome: 'Cliente Satisfeito',
      descricao: 'Receba 200 avaliações positivas',
      icone: Award,
      progresso: 75,
      meta: 200,
      atual: 150,
      tipo: 'avaliações',
      desbloqueada: false,
      pontos: 600
    }
  ]

  const ranking = [
    {
      posicao: 1,
      nome: 'Maria Silva',
      pontos: 2850,
      nivel: 'Ouro',
      conquistas: 12
    },
    {
      posicao: 2,
      nome: 'João Santos',
      pontos: 2640,
      nivel: 'Ouro',
      conquistas: 10
    },
    {
      posicao: 3,
      nome: 'Ana Costa',
      pontos: 2420,
      nivel: 'Prata',
      conquistas: 9
    },
    {
      posicao: 4,
      nome: 'Pedro Lima',
      pontos: 2180,
      nivel: 'Prata',
      conquistas: 8
    },
    {
      posicao: 5,
      nome: 'Carla Souza',
      pontos: 1950,
      nivel: 'Bronze',
      conquistas: 7
    }
  ]





  const getIconeNivel = (nivel: string) => {
    switch (nivel) {
      case 'Bronze': return Medal
      case 'Prata': return Award
      case 'Ouro': return Trophy
      case 'Platina': return Crown
      case 'Diamante': return Star
      default: return Medal
    }
  }

  const getCorNivel = (nivel: string) => {
    switch (nivel) {
      case 'Bronze': return 'text-amber-600'
      case 'Prata': return 'text-gray-400'
      case 'Ouro': return 'text-yellow-500'
      case 'Platina': return 'text-blue-500'
      case 'Diamante': return 'text-purple-500'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Sistema de Gamificação</h1>
        <p className="text-muted-foreground">
          Conquistas, rankings e sistema de pontuação
        </p>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pontos Totais</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,850</div>
            <p className="text-xs text-muted-foreground">
              +180 pontos este mês
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nível Atual</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">Ouro</div>
            <p className="text-xs text-muted-foreground">
              350 pontos para Platina
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conquistas</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12/20</div>
            <p className="text-xs text-muted-foreground">
              60% completado
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posição</CardTitle>
            <Medal className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#1</div>
            <p className="text-xs text-muted-foreground">
              No ranking geral
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progresso do Nível */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Progresso do Nível
          </CardTitle>
          <CardDescription>
            Seu progresso atual no sistema de níveis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-6 w-6 text-yellow-500" />
                <span className="font-medium text-yellow-500">Nível Ouro</span>
              </div>
              <span className="text-sm text-muted-foreground">2,850 / 5,000 pontos</span>
            </div>
            <Progress value={57} className="h-3" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Prata (2,500)</span>
              <span>Platina (5,000)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conquistas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Conquistas Disponíveis
          </CardTitle>
          <CardDescription>
            Complete desafios para ganhar pontos e distintivos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {conquistas.map((conquista) => {
              const IconeConquista = conquista.icone
              return (
                <div
                  key={conquista.id}
                  className={`p-4 rounded-lg border ${
                    conquista.desbloqueada
                      ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
                      : 'bg-muted/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      conquista.desbloqueada
                        ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      <IconeConquista className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{conquista.nome}</h3>
                        {conquista.desbloqueada && (
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            Desbloqueada
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {conquista.descricao}
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{conquista.atual} / {conquista.meta} {conquista.tipo}</span>
                          <span className="font-medium">+{conquista.pontos} pontos</span>
                        </div>
                        <Progress value={conquista.progresso} className="h-2" />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Ranking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Ranking de Pontuação
          </CardTitle>
          <CardDescription>
            Top 5 atendentes com maior pontuação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ranking.map((atendente) => {
              const IconeNivel = getIconeNivel(atendente.nivel)
              return (
                <div
                  key={atendente.posicao}
                  className={`flex items-center gap-4 p-4 rounded-lg border ${
                    atendente.posicao === 1
                      ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800'
                      : atendente.posicao <= 3
                      ? 'bg-muted/50'
                      : 'bg-background'
                  }`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                    atendente.posicao === 1
                      ? 'bg-yellow-500 text-white'
                      : atendente.posicao === 2
                      ? 'bg-gray-400 text-white'
                      : atendente.posicao === 3
                      ? 'bg-amber-600 text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {atendente.posicao}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{atendente.nome}</h3>
                      <IconeNivel className={`h-4 w-4 ${getCorNivel(atendente.nivel)}`} />
                      <Badge variant="outline" className={getCorNivel(atendente.nivel)}>
                        {atendente.nivel}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {atendente.conquistas} conquistas desbloqueadas
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-bold">{atendente.pontos.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">pontos</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recompensas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Loja de Recompensas
          </CardTitle>
          <CardDescription>
            Troque seus pontos por recompensas exclusivas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg border bg-muted/50">
              <div className="text-center space-y-2">
                <Gift className="h-8 w-8 mx-auto text-blue-500" />
                <h3 className="font-medium">Vale Presente</h3>
                <p className="text-sm text-muted-foreground">R$ 50 em vale compras</p>
                <p className="text-lg font-bold text-blue-500">1,000 pontos</p>
                <Button size="sm" className="w-full">
                  Resgatar
                </Button>
              </div>
            </div>
            
            <div className="p-4 rounded-lg border bg-muted/50">
              <div className="text-center space-y-2">
                <Trophy className="h-8 w-8 mx-auto text-yellow-500" />
                <h3 className="font-medium">Troféu Personalizado</h3>
                <p className="text-sm text-muted-foreground">Troféu com seu nome</p>
                <p className="text-lg font-bold text-yellow-500">2,500 pontos</p>
                <Button size="sm" className="w-full">
                  Resgatar
                </Button>
              </div>
            </div>
            
            <div className="p-4 rounded-lg border bg-muted/50">
              <div className="text-center space-y-2">
                <Star className="h-8 w-8 mx-auto text-purple-500" />
                <h3 className="font-medium">Dia de Folga Extra</h3>
                <p className="text-sm text-muted-foreground">1 dia de folga adicional</p>
                <p className="text-lg font-bold text-purple-500">5,000 pontos</p>
                <Button size="sm" className="w-full">
                  Resgatar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}