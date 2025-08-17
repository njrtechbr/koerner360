'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  Copy, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  AlertTriangle,
  User
} from 'lucide-react';
import { toast } from 'sonner';
import { logError } from '@/lib/error-utils';

interface ModalCredenciaisProps {
  aberto: boolean;
  onFechar: () => void;
  credenciais: {
    email: string;
    senhaTemporaria: string;
  };
  nomeAtendente: string;
}

/**
 * Modal para exibir as credenciais temporárias do usuário criado
 * Permite copiar as credenciais e fornece instruções de uso
 */
export function ModalCredenciais({
  aberto,
  onFechar,
  credenciais,
  nomeAtendente,
}: ModalCredenciaisProps) {
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [emailCopiado, setEmailCopiado] = useState(false);
  const [senhaCopiada, setSenhaCopiada] = useState(false);

  const copiarTexto = async (texto: string, tipo: 'email' | 'senha') => {
    try {
      await navigator.clipboard.writeText(texto);
      
      if (tipo === 'email') {
        setEmailCopiado(true);
        setTimeout(() => setEmailCopiado(false), 2000);
        toast.success('Email copiado para a área de transferência');
      } else {
        setSenhaCopiada(true);
        setTimeout(() => setSenhaCopiada(false), 2000);
        toast.success('Senha copiada para a área de transferência');
      }
    } catch (error) {
      logError('Erro ao copiar', error);
      toast.error('Erro ao copiar para a área de transferência');
    }
  };

  const copiarCredenciaisCompletas = async () => {
    const textoCompleto = `Credenciais de acesso - Koerner 360\n\nUsuário: ${nomeAtendente}\nEmail: ${credenciais.email}\nSenha temporária: ${credenciais.senhaTemporaria}\n\nIMPORTANTE: Esta é uma senha temporária que deve ser alterada no primeiro acesso.`;
    
    try {
      await navigator.clipboard.writeText(textoCompleto);
      toast.success('Credenciais completas copiadas para a área de transferência');
    } catch (error) {
      logError('Erro ao copiar credenciais completas', error);
      toast.error('Erro ao copiar credenciais');
    }
  };

  // Função para controlar o fechamento do modal
  const handleOpenChange = (open: boolean) => {
    // Sempre permite fechar o modal de credenciais
    if (!open) {
      onFechar();
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            Usuário Criado com Sucesso!
          </DialogTitle>
          <DialogDescription>
            As credenciais temporárias foram geradas. Compartilhe-as com segurança com o atendente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informações do usuário */}
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <User className="h-4 w-4 text-green-600" />
            <span className="font-medium text-green-800">{nomeAtendente}</span>
          </div>

          <Separator />

          {/* Credenciais */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Credenciais de Acesso:</h4>
            
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  value={credenciais.email}
                  readOnly
                  className="font-mono"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copiarTexto(credenciais.email, 'email')}
                  className="flex-shrink-0"
                >
                  {emailCopiado ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <Label htmlFor="senha" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Senha Temporária
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="senha"
                    type={senhaVisivel ? 'text' : 'password'}
                    value={credenciais.senhaTemporaria}
                    readOnly
                    className="font-mono pr-10"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setSenhaVisivel(!senhaVisivel)}
                  >
                    {senhaVisivel ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copiarTexto(credenciais.senhaTemporaria, 'senha')}
                  className="flex-shrink-0"
                >
                  {senhaCopiada ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Instruções importantes */}
          <div className="space-y-3">
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">Instruções Importantes:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Esta é uma senha temporária que deve ser alterada no primeiro acesso</li>
                  <li>• Compartilhe essas credenciais de forma segura com o atendente</li>
                  <li>• O usuário deve fazer login em: <strong>{window.location.origin}/login</strong></li>
                  <li>• Após o primeiro login, o sistema solicitará uma nova senha</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={copiarCredenciaisCompletas}
            className="gap-2"
          >
            <Copy className="h-4 w-4" />
            Copiar Tudo
          </Button>
          <Button onClick={onFechar}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}