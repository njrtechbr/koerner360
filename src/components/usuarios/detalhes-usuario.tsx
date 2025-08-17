'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, User, Mail, Shield, Calendar, UserCheck } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { logError } from '@/lib/error-utils';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  tipoUsuario: 'ADMIN' | 'SUPERVISOR' | 'ATENDENTE';
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
  supervisorId?: string;
  supervisor?: {
    id: string;
    nome: string;
  };
  _count?: {
    atendentesSupervisionados?: number;

  };
}

interface DetalhesUsuarioProps {
  usuarioId: string;
  onEditar: () => void;
  onFechar: () => void;
}

function DetalhesUsuarioComponent({ usuarioId, onEditar, onFechar }: DetalhesUsuarioProps) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregarUsuario = useCallback(async () => {
    try {
      setCarregando(true);
      setErro(null);

      const response = await fetch(`/api/usuarios/${usuarioId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Erro ao carregar usuário');
      }

      setUsuario(data.data.usuario);
    } catch (error) {
      logError('Erro ao carregar usuário', error);
      setErro(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setCarregando(false);
    }
  }, [usuarioId]);

  useEffect(() => {
    carregarUsuario();
  }, [carregarUsuario]);

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

  const getTipoUsuarioVariant = (tipo: string) => {
    switch (tipo) {
      case 'ADMIN':
        return 'destructive';
      case 'SUPERVISOR':
        return 'default';
      case 'ATENDENTE':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatarData = (data: string) => {
    return format(new Date(data), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
      locale: ptBR,
    });
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando detalhes do usuário...</span>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>{erro}</AlertDescription>
        </Alert>
        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={onFechar}>
            Fechar
          </Button>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="p-6">
        <Alert>
          <AlertDescription>Usuário não encontrado.</AlertDescription>
        </Alert>
        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={onFechar}>
            Fechar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{usuario.nome}</h2>
            <p className="text-muted-foreground">{usuario.email}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge
            variant={usuario.ativo ? 'default' : 'secondary'}
            className={usuario.ativo ? 'bg-green-100 text-green-800' : ''}
          >
            {usuario.ativo ? 'Ativo' : 'Inativo'}
          </Badge>
          <Badge variant={getTipoUsuarioVariant(usuario.tipoUsuario) as "default" | "destructive" | "outline" | "secondary"}>
            {getTipoUsuarioLabel(usuario.tipoUsuario)}
          </Badge>
        </div>
      </div>

      <Separator />

      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Informações Básicas</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{usuario.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Tipo de Usuário</p>
                <p className="text-sm text-muted-foreground">
                  {getTipoUsuarioLabel(usuario.tipoUsuario)}
                </p>
              </div>
            </div>
          </div>

          {/* Supervisor (se for atendente) */}
          {usuario.tipoUsuario === 'ATENDENTE' && usuario.supervisor && (
            <div className="flex items-center space-x-3">
              <UserCheck className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Supervisor</p>
                <p className="text-sm text-muted-foreground">{usuario.supervisor.nome}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estatísticas */}
      {usuario._count && (
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {usuario.tipoUsuario === 'SUPERVISOR' && usuario._count.atendentesSupervisionados !== undefined && (
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {usuario._count.atendentesSupervisionados}
                  </p>
                  <p className="text-sm text-blue-600">Atendentes Supervisionados</p>
                </div>
              )}
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {usuario.ativo ? 'Ativo' : 'Inativo'}
                </p>
                <p className="text-sm text-green-600">Status</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informações de Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Informações do Sistema</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Criado em</p>
              <p className="text-sm text-muted-foreground">
                {formatarData(usuario.criadoEm)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Última atualização</p>
              <p className="text-sm text-muted-foreground">
                {formatarData(usuario.atualizadoEm)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onFechar}>
          Fechar
        </Button>
        <Button onClick={onEditar}>
          Editar Usuário
        </Button>
      </div>
    </div>
  );
}

export const DetalhesUsuario = memo(DetalhesUsuarioComponent);