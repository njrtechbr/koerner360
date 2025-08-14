'use client';

import { useState } from 'react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  MoreHorizontal,
  Eye,
  Edit,
  UserX,
  UserCheck,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  tipoUsuario: 'ADMIN' | 'SUPERVISOR' | 'ATENDENTE';
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
  supervisor?: {
    id: string;
    nome: string;
  };
}

type OrdenacaoColuna = 'nome' | 'email' | 'tipoUsuario' | 'ativo' | 'criadoEm';
type DirecaoOrdenacao = 'asc' | 'desc';

interface TabelaUsuariosProps {
  usuarios: Usuario[];
  carregando: boolean;
  onVerDetalhes: (usuario: Usuario) => void;
  onEditar: (usuario: Usuario) => void;
  onDesativar: (usuario: Usuario) => void;
  podeEditar: boolean;
  podeDesativar: boolean;
}

export function TabelaUsuarios({
  usuarios,
  carregando,
  onVerDetalhes,
  onEditar,
  onDesativar,
  podeEditar,
  podeDesativar,
}: TabelaUsuariosProps) {
  const [ordenacao, setOrdenacao] = useState<{
    coluna: OrdenacaoColuna;
    direcao: DirecaoOrdenacao;
  }>({ coluna: 'nome', direcao: 'asc' });

  const handleOrdenacao = (coluna: OrdenacaoColuna) => {
    setOrdenacao(prev => ({
      coluna,
      direcao: prev.coluna === coluna && prev.direcao === 'asc' ? 'desc' : 'asc',
    }));
  };

  const usuariosOrdenados = [...usuarios].sort((a, b) => {
    const { coluna, direcao } = ordenacao;
    let valorA: string | number;
    let valorB: string | number;

    switch (coluna) {
      case 'nome':
        valorA = a.nome.toLowerCase();
        valorB = b.nome.toLowerCase();
        break;
      case 'email':
        valorA = a.email.toLowerCase();
        valorB = b.email.toLowerCase();
        break;
      case 'tipoUsuario':
        valorA = a.tipoUsuario;
        valorB = b.tipoUsuario;
        break;
      case 'ativo':
        valorA = a.ativo ? 1 : 0;
        valorB = b.ativo ? 1 : 0;
        break;
      case 'criadoEm':
        valorA = new Date(a.criadoEm).getTime();
        valorB = new Date(b.criadoEm).getTime();
        break;
      default:
        return 0;
    }

    if (valorA < valorB) return direcao === 'asc' ? -1 : 1;
    if (valorA > valorB) return direcao === 'asc' ? 1 : -1;
    return 0;
  });

  const getTipoUsuarioLabel = (tipo: string) => {
    switch (tipo) {
      case 'ADMIN':
        return 'Admin';
      case 'SUPERVISOR':
        return 'Supervisor';
      case 'ATENDENTE':
        return 'Atendente';
      default:
        return tipo;
    }
  };

  const getTipoUsuarioVariant = (tipo: string) => {
    switch (tipo) {
      case 'ADMIN':
        return 'destructive';
      case 'SUPERVISOR':
        return 'default';
      case 'ATENDENTE':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getIniciais = (nome: string) => {
    return nome
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatarData = (data: string) => {
    return format(new Date(data), 'dd/MM/yyyy', { locale: ptBR });
  };

  const IconeOrdenacao = ({ coluna }: { coluna: OrdenacaoColuna }) => {
    if (ordenacao.coluna !== coluna) {
      return <ChevronUp className="h-4 w-4 opacity-30" />;
    }
    return ordenacao.direcao === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  if (carregando) {
    return (
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                    <div className="space-y-1">
                      <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="w-16 h-6 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="w-12 h-6 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (usuarios.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">Nenhum usuário encontrado.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button
                variant="ghost"
                className="h-auto p-0 font-semibold hover:bg-transparent"
                onClick={() => handleOrdenacao('nome')}
              >
                Usuário
                <IconeOrdenacao coluna="nome" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                className="h-auto p-0 font-semibold hover:bg-transparent"
                onClick={() => handleOrdenacao('email')}
              >
                Email
                <IconeOrdenacao coluna="email" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                className="h-auto p-0 font-semibold hover:bg-transparent"
                onClick={() => handleOrdenacao('tipoUsuario')}
              >
                Tipo
                <IconeOrdenacao coluna="tipoUsuario" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                className="h-auto p-0 font-semibold hover:bg-transparent"
                onClick={() => handleOrdenacao('ativo')}
              >
                Status
                <IconeOrdenacao coluna="ativo" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                className="h-auto p-0 font-semibold hover:bg-transparent"
                onClick={() => handleOrdenacao('criadoEm')}
              >
                Criado em
                <IconeOrdenacao coluna="criadoEm" />
              </Button>
            </TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usuariosOrdenados.map((usuario) => (
            <TableRow key={usuario.id} className="hover:bg-muted/50">
              <TableCell>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {getIniciais(usuario.nome)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{usuario.nome}</p>
                    {usuario.supervisor && (
                      <p className="text-xs text-muted-foreground">
                        Supervisor: {usuario.supervisor.nome}
                      </p>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm">{usuario.email}</span>
              </TableCell>
              <TableCell>
                <Badge variant={getTipoUsuarioVariant(usuario.tipoUsuario) as "default" | "destructive" | "outline" | "secondary"}>
                  {getTipoUsuarioLabel(usuario.tipoUsuario)}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={usuario.ativo ? 'default' : 'secondary'}
                  className={usuario.ativo ? 'bg-green-100 text-green-800' : ''}
                >
                  {usuario.ativo ? 'Ativo' : 'Inativo'}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {formatarData(usuario.criadoEm)}
                </span>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onVerDetalhes(usuario)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver detalhes
                    </DropdownMenuItem>
                    {podeEditar && (
                      <DropdownMenuItem onClick={() => onEditar(usuario)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                    )}
                    {podeDesativar && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDesativar(usuario)}
                          className={usuario.ativo ? 'text-red-600' : 'text-green-600'}
                        >
                          {usuario.ativo ? (
                            <>
                              <UserX className="mr-2 h-4 w-4" />
                              Desativar
                            </>
                          ) : (
                            <>
                              <UserCheck className="mr-2 h-4 w-4" />
                              Ativar
                            </>
                          )}
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}