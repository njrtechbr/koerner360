/**
 * Modal para editar atendente
 */

'use client';


import { Atendente } from '@/types/atendente';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FormularioAtendente } from './formulario-atendente';

interface ModalEditarAtendenteProps {
  atendente: Atendente | null;
  aberto: boolean;
  onFechar: () => void;
  onAtendenteAtualizado?: () => void;
}

/**
 * Modal para editar informações do atendente
 */
export function ModalEditarAtendente({
  atendente,
  aberto,
  onFechar,
  onAtendenteAtualizado
}: ModalEditarAtendenteProps) {


  const handleOpenChange = (novoEstado: boolean) => {
    if (!novoEstado) {
      onFechar();
    }
  };

  const handleSucesso = () => {
    onFechar();
    if (onAtendenteAtualizado) {
      onAtendenteAtualizado();
    }
  };

  if (!atendente) {
    return null;
  }

  return (
    <Dialog open={aberto} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Atendente</DialogTitle>
          <DialogDescription>
            Atualize as informações de {atendente.nome}. Todos os campos marcados com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          <FormularioAtendente 
            modo="editar" 
            atendente={atendente}
            onSucesso={handleSucesso}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}