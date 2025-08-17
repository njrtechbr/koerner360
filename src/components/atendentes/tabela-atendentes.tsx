/**
 * Componente de tabela para listar atendentes
 */

'use client';

import { useState, useCallback, memo } from 'react';
import {
  Atendente,
  FiltrosAtendente,
  OrdenacaoAtendente,
  OrdenacaoColunaAtendente,
  PaginacaoAtendentes,
  STATUS_ATENDENTE_LABELS,
  STATUS_ATENDENTE_CORES
} from '@/types/atendente';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  ChevronDown, 
  ChevronUp, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  ArrowUpDown
} from 'lucide-react';
import { toast } from 'sonner';
import { logError } from '@/lib/error-utils';
import { formatarCPF, formatarTelefone } from '@/lib/validations/atendente';
import { BotaoCriarUsuario } from './BotaoCriarUsuario';
import { ModalVisualizarAtendente } from './ModalVisualizarAtendente';
import { ModalEditarAtendente } from './ModalEditarAtendente';

interface TabelaAtendentesProps {
  atendentes: Atendente[];
  filtros: FiltrosAtendente;
  ordenacao: OrdenacaoAtendente;
  paginacao: PaginacaoAtendentes;
  carregando?: boolean;
  onFiltroChange: (filtros: FiltrosAtendente) => void;
  onOrdenacaoChange: (ordenacao: OrdenacaoAtendente) => void;
  onPaginacaoChange: (paginacao: Partial<PaginacaoAtendentes>) => void;
  onRecarregar: () => void;
}

/**
 * Componente de tabela de atendentes
 */
