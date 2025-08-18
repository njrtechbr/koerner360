'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, X } from 'lucide-react';

export interface FiltrosUsuarios {
  busca: string;
  tipoUsuario: string;
  ativo: string;
  supervisorId: string;
}

interface FiltrosUsuariosProps {
  filtros: FiltrosUsuarios;
  onFiltrosChange: (filtros: FiltrosUsuarios) => void;
  onLimparFiltros: () => void;
}

export function FiltrosUsuariosComponent({ filtros, onFiltrosChange, onLimparFiltros }: FiltrosUsuariosProps) {
  const handleBuscaChange = (value: string) => {
    onFiltrosChange({ ...filtros, busca: value });
  };

  const handleTipoChange = (value: string) => {
    onFiltrosChange({ ...filtros, tipoUsuario: value });
  };

  const handleAtivoChange = (value: string) => {
    onFiltrosChange({ ...filtros, ativo: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Buscar</label>
            <Input
              placeholder="Nome ou email..."
              value={filtros.busca}
              onChange={(e) => handleBuscaChange(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo</label>
            <Select value={filtros.tipoUsuario} onValueChange={handleTipoChange}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
                <SelectItem value="ATENDENTE">Atendente</SelectItem>
                <SelectItem value="CONSULTOR">Consultor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={filtros.ativo} onValueChange={handleAtivoChange}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="true">Ativo</SelectItem>
                <SelectItem value="false">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Ações</label>
            <Button 
              variant="outline" 
              onClick={onLimparFiltros}
              className="w-full"
            >
              <X className="h-4 w-4 mr-2" />
              Limpar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}