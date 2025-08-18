'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, Edit, UserX } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  tipoUsuario: 'ADMIN' | 'SUPERVISOR' | 'ATENDENTE' | 'CONSULTOR';
  ativo: boolean;
  criadoEm: string;
  supervisorId?: string;
  supervisor?: {
    id: string;
    nome: string;
  };
}

interface OrdenacaoUsuario {
  coluna: 'nome' | 'email' | 'tipoUsuario' | 'ativo' | 'criadoEm';
  direcao: 'asc' | 'desc';
}

interface TabelaUsuariosProps {
  usuarios: Usuario[];
  carregando: boolean;
  onVerDetalhes: (usuario: Usuario) => void;
  onEditar: (usuario: Usuario) => void;
  onDesativar: (usuario: Usuario) => void;
  podeEditar: boolean;
  podeDesativar: boolean;
  ordenacao: OrdenacaoUsuario;
  onOrdenacaoChange: (ordenacao: OrdenacaoUsuario) => void;
}

const getTipoLabel = (tipo: string) => {
  const labels = {
    ADMIN: 'Admin',
    SUPERVISOR: 'Supervisor',
    ATENDENTE: 'Atendente',
    CONSULTOR: 'Consultor'
  };
  return labels[tipo as keyof typeof labels] || tipo;
};

const getTipoColor = (tipo: string) => {
  const colors = {
    ADMIN: 'bg-red-100 text-red-800',
    SUPERVISOR: 'bg-blue-100 text-blue-800',
    ATENDENTE: 'bg-green-100 text-green-800',
    CONSULTOR: 'bg-purple-100 text-purple-800'
  };
  return colors[tipo as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

export function TabelaUsuarios({
  usuarios,
  carregando,
  onVerDetalhes,
  onEditar,
  onDesativar,
  podeEditar,
  podeDesativar,
  ordenacao: _ordenacao,
  onOrdenacaoChange: _onOrdenacaoChange
}: TabelaUsuariosProps) {
  if (carregando) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (usuarios.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Nenhum usuário encontrado</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header da tabela */}
      <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 rounded-lg font-medium text-sm">
        <div className="col-span-3">Nome</div>
        <div className="col-span-3">Email</div>
        <div className="col-span-2">Tipo</div>
        <div className="col-span-1">Status</div>
        <div className="col-span-2">Criado</div>
        <div className="col-span-1">Ações</div>
      </div>

      {/* Linhas da tabela */}
      {usuarios.map((usuario) => (
        <Card key={usuario.id}>
          <CardContent className="p-4">
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-3">
                <div className="font-medium">{usuario.nome}</div>
                {usuario.supervisor && (
                  <div className="text-sm text-muted-foreground">
                    Supervisor: {usuario.supervisor.nome}
                  </div>
                )}
              </div>
              
              <div className="col-span-3">
                <div className="text-sm">{usuario.email}</div>
              </div>
              
              <div className="col-span-2">
                <Badge className={getTipoColor(usuario.tipoUsuario)}>
                  {getTipoLabel(usuario.tipoUsuario)}
                </Badge>
              </div>
              
              <div className="col-span-1">
                <Badge variant={usuario.ativo ? 'default' : 'secondary'}>
                  {usuario.ativo ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              
              <div className="col-span-2">
                <div className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(usuario.criadoEm), {
                    addSuffix: true,
                    locale: ptBR
                  })}
                </div>
              </div>
              
              <div className="col-span-1">
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onVerDetalhes(usuario)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  {podeEditar && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditar(usuario)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {podeDesativar && usuario.ativo && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDesativar(usuario)}
                    >
                      <UserX className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}