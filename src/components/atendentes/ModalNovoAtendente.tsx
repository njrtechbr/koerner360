/**
 * Modal para criar novo atendente
 */

'use client';


import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FormularioAtendente } from './formulario-atendente';

interface ModalNovoAtendenteProps {
  aberto: boolean;
  onFechar: () => void;
  onAtendenteCriado?: () => void;
}

/**
 * Modal para criar novo atendente
 */
export function ModalNovoAtendente({
  aberto,
  onFechar,
  onAtendenteCriado
}: ModalNovoAtendenteProps) {


  const handleOpenChange = (novoEstado: boolean) => {
    if (!novoEstado) {
      onFechar();
    }
  };

  const handleSucesso = () => {
    onFechar();
    if (onAtendenteCriado) {
      onAtendenteCriado();
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Atendente</DialogTitle>
          <DialogDescription>
            Preencha as informações para adicionar um novo atendente ao sistema. Todos os campos marcados com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          <FormularioAtendente 
            modo="criar" 
            onSucesso={handleSucesso}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}