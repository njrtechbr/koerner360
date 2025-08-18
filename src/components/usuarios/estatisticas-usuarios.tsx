'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface EstatisticasUsuariosProps {
  total: number;
  usuariosAtivos: number;
  admins: number;
  supervisores: number;
}

interface EstatisticaCardProps {
  titulo: string;
  valor: number;
  descricao: string;
  cor?: string;
  iconeColor?: string;
}

function EstatisticaCard({ titulo, valor, descricao, cor, iconeColor }: EstatisticaCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{titulo}</CardTitle>
        <Users className={`h-4 w-4 ${iconeColor || 'text-muted-foreground'}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${cor || ''}`}>{valor}</div>
        <p className="text-xs text-muted-foreground">{descricao}</p>
      </CardContent>
    </Card>
  );
}

export function EstatisticasUsuarios({ 
  total, 
  usuariosAtivos, 
  admins, 
  supervisores 
}: EstatisticasUsuariosProps) {
  const estatisticas = [
    {
      titulo: 'Total',
      valor: total,
      descricao: 'usuários cadastrados',
      cor: '',
      iconeColor: 'text-muted-foreground'
    },
    {
      titulo: 'Ativos',
      valor: usuariosAtivos,
      descricao: 'com acesso ativo',
      cor: 'text-green-600',
      iconeColor: 'text-green-600'
    },
    {
      titulo: 'Admins',
      valor: admins,
      descricao: 'administradores',
      cor: 'text-red-600',
      iconeColor: 'text-red-600'
    },
    {
      titulo: 'Supervisores',
      valor: supervisores,
      descricao: 'supervisores',
      cor: 'text-blue-600',
      iconeColor: 'text-blue-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {estatisticas.map((stat, index) => (
        <EstatisticaCard key={index} {...stat} />
      ))}
    </div>
  );
}