/**
 * Modal para visualizar detalhes do atendente
 */

'use client';

import { useCallback, memo } from 'react';
import { Atendente } from '@/types/atendente';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DetalhesAtendente } from './detalhes-atendente';

interface ModalVisualizarAtendenteProps {
  atendente: Atendente | null;
  aberto: boolean;
  onFechar: () => void;
}

/**
 * Modal para visualizar detalhes completos do atendente
 */
function ModalVisualizarAtendenteComponent({
  atendente,
  aberto,
  onFechar
}: ModalVisualizarAtendenteProps) {
  const handleOpenChange = useCallback((novoEstado: boolean) => {
    if (!novoEstado) {
      onFechar();
    }
  }, [onFechar]);

  if (!atendente) {
    return null;
  }

  return (
    <Dialog open={aberto} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Atendente</DialogTitle>
          <DialogDescription>
            Visualize as informações completas de {atendente.nome}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          <DetalhesAtendente atendente={atendente} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export const ModalVisualizarAtendente = memo(ModalVisualizarAtendenteComponent);