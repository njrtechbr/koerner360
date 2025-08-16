'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Filter, Search } from 'lucide-react';
import { useSonnerToast } from '@/hooks/use-sonner-toast';

export interface FiltrosUsuarios {
  busca: string;
  tipoUsuario: string;
  ativo: string;
  supervisorId: string;
}

interface Supervisor {
  id: string;
  nome: string;
}

interface FiltrosUsuariosProps {
  filtros: FiltrosUsuarios;
  onFiltrosChange: (filtros: FiltrosUsuarios) => void;
  onLimparFiltros: () => void;
}

export function FiltrosUsuariosComponent({ filtros, onFiltrosChange, onLimparFiltros }: FiltrosUsuariosProps) {
  const { showInfo } = useSonnerToast();
  const [supervisores, setSupervisores] = useState<Supervisor[]>([]);
  const [carregandoSupervisores, setCarregandoSupervisores] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Carregar supervisores
  const carregarSupervisores = async () => {
    try {
      setCarregandoSupervisores(true);
      const response = await fetch('/api/usuarios?tipoUsuario=SUPERVISOR&ativo=true&limit=100');
      const data = await response.json();

      if (response.ok) {
        setSupervisores(data.data.usuarios);
      }
    } catch (error) {
      console.error('Erro ao carregar supervisores:', error);
    } finally {
      setCarregandoSupervisores(false);
    }
  };

  useEffect(() => {
    carregarSupervisores();
  }, []);

  const handleFiltroChange = (campo: keyof FiltrosUsuarios, valor: string) => {
    // Converte "todos" para string vazia para manter compatibilidade
    const valorFinal = valor === 'todos' ? '' : valor;
    onFiltrosChange({
      ...filtros,
      [campo]: valorFinal,
    });
  };

  const temFiltrosAtivos = () => {
    return (
      filtros.busca ||
      (filtros.tipoUsuario && filtros.tipoUsuario !== 'todos') ||
      (filtros.ativo && filtros.ativo !== 'todos') ||
      (filtros.supervisorId && filtros.supervisorId !== 'todos')
    );
  };

  const contarFiltrosAtivos = () => {
    let count = 0;
    if (filtros.busca) count++;
    if (filtros.tipoUsuario && filtros.tipoUsuario !== 'todos') count++;
    if (filtros.ativo && filtros.ativo !== 'todos') count++;
    if (filtros.supervisorId && filtros.supervisorId !== 'todos') count++;
    return count;
  };

  const getTipoUsuarioLabel = (tipo: string) => {
    switch (tipo) {
      case 'ADMIN':
        return 'Administrador';
      case 'SUPERVISOR':
        return 'Supervisor';
      case 'ATENDENTE':
        return 'Atendente';
      default:
        return tipo;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'true':
        return 'Ativo';
      case 'false':
        return 'Inativo';
      default:
        return status;
    }
  };

  const getSupervisorNome = (id: string) => {
    const supervisor = supervisores.find(s => s.id === id);
    return supervisor ? supervisor.nome : 'Supervisor não encontrado';
  };

  return (
    <div className="space-y-4">
      {/* Barra de Busca e Botão de Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={filtros.busca}
            onChange={(e) => handleFiltroChange('busca', e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="flex items-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span>Filtros</span>
            {contarFiltrosAtivos() > 0 && (
              <Badge variant="secondary" className="ml-1">
                {contarFiltrosAtivos()}
              </Badge>
            )}
          </Button>
          {temFiltrosAtivos() && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onLimparFiltros();
                showInfo('Filtros de usuários removidos');
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          )}
        </div>
      </div>

      {/* Filtros Ativos */}
      {temFiltrosAtivos() && (
        <div className="flex flex-wrap gap-2">
          {filtros.tipoUsuario && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Tipo: {getTipoUsuarioLabel(filtros.tipoUsuario)}</span>
              <button
                onClick={() => handleFiltroChange('tipoUsuario', '')}
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filtros.ativo && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Status: {getStatusLabel(filtros.ativo)}</span>
              <button
                onClick={() => handleFiltroChange('ativo', '')}
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filtros.supervisorId && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Supervisor: {getSupervisorNome(filtros.supervisorId)}</span>
              <button
                onClick={() => handleFiltroChange('supervisorId', '')}
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Painel de Filtros */}
      {mostrarFiltros && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros Avançados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tipo de Usuário */}
              <div className="space-y-2">
                <Label htmlFor="tipoUsuario">Tipo de Usuário</Label>
                <Select
                  value={filtros.tipoUsuario || 'todos'}
                  onValueChange={(value) => handleFiltroChange('tipoUsuario', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os tipos</SelectItem>
                    <SelectItem value="ADMIN">Administrador</SelectItem>
                    <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
                    <SelectItem value="ATENDENTE">Atendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="ativo">Status</Label>
                <Select
                  value={filtros.ativo || 'todos'}
                  onValueChange={(value) => handleFiltroChange('ativo', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os status</SelectItem>
                    <SelectItem value="true">Ativo</SelectItem>
                    <SelectItem value="false">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Supervisor */}
              <div className="space-y-2">
                <Label htmlFor="supervisorId">Supervisor</Label>
                <Select
                  value={filtros.supervisorId || 'todos'}
                  onValueChange={(value) => handleFiltroChange('supervisorId', value)}
                  disabled={carregandoSupervisores}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os supervisores" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os supervisores</SelectItem>
                    {supervisores.map((supervisor) => (
                      <SelectItem key={supervisor.id} value={supervisor.id}>
                        {supervisor.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {carregandoSupervisores && (
                  <p className="text-sm text-muted-foreground">Carregando supervisores...</p>
                )}
              </div>
            </div>

            {/* Botões do Painel */}
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setMostrarFiltros(false)}
              >
                Fechar
              </Button>
              {temFiltrosAtivos() && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    onLimparFiltros();
                    setMostrarFiltros(false);
                    showInfo('Filtros de usuários removidos');
                  }}
                >
                  Limpar Filtros
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}