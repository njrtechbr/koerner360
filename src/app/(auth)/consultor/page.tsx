import { Metadata } from 'next'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, Trophy, TrendingUp, Users, Target, Award } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Dashboard Consultor - Koerner 360',
  description: 'Dashboard principal do consultor para análise de rankings e performance',
}

export default async function ConsultorDashboard() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.userType !== 'CONSULTOR') {
    redirect('/dashboard')
  }

  const metricas = [
    {
      titulo: 'Total de Atendentes',
      valor: '156',
      descricao: 'Atendentes ativos no sistema',
      icone: Users,
      cor: 'text-blue-600'
    },
    {
      titulo: 'Média Geral',
      valor: '8.7',
      descricao: 'Nota média das avaliações',
      icone: BarChart3,
      cor: 'text-green-600'
    },
    {
      titulo: 'Top Performer',
      valor: 'Maria Silva',
      descricao: 'Melhor atendente do mês',
      icone: Trophy,
      cor: 'text-yellow-600'
    },
    {
      titulo: 'Metas Atingidas',
      valor: '87%',
      descricao: 'Percentual de metas cumpridas',
      icone: Target,
      cor: 'text-purple-600'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Consultor</h1>
        <p className="text-muted-foreground">
          Bem-vindo, {session.user.name}. Aqui você pode acompanhar rankings, performance e análises comparativas.
        </p>
      </div>

      {/* Métricas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metricas.map((metrica, index) => {
          const IconeComponente = metrica.icone
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metrica.titulo}
                </CardTitle>
                <IconeComponente className={`h-4 w-4 ${metrica.cor}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrica.valor}</div>
                <p className="text-xs text-muted-foreground">
                  {metrica.descricao}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Área Principal */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Ranking de Performance
            </CardTitle>
            <CardDescription>
              Top 10 atendentes com melhor performance este mês
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Aqui será exibido o ranking dos atendentes baseado em suas avaliações e métricas de performance.
              </p>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((posicao) => (
                  <div key={posicao} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                        {posicao}
                      </div>
                      <div>
                        <p className="text-sm font-medium">Atendente {posicao}</p>
                        <p className="text-xs text-muted-foreground">Setor Exemplo</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{(10 - posicao * 0.5).toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">Nota média</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Conquistas Recentes
            </CardTitle>
            <CardDescription>
              Últimas conquistas e marcos atingidos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <div>
                    <p className="text-sm font-medium">Meta Mensal Atingida</p>
                    <p className="text-xs text-muted-foreground">87% das metas foram cumpridas</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Novo Recorde</p>
                    <p className="text-xs text-muted-foreground">Maior nota média do trimestre</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                  <div className="h-2 w-2 rounded-full bg-purple-500" />
                  <div>
                    <p className="text-sm font-medium">Equipe Destaque</p>
                    <p className="text-xs text-muted-foreground">Setor com melhor performance</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}