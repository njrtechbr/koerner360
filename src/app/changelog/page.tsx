'use client';

import { useState, useEffect } from 'react';
import { PublicLayout } from '@/components/layout/public-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  GitBranch, 
  Tag, 
  Calendar, 
  User, 
  Hash, 
  Clock,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Loader2,
  Package
} from 'lucide-react';
import { buildInfo } from '@/lib/build-info';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

const tipoColors = {
  ADICIONADO: 'bg-green-100 text-green-800 border-green-200',
  ALTERADO: 'bg-blue-100 text-blue-800 border-blue-200',
  CORRIGIDO: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  REMOVIDO: 'bg-red-100 text-red-800 border-red-200',
  DEPRECIADO: 'bg-orange-100 text-orange-800 border-orange-200',
  SEGURANCA: 'bg-purple-100 text-purple-800 border-purple-200'
};

const tipoLabels = {
  ADICIONADO: 'Adicionado',
  ALTERADO: 'Alterado',
  CORRIGIDO: 'Corrigido',
  REMOVIDO: 'Removido',
  DEPRECIADO: 'Depreciado',
  SEGURANCA: 'Segurança'
};

const prioridadeColors = {
  BAIXA: 'bg-gray-100 text-gray-800',
  MEDIA: 'bg-blue-100 text-blue-800',
  ALTA: 'bg-orange-100 text-orange-800',
  CRITICA: 'bg-red-100 text-red-800'
};

const prioridadeLabels = {
  BAIXA: 'Baixa',
  MEDIA: 'Média',
  ALTA: 'Alta',
  CRITICA: 'Crítica'
};

const categoriaLabels = {
  FUNCIONALIDADE: 'Funcionalidade',
  INTERFACE: 'Interface',
  PERFORMANCE: 'Performance',
  SEGURANCA: 'Segurança',
  CONFIGURACAO: 'Configuração',
  DOCUMENTACAO: 'Documentação',
  TECNICO: 'Técnico'
};

