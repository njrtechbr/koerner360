import { Metadata } from 'next'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { GitCompare, TrendingUp, TrendingDown, BarChart3, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Comparativos - Consultor | Koerner 360',
  description: 'Análises comparativas entre atendentes',
}

export default async function ComparativosPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.userType !== 'CONSULTOR') {
    redirect('/dashboard')
  }

  // Dados mockados para demonstração
  const atendentesSelecionados = [
    {
      id: '1',
      nome: 'Maria Silva',
      setor: 'Vendas',
      pontuacao: 9.8,
      avaliacoes: 156,
      satisfacao: 95,
      resolucao: 88,
      tempo_resposta: 2.3
    },
    {
      id: '2',
      nome: 'João Santos',
      setor: 'Suporte',
      pontuacao: 9.6,
      avaliacoes: 142,
      satisfacao: 92,
      resolucao: 94,
      tempo_resposta: 1.8
    }
  ]

  const metricas = [
    {
      nome: 'Pontuação Geral',
      atendente1: 9.8,
      atendente2: 9.6,
      diferenca: 0.2,
      tipo: 'score'
    },
    {
      nome: 'Satisfação (%)',
      atendente1: 95,
      atendente2: 92,
      diferenca: 3,
      tipo: 'percentage'
    },
    {
      nome: 'Taxa de Resolução (%)',
      atendente1: 88,
      atendente2: 94,
      diferenca: -6,
      tipo: 'percentage'
    },
    {
      nome: 'Tempo Médio de Resposta (h)',
      atendente1: 2.3,
      atendente2: 1.8,
      diferenca: 0.5,
      tipo: 'time'
    },
    {
      nome: 'Total de Avaliações',
      atendente1: 156,
      atendente2: 142,
      diferenca: 14,
      tipo: 'count'
    }
  ]

  const formatarValor = (valor: number, tipo: string) => {
    switch (tipo) {
      case 'score':
        return valor.toFixed(1)
      case 'percentage':
        return `${valor}%`
      case 'time':
        return `${valor}h`
      case 'count':
        return valor.toString()
      default:
        return valor.toString()
    }
  }

  const formatarDiferenca = (diferenca: number, tipo: string) => {
    const sinal = diferenca > 0 ? '+' : ''
    switch (tipo) {
      case 'score':
        return `${sinal}${diferenca.toFixed(1)}`
      case 'percentage':
        return `${sinal}${diferenca}%`
      case 'time':
        return `${sinal}${diferenca}h`
      case 'count':
        return `${sinal}${diferenca}`
      default:
        return `${sinal}${diferenca}`
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Análise Comparativa</h1>
        <p className="text-muted-foreground">
          Compare performance entre diferentes atendentes
        </p>
      </div>

      {/* Seleção de Atendentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Seleção de Atendentes
          </CardTitle>
          <CardDescription>
            Escolha até 4 atendentes para comparar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Atendente 1</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Maria Silva" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maria">Maria Silva - Vendas</SelectItem>
                  <SelectItem value="joao">João Santos - Suporte</SelectItem>
                  <SelectItem value="ana">Ana Costa - Vendas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Atendente 2</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="João Santos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maria">Maria Silva - Vendas</SelectItem>
                  <SelectItem value="joao">João Santos - Suporte</SelectItem>
                  <SelectItem value="ana">Ana Costa - Vendas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Atendente 3</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maria">Maria Silva - Vendas</SelectItem>
                  <SelectItem value="joao">João Santos - Suporte</SelectItem>
                  <SelectItem value="ana">Ana Costa - Vendas</SelectItem>
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
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button className="mt-4">
            Atualizar Comparação
          </Button>
        </CardContent>
      </Card>

      {/* Resumo dos Atendentes */}
      <div className="grid gap-4 md:grid-cols-2">
        {atendentesSelecionados.map((atendente, index) => (
          <Card key={atendente.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{atendente.nome}</span>
                <Badge variant="secondary">{atendente.setor}</Badge>
              </CardTitle>
              <CardDescription>
                Atendente {index + 1} - Resumo de Performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{atendente.pontuacao}</p>
                  <p className="text-xs text-muted-foreground">Pontuação</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{atendente.satisfacao}%</p>
                  <p className="text-xs text-muted-foreground">Satisfação</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{atendente.resolucao}%</p>
                  <p className="text-xs text-muted-foreground">Resolução</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{atendente.tempo_resposta}h</p>
                  <p className="text-xs text-muted-foreground">Tempo Resposta</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comparação Detalhada */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5" />
            Comparação Detalhada
          </CardTitle>
          <CardDescription>
            Análise métrica por métrica entre os atendentes selecionados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metricas.map((metrica, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
                <div className="flex-1">
                  <p className="font-medium">{metrica.nome}</p>
                </div>
                
                <div className="flex items-center gap-8">
                  {/* Atendente 1 */}
                  <div className="text-center min-w-[80px]">
                    <p className="text-lg font-bold">
                      {formatarValor(metrica.atendente1, metrica.tipo)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {atendentesSelecionados[0].nome.split(' ')[0]}
                    </p>
                  </div>
                  
                  {/* Comparação */}
                  <div className="flex items-center gap-2">
                    {metrica.diferenca > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : metrica.diferenca < 0 ? (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    ) : (
                      <div className="h-4 w-4" />
                    )}
                    <span className={`text-sm font-medium ${
                      metrica.diferenca > 0 ? 'text-green-600' :
                      metrica.diferenca < 0 ? 'text-red-600' :
                      'text-muted-foreground'
                    }`}>
                      {formatarDiferenca(metrica.diferenca, metrica.tipo)}
                    </span>
                  </div>
                  
                  {/* Atendente 2 */}
                  <div className="text-center min-w-[80px]">
                    <p className="text-lg font-bold">
                      {formatarValor(metrica.atendente2, metrica.tipo)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {atendentesSelecionados[1].nome.split(' ')[0]}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Gráfico de Performance
          </CardTitle>
          <CardDescription>
            Visualização gráfica da comparação entre atendentes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 bg-muted/50 rounded-lg">
            <div className="text-center space-y-2">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">Gráfico de comparação será implementado aqui</p>
              <p className="text-sm text-muted-foreground">Utilizando Recharts para visualização de dados</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}