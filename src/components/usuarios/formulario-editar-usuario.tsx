'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useSonnerToast } from '@/hooks/use-sonner-toast';
import { Save, Loader2 } from 'lucide-react';

const editarUsuarioSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  tipoUsuario: z.enum(['ADMIN', 'SUPERVISOR', 'ATENDENTE', 'CONSULTOR']),
  ativo: z.boolean(),
  supervisorId: z.string().nullable().optional(),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').optional().or(z.literal('')),
  confirmarSenha: z.string().optional(),
}).refine((data) => {
  if (data.senha && data.senha.length > 0) {
    return data.senha === data.confirmarSenha;
  }
  return true;
}, {
  message: "Senhas não coincidem",
  path: ["confirmarSenha"],
});

type EditarUsuarioForm = z.infer<typeof editarUsuarioSchema>;

interface Usuario {
  id: string;
  nome: string;
  email: string;
  tipoUsuario: string;
  ativo: boolean;
  supervisorId?: string | null;
}

interface Supervisor {
  id: string;
  nome: string;
  email: string;
}

interface FormularioEditarUsuarioProps {
  usuario: Usuario;
  supervisores: Supervisor[];
  podeEditarTipo: boolean;
  podeEditarSupervisor: boolean;
  userType: string;
}

export function FormularioEditarUsuario({
  usuario,
  supervisores,
  podeEditarTipo,
  podeEditarSupervisor,
  userType
}: FormularioEditarUsuarioProps) {
  const router = useRouter();
  const { showSuccess, showError } = useSonnerToast();
  const [loading, setLoading] = useState(false);
  const [alterarSenha, setAlterarSenha] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty }
  } = useForm<EditarUsuarioForm>({
    resolver: zodResolver(editarUsuarioSchema),
    defaultValues: {
      nome: usuario.nome,
      email: usuario.email,
      tipoUsuario: usuario.tipoUsuario as any,
      ativo: usuario.ativo,
      supervisorId: usuario.supervisorId,
      senha: '',
      confirmarSenha: '',
    },
  });

  const tipoUsuarioSelecionado = watch('tipoUsuario');

  const onSubmit = async (data: EditarUsuarioForm) => {
    try {
      setLoading(true);

      // Preparar dados para envio
      const dadosEnvio: any = {
        nome: data.nome,
        email: data.email,
        ativo: data.ativo,
      };

      // Apenas incluir campos que podem ser editados
      if (podeEditarTipo) {
        dadosEnvio.tipoUsuario = data.tipoUsuario;
      }

      if (podeEditarSupervisor) {
        dadosEnvio.supervisorId = data.supervisorId;
      }

      // Incluir senha apenas se foi alterada
      if (alterarSenha && data.senha) {
        dadosEnvio.senha = data.senha;
      }

      const response = await fetch(`/api/usuarios/${usuario.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosEnvio),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao atualizar usuário');
      }

      showSuccess('Usuário atualizado com sucesso');
      router.push(`/usuarios/${usuario.id}`);
      router.refresh();
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      showError(
        error instanceof Error 
          ? error.message 
          : 'Erro ao atualizar usuário'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Informações básicas */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              {...register('nome')}
              placeholder="Nome completo"
            />
            {errors.nome && (
              <p className="text-sm text-red-600">{errors.nome.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="email@exemplo.com"
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tipoUsuario">Tipo de Usuário *</Label>
            <Select
              value={watch('tipoUsuario')}
              onValueChange={(value) => setValue('tipoUsuario', value as any, { shouldDirty: true })}
              disabled={!podeEditarTipo}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Administrador</SelectItem>
                <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
                <SelectItem value="ATENDENTE">Atendente</SelectItem>
                <SelectItem value="CONSULTOR">Consultor</SelectItem>
              </SelectContent>
            </Select>
            {!podeEditarTipo && (
              <p className="text-sm text-muted-foreground">
                Você não tem permissão para alterar o tipo de usuário
              </p>
            )}
          </div>

          {(tipoUsuarioSelecionado === 'ATENDENTE' || usuario.supervisorId) && (
            <div className="space-y-2">
              <Label htmlFor="supervisorId">Supervisor</Label>
              <Select
                value={watch('supervisorId') || ''}
                onValueChange={(value) => setValue('supervisorId', value || null, { shouldDirty: true })}
                disabled={!podeEditarSupervisor}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um supervisor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nenhum">Nenhum supervisor</SelectItem>
                  {supervisores.map((supervisor) => (
                    <SelectItem key={supervisor.id} value={supervisor.id}>
                      {supervisor.nome} ({supervisor.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!podeEditarSupervisor && (
                <p className="text-sm text-muted-foreground">
                  Você não tem permissão para alterar o supervisor
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="ativo"
            checked={watch('ativo')}
            onCheckedChange={(checked) => setValue('ativo', checked, { shouldDirty: true })}
          />
          <Label htmlFor="ativo">Usuário ativo</Label>
        </div>
      </div>

      <Separator />

      {/* Alteração de senha */}
      <Card>
        <CardHeader>
          <CardTitle>Alterar Senha</CardTitle>
          <CardDescription>
            Deixe em branco para manter a senha atual
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="alterarSenha"
              checked={alterarSenha}
              onCheckedChange={setAlterarSenha}
            />
            <Label htmlFor="alterarSenha">Alterar senha</Label>
          </div>

          {alterarSenha && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="senha">Nova Senha</Label>
                <Input
                  id="senha"
                  type="password"
                  {...register('senha')}
                  placeholder="Digite a nova senha"
                />
                {errors.senha && (
                  <p className="text-sm text-red-600">{errors.senha.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
                <Input
                  id="confirmarSenha"
                  type="password"
                  {...register('confirmarSenha')}
                  placeholder="Confirme a nova senha"
                />
                {errors.confirmarSenha && (
                  <p className="text-sm text-red-600">{errors.confirmarSenha.message}</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botões de ação */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancelar
        </Button>

        <Button
          type="submit"
          disabled={loading || !isDirty}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Alterações
            </>
          )}
        </Button>
      </div>
    </form>
  );
}