export default function ChangelogPage() {
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set());
  const [buildInfoData, setBuildInfoData] = useState(buildInfo);
  const [changelogs, setChangelogs] = useState<Changelog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [paginacao, setPaginacao] = useState({
    paginaAtual: 1,
    itensPorPagina: 10,
    totalItens: 0,
    totalPaginas: 0,
    temProximaPagina: false,
    temPaginaAnterior: false
  });

  const carregarChangelogs = async (pagina = 1) => {
    try {
      setRefreshing(true);
      const response = await fetch(`/api/changelog?publicado=true&pagina=${pagina}&limite=10`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar changelog');
      }
      
      const data = await response.json();
      setChangelogs(data.data?.changelogs || []);
      setPaginacao(data.data?.paginacao || { 
        paginaAtual: 1, 
        itensPorPagina: 10, 
        totalItens: 0, 
        totalPaginas: 0,
        temProximaPagina: false,
        temPaginaAnterior: false
      });
      
      // Expandir a primeira versão por padrão
      if (data.data?.changelogs && data.data.changelogs.length > 0) {
        setExpandedVersions(new Set([data.data.changelogs[0].id]));
      }
    } catch (error) {
      console.error('Erro ao carregar changelog:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    carregarChangelogs();
    setBuildInfoData(buildInfo);
  }, []);

  const handleRefresh = () => {
    carregarChangelogs(paginacao.paginaAtual);
  };

  const toggleVersion = (id: string) => {
    const newExpanded = new Set(expandedVersions);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedVersions(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const getTipoInfo = (tipo: string) => {
    return {
      color: tipoColors[tipo as keyof typeof tipoColors] || tipoColors.ADICIONADO,
      label: tipoLabels[tipo as keyof typeof tipoLabels] || tipo
    };
  };

  const getPrioridadeInfo = (prioridade: string) => {
    return {
      color: prioridadeColors[prioridade as keyof typeof prioridadeColors] || prioridadeColors.MEDIA,
      label: prioridadeLabels[prioridade as keyof typeof prioridadeLabels] || prioridade
    };
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="container mx-auto py-8 px-4 max-w-4xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Carregando changelog...</p>
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Changelog</h1>
              <p className="text-muted-foreground">
                Histórico de versões e mudanças do Koerner 360
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2"
              >
                {refreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {refreshing ? 'Atualizando...' : 'Atualizar'}
              </Button>
            </div>
          </div>

          {/* Informações de Build */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Informações da Build Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Versão:</span>
                  <Badge variant="outline">{buildInfoData.version}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Branch:</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">{buildInfoData.branch}</code>
                </div>
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Commit:</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">{buildInfoData.commitShort}</code>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Build:</span>
                  <span className="text-muted-foreground">{new Date(buildInfoData.buildDate).toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Ambiente:</span>
                  <Badge variant={buildInfoData.environment === 'production' ? 'default' : 'secondary'}>
                    {buildInfoData.environment}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Node.js:</span>
                  <span className="text-muted-foreground">{buildInfoData.nodeVersion}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Changelogs */}
        <div className="space-y-6">
          {changelogs.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Nenhum changelog encontrado</h3>
                <p className="text-muted-foreground">
                  Não há changelogs publicados no momento.
                </p>
              </CardContent>
            </Card>
          ) : (
            changelogs.map((changelog) => {
              const isExpanded = expandedVersions.has(changelog.id);
              const tipoInfo = getTipoInfo(changelog.tipo);
              const prioridadeInfo = getPrioridadeInfo(changelog.prioridade);
              
              return (
                <Card key={changelog.id} className="overflow-hidden">
                  <CardHeader 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => toggleVersion(changelog.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="font-mono">
                          {changelog.versao}
                        </Badge>
                        <Badge className={tipoInfo.color}>
                          {tipoInfo.label}
                        </Badge>
                        {changelog.categoria && (
                          <Badge variant="secondary">
                            {categoriaLabels[changelog.categoria as keyof typeof categoriaLabels] || changelog.categoria}
                          </Badge>
                        )}
                        <Badge className={prioridadeInfo.color}>
                          {prioridadeInfo.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(changelog.dataLancamento)}
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                    <div>
                      <CardTitle className="text-lg">{changelog.titulo}</CardTitle>
                      {changelog.autor && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <User className="h-3 w-3" />
                          {changelog.autor.nome}
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  {isExpanded && (
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <div>
                          <p className="text-muted-foreground leading-relaxed">
                            {changelog.descricao}
                          </p>
                        </div>
                        
                        {changelog.itens && changelog.itens.length > 0 && (
                          <div>
                            <Separator className="my-4" />
                            <h4 className="font-medium mb-3">Detalhes das mudanças:</h4>
                            <div className="space-y-3">
                              {changelog.itens
                                .sort((a, b) => a.ordem - b.ordem)
                                .map((item) => {
                                  const itemTipoInfo = getTipoInfo(item.tipo);
                                  
                                  return (
                                    <div key={item.id} className="flex gap-3 p-3 bg-muted/30 rounded-lg">
                                      <Badge className={`${itemTipoInfo.color} shrink-0`}>
                                        {itemTipoInfo.label}
                                      </Badge>
                                      <div className="flex-1">
                                        <h5 className="font-medium text-sm mb-1">{item.titulo}</h5>
                                        <p className="text-sm text-muted-foreground">{item.descricao}</p>
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })
          )}
        </div>

        {/* Paginação */}
        {paginacao.totalPaginas > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => carregarChangelogs(paginacao.paginaAtual - 1)}
              disabled={paginacao.paginaAtual <= 1 || refreshing}
            >
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground px-4">
              Página {paginacao.paginaAtual} de {paginacao.totalPaginas}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => carregarChangelogs(paginacao.paginaAtual + 1)}
              disabled={paginacao.paginaAtual >= paginacao.totalPaginas || refreshing}
            >
              Próxima
            </Button>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}