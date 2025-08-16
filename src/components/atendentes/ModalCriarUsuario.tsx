'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, User, Mail, UserPlus, Loader2 } from 'lucide-react';
import { Atendente, StatusAtendenteLabels } from '@/types/atendente';

interface ModalCriarUsuarioProps {
  aberto: boolean;
  onFechar: () => void;
  onConfirmar: () => void;
  atendente: Atendente;
  carregando: boolean;
}

/**
 * Modal de confirmação para criação de usuário
 * Exibe informações do atendente e solicita confirmação
 */
export function ModalCriarUsuario({
  aberto,
  onFechar,
  onConfirmar,
  atendente,
  carregando,
}: ModalCriarUsuarioProps) {
  // Função para controlar o fechamento do modal
  const handleOpenChange = (open: boolean) => {
    // Só permite fechar se não estiver carregando
    if (!open && !carregando) {
      onFechar();
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Criar Usuário
          </DialogTitle>
          <DialogDescription>
            Confirme a criação de usuário para o atendente selecionado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informações do atendente */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{atendente.nome}</span>
              <Badge variant="outline">
                {StatusAtendenteLabels[atendente.status]}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{atendente.email}</span>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <div><strong>Setor:</strong> {atendente.setor}</div>
              <div><strong>Cargo:</strong> {atendente.cargo}</div>
              <div><strong>Portaria:</strong> {atendente.portaria}</div>
            </div>
          </div>

          <Separator />

          {/* Informações sobre o usuário que será criado */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Usuário que será criado:</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <div><strong>Nome:</strong> {atendente.nome}</div>
              <div><strong>Email:</strong> {atendente.email}</div>
              <div><strong>Tipo:</strong> Atendente</div>
              <div><strong>Status:</strong> Ativo</div>
            </div>
          </div>

          {/* Aviso sobre senha temporária */}
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Senha temporária</p>
              <p>
                Uma senha temporária será gerada automaticamente. 
                O usuário deverá alterá-la no primeiro acesso.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onFechar}
            disabled={carregando}
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirmar}
            disabled={carregando}
            className="gap-2"
          >
            {carregando ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Criar Usuário
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}