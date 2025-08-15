'use client';

import { useState, useEffect, useCallback } from 'react';
import { PublicLayout } from '@/components/layout/public-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// Removido import do Tabs - componente não existe
import { 
  GitBranch, 
  Tag, 
  Calendar, 
  User, 
  Hash, 
  Clock,

  ChevronDown,
  ChevronUp,
  RefreshCw,
  Loader2,
  Package,
  Search,
  Filter,
  History,
  Star,
  AlertCircle,
  CheckCircle,
  Info,
  Plus,
  Minus,
  Settings,
  Shield,
  Zap,
  Bug,
  Sparkles
} from 'lucide-react';
import { buildInfo } from '@/lib/build-info';

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

interface Estatisticas {
  totalVersions: number;
  totalChanges: number;
  lastUpdate: string;
  typeDistribution: Record<string, number>;
}

// Configurações de cores e ícones para tipos
const tipoConfig = {
  ADICIONADO: {
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300',
    icon: Plus,
    label: 'Adicionado'
  },
  ALTERADO: {
    color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300',
    icon: Settings,
    label: 'Alterado'
  },
  CORRIGIDO: {
    color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300',
    icon: Bug,
    label: 'Corrigido'
  },
  REMOVIDO: {
    color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300',
    icon: Minus,
    label: 'Removido'
  },
  DEPRECIADO: {
    color: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300',
    icon: AlertCircle,
    label: 'Depreciado'
  },
  SEGURANCA: {
    color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300',
    icon: Shield,
    label: 'Segurança'
  }
};

const prioridadeConfig = {
  BAIXA: {
    color: 'bg-slate-50 text-slate-600 border-slate-200',
    label: 'Baixa'
  },
  MEDIA: {
    color: 'bg-blue-50 text-blue-600 border-blue-200',
    label: 'Média'
  },
  ALTA: {
    color: 'bg-orange-50 text-orange-600 border-orange-200',
    label: 'Alta'
  },
  CRITICA: {
    color: 'bg-red-50 text-red-600 border-red-200',
    label: 'Crítica'
  }
};

const categoriaConfig = {
  FUNCIONALIDADE: { label: 'Funcionalidade', icon: Sparkles },
  INTERFACE: { label: 'Interface', icon: Settings },
  PERFORMANCE: { label: 'Performance', icon: Zap },
  SEGURANCA: { label: 'Segurança', icon: Shield },
  CONFIGURACAO: { label: 'Configuração', icon: Settings },
  DOCUMENTACAO: { label: 'Documentação', icon: Info },
  TECNICO: { label: 'Técnico', icon: Settings }
};

