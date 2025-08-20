'use client';

import { useState, useEffect, memo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { useUsuarios } from '@/hooks/use-usuarios';
import { ModalBoasVindas } from '@/components/usuarios/modal-boas-vindas';
import {
  type CriarUsuarioData,
  type AtualizarUsuarioData,
  type Usuario,
  type Supervisor,
  criarUsuarioSchema,
  atualizarUsuarioSchema
} from '@/lib/validations/usuario';

interface FormularioUsuarioProps {
  usuario?: Usuario | null;
  onSalvar: () => void;
  onCancelar: () => void;
}

function FormularioUsuarioComponent({ usuario, onSalvar, onCancelar }: FormularioUsuarioProps) {
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [modalBoasVindas, setModalBoasVindas] = useState(false);
  const [dadosUsuarioCriado, setDadosUsuarioCriado] = useState<{
    nome: string;
    email: string;
    senhaTemporaria: string;
  } | null>(null);
  const { showSuccess, showError } = useSonnerToast();

  const isEdicao = !!usuario;
  const schema = isEdicao ? atualizarUsuarioSchema : criarUsuarioSchema;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: usuario?.nome || '',
      email: usuario?.email || '',
      tipoUsuario: usuario?.tipoUsuario || 'ATENDENTE',
      ativo: usuario?.ativo ?? true,
      supervisorId: usuario?.supervisorId || '',
    },
  });

  const {
    criarUsuario,
    atualizarUsuario,
    buscarSupervisores,
    supervisores,
    carregandoSupervisores,
    erro
  } = useUsuarios();

  const tipoUsuarioSelecionado = watch('tipoUsuario');

  // Carregar supervisores quando necessário
  useEffect(() => {
    if (tipoUsuarioSelecionado === 'ATENDENTE') {
      buscarSupervisores();
    }
  }, [tipoUsuarioSelecionado, buscarSupervisores]);

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

  const onSubmit = async (data: any) => {
    try {
      if (isEdicao && usuario) {
        // Atualizar usuário existente
        await atualizarUsuario(usuario.id, data);
        showSuccess('Usuário atualizado com sucesso!');
        onSalvar();
      } else {
        // Criar novo usuário
        const novoUsuario = await criarUsuario(data);
        
        // Preparar dados para o modal de boas-vindas
        setDadosUsuarioCriado({
          nome: data.nome,
          email: data.email,
          senhaTemporaria: data.senha || 'senha_temporaria_123',
        });
        setModalBoasVindas(true);
        showSuccess('Usuário criado com sucesso!');
      }
    } catch (error) {
      // Erro já tratado pelo hook useUsuarios
      console.error('Erro ao salvar usuário:', error);
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
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
              disabled={isSubmitting}
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
            disabled={isSubmitting}
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
              disabled={isSubmitting || carregandoSupervisores}
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
            disabled={isSubmitting}
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
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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