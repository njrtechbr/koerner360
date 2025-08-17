'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ModalBoasVindasProps {
  isOpen: boolean;
  onClose: () => void;
  nomeUsuario: string;
  email: string;
  senhaTemporaria: string;
}

export function ModalBoasVindas({
  isOpen,
  onClose,
  nomeUsuario,
  email,
  senhaTemporaria,
}: ModalBoasVindasProps) {
  const [copiado, setCopiado] = useState(false);

  const textoCompleto = `Olá ${nomeUsuario},

Seja muito bem-vindo(a) ao Koerner 360! 🎉

É com grande satisfação que informamos que sua conta de atendente foi convertida para usuário da nossa plataforma de gestão de feedbacks e avaliações. Agora você terá acesso a todas as funcionalidades do sistema para acompanhar e gerenciar suas atividades.

### 🔐 Seus Dados de Acesso:
- Nome de usuário: ${email}
- Senha temporária: ${senhaTemporaria}

⚠️ Importante: Esta é uma senha temporária para seu primeiro acesso. Por questões de segurança, recomendamos que você altere sua senha assim que fizer login na plataforma.

Acesse a plataforma em: http://localhost:3001/login`;

  const copiarTexto = async () => {
    try {
      await navigator.clipboard.writeText(textoCompleto);
      setCopiado(true);
      toast.success('Texto copiado para a área de transferência!');
      
      // Reset do ícone após 2 segundos
      setTimeout(() => {
        setCopiado(false);
      }, 2000);
    } catch (error) {
      console.error('Erro ao copiar texto:', error);
      toast.error('Erro ao copiar texto. Tente novamente.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-green-600">
            Usuário Criado com Sucesso! 🎉
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Olá {nomeUsuario},
            </h3>
            
            <p className="text-gray-700 mb-4">
              Seja muito bem-vindo(a) ao <strong>Koerner 360</strong>! 🎉
            </p>
            
            <p className="text-gray-700 mb-6">
              É com grande satisfação que informamos que sua conta de atendente foi convertida 
              para usuário da nossa plataforma de gestão de feedbacks e avaliações. Agora você 
              terá acesso a todas as funcionalidades do sistema para acompanhar e gerenciar 
              suas atividades.
            </p>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                🔐 Seus Dados de Acesso:
              </h4>
              
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="font-medium text-gray-600 min-w-[140px]">Nome de usuário:</span>
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
                    {email}
                  </span>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="font-medium text-gray-600 min-w-[140px]">Senha temporária:</span>
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
                    {senhaTemporaria}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
              <p className="text-amber-800 text-sm">
                <strong>⚠️ Importante:</strong> Esta é uma senha temporária para seu primeiro acesso. 
                Por questões de segurança, recomendamos que você altere sua senha assim que 
                fizer login na plataforma.
              </p>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">
                <strong>🌐 Acesse a plataforma em:</strong>{' '}
                <a 
                  href="http://localhost:3001/login" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-600"
                >
                  http://localhost:3001/login
                </a>
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              onClick={copiarTexto}
              variant="outline"
              className="flex items-center gap-2"
            >
              {copiado ? (
                <>
                  <Check className="h-4 w-4 text-green-600" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copiar Texto
                </>
              )}
            </Button>
            
            <Button onClick={onClose} className="bg-green-600 hover:bg-green-700">
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}