export default function ChangelogPage() {
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set());
  const [buildInfoData, setBuildInfoData] = useState(buildInfo);
  const [changelogs, setChangelogs] = useState<Changelog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('changelog');
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [paginacao, setPaginacao] = useState({
    paginaAtual: 1,
    itensPorPagina: 10,
    totalItens: 0,
    totalPaginas: 0,
    temProximaPagina: false,
    temPaginaAnterior: false
  });

  const carregarChangelogs = useCallback(async (pagina = 1) => {
    try {
      setRefreshing(true);
      const params = new URLSearchParams({
        publicado: 'true',
        pagina: pagina.toString(),
        limite: '10'
      });
      
      if (searchTerm) params.append('busca', searchTerm);
      if (selectedType !== 'all') params.append('tipo', selectedType);
      if (selectedPriority !== 'all') params.append('prioridade', selectedPriority);
      
      const response = await fetch(`/api/changelog?${params}`);
      
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
  }, [searchTerm, selectedType, selectedPriority]);

  const carregarEstatisticas = async () => {
    try {
      const response = await fetch('/api/changelog/stats');
      if (response.ok) {
        const data = await response.json();
        setEstatisticas(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  useEffect(() => {
    carregarChangelogs();
    carregarEstatisticas();
    setBuildInfoData(buildInfo);
  }, [carregarChangelogs]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      carregarChangelogs(1);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [carregarChangelogs]);

  const handleRefresh = () => {
    carregarChangelogs(paginacao.paginaAtual);
    carregarEstatisticas();
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

  const expandAll = () => {
    setExpandedVersions(new Set(changelogs.map(c => c.id)));
  };

  const collapseAll = () => {
    setExpandedVersions(new Set());
  };

  const formatarData = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatarDataCurta = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getTipoConfig = (tipo: string) => {
    return tipoConfig[tipo as keyof typeof tipoConfig] || tipoConfig.ADICIONADO;
  };

  const getPrioridadeConfig = (prioridade: string) => {
    return prioridadeConfig[prioridade as keyof typeof prioridadeConfig] || prioridadeConfig.MEDIA;
  };

  const getCategoriaConfig = (categoria: string) => {
    return categoriaConfig[categoria as keyof typeof categoriaConfig] || categoriaConfig.TECNICO;
  };

  const renderBuildInfo = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Informações da Build Atual
        </CardTitle>
        <CardDescription>
          Detalhes técnicos da versão em execução
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Versão</p>
              <Badge variant="outline" className="font-mono">{buildInfoData.version}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <GitBranch className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Branch</p>
              <code className="text-xs bg-muted px-2 py-1 rounded">{buildInfoData.branch}</code>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Commit</p>
              <code className="text-xs bg-muted px-2 py-1 rounded">{buildInfoData.commitShort}</code>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Build</p>
              <span className="text-sm text-muted-foreground">
                {new Date(buildInfoData.buildDate).toLocaleString('pt-BR')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Ambiente</p>
              <Badge variant={buildInfoData.environment === 'production' ? 'default' : 'secondary'}>
                {buildInfoData.environment}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Node.js</p>
              <span className="text-sm text-muted-foreground">{buildInfoData.nodeVersion}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderEstatisticas = () => {
    if (!estatisticas) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total de Versões</p>
                <p className="text-2xl font-bold">{estatisticas.totalVersions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Total de Mudanças</p>
                <p className="text-2xl font-bold">{estatisticas.totalChanges}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Última Atualização</p>
                <p className="text-sm font-medium">{formatarDataCurta(estatisticas.lastUpdate)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <div>
                <p className="text-sm font-medium">Status</p>
                <Badge variant="outline" className="text-emerald-600">Atualizado</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderFilters = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtros e Busca
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por versão, título ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {Object.entries(tipoConfig).map(([key, config]) => (
                <SelectItem key={key} value={key}>{config.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedPriority} onValueChange={setSelectedPriority}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as prioridades</SelectItem>
              {Object.entries(prioridadeConfig).map(([key, config]) => (
                <SelectItem key={key} value={key}>{config.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );

  const renderChangelogItem = (item: ChangelogItem) => {
    const tipoConfig = getTipoConfig(item.tipo);
    const IconComponent = tipoConfig.icon;
    
    return (
      <div key={item.id} className="flex gap-3 p-4 bg-muted/20 rounded-lg border border-muted hover:bg-muted/30 transition-colors">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background border">
          <IconComponent className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge className={tipoConfig.color} variant="outline">
              {tipoConfig.label}
            </Badge>
          </div>
          <h5 className="font-medium text-sm mb-1">{item.titulo}</h5>
          <p className="text-sm text-muted-foreground leading-relaxed">{item.descricao}</p>
        </div>
      </div>
    );
  };

  const renderChangelogCard = (changelog: Changelog) => {
    const isExpanded = expandedVersions.has(changelog.id);
    const tipoConfig = getTipoConfig(changelog.tipo);
    const prioridadeConfig = getPrioridadeConfig(changelog.prioridade);
    const IconComponent = tipoConfig.icon;
    
    return (
      <Card key={changelog.id} className="overflow-hidden hover:shadow-md transition-shadow">
        <CardHeader 
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => toggleVersion(changelog.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <IconComponent className="h-5 w-5 text-primary" />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="font-mono text-sm">
                  v{changelog.versao}
                </Badge>
                <Badge className={tipoConfig.color} variant="outline">
                  {tipoConfig.label}
                </Badge>
                {changelog.categoria && (
                  <Badge variant="secondary">
                    {getCategoriaConfig(changelog.categoria).label}
                  </Badge>
                )}
                <Badge className={prioridadeConfig.color} variant="outline">
                  {prioridadeConfig.label}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {formatarData(changelog.dataLancamento)}
                </div>
                {changelog.autor && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <User className="h-3 w-3" />
                    {changelog.autor.nome}
                  </div>
                )}
              </div>
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </div>
          <div className="mt-2">
            <CardTitle className="text-lg mb-1">{changelog.titulo}</CardTitle>
            <CardDescription className="text-sm">
              {changelog.descricao}
            </CardDescription>
          </div>
        </CardHeader>
        
        {isExpanded && (
          <CardContent className="pt-0">
            {changelog.itens && changelog.itens.length > 0 && (
              <div>
                <Separator className="mb-4" />
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Detalhes das mudanças ({changelog.itens.length})
                  </h4>
                </div>
                <div className="space-y-3">
                  {changelog.itens
                    .sort((a, b) => a.ordem - b.ordem)
                    .map(renderChangelogItem)}
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    );
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="container mx-auto py-8 px-4 max-w-6xl">
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
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Changelog
              </h1>
              <p className="text-muted-foreground text-lg">
                Histórico completo de versões e mudanças do Koerner 360
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={collapseAll}
                className="flex items-center gap-2"
              >
                <ChevronUp className="h-4 w-4" />
                Recolher Tudo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={expandAll}
                className="flex items-center gap-2"
              >
                <ChevronDown className="h-4 w-4" />
                Expandir Tudo
              </Button>
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
        </div>

        {/* Navegação por Abas */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('changelog')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'changelog'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <History className="h-4 w-4" />
              Changelog
            </button>
            <button
              onClick={() => setActiveTab('build-info')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'build-info'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Package className="h-4 w-4" />
              Build Info
            </button>
          </div>
        </div>

        {/* Conteúdo do Changelog */}
        {activeTab === 'changelog' && (
          <div className="space-y-6">
            {/* Estatísticas */}
            {renderEstatisticas()}
            
            {/* Filtros */}
            {renderFilters()}
            
            {/* Lista de Changelogs */}
            <div className="space-y-4">
              {changelogs.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-medium mb-2">Nenhum changelog encontrado</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm || selectedType !== 'all' || selectedPriority !== 'all'
                        ? 'Nenhum resultado encontrado para os filtros aplicados.'
                        : 'Não há changelogs publicados no momento.'}
                    </p>
                    {(searchTerm || selectedType !== 'all' || selectedPriority !== 'all') && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedType('all');
                          setSelectedPriority('all');
                        }}
                      >
                        Limpar Filtros
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                changelogs.map(renderChangelogCard)
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
                <div className="flex items-center gap-2 px-4">
                  <span className="text-sm text-muted-foreground">
                    Página {paginacao.paginaAtual} de {paginacao.totalPaginas}
                  </span>
                  <Separator orientation="vertical" className="h-4" />
                  <span className="text-sm text-muted-foreground">
                    {paginacao.totalItens} itens
                  </span>
                </div>
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
        )}

        {/* Conteúdo do Build Info */}
        {activeTab === 'build-info' && (
          <div>
            {renderBuildInfo()}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}