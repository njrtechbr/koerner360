'use client';

import { useSession } from 'next-auth/react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, BarChart3, MessageSquare, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

// Dados de exemplo para os gráficos
const avaliacoesData = [
  { mes: 'Jan', avaliacoes: 12 },
  { mes: 'Fev', avaliacoes: 19 },
  { mes: 'Mar', avaliacoes: 15 },
  { mes: 'Abr', avaliacoes: 22 },
  { mes: 'Mai', avaliacoes: 18 },
  { mes: 'Jun', avaliacoes: 25 },
];

const feedbacksData = [
  { tipo: 'Positivo', valor: 45, cor: '#10B981' },
  { tipo: 'Construtivo', valor: 30, cor: '#F59E0B' },
  { tipo: 'Sugestão', valor: 25, cor: '#3B82F6' },
];

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
            title: 'Feedbacks Recebidos',
            value: '89',
            description: '+23% em relação ao mês anterior',
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
            title: 'Feedbacks da Equipe',
            value: '34',
            description: 'Recebidos este mês',
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
            title: 'Feedbacks Recebidos',
            value: '15',
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

        {/* Charts */}
        {(session?.user?.userType === 'ADMIN' || session?.user?.userType === 'SUPERVISOR') && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Avaliações por Mês */}
            <Card>
              <CardHeader>
                <CardTitle>Avaliações por Mês</CardTitle>
                <CardDescription>
                  Número de avaliações realizadas nos últimos 6 meses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={avaliacoesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avaliacoes" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Distribuição de Feedbacks */}
            <Card>
              <CardHeader>
                <CardTitle>Tipos de Feedback</CardTitle>
                <CardDescription>
                  Distribuição dos tipos de feedback recebidos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={feedbacksData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ tipo, valor }) => `${tipo}: ${valor}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="valor"
                    >
                      {feedbacksData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.cor} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
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
              {(session?.user?.userType === 'ADMIN' || session?.user?.userType === 'SUPERVISOR') && (
                <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <h3 className="font-medium">Nova Avaliação</h3>
                  <p className="text-sm text-gray-600">Criar uma nova avaliação</p>
                </div>
              )}
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <h3 className="font-medium">Enviar Feedback</h3>
                <p className="text-sm text-gray-600">Compartilhar feedback com a equipe</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}