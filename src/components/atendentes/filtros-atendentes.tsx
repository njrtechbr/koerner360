/**
 * Componente de filtros para atendentes
 */

'use client';

import { useState } from 'react';
import { 
  FiltrosAtendente, 
  StatusAtendente,
  STATUS_ATENDENTE_LABELS 
} from '@/types/atendente';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  X, 
  RotateCcw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useSonnerToast } from '@/hooks/use-sonner-toast';

interface FiltrosAtendentesProps {
  filtros: FiltrosAtendente;
  onFiltroChange: (filtros: FiltrosAtendente) => void;
  carregando?: boolean;
}

/**
 * Filtros iniciais vazios
 */
const FILTROS_INICIAIS: FiltrosAtendente = {
  busca: '',
  status: undefined,
  setor: '',
  cargo: '',
  portaria: '',
  dataAdmissaoInicio: '',
  dataAdmissaoFim: ''
};

/**
 * Componente de filtros para atendentes
 */
export function FiltrosAtendentes({
  filtros,
  onFiltroChange,
  carregando = false
}: FiltrosAtendentesProps) {
  const { showInfo } = useSonnerToast();
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [filtrosLocais, setFiltrosLocais] = useState<FiltrosAtendente>(filtros);

  /**
   * Atualizar filtro local
   */
  const atualizarFiltroLocal = (campo: keyof FiltrosAtendente, valor: string | undefined) => {
    const novosFiltros = { ...filtrosLocais, [campo]: valor };
    setFiltrosLocais(novosFiltros);
  };

  /**
   * Aplicar filtros
   */
  const aplicarFiltros = () => {
    onFiltroChange(filtrosLocais);
  };

  /**
   * Limpar filtros
   */
  const limparFiltros = () => {
    setFiltrosLocais(FILTROS_INICIAIS);
    onFiltroChange(FILTROS_INICIAIS);
    showInfo('Todos os filtros foram removidos');
  };

  /**
   * Verificar se há filtros ativos
   */
  const temFiltrosAtivos = () => {
    return Object.entries(filtros).some(([key, value]) => {
      if (key === 'busca') return value && value.trim() !== '';
      return value !== undefined && value !== '';
    });
  };

  /**
   * Contar filtros ativos
   */
  const contarFiltrosAtivos = () => {
    return Object.entries(filtros).filter(([key, value]) => {
      if (key === 'busca') return value && value.trim() !== '';
      return value !== undefined && value !== '';
    }).length;
  };

  /**
   * Obter lista de filtros ativos para exibição
   */
  const obterFiltrosAtivos = () => {
    const ativos: Array<{ label: string; valor: string; campo: keyof FiltrosAtendente }> = [];
    
    if (filtros.busca && filtros.busca.trim() !== '') {
      ativos.push({ label: 'Busca', valor: filtros.busca, campo: 'busca' });
    }
    
    if (filtros.status) {
      ativos.push({ 
        label: 'Status', 
        valor: STATUS_ATENDENTE_LABELS[filtros.status], 
        campo: 'status' 
      });
    }
    
    if (filtros.setor && filtros.setor !== '') {
      ativos.push({ label: 'Setor', valor: filtros.setor, campo: 'setor' });
    }
    
    if (filtros.cargo && filtros.cargo !== '') {
      ativos.push({ label: 'Cargo', valor: filtros.cargo, campo: 'cargo' });
    }
    
    if (filtros.portaria && filtros.portaria !== '') {
      ativos.push({ label: 'Portaria', valor: filtros.portaria, campo: 'portaria' });
    }
    
    if (filtros.dataAdmissaoInicio && filtros.dataAdmissaoInicio !== '') {
      ativos.push({ 
        label: 'Data Admissão (Início)', 
        valor: new Date(filtros.dataAdmissaoInicio).toLocaleDateString('pt-BR'), 
        campo: 'dataAdmissaoInicio' 
      });
    }
    
    if (filtros.dataAdmissaoFim && filtros.dataAdmissaoFim !== '') {
      ativos.push({ 
        label: 'Data Admissão (Fim)', 
        valor: new Date(filtros.dataAdmissaoFim).toLocaleDateString('pt-BR'), 
        campo: 'dataAdmissaoFim' 
      });
    }
    
    return ativos;
  };

  /**
   * Remover filtro específico
   */
  const removerFiltro = (campo: keyof FiltrosAtendente) => {
    const novosFiltros = { ...filtros };
    if (campo === 'busca') {
      novosFiltros[campo] = '';
    } else {
      novosFiltros[campo] = undefined;
    }
    onFiltroChange(novosFiltros);
    setFiltrosLocais(novosFiltros);
  };

  const filtrosAtivos = obterFiltrosAtivos();

  return (
    <div className="space-y-4">
      {/* Busca rápida */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email, CPF ou telefone..."
                  value={filtrosLocais.busca || ''}
                  onChange={(e) => atualizarFiltroLocal('busca', e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      aplicarFiltros();
                    }
                  }}
                  className="pl-10"
                  disabled={carregando}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                onClick={aplicarFiltros}
                disabled={carregando}
                size="sm"
              >
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </Button>
              
              <Collapsible open={filtrosAbertos} onOpenChange={setFiltrosAbertos}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filtros
                    {contarFiltrosAtivos() > 0 && (
                      <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                        {contarFiltrosAtivos()}
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
              
              {temFiltrosAtivos() && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={limparFiltros}
                  disabled={carregando}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Limpar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros ativos */}
      {filtrosAtivos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filtrosAtivos.map((filtro, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              <span className="text-xs">
                <strong>{filtro.label}:</strong> {filtro.valor}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1 hover:bg-transparent"
                onClick={() => removerFiltro(filtro.campo)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Filtros avançados */}
      <Collapsible open={filtrosAbertos} onOpenChange={setFiltrosAbertos}>
        <CollapsibleContent>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros Avançados
              </CardTitle>
              <CardDescription>
                Use os filtros abaixo para refinar sua busca
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={filtrosLocais.status || ''}
                    onValueChange={(value) => 
                      atualizarFiltroLocal('status', value === '' ? undefined : value as StatusAtendente)
                    }
                    disabled={carregando}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos os status</SelectItem>
                      {Object.entries(STATUS_ATENDENTE_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Setor */}
                <div className="space-y-2">
                  <Label htmlFor="setor">Setor</Label>
                  <Select
                    value={filtrosLocais.setor || ''}
                    onValueChange={(value) => atualizarFiltroLocal('setor', value)}
                    disabled={carregando}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os setores" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos os setores</SelectItem>
                      {/* Opções de setores serão carregadas dinamicamente */}
                    </SelectContent>
                  </Select>
                </div>

                {/* Cargo */}
                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo</Label>
                  <Select
                    value={filtrosLocais.cargo || ''}
                    onValueChange={(value) => atualizarFiltroLocal('cargo', value)}
                    disabled={carregando}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os cargos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos os cargos</SelectItem>
                      {/* Opções de cargos serão carregadas dinamicamente */}
                    </SelectContent>
                  </Select>
                </div>

                {/* Portaria */}
                <div className="space-y-2">
                  <Label htmlFor="portaria">Portaria</Label>
                  <Select
                    value={filtrosLocais.portaria || ''}
                    onValueChange={(value) => atualizarFiltroLocal('portaria', value)}
                    disabled={carregando}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as portarias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas as portarias</SelectItem>
                      {/* Opções de portarias serão carregadas dinamicamente */}
                    </SelectContent>
                  </Select>
                </div>

                {/* Data de Admissão - Início */}
                <div className="space-y-2">
                  <Label htmlFor="dataAdmissaoInicio">Data Admissão (De)</Label>
                  <Input
                    id="dataAdmissaoInicio"
                    type="date"
                    value={filtrosLocais.dataAdmissaoInicio || ''}
                    onChange={(e) => atualizarFiltroLocal('dataAdmissaoInicio', e.target.value)}
                    disabled={carregando}
                  />
                </div>

                {/* Data de Admissão - Fim */}
                <div className="space-y-2">
                  <Label htmlFor="dataAdmissaoFim">Data Admissão (Até)</Label>
                  <Input
                    id="dataAdmissaoFim"
                    type="date"
                    value={filtrosLocais.dataAdmissaoFim || ''}
                    onChange={(e) => atualizarFiltroLocal('dataAdmissaoFim', e.target.value)}
                    disabled={carregando}
                  />
                </div>
              </div>

              {/* Ações */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  {/* Informações de total removidas */}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    onClick={limparFiltros}
                    disabled={carregando}
                    size="sm"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Limpar Filtros
                  </Button>
                  
                  <Button 
                    onClick={aplicarFiltros}
                    disabled={carregando}
                    size="sm"
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    Aplicar Filtros
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}