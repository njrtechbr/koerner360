'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Edit, Shield } from 'lucide-react';
import Link from 'next/link';
import { DetalhesUsuario } from '@/components/usuarios/detalhes-usuario';
import { FormularioUsuario } from '@/components/usuarios/formulario-usuario';

// Tipagem do usuário que vem da API (semelhante ao schema do Prisma)
interface Usuario {
  id: string;
  nome: string;
  email: string;
  tipoUsuario: 'ADMIN' | 'SUPERVISOR' | 'ATENDENTE';
  ativo: boolean;
  criadoEm: Date | string;
  atualizadoEm: Date | string;
  supervisorId?: string | null;
  supervisor?: {
    id: string;
    nome: string;
  } | null;
  _count?: {
    supervisoes?: number;
  };
}

interface UsuarioDetailsPageProps {
  usuario: Usuario;
  podeEditar: boolean;
  tabAtiva: string;
}

export default function UsuarioDetailsPage({ usuario, podeEditar, tabAtiva: initialTab }: UsuarioDetailsPageProps) {
  const router = useRouter();
  const [tabAtiva, setTabAtiva] = useState(initialTab);

  const handleTabChange = (value: string) => {
    setTabAtiva(value);
    router.push(`/usuarios/${usuario.id}?tab=${value}`, { scroll: false });
  };

  const handleFechar = () => {
    router.push('/usuarios');
  };

  const handleSalvar = () => {
    // Lógica para salvar o formulário aqui, talvez revalidar a rota
    router.push(`/usuarios/${usuario.id}?tab=detalhes`);
    router.refresh(); // Revalida os dados da página
  };

  return (
    <Tabs value={tabAtiva} onValueChange={handleTabChange} className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="detalhes">
          <User className="h-4 w-4 mr-2" />
          Detalhes
        </TabsTrigger>
        {podeEditar && (
          <TabsTrigger value="editar">
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </TabsTrigger>
        )}
        <TabsTrigger value="permissoes">
          <Shield className="h-4 w-4 mr-2" />
          Permissões
        </TabsTrigger>
      </TabsList>

      <TabsContent value="detalhes" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações do Usuário
            </CardTitle>
            <CardDescription>
              Visualize as informações detalhadas do usuário.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DetalhesUsuario
              usuario={usuario}
              onEditar={() => handleTabChange('editar')}
              onFechar={handleFechar}
            />
          </CardContent>
        </Card>
      </TabsContent>

      {podeEditar && (
        <TabsContent value="editar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Editar Usuário
              </CardTitle>
              <CardDescription>
                Modifique as informações do usuário. Campos marcados com * são obrigatórios.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormularioUsuario
                usuario={{
                  id: usuario.id,
                  nome: usuario.nome,
                  email: usuario.email,
                  tipoUsuario: usuario.tipoUsuario,
                  ativo: usuario.ativo,
                  supervisorId: usuario.supervisorId || undefined,
                }}
                onSalvar={handleSalvar}
                onCancelar={() => handleTabChange('detalhes')}
              />
            </CardContent>
          </Card>
        </TabsContent>
      )}

      <TabsContent value="permissoes" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Permissões e Acesso
            </CardTitle>
            <CardDescription>
              Visualize as permissões e níveis de acesso do usuário.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Tipo de Usuário</h4>
                  <p className="text-sm text-muted-foreground">{usuario.tipoUsuario}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Status</h4>
                  <p className="text-sm text-muted-foreground">
                    {usuario.ativo ? 'Ativo' : 'Inativo'}
                  </p>
                </div>
                {usuario.supervisor && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Supervisor</h4>
                    <p className="text-sm text-muted-foreground">
                      {usuario.supervisor.nome} ({usuario.supervisor.email})
                    </p>
                  </div>
                )}
                {(usuario._count?.supervisoes ?? 0) > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Atendentes Supervisionados</h4>
                    <p className="text-sm text-muted-foreground">
                      {usuario._count.supervisoes} colaborador(es) supervisionado(s)
                    </p>
                  </div>
                )}
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Informações do Sistema</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium">Criado em:</span> {new Date(usuario.criadoEm).toLocaleString('pt-BR')}
                  </div>
                  <div>
                    <span className="font-medium">Atualizado em:</span> {new Date(usuario.atualizadoEm).toLocaleString('pt-BR')}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
