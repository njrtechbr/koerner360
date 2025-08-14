'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, AlertTriangle } from 'lucide-react';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  tipoUsuario: 'ADMIN' | 'SUPERVISOR' | 'ATENDENTE';
  ativo: boolean;
}

interface ConfirmarDesativacaoProps {
  usuario: Usuario | null;
  aberto: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export function ConfirmarDesativacao({ usuario, aberto, onConfirmar, onCancelar }: ConfirmarDesativacaoProps) {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleConfirmar = async () => {
    if (!usuario) return;
    
    try {
      setCarregando(true);
      setErro(null);

      const response = await fetch(`/api/usuarios/${usuario.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Erro ao desativar usuário');
      }

      onConfirmar();
    } catch (error) {
      console.error('Erro ao desativar usuário:', error);
      setErro(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setCarregando(false);
    }
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

  const getAcaoLabel = () => {
    if (!usuario) return 'processar';
    return usuario.ativo ? 'desativar' : 'ativar';
  };

  const getAcaoTitulo = () => {
    if (!usuario) return 'Processar';
    return usuario.ativo ? 'Desativar' : 'Ativar';
  };

  const getDescricaoAcao = () => {
    if (!usuario) return 'Processando ação do usuário...';
    if (usuario.ativo) {
      return 'O usuário será desativado e não poderá mais acessar o sistema. Esta ação pode ser revertida posteriormente.';
    } else {
      return 'O usuário será reativado e poderá acessar o sistema novamente.';
    }
  };

  const getAvisoEspecial = () => {
    if (!usuario || !usuario.ativo) return null;

    switch (usuario.tipoUsuario) {
      case 'ADMIN':
        return 'Atenção: Este é um usuário administrador. Certifique-se de que há outros administradores ativos no sistema.';
      case 'SUPERVISOR':
        return 'Atenção: Este supervisor pode ter atendentes sob sua supervisão. Verifique se há outros supervisores disponíveis.';
      case 'ATENDENTE':
        return 'Este atendente será desativado e suas avaliações pendentes podem ser afetadas.';
      default:
        return null;
    }
  };

  if (!usuario) {
    return null;
  }

  return (
    <Dialog open={aberto} onOpenChange={(open) => !open && onCancelar()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{getAcaoTitulo()} Usuário</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {erro && (
            <Alert variant="destructive">
              <AlertDescription>{erro}</AlertDescription>
            </Alert>
          )}

          {/* Ícone de Aviso */}
          <div className="flex justify-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          {/* Título */}
          <div className="text-center">
            <p className="text-muted-foreground mt-1">
              Tem certeza de que deseja {getAcaoLabel()} este usuário?
            </p>
          </div>

          {/* Informações do Usuário */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Nome:</span>
              <span>{usuario.nome}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Email:</span>
              <span>{usuario.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Tipo:</span>
              <span>{getTipoUsuarioLabel(usuario.tipoUsuario)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Status atual:</span>
              <span className={usuario.ativo ? 'text-green-600' : 'text-red-600'}>
                {usuario.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>

          {/* Descrição da Ação */}
          <div className="text-sm text-muted-foreground text-center">
            {getDescricaoAcao()}
          </div>

          {/* Aviso Especial */}
          {getAvisoEspecial() && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{getAvisoEspecial()}</AlertDescription>
            </Alert>
          )}

          {/* Botões */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={onCancelar}
              disabled={carregando}
            >
              Cancelar
            </Button>
            <Button
              variant={usuario.ativo ? 'destructive' : 'default'}
              onClick={handleConfirmar}
              disabled={carregando}
            >
              {carregando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {getAcaoTitulo()}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}