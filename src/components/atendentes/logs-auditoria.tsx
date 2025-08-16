/**
 * Componente para exibir logs de auditoria de atendentes
 */

'use client';

import { useState } from 'react';
import { LogAuditoria } from '@/types/atendente';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  History, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Edit, 
  Plus, 
  Trash2, 
  Eye,
  RotateCcw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface LogsAuditoriaProps {
  logs: LogAuditoria[];
  carregando?: boolean;
  onCarregarMais?: () => void;
  temMaisLogs?: boolean;
}

/**
 * Tipos de ação para filtros
 */
const TIPOS_ACAO = {
  CREATE: 'Criação',
  UPDATE: 'Atualização',
  DELETE: 'Exclusão',
  VIEW: 'Visualização'
} as const;

/**
 * Cores para tipos de ação
 */
const CORES_ACAO = {
  CREATE: 'bg-green-100 text-green-800 border-green-200',
  UPDATE: 'bg-blue-100 text-blue-800 border-blue-200',
  DELETE: 'bg-red-100 text-red-800 border-red-200',
  VIEW: 'bg-gray-100 text-gray-800 border-gray-200'
};

/**
 * Ícones para tipos de ação
 */
const ICONES_ACAO = {
  CREATE: Plus,
  UPDATE: Edit,
  DELETE: Trash2,
  VIEW: Eye
};

/**
 * Componente de logs de auditoria
 */
