'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, X } from 'lucide-react';
import Link from 'next/link';
import { useCallback } from 'react';

interface FiltrosUsuariosAvancadosProps {
  searchParams: {
    busca?: string;
    tipoUsuario?: string;
    ativo?: string;
  };
}

const TIPOS_USUARIO = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'SUPERVISOR', label: 'Supervisor' },
  { value: 'ATENDENTE', label: 'Atendente' },
  { value: 'CONSULTOR', label: 'Consultor' },
] as const;

const STATUS_OPTIONS = [
  { value: 'true', label: 'Ativo' },
  { value: 'false', label: 'Inativo' },
] as const;

export function FiltrosUsuariosAvancados({ searchParams }: FiltrosUsuariosAvancadosProps) {
  const temFiltrosAtivos = useCallback(() => {
    return Boolean(searchParams.busca || searchParams.tipoUsuario || searchParams.ativo);
  }, [searchParams]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filtros
          {temFiltrosAtivos() && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              Filtros ativos
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form method="GET" className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label htmlFor="busca" className="text-sm font-medium">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="busca"
                name="busca"
                placeholder="Nome ou email..."
                defaultValue={searchParams.busca}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="tipoUsuario" className="text-sm font-medium">
              Tipo
            </label>
            <Select name="tipoUsuario" defaultValue={searchParams.tipoUsuario || undefined}>
              <SelectTrigger id="tipoUsuario">
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                {TIPOS_USUARIO.map((tipo) => (
                  <SelectItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="ativo" className="text-sm font-medium">
              Status
            </label>
            <Select name="ativo" defaultValue={searchParams.ativo || undefined}>
              <SelectTrigger id="ativo">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Ações</label>
            <div className="flex gap-2">
              <Button type="submit" size="sm">
                Filtrar
              </Button>
              {temFiltrosAtivos() && (
                <Button type="button" variant="outline" size="sm" asChild>
                  <Link href="/usuarios">
                    <X className="h-4 w-4 mr-1" />
                    Limpar
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}