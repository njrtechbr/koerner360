'use client';

import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BarChart3, MessageSquare, TrendingUp, type LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<{
    title: string;
    value: string;
    description: string;
    icon: LucideIcon;
    color: string;
  }[]>([]);

  useEffect(() => {
    if (session?.user) {
      const userType = session.user.userType;
      setStats(getStatsForRole(userType));
    }
  }, [session]);

  const getStatsForRole = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return [
          {
            title: 'Total de Usuários',
            value: '48',
            description: '+12% em relação ao mês anterior',
            icon: Users,
            color: 'text-blue-600',
          },
          {
            title: 'Avaliações Realizadas',
            value: '156',
            description: '+8% em relação ao mês anterior',
            icon: BarChart3,
            color: 'text-green-600',
          },
          {
            title: 'Novos Cadastros',
            value: '14',
            description: '+25% em relação ao mês anterior',
            icon: MessageSquare,
            color: 'text-purple-600',
          },
          {
            title: 'Nota Média Geral',
            value: '8.4',
            description: '+0.3 pontos em relação ao mês anterior',
            icon: TrendingUp,
            color: 'text-orange-600',
          },
        ];
      case 'SUPERVISOR':
        return [
          {
            title: 'Atendentes Supervisionados',
            value: '12',
            description: 'Sob sua supervisão',
            icon: Users,
            color: 'text-blue-600',
          },
          {
            title: 'Avaliações do Mês',
            value: '89',
            description: '+15% em relação ao mês anterior',
            icon: BarChart3,
            color: 'text-green-600',
          },
          {
            title: 'Nota Média da Equipe',
            value: '8.2',
            description: '+0.2 pontos em relação ao mês anterior',
            icon: TrendingUp,
            color: 'text-orange-600',
          },
        ];
      case 'ATENDENTE':
        return [
          {
            title: 'Suas Avaliações',
            value: '23',
            description: 'Neste mês',
            icon: BarChart3,
            color: 'text-green-600',
          },
          {
            title: 'Sua Nota Média',
            value: '8.7',
            description: '+0.5 pontos em relação ao mês anterior',
            icon: TrendingUp,
            color: 'text-orange-600',
          },
          {
            title: 'Feedbacks Recebidos',
            value: '18',
            description: 'Neste mês',
            icon: MessageSquare,
            color: 'text-purple-600',
          },
        ];
      default:
        return [];
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Você precisa estar logado para acessar esta página.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo de volta, {session.user.name}!
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Área de conteúdo adicional baseada no tipo de usuário */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Visão Geral</CardTitle>
            <CardDescription>
              Resumo das atividades recentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Tipo de usuário: <span className="font-medium">{session.user.userType}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Esta é a página principal do dashboard. Aqui você pode visualizar
                as principais métricas e informações relevantes para seu perfil.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Acesso rápido às principais funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {session.user.userType === 'ADMIN' && (
                <>
                  <p className="text-sm">• Gerenciar usuários</p>
                  <p className="text-sm">• Visualizar relatórios</p>
                  <p className="text-sm">• Configurações do sistema</p>
                </>
              )}
              {session.user.userType === 'SUPERVISOR' && (
                <>
                  <p className="text-sm">• Gerenciar atendentes</p>
                  <p className="text-sm">• Visualizar avaliações</p>
                  <p className="text-sm">• Relatórios da equipe</p>
                </>
              )}
              {session.user.userType === 'ATENDENTE' && (
                <>
                  <p className="text-sm">• Ver suas avaliações</p>
                  <p className="text-sm">• Acompanhar feedbacks</p>
                  <p className="text-sm">• Atualizar perfil</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}