function TabelaAtendentesComponent({
  atendentes,
  ordenacao,
  paginacao,
  carregando = false,
  onOrdenacaoChange,
  onPaginacaoChange,
  onRecarregar
}: TabelaAtendentesProps) {
  const [atendenteParaExcluir, setAtendenteParaExcluir] = useState<Atendente | null>(null);
  const [atendenteParaVisualizar, setAtendenteParaVisualizar] = useState<Atendente | null>(null);
  const [atendenteParaEditar, setAtendenteParaEditar] = useState<Atendente | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  /**
   * Alterar ordenação
   */
  const alterarOrdenacao = useCallback((campo: keyof Atendente) => {
    const novaOrdenacao: OrdenacaoAtendente = {
      coluna: campo as OrdenacaoColunaAtendente,
      direcao: ordenacao.coluna === campo && ordenacao.direcao === 'asc' ? 'desc' : 'asc'
    };
    onOrdenacaoChange(novaOrdenacao);
  }, [ordenacao.coluna, ordenacao.direcao, onOrdenacaoChange]);

  /**
   * Obter ícone de ordenação
   */
  const obterIconeOrdenacao = useCallback((campo: keyof Atendente) => {
    if (ordenacao.coluna !== campo) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return ordenacao.direcao === 'asc' 
      ? <ChevronUp className="ml-2 h-4 w-4" />
      : <ChevronDown className="ml-2 h-4 w-4" />;
  }, [ordenacao.coluna, ordenacao.direcao]);

  /**
   * Excluir atendente
   */
  const excluirAtendente = useCallback(async (atendente: Atendente) => {
    setExcluindo(true);
    
    try {
      const response = await fetch(`/api/atendentes/${atendente.id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao excluir atendente');
      }
      
      toast.success(
        data.softDelete 
          ? `Atendente ${atendente.nome} foi inativado com sucesso`
          : `Atendente ${atendente.nome} foi excluído com sucesso`
      );
      
      onRecarregar();
    } catch (error) {
      logError('Erro ao excluir atendente', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Erro ao excluir atendente'
      );
    } finally {
      setExcluindo(false);
      setAtendenteParaExcluir(null);
    }
  }, [onRecarregar]);

  /**
   * Obter iniciais do nome
   */
  const obterIniciais = useCallback((nome: string) => {
    return nome
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, []);



  return (
    <div className="space-y-4">
      {/* Tabela */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">Foto</TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => alterarOrdenacao('nome')}
                  className="h-auto p-0 font-semibold hover:bg-transparent"
                >
                  Nome
                  {obterIconeOrdenacao('nome')}
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => alterarOrdenacao('email')}
                  className="h-auto p-0 font-semibold hover:bg-transparent"
                >
                  Email
                  {obterIconeOrdenacao('email')}
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => alterarOrdenacao('status')}
                  className="h-auto p-0 font-semibold hover:bg-transparent"
                >
                  Status
                  {obterIconeOrdenacao('status')}
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => alterarOrdenacao('setor')}
                  className="h-auto p-0 font-semibold hover:bg-transparent"
                >
                  Setor
                  {obterIconeOrdenacao('setor')}
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => alterarOrdenacao('cargo')}
                  className="h-auto p-0 font-semibold hover:bg-transparent"
                >
                  Cargo
                  {obterIconeOrdenacao('cargo')}
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => alterarOrdenacao('portaria')}
                  className="h-auto p-0 font-semibold hover:bg-transparent"
                >
                  Portaria
                  {obterIconeOrdenacao('portaria')}
                </Button>
              </TableHead>
              <TableHead className="w-[70px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {carregando ? (
              // Skeleton loading
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-40 bg-muted rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-6 w-16 bg-muted rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-28 bg-muted rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-12 bg-muted rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                  </TableCell>
                </TableRow>
              ))
            ) : atendentes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="text-muted-foreground">
                    Nenhum atendente encontrado.
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              atendentes.map((atendente) => {

                
                return (
                  <TableRow key={atendente.id} className="hover:bg-muted/50">
                    <TableCell>
                      <Avatar className="h-10 w-10">
                        <AvatarImage 
                          src={atendente.avatarUrl || undefined} 
                          alt={atendente.nome} 
                        />
                        <AvatarFallback className="text-xs">
                          {obterIniciais(atendente.nome)}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{atendente.nome}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatarCPF(atendente.cpf)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{atendente.email}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatarTelefone(atendente.telefone)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={STATUS_ATENDENTE_CORES[atendente.status] as "default" | "secondary" | "destructive" | "outline"}
                        className="text-xs"
                      >
                        {STATUS_ATENDENTE_LABELS[atendente.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>{atendente.setor}</TableCell>
                    <TableCell>{atendente.cargo}</TableCell>
                    <TableCell>{atendente.portaria}</TableCell>

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => setAtendenteParaVisualizar(atendente)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setAtendenteParaEditar(atendente)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <BotaoCriarUsuario 
                            atendente={atendente} 
                            onUsuarioCriado={onRecarregar}
                            renderAsMenuItem
                          />
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setAtendenteParaExcluir(atendente)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginação */}
      {!carregando && atendentes.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {((paginacao.paginaAtual - 1) * paginacao.itensPorPagina) + 1} a{' '}
            {Math.min(paginacao.paginaAtual * paginacao.itensPorPagina, paginacao.totalItens)} de{' '}
            {paginacao.totalItens} atendentes
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPaginacaoChange({ paginaAtual: paginacao.paginaAtual - 1 })}
              disabled={!paginacao.temPaginaAnterior}
            >
              Anterior
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, paginacao.totalPaginas) }, (_, i) => {
                const pagina = i + 1;
                return (
                  <Button
                    key={pagina}
                    variant={pagina === paginacao.paginaAtual ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPaginacaoChange({ paginaAtual: pagina })}
                    className="w-8 h-8 p-0"
                  >
                    {pagina}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPaginacaoChange({ paginaAtual: paginacao.paginaAtual + 1 })}
              disabled={!paginacao.temProximaPagina}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog 
        open={!!atendenteParaExcluir} 
        onOpenChange={() => setAtendenteParaExcluir(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o atendente <strong>{atendenteParaExcluir?.nome}</strong>?
              <br /><br />
              <span className="text-red-600">
                ⚠️ Esta ação não pode ser desfeita. O atendente será excluído permanentemente.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={excluindo}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => atendenteParaExcluir && excluirAtendente(atendenteParaExcluir)}
              disabled={excluindo}
              className="bg-red-600 hover:bg-red-700"
            >
              {excluindo ? 'Excluindo...' : 'Confirmar Exclusão'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal para visualizar atendente */}
      <ModalVisualizarAtendente
        atendente={atendenteParaVisualizar}
        aberto={!!atendenteParaVisualizar}
        onFechar={() => setAtendenteParaVisualizar(null)}
      />

      {/* Modal para editar atendente */}
      <ModalEditarAtendente
        atendente={atendenteParaEditar}
        aberto={!!atendenteParaEditar}
        onFechar={() => setAtendenteParaEditar(null)}
        onAtendenteAtualizado={onRecarregar}
      />
    </div>
  );
}

export const TabelaAtendentes = memo(TabelaAtendentesComponent);