/**
 * Página para visualizar e editar atendente
 * /app/atendentes/[id] - Detalhes e edição de atendente específico
 */

import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { TipoUsuario } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { DetalhesAtendente } from '@/components/atendentes/detalhes-atendente';
import { FormularioAtendente } from '@/components/atendentes/formulario-atendente';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, User, Edit, History } from 'lucide-react';
import Link from 'next/link';
import { formatarCPF, formatarTelefone } from '@/lib/validations/atendente';
import { logError } from '@/lib/error-utils';

interface PageProps {
  params: {
    id: string;
  };
  searchParams: {
    tab?: string;
  };
}

/**
 * Buscar dados do atendente
 */
async function buscarAtendente(id: string) {
  try {
    const atendente = await prisma.atendente.findUnique({
      where: { id },
      include: {

        auditLogs: {
          select: {
            id: true,
            acao: true,
            dadosNovos: true,
            criadoEm: true,
            usuario: {
              select: {
                nome: true,
                email: true
              }
            }
          },
          orderBy: {
            criadoEm: 'desc'
          },
          take: 20
        }
      }
    });

    if (!atendente) {
      return null;
    }

    // Formatar dados
    return {
      ...atendente,
      cpf: formatarCPF(atendente.cpf),
      telefone: formatarTelefone(atendente.telefone),
      avatarUrl: atendente.avatarUrl || undefined
    };
  } catch (error) {
    logError('Erro ao buscar atendente', error);
    return null;
  }
}

/**
 * Gerar metadata dinâmica
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const atendente = await buscarAtendente(params.id);
  
  if (!atendente) {
    return {
      title: 'Atendente não encontrado | Koerner 360'
    };
  }

  return {
    title: `${atendente.nome} | Koerner 360`,
    description: `Visualize e gerencie informações do atendente ${atendente.nome}.`
  };
}

/**
 * Página de detalhes do atendente
 */
export default async function AtendentePage({ params, searchParams }: PageProps) {
  // Verificar autenticação
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  // Verificar permissões
  if (session.user.userType === TipoUsuario.ATENDENTE) {
    redirect('/dashboard');
  }

  // Buscar dados do atendente
  const atendente = await buscarAtendente(params.id);
  
  if (!atendente) {
    notFound();
  }

  const tabAtiva = searchParams.tab || 'detalhes';

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Cabeçalho da página */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/atendentes" prefetch={false}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{atendente.nome}</h1>
          <p className="text-muted-foreground">
            {atendente.cargo} • {atendente.setor} • {atendente.portaria}
          </p>
        </div>

      </div>

      {/* Tabs de navegação */}
      <Tabs value={tabAtiva} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="detalhes" asChild>
            <Link href={`/atendentes/${params.id}?tab=detalhes`} prefetch={false} className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Detalhes
            </Link>
          </TabsTrigger>
          <TabsTrigger value="editar" asChild>
            <Link href={`/atendentes/${params.id}?tab=editar`} prefetch={false} className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Editar
            </Link>
          </TabsTrigger>
          <TabsTrigger value="historico" asChild>
            <Link href={`/atendentes/${params.id}?tab=historico`} prefetch={false} className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Histórico
            </Link>
          </TabsTrigger>
        </TabsList>

        {/* Conteúdo das tabs */}
        <TabsContent value="detalhes" className="space-y-6">
          <DetalhesAtendente atendente={atendente} />
        </TabsContent>

        <TabsContent value="editar" className="space-y-6">
          <div className="max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle>Editar Atendente</CardTitle>
                <CardDescription>
                  Atualize as informações do atendente. Todos os campos marcados com * são obrigatórios.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormularioAtendente 
                  modo="editar" 
                  atendente={atendente}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>



        <TabsContent value="historico" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Alterações</CardTitle>
              <CardDescription>
                Registro de todas as alterações realizadas neste atendente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {atendente.auditLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>Nenhum histórico de alterações encontrado.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {atendente.auditLogs.map((log) => (
                    <div key={log.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {log.acao === 'CREATE' && 'Criação'}
                            {log.acao === 'UPDATE' && 'Atualização'}
                            {log.acao === 'DELETE' && 'Remoção'}
                            {log.acao === 'SOFT_DELETE' && 'Inativação'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            por {log.usuario?.nome || 'Sistema'}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.criadoEm).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      {log.dadosNovos && (
                        <div className="text-sm text-muted-foreground">
                          <pre className="whitespace-pre-wrap font-mono text-xs bg-muted p-2 rounded">
                            {JSON.stringify(log.dadosNovos, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}