'use client';

import { useState, useCallback, useMemo, memo } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { UserPlus, Loader2 } from 'lucide-react';
import { Atendente, StatusAtendente } from '@/types/atendente';
import { ModalCriarUsuario } from './ModalCriarUsuario';
import { ModalBoasVindas } from '../usuarios/modal-boas-vindas';
import { useSonnerToast } from '@/hooks/use-sonner-toast';
import { getErrorMessage, logError } from '@/lib/error-utils';

interface BotaoCriarUsuarioProps {
  atendente: Atendente;
  onUsuarioCriado?: () => void;
  renderAsMenuItem?: boolean;
}

interface CredenciaisUsuario {
  nomeUsuario: string;
  email: string;
  senhaTemporaria: string;
}

/**
 * Botão para criar usuário para um atendente
 * Exibe diferentes estados baseado nas condições do atendente
 */
function BotaoCriarUsuarioComponent({ atendente, onUsuarioCriado, renderAsMenuItem = false }: BotaoCriarUsuarioProps) {
  const [modalConfirmacaoAberto, setModalConfirmacaoAberto] = useState(false);
  const [modalBoasVindasAberto, setModalBoasVindasAberto] = useState(false);
  const [credenciais, setCredenciais] = useState<CredenciaisUsuario | null>(null);
  const [carregando, setCarregando] = useState(false);
  const { showSuccess, showError } = useSonnerToast();

  // Verificações memoizadas para otimizar performance
  const validacoes = useMemo(() => {
    const jaTemUsuario = Boolean(atendente.usuarioId);
    const atendenteAtivo = atendente.status === StatusAtendente.ATIVO;
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(atendente.email);
    
    const nomePartes = atendente.nome.trim().split(' ');
    const nomeCompleto = nomePartes.length >= 2 && nomePartes.every(parte => parte.length >= 2);
    
    const podecriarUsuario = !jaTemUsuario && atendenteAtivo && emailValido && nomeCompleto;
    
    return {
      jaTemUsuario,
      atendenteAtivo,
      emailValido,
      nomeCompleto,
      podecriarUsuario
    };
  }, [atendente.usuarioId, atendente.status, atendente.email, atendente.nome]);

  // Determinar a mensagem de tooltip/erro
  const obterMensagemStatus = useCallback((): string => {
    if (validacoes.jaTemUsuario) {
      return 'Atendente já possui usuário associado';
    }
    if (!validacoes.atendenteAtivo) {
      return 'Atendente deve estar ativo para criar usuário';
    }
    if (!validacoes.emailValido) {
      return 'Email do atendente é inválido';
    }
    if (!validacoes.nomeCompleto) {
      return 'Nome do atendente deve estar completo (nome e sobrenome)';
    }
    return 'Criar usuário para este atendente';
  }, [validacoes]);

  const handleCriarUsuario = useCallback(async () => {
    if (!validacoes.podecriarUsuario) return;

    setCarregando(true);
    
    try {
      const response = await fetch(`/api/atendentes/${atendente.id}/criar-usuario`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar usuário');
      }

      if (data.success && data.data?.credenciais) {
        // Fechar modal de confirmação
        setModalConfirmacaoAberto(false);
        
        // Definir credenciais e abrir modal de boas-vindas
        setCredenciais({
          nomeUsuario: data.data.usuario?.nome || atendente.nome,
          email: data.data.credenciais.email,
          senhaTemporaria: data.data.credenciais.senhaTemporaria
        });
        setModalBoasVindasAberto(true);
        
        // Notificar sucesso
        showSuccess('Usuário criado com sucesso!');
        
        // Callback para atualizar a lista
        onUsuarioCriado?.();
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (error) {
      logError('Erro ao criar usuário', error);
      const errorMessage = getErrorMessage(error, 'Erro inesperado ao criar usuário');
      showError(errorMessage);
    } finally {
      setCarregando(false);
    }
  }, [validacoes.podecriarUsuario, atendente.id, atendente.nome, showSuccess, showError, onUsuarioCriado]);

  const handleFecharBoasVindas = useCallback(() => {
    setModalBoasVindasAberto(false);
    setCredenciais(null);
  }, []);

  const handleAbrirModal = useCallback(() => {
    setModalConfirmacaoAberto(true);
  }, []);

  // Se o atendente já possui usuário, não exibir o componente
  if (validacoes.jaTemUsuario) {
    return null;
  }

  // Renderizar como item de menu dropdown
  if (renderAsMenuItem) {
    return (
      <>
        <DropdownMenuItem
          onClick={(e) => {
            if (validacoes.podecriarUsuario) {
              e.preventDefault();
              e.stopPropagation();
              // Usar setTimeout para evitar conflito com o fechamento do dropdown
              setTimeout(() => {
                handleAbrirModal();
              }, 100);
            }
          }}
          disabled={!validacoes.podecriarUsuario || carregando}
          className={!validacoes.podecriarUsuario ? 'text-muted-foreground' : ''}
        >
          {carregando ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Criando Usuário...
            </>
          ) : (
            <>
              <UserPlus className="mr-2 h-4 w-4" />
              Criar Usuário
            </>
          )}
        </DropdownMenuItem>

        {/* Modal de confirmação */}
        <ModalCriarUsuario
          aberto={modalConfirmacaoAberto}
          onFechar={() => setModalConfirmacaoAberto(false)}
          onConfirmar={handleCriarUsuario}
          atendente={atendente}
          carregando={carregando}
        />

        {/* Modal de boas-vindas */}
        {credenciais && (
          <ModalBoasVindas
            isOpen={modalBoasVindasAberto}
            onClose={handleFecharBoasVindas}
            nomeUsuario={credenciais.nomeUsuario}
            email={credenciais.email}
            senhaTemporaria={credenciais.senhaTemporaria}
          />
        )}
      </>
    );
  }

  return (
    <>
      <Button
        variant={validacoes.podecriarUsuario ? 'default' : 'secondary'}
        size="sm"
        disabled={!validacoes.podecriarUsuario || carregando}
        onClick={handleAbrirModal}
        title={obterMensagemStatus()}
        className="gap-2"
      >
        {carregando ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <UserPlus className="h-4 w-4" />
        )}
        {validacoes.jaTemUsuario ? 'Usuário Criado' : 'Criar Usuário'}
      </Button>

      {/* Modal de confirmação */}
      <ModalCriarUsuario
        aberto={modalConfirmacaoAberto}
        onFechar={() => setModalConfirmacaoAberto(false)}
        onConfirmar={handleCriarUsuario}
        atendente={atendente}
        carregando={carregando}
      />

      {/* Modal de boas-vindas */}
      {credenciais && (
        <ModalBoasVindas
          isOpen={modalBoasVindasAberto}
          onClose={handleFecharBoasVindas}
          nomeUsuario={credenciais.nomeUsuario}
          email={credenciais.email}
          senhaTemporaria={credenciais.senhaTemporaria}
        />
      )}
    </>
  );
}

// Exportar componente memoizado para otimizar re-renders
export const BotaoCriarUsuario = memo(BotaoCriarUsuarioComponent);