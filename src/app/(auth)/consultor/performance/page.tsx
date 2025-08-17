import { Metadata } from 'next'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Activity, Target, TrendingUp, Clock, Star, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Performance - Consultor - Koerner 360',
  description: 'Análise detalhada de performance e métricas',
}

export default async function PerformancePage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.userType !== 'CONSULTOR') {
    redirect('/dashboard')
  }

  // Dados mockados para demonstração
  const performanceMetrics = {
    pontuacaoGeral: 9.2,
    metaAtingida: 87,
    crescimentoMensal: 15,
    satisfacaoCliente: 94,
    tempoMedioAtendimento: 4.2,
    avaliacoesTotais: 1247
  }

  const performanceDetalhada = [
    {
      categoria: 'Qualidade do Atendimento',
      pontuacao: 9.5,
      meta: 9.0,
      progresso: 95,
      tendencia: 'up'
    },
    {
      categoria: 'Tempo de Resposta',
      pontuacao: 8.8,
      meta: 9.0,
      progresso: 88,
      tendencia: 'up'
    },
    {
      categoria: 'Resolução de Problemas',
      pontuacao: 9.3,
      meta: 8.5,
      progresso: 93,
      tendencia: 'up'
    },
    {
      categoria: 'Comunicação',
      pontuacao: 9.1,
      meta: 8.8,
      progresso: 91,
      tendencia: 'stable'
    },
    {
      categoria: 'Conhecimento Técnico',
      pontuacao: 8.9,
      meta: 9.2,
      progresso: 89,
      tendencia: 'down'
    }
  ]

  const topAtendentes = [
    {
      nome: 'Maria Silva',
      setor: 'Vendas',
      pontuacao: 9.8,
      crescimento: 12,
      avaliacoes: 156
    },
    {
      nome: 'João Santos',
      setor: 'Suporte',
      pontuacao: 9.6,
      crescimento: 8,
      avaliacoes: 142
    },
    {
      nome: 'Ana Costa',
      setor: 'Vendas',
      pontuacao: 9.4,
      crescimento: 5,
      avaliacoes: 138
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Performance</h1>
          <p className="text-muted-foreground">
            Análise detalhada de performance e métricas de qualidade
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select defaultValue="mes">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semana">Esta semana</SelectItem>
              <SelectItem value="mes">Este mês</SelectItem>
              <SelectItem value="trimestre">Trimestre</SelectItem>
              <SelectItem value="ano">Este ano</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <Activity className="h-4 w-4 mr-2" />
            Relatório Detalhado
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pontuação Geral</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceMetrics.pontuacaoGeral}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{performanceMetrics.crescimentoMensal}%</span> vs mês anterior
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meta Atingida</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceMetrics.metaAtingida}%</div>
            <Progress value={performanceMetrics.metaAtingida} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfação Cliente</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceMetrics.satisfacaoCliente}%</div>
            <p className="text-xs text-muted-foreground">
              {performanceMetrics.avaliacoesTotais} avaliações
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceMetrics.tempoMedioAtendimento}min</div>
            <p className="text-xs text-muted-foreground">
              Tempo de atendimento
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crescimento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{performanceMetrics.crescimentoMensal}%</div>
            <p className="text-xs text-muted-foreground">
              Crescimento mensal
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Avaliações</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceMetrics.avaliacoesTotais}</div>
            <p className="text-xs text-muted-foreground">
              Avaliações recebidas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Detalhada por Categoria */}
      <Card>
        <CardHeader>
          <CardTitle>Performance por Categoria</CardTitle>
          <CardDescription>
            Análise detalhada de performance em diferentes categorias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {performanceDetalhada.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium">{item.categoria}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{item.pontuacao}</span>
                      <span className="text-sm text-muted-foreground">/ 10</span>
                      <Badge variant={item.pontuacao >= item.meta ? 'default' : 'secondary'}>
                        Meta: {item.meta}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      {item.tendencia === 'up' && (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      )}
                      {item.tendencia === 'down' && (
                        <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
                      )}
                      <span className="text-sm font-medium">{item.progresso}%</span>
                    </div>
                  </div>
                </div>
                
                <Progress value={item.progresso} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
          <CardDescription>
            Atendentes com melhor performance no período
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topAtendentes.map((atendente, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    {index + 1}
                  </div>
                  
                  <div className="space-y-1">
                    <h4 className="font-medium">{atendente.nome}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{atendente.setor}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {atendente.avaliacoes} avaliações
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right space-y-1">
                  <div className="text-2xl font-bold">{atendente.pontuacao}</div>
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <TrendingUp className="h-3 w-3" />
                    +{atendente.crescimento}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}