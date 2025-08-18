'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Eye, Edit, UserX, MoreHorizontal, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSonnerToast } from '@/hooks/use-sonner-toast';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  tipoUsuario: string;
  ativo: boolean;
}

interface UsuarioActionsProps {
  usuario: Usuario;
  podeEditar: boolean;
  podeDesativar: boolean;
}

export function UsuarioActions({ usuario, podeEditar, podeDesativar }: UsuarioActionsProps) {
  const router = useRouter();
  const { showSuccess, showError } = useSonnerToast();
  const [showDesativarDialog, setShowDesativarDialog] = useState(false);
  const [showAtivarDialog, setShowAtivarDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleToggleStatus = async (novoStatus: boolean) => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/usuarios/${usuario.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ativo: novoStatus }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao atualizar usuário');
      }

      showSuccess(
        novoStatus 
          ? `Usuário ${usuario.nome} foi ativado com sucesso`
          : `Usuário ${usuario.nome} foi desativado com sucesso`
      );
      
      // Recarregar a página para refletir as mudanças
      router.refresh();
    } catch (error) {
      console.error('Erro ao atualizar status do usuário:', error);
      showError(
        error instanceof Error 
          ? error.message 
          : 'Erro ao atualizar status do usuário'
      );
    } finally {
      setLoading(false);
      setShowDesativarDialog(false);
      setShowAtivarDialog(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Abrir menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/usuarios/${usuario.id}`} className="flex items-center">
              <Eye className="mr-2 h-4 w-4" />
              Visualizar
            </Link>
          </DropdownMenuItem>
          
          {podeEditar && (
            <DropdownMenuItem asChild>
              <Link href={`/usuarios/${usuario.id}/editar`} className="flex items-center">
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </DropdownMenuItem>
          )}
          
          {podeDesativar && (
            <>
              <DropdownMenuSeparator />
              {usuario.ativo ? (
                <DropdownMenuItem 
                  onClick={() => setShowDesativarDialog(true)}
                  className="text-red-600 focus:text-red-600"
                >
                  <UserX className="mr-2 h-4 w-4" />
                  Desativar
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem 
                  onClick={() => setShowAtivarDialog(true)}
                  className="text-green-600 focus:text-green-600"
                >
                  <UserCheck className="mr-2 h-4 w-4" />
                  Ativar
                </DropdownMenuItem>
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog de confirmação para desativar */}
      <AlertDialog open={showDesativarDialog} onOpenChange={setShowDesativarDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja desativar o usuário <strong>{usuario.nome}</strong>?
              <br />
              <br />
              O usuário não conseguirá mais fazer login no sistema, mas seus dados serão preservados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleToggleStatus(false)}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Desativando...' : 'Desativar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de confirmação para ativar */}
      <AlertDialog open={showAtivarDialog} onOpenChange={setShowAtivarDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ativar usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja ativar o usuário <strong>{usuario.nome}</strong>?
              <br />
              <br />
              O usuário poderá fazer login no sistema novamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleToggleStatus(true)}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Ativando...' : 'Ativar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}