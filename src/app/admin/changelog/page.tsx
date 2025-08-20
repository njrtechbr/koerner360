'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Edit, Trash2, MoreHorizontal, Calendar, User } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TipoUsuario } from '@prisma/client';
import { logError } from '@/lib/error-utils';

interface ChangelogItem {
  id: string;
  tipo: string;
  titulo: string;
  descricao: string;
  ordem: number;
}

interface Changelog {
  id: string;
  versao: string;
  dataLancamento: string;
  tipo: string;
  titulo: string;
  descricao: string;
  categoria?: string;
  prioridade: string;
  publicado: boolean;
  criadoEm: string;
  atualizadoEm: string;
  autor?: {
    id: string;
    nome: string;
    email: string;
  };
  itens: ChangelogItem[];
}

interface FormData {
  versao: string;
  dataLancamento: string;
  tipo: string;
  titulo: string;
  descricao: string;
  categoria: string;
  prioridade: string;
  publicado: boolean;
}

const tiposMudanca = [
  { value: 'ADICIONADO', label: 'Adicionado', color: 'bg-green-100 text-green-800' },
  { value: 'ALTERADO', label: 'Alterado', color: 'bg-blue-100 text-blue-800' },
  { value: 'CORRIGIDO', label: 'Corrigido', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'REMOVIDO', label: 'Removido', color: 'bg-red-100 text-red-800' },
  { value: 'DEPRECIADO', label: 'Depreciado', color: 'bg-orange-100 text-orange-800' },
  { value: 'SEGURANCA', label: 'Segurança', color: 'bg-purple-100 text-purple-800' }
];

const categorias = [
  { value: 'FUNCIONALIDADE', label: 'Funcionalidade' },
  { value: 'INTERFACE', label: 'Interface' },
  { value: 'PERFORMANCE', label: 'Performance' },
  { value: 'SEGURANCA', label: 'Segurança' },
  { value: 'CONFIGURACAO', label: 'Configuração' },
  { value: 'DOCUMENTACAO', label: 'Documentação' },
  { value: 'TECNICO', label: 'Técnico' }
];

const prioridades = [
  { value: 'BAIXA', label: 'Baixa', color: 'bg-gray-100 text-gray-800' },
  { value: 'MEDIA', label: 'Média', color: 'bg-blue-100 text-blue-800' },
  { value: 'ALTA', label: 'Alta', color: 'bg-orange-100 text-orange-800' },
  { value: 'CRITICA', label: 'Crítica', color: 'bg-red-100 text-red-800' }
];

