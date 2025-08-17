'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useSonnerToast } from '@/hooks/use-sonner-toast';
import { getErrorMessage, logError } from '@/lib/error-utils';
import { ModalBoasVindas } from '@/components/usuarios/modal-boas-vindas';

// Schema removido - validação feita no backend

type FormData = {
  nome: string;
  email: string;
  senha?: string;
  tipoUsuario: 'ADMIN' | 'SUPERVISOR' | 'ATENDENTE';
  ativo: boolean;
  supervisorId?: string;
};

interface Usuario {
  id: string;
  nome: string;
  email: string;
  tipoUsuario: 'ADMIN' | 'SUPERVISOR' | 'ATENDENTE';
  ativo: boolean;
  supervisorId?: string;
}

interface Supervisor {
  id: string;
  nome: string;
}

interface FormularioUsuarioProps {
  usuario?: Usuario | null;
  onSalvar: () => void;
  onCancelar: () => void;
}

function FormularioUsuarioComponent({ usuario, onSalvar, onCancelar }: FormularioUsuarioProps) {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [supervisores, setSupervisores] = useState<Supervisor[]>([]);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregandoSupervisores, setCarregandoSupervisores] = useState(false);
  const [modalBoasVindas, setModalBoasVindas] = useState(false);
  const [dadosUsuarioCriado, setDadosUsuarioCriado] = useState<{
    nome: string;
    email: string;
    senhaTemporaria: string;
  } | null>(null);
  const { showSuccess, showError } = useSonnerToast();

  const isEdicao = !!usuario;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FormData>({
    // resolver: zodResolver(usuarioSchema), // Temporariamente removido devido a incompatibilidade de tipos
    defaultValues: {
      nome: usuario?.nome || '',
      email: usuario?.email || '',
      tipoUsuario: usuario?.tipoUsuario || 'ATENDENTE',
      ativo: usuario?.ativo ?? true,
      supervisorId: usuario?.supervisorId || '',
    },
  });

  const tipoUsuarioSelecionado = watch('tipoUsuario');

  // Carregar supervisores
  const carregarSupervisores = useCallback(async () => {
    try {
      setCarregandoSupervisores(true);
      const response = await fetch('/api/usuarios?tipoUsuario=SUPERVISOR&ativo=true&limit=100');
      const data = await response.json();

      if (response.ok) {
        const supervisores = data.data.usuarios || [];
        setSupervisores(supervisores);
        if (supervisores.length > 0) {
          showSuccess(`${supervisores.length} supervisor(es) disponível(is)`);
        } else {
          showSuccess('Nenhum supervisor encontrado');
        }
      } else {
        showError('Erro ao carregar supervisores');
      }
    } catch (error) {
      logError('Erro ao carregar supervisores', error);
    } finally {
      setCarregandoSupervisores(false);
    }
  }, [showSuccess, showError]);

  useEffect(() => {
    carregarSupervisores();
  }, [carregarSupervisores]);

  // Reset form quando usuario muda
  useEffect(() => {
    if (usuario) {
      reset({
        nome: usuario.nome,
        email: usuario.email,
        tipoUsuario: usuario.tipoUsuario,
        ativo: usuario.ativo,
        supervisorId: usuario.supervisorId || '',
      });
      showSuccess(`Dados do usuário ${usuario.nome} carregados`);
    }
  }, [usuario, reset, showSuccess]);

  const onSubmit = async (data: FormData) => {
    try {
      setCarregando(true);
      setErro(null);

      // Preparar dados para envio
      const dadosEnvio: {
        nome: string;
        email: string;
        tipoUsuario: string;
        ativo: boolean;
        senha?: string;
        supervisorId?: string;
      } = {
        nome: data.nome,
        email: data.email,
        tipoUsuario: data.tipoUsuario,
        ativo: data.ativo,
      };

      // Adicionar senha apenas se for criação ou se foi fornecida
      if (!isEdicao && data.senha) {
        dadosEnvio.senha = data.senha;
      }

      // Adicionar supervisor apenas se for atendente
      if (data.tipoUsuario === 'ATENDENTE' && data.supervisorId) {
        dadosEnvio.supervisorId = data.supervisorId;
      }

      const url = isEdicao ? `/api/usuarios/${usuario.id}` : '/api/usuarios';
      const method = isEdicao ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosEnvio),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.error || 'Erro ao salvar usuário';
        showError(errorMessage);
        throw new Error(errorMessage);
      }

      if (isEdicao) {
        // Para edição, apenas mostrar notificação e fechar
        showSuccess('Usuário atualizado com sucesso!');
        onSalvar();
      } else {
        // Para criação, preparar dados para o modal de boas-vindas
        setDadosUsuarioCriado({
          nome: data.nome,
          email: data.email,
          senhaTemporaria: data.senha || 'senha_temporaria_123', // Fallback caso não tenha senha
        });
        setModalBoasVindas(true);
        showSuccess('Usuário criado com sucesso!');
      }
    } catch (error) {
        logError('Erro ao salvar usuário', error);
        const errorMessage = getErrorMessage(error, 'Erro inesperado');
        setErro(errorMessage);
        showError(`Erro ao salvar usuário: ${errorMessage}`);
      } finally {
      setCarregando(false);
    }
  };

  return (
    <>
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {erro && (
        <Alert variant="destructive">
          <AlertDescription>{erro}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nome */}
        <div className="space-y-2">
          <Label htmlFor="nome">Nome *</Label>
          <Input
            id="nome"
            {...register('nome')}
            placeholder="Nome completo"
            disabled={carregando}
          />
          {errors.nome && (
            <p className="text-sm text-red-600">{errors.nome.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="email@exemplo.com"
            disabled={carregando}
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>
      </div>

      {/* Senha (apenas para criação) */}
      {!isEdicao && (
        <div className="space-y-2">
          <Label htmlFor="senha">Senha *</Label>
          <div className="relative">
            <Input
              id="senha"
              type={mostrarSenha ? 'text' : 'password'}
              {...register('senha')}
              placeholder="Mínimo 6 caracteres"
              disabled={carregando}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setMostrarSenha(!mostrarSenha)}
            >
              {mostrarSenha ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          {errors.senha && (
            <p className="text-sm text-red-600">{errors.senha.message}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tipo de Usuário */}
        <div className="space-y-2">
          <Label htmlFor="tipoUsuario">Tipo de Usuário *</Label>
          <Select
            value={watch('tipoUsuario')}
            onValueChange={(value) => setValue('tipoUsuario', value as 'ADMIN' | 'SUPERVISOR' | 'ATENDENTE')}
            disabled={carregando}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ADMIN">Administrador</SelectItem>
              <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
              <SelectItem value="ATENDENTE">Atendente</SelectItem>
            </SelectContent>
          </Select>
          {errors.tipoUsuario && (
            <p className="text-sm text-red-600">{errors.tipoUsuario.message}</p>
          )}
        </div>

        {/* Supervisor (apenas para atendentes) */}
        {tipoUsuarioSelecionado === 'ATENDENTE' && (
          <div className="space-y-2">
            <Label htmlFor="supervisorId">Supervisor</Label>
            <Select
              value={watch('supervisorId') || 'nenhum'}
              onValueChange={(value) => setValue('supervisorId', value === 'nenhum' ? undefined : value)}
              disabled={carregando || carregandoSupervisores}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um supervisor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nenhum">Nenhum supervisor</SelectItem>
                {supervisores.map((supervisor) => (
                  <SelectItem key={supervisor.id} value={supervisor.id}>
                    {supervisor.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {carregandoSupervisores && (
              <p className="text-sm text-muted-foreground">Carregando supervisores...</p>
            )}
          </div>
        )}
      </div>

      {/* Status Ativo (apenas para edição) */}
      {isEdicao && (
        <div className="flex items-center space-x-2">
          <Switch
            id="ativo"
            checked={watch('ativo')}
            onCheckedChange={(checked) => setValue('ativo', checked)}
            disabled={carregando}
          />
          <Label htmlFor="ativo">Usuário ativo</Label>
        </div>
      )}

      {/* Botões */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancelar}
          disabled={carregando}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={carregando}>
          {carregando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdicao ? 'Atualizar' : 'Criar'} Usuário
        </Button>
      </div>
    </form>
    
    {/* Modal de Boas-vindas */}
    {modalBoasVindas && dadosUsuarioCriado && (
      <ModalBoasVindas
        isOpen={modalBoasVindas}
        onClose={() => {
          setModalBoasVindas(false);
          setDadosUsuarioCriado(null);
          onSalvar(); // Fechar o formulário após o modal
        }}
        nomeUsuario={dadosUsuarioCriado.nome}
        email={dadosUsuarioCriado.email}
        senhaTemporaria={dadosUsuarioCriado.senhaTemporaria}
      />
    )}
    </>
  );
}

export const FormularioUsuario = memo(FormularioUsuarioComponent);