export function LogsAuditoria({
  logs,
  carregando = false,
  onCarregarMais,
  temMaisLogs = false
}: LogsAuditoriaProps) {
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [filtros, setFiltros] = useState({
    busca: '',
    acao: '',
    dataInicio: '',
    dataFim: '',
    usuario: ''
  });

  /**
   * Filtrar logs baseado nos filtros aplicados
   */
  const logsFiltrados = logs.filter(log => {
    const matchBusca = !filtros.busca || 
      log.detalhes.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      log.usuario?.nome.toLowerCase().includes(filtros.busca.toLowerCase());
    
    const matchAcao = !filtros.acao || log.acao === filtros.acao;
    
    const matchDataInicio = !filtros.dataInicio || 
      new Date(log.criado_em) >= new Date(filtros.dataInicio);
    
    const matchDataFim = !filtros.dataFim || 
      new Date(log.criado_em) <= new Date(filtros.dataFim + 'T23:59:59');
    
    const matchUsuario = !filtros.usuario || 
      log.usuario?.nome.toLowerCase().includes(filtros.usuario.toLowerCase());
    
    return matchBusca && matchAcao && matchDataInicio && matchDataFim && matchUsuario;
  });

  /**
   * Limpar filtros
   */
  const limparFiltros = () => {
    setFiltros({
      busca: '',
      acao: '',
      dataInicio: '',
      dataFim: '',
      usuario: ''
    });
  };

  /**
   * Verificar se há filtros ativos
   */
  const temFiltrosAtivos = () => {
    return Object.values(filtros).some(valor => valor !== '');
  };

  /**
   * Obter iniciais do nome do usuário
   */
  const obterIniciais = (nome: string) => {
    return nome
      .split(' ')
      .map(parte => parte.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  /**
   * Formatar data relativa
   */
  const formatarDataRelativa = (data: string) => {
    const agora = new Date();
    const dataLog = new Date(data);
    const diffMs = agora.getTime() - dataLog.getTime();
    const diffMinutos = Math.floor(diffMs / (1000 * 60));
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutos < 1) {
      return 'Agora mesmo';
    } else if (diffMinutos < 60) {
      return `${diffMinutos} min atrás`;
    } else if (diffHoras < 24) {
      return `${diffHoras}h atrás`;
    } else if (diffDias < 7) {
      return `${diffDias}d atrás`;
    } else {
      return dataLog.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  /**
   * Renderizar item de log
   */
  const renderizarLog = (log: LogAuditoria) => {
    const IconeAcao = ICONES_ACAO[log.acao as keyof typeof ICONES_ACAO] || Edit;
    const corAcao = CORES_ACAO[log.acao as keyof typeof CORES_ACAO] || CORES_ACAO.UPDATE;

    return (
      <div key={log.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
        {/* Avatar do usuário */}
        <Avatar className="h-8 w-8 mt-1">
          <AvatarImage src={log.usuario?.foto_url} />
          <AvatarFallback className="text-xs">
            {log.usuario ? obterIniciais(log.usuario.nome) : 'SY'}
          </AvatarFallback>
        </Avatar>

        {/* Conteúdo do log */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className={`${corAcao} border`}>
                <IconeAcao className="h-3 w-3 mr-1" />
                {TIPOS_ACAO[log.acao as keyof typeof TIPOS_ACAO] || log.acao}
              </Badge>
              
              <span className="text-sm font-medium">
                {log.usuario?.nome || 'Sistema'}
              </span>
            </div>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <span className="text-xs text-muted-foreground">
                    {formatarDataRelativa(log.criado_em)}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {new Date(log.criado_em).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <p className="text-sm text-muted-foreground">
            {log.detalhes}
          </p>

          {/* Dados anteriores e novos (para atualizações) */}
          {log.acao === 'UPDATE' && log.dados_anteriores && log.dados_novos && (
            <div className="mt-3 p-3 bg-muted/30 rounded-md">
              <p className="text-xs font-medium text-muted-foreground mb-2">Alterações:</p>
              <div className="space-y-1 text-xs">
                {Object.entries(log.dados_novos).map(([campo, valorNovo]) => {
                  const valorAnterior = (log.dados_anteriores as Record<string, unknown>)?.[campo];
                  if (valorAnterior !== valorNovo) {
                    return (
                      <div key={campo} className="flex items-center gap-2">
                        <span className="font-medium capitalize">{campo}:</span>
                        <span className="text-red-600 line-through">{valorAnterior}</span>
                        <span>→</span>
                        <span className="text-green-600">{valorNovo}</span>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          )}

          {/* IP do usuário */}
          {log.ip_usuario && (
            <p className="text-xs text-muted-foreground">
              IP: {log.ip_usuario}
            </p>
          )}
        </div>
      </div>
    );
  };

  if (carregando && logs.length === 0) {
    return <LogsAuditoriaLoading />;
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Histórico de Auditoria
              </CardTitle>
              <CardDescription>
                Registro de todas as ações realizadas no atendente
              </CardDescription>
            </div>
            
            <Collapsible open={filtrosAbertos} onOpenChange={setFiltrosAbertos}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtros
                  {temFiltrosAtivos() && (
                    <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                      !
                    </Badge>
                  )}
                  {filtrosAbertos ? (
                    <ChevronUp className="ml-2 h-4 w-4" />
                  ) : (
                    <ChevronDown className="ml-2 h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Busca */}
              <div className="space-y-2">
                <Label htmlFor="busca">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="busca"
                    placeholder="Buscar nos detalhes..."
                    value={filtros.busca}
                    onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Ação */}
              <div className="space-y-2">
                <Label htmlFor="acao">Tipo de Ação</Label>
                <Select
                  value={filtros.acao}
                  onValueChange={(value) => setFiltros(prev => ({ ...prev, acao: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as ações" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as ações</SelectItem>
                    {Object.entries(TIPOS_ACAO).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Usuário */}
              <div className="space-y-2">
                <Label htmlFor="usuario">Usuário</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="usuario"
                    placeholder="Nome do usuário..."
                    value={filtros.usuario}
                    onChange={(e) => setFiltros(prev => ({ ...prev, usuario: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Data Início */}
              <div className="space-y-2">
                <Label htmlFor="dataInicio">Data Início</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="dataInicio"
                    type="date"
                    value={filtros.dataInicio}
                    onChange={(e) => setFiltros(prev => ({ ...prev, dataInicio: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Data Fim */}
              <div className="space-y-2">
                <Label htmlFor="dataFim">Data Fim</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="dataFim"
                    type="date"
                    value={filtros.dataFim}
                    onChange={(e) => setFiltros(prev => ({ ...prev, dataFim: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Ações dos filtros */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={limparFiltros}
                disabled={!temFiltrosAtivos()}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>

      {/* Lista de logs */}
      <div className="space-y-4">
        {logsFiltrados.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <History className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum log encontrado</h3>
              <p className="text-muted-foreground text-center">
                {temFiltrosAtivos() 
                  ? 'Nenhum log corresponde aos filtros aplicados.' 
                  : 'Ainda não há registros de auditoria para este atendente.'
                }
              </p>
              {temFiltrosAtivos() && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={limparFiltros}
                  className="mt-4"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Limpar Filtros
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Contador de resultados */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {logsFiltrados.length} {logsFiltrados.length === 1 ? 'registro' : 'registros'}
                {temFiltrosAtivos() && ` (filtrado de ${logs.length} total)`}
              </p>
            </div>

            {/* Lista de logs */}
            <div className="space-y-3">
              {logsFiltrados.map(renderizarLog)}
            </div>

            {/* Botão carregar mais */}
            {temMaisLogs && onCarregarMais && (
              <div className="flex justify-center pt-4">
                <Button 
                  variant="outline" 
                  onClick={onCarregarMais}
                  disabled={carregando}
                >
                  {carregando ? (
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <ChevronDown className="mr-2 h-4 w-4" />
                  )}
                  Carregar mais logs
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Componente de loading para logs de auditoria
 */
export function LogsAuditoriaLoading() {
  return (
    <div className="space-y-6">
      {/* Cabeçalho - Loading */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-6 w-48 bg-muted animate-pulse rounded" />
              <div className="h-4 w-64 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-9 w-24 bg-muted animate-pulse rounded" />
          </div>
        </CardHeader>
      </Card>

      {/* Lista de logs - Loading */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
            <div className="h-8 w-8 bg-muted animate-pulse rounded-full mt-1" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-16 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                </div>
                <div className="h-3 w-16 bg-muted animate-pulse rounded" />
              </div>
              <div className="h-4 w-full bg-muted animate-pulse rounded" />
              <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}