export default function AdminChangelogPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [changelogs, setChangelogs] = useState<Changelog[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [editando, setEditando] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    versao: '',
    dataLancamento: '',
    tipo: 'ADICIONADO',
    titulo: '',
    descricao: '',
    categoria: 'FUNCIONALIDADE',
    prioridade: 'MEDIA',
    publicado: false
  });

  // Verificar autenticação e permissão
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user) {
      router.push('/login');
      return;
    }
    
    if (session.user.userType !== 'ADMIN') {
      toast.error('Acesso negado. Apenas administradores podem acessar esta página.');
      router.push('/dashboard');
      return;
    }
  }, [session, status, router]);

  // Carregar changelogs
  useEffect(() => {
    if (session?.user?.userType !== TipoUsuario.ADMIN) {
      carregarChangelogs();
    }
  }, [session, carregarChangelogs]);

    const carregarChangelogs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/changelog');
      
      if (!response.ok) {
        throw new Error('Erro ao carregar changelogs');
      }
      
      const data = await response.json();
      setChangelogs(data.changelogs || []);
    } catch (error) {
      logError('Erro ao carregar changelogs', error);
      toast.error('Erro ao carregar changelogs');
    } finally {
      setLoading(false);
    }
  }, [setChangelogs, setLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editando ? `/api/changelog/${editando}` : '/api/changelog';
      const method = editando ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.erro || 'Erro ao salvar changelog');
      }
      
      toast.success(editando ? 'Changelog atualizado com sucesso!' : 'Changelog criado com sucesso!');
      setDialogAberto(false);
      resetForm();
      carregarChangelogs();
    } catch (error: unknown) {
      logError('Erro ao salvar changelog', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar changelog';
      toast.error(errorMessage);
    }
  };

  const handleEditar = (changelog: Changelog) => {
    setEditando(changelog.id);
    setFormData({
      versao: changelog.versao,
      dataLancamento: format(new Date(changelog.dataLancamento), 'yyyy-MM-dd'),
      tipo: changelog.tipo,
      titulo: changelog.titulo,
      descricao: changelog.descricao,
      categoria: changelog.categoria || 'FUNCIONALIDADE',
      prioridade: changelog.prioridade,
      publicado: changelog.publicado
    });
    setDialogAberto(true);
  };

  const handleDeletar = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este changelog?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/changelog/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.erro || 'Erro ao deletar changelog');
      }
      
      toast.success('Changelog deletado com sucesso!');
      carregarChangelogs();
    } catch (error: unknown) {
      logError('Erro ao deletar changelog', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao deletar changelog';
      toast.error(errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      versao: '',
      dataLancamento: '',
      tipo: 'ADICIONADO',
      titulo: '',
      descricao: '',
      categoria: 'FUNCIONALIDADE',
      prioridade: 'MEDIA',
      publicado: false
    });
    setEditando(null);
  };

  const getTipoInfo = (tipo: string) => {
    return tiposMudanca.find(t => t.value === tipo) || tiposMudanca[0] || { value: 'ADICIONADO', label: 'Adicionado', color: 'bg-green-100 text-green-800' };
  };

  const getPrioridadeInfo = (prioridade: string) => {
    return prioridades.find(p => p.value === prioridade) || prioridades[1] || { value: 'MEDIA', label: 'Média', color: 'bg-yellow-100 text-yellow-800' };
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!session?.user || session.user.userType !== 'ADMIN') {
    return null;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Administração do Changelog</h1>
          <p className="text-muted-foreground">
            Gerencie as versões e mudanças do sistema
          </p>
        </div>
        
        <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Changelog
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editando ? 'Editar Changelog' : 'Novo Changelog'}
              </DialogTitle>
              <DialogDescription>
                {editando ? 'Atualize as informações do changelog.' : 'Crie um novo changelog para documentar as mudanças.'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="versao">Versão</Label>
                  <Input
                    id="versao"
                    value={formData.versao}
                    onChange={(e) => setFormData({ ...formData, versao: e.target.value })}
                    placeholder="v1.0.0"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dataLancamento">Data de Lançamento</Label>
                  <Input
                    id="dataLancamento"
                    type="date"
                    value={formData.dataLancamento}
                    onChange={(e) => setFormData({ ...formData, dataLancamento: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposMudanca.map((tipo) => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select value={formData.categoria} onValueChange={(value) => setFormData({ ...formData, categoria: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((categoria) => (
                        <SelectItem key={categoria.value} value={categoria.value}>
                          {categoria.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Título do changelog"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descrição detalhada das mudanças"
                  rows={4}
                  required
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Label htmlFor="prioridade">Prioridade</Label>
                  <Select value={formData.prioridade} onValueChange={(value) => setFormData({ ...formData, prioridade: value })}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {prioridades.map((prioridade) => (
                        <SelectItem key={prioridade.value} value={prioridade.value}>
                          {prioridade.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="publicado"
                    checked={formData.publicado}
                    onCheckedChange={(checked) => setFormData({ ...formData, publicado: checked })}
                  />
                  <Label htmlFor="publicado">Publicado</Label>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogAberto(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editando ? 'Atualizar' : 'Criar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Changelogs</CardTitle>
          <CardDescription>
            Lista de todos os changelogs criados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Versão</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Autor</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {changelogs.map((changelog) => {
                const tipoInfo = getTipoInfo(changelog.tipo);
                const prioridadeInfo = getPrioridadeInfo(changelog.prioridade);
                
                return (
                  <TableRow key={changelog.id}>
                    <TableCell className="font-medium">
                      {changelog.versao}
                    </TableCell>
                    <TableCell>{changelog.titulo}</TableCell>
                    <TableCell>
                      <Badge className={tipoInfo.color}>
                        {tipoInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {categorias.find(c => c.value === changelog.categoria)?.label || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge className={prioridadeInfo.color}>
                        {prioridadeInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={changelog.publicado ? 'default' : 'secondary'}>
                        {changelog.publicado ? 'Publicado' : 'Rascunho'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        {format(new Date(changelog.dataLancamento), 'dd/MM/yyyy', { locale: ptBR })}
                      </div>
                    </TableCell>
                    <TableCell>
                      {changelog.autor && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <User className="h-3 w-3 mr-1" />
                          {changelog.autor.nome}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditar(changelog)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeletar(changelog.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Deletar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {changelogs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum changelog encontrado.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}