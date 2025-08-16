'use client';

import { useSession } from 'next-auth/react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { Users, BarChart3, MessageSquare, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Dados de exemplo para os gráficos


export default function DashboardPage() {
  const { data: session } = useSession();

  const getStatsForRole = (role: string) => {
    switch (role) {
      case 'admin':
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
      case 'supervisor':
        return [
          {
            title: 'Atendentes Supervisionados',
            value: '12',
            description: 'Equipe ativa',
            icon: Users,
            color: 'text-blue-600',
          },
          {
            title: 'Avaliações Pendentes',
            value: '5',
            description: 'Para este mês',
            icon: BarChart3,
            color: 'text-yellow-600',
          },
          {
            title: 'Relatórios Gerados',
            value: '8',
            description: 'Este mês',
            icon: MessageSquare,
            color: 'text-purple-600',
          },
          {
            title: 'Performance da Equipe',
            value: '8.7',
            description: 'Nota média da equipe',
            icon: TrendingUp,
            color: 'text-green-600',
          },
        ];
      case 'attendant':
        return [
          {
            title: 'Suas Avaliações',
            value: '8',
            description: 'Total recebidas',
            icon: BarChart3,
            color: 'text-green-600',
          },
          {
            title: 'Atendimentos Realizados',
            value: '127',
            description: 'Este mês',
            icon: MessageSquare,
            color: 'text-purple-600',
          },
          {
            title: 'Sua Nota Média',
            value: '8.9',
            description: '+0.5 pontos este mês',
            icon: TrendingUp,
            color: 'text-blue-600',
          },
          {
            title: 'Metas Atingidas',
            value: '92%',
            description: 'Dos objetivos mensais',
            icon: Users,
            color: 'text-orange-600',
          },
        ];
      default:
        return [];
    }
  };

  const stats = getStatsForRole(session?.user?.userType || '');

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Bem-vindo, {session?.user?.name}!
          </h1>
          <p className="text-gray-600">
            Aqui está um resumo das suas atividades e métricas importantes.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

        {/* Gráfico de Atividade */}
        {(session?.user?.userType === 'ADMIN' || session?.user?.userType === 'SUPERVISOR') && (
          <Card>
            <CardHeader>
              <CardTitle>Atividade do Sistema</CardTitle>
              <CardDescription>
                Resumo das atividades dos últimos 6 meses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Gráficos de atividade serão implementados em breve
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ações Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Acesse rapidamente as funcionalidades mais utilizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {session?.user?.userType === 'ADMIN' && (
                <>
                  <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <h3 className="font-medium">Gerenciar Usuários</h3>
                    <p className="text-sm text-gray-600">Adicionar, editar ou remover usuários</p>
                  </div>
                  <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <h3 className="font-medium">Relatórios</h3>
                    <p className="text-sm text-gray-600">Visualizar relatórios detalhados</p>
                  </div>
                </>
              )}

            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}