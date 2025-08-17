'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Filter,
  Download,
  Upload,
  Settings,
  Eye,
  EyeOff,
  MoreHorizontal,
  Trash2,
  Edit,
  Copy,
  ExternalLink,
  RefreshCw,
  Plus,
  X,
  Check,
  AlertCircle,
  Info,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type TipoDado = 'texto' | 'numero' | 'data' | 'boolean' | 'badge' | 'avatar' | 'acao' | 'personalizado'
type TipoOrdenacao = 'asc' | 'desc' | null
type TipoSelecao = 'single' | 'multiple' | 'none'

interface ColunaDados {
  id: string
  titulo: string
  tipo: TipoDado
  largura?: string | number
  minLargura?: string | number
  maxLargura?: string | number
  ordenavel?: boolean
  filtravel?: boolean
  visivel?: boolean
  fixo?: 'esquerda' | 'direita'
  alinhamento?: 'esquerda' | 'centro' | 'direita'
  formatador?: (valor: any, linha: any) => React.ReactNode
  accessor?: string // Para dados aninhados, ex: 'usuario.nome'
  opcoesBadge?: {
    [key: string]: {
      label: string
      cor: string
      variante?: 'default' | 'secondary' | 'destructive' | 'outline'
    }
  }
  opcoesAcao?: {
    label: string
    icone?: React.ComponentType<{ className?: string }>
    acao: (linha: any) => void
    condicao?: (linha: any) => boolean
    variante?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  }[]
}

interface ConfiguracaoPaginacao {
  paginaAtual: number
  itensPorPagina: number
  totalItens: number
  opcoesTamanho?: number[]
}

interface ConfiguracaoOrdenacao {
  coluna: string
  direcao: TipoOrdenacao
}

interface DataTableProps<T = any> {
  dados: T[]
  colunas: ColunaDados[]
  paginacao?: ConfiguracaoPaginacao
  ordenacao?: ConfiguracaoOrdenacao
  selecao?: {
    tipo: TipoSelecao
    selecionados: string[]
    onSelecaoChange: (selecionados: string[]) => void
    chaveId?: string
  }
  busca?: {
    valor: string
    placeholder?: string
    colunas?: string[]
    onBuscaChange: (valor: string) => void
  }
  filtros?: {
    ativos: Record<string, any>
    onFiltroChange: (filtros: Record<string, any>) => void
  }
  acoes?: {
    titulo?: string
    itens: {
      label: string
      icone?: React.ComponentType<{ className?: string }>
      acao: (selecionados: T[]) => void
      condicao?: (selecionados: T[]) => boolean
      variante?: 'default' | 'destructive' | 'outline' | 'secondary'
    }[]
  }
  configuracao?: {
    showPaginacao?: boolean
    showBusca?: boolean
    showFiltros?: boolean
    showSelecao?: boolean
    showAcoes?: boolean
    showExportar?: boolean
    showConfigurar?: boolean
    compacto?: boolean
    zebrado?: boolean
    hover?: boolean
    bordas?: boolean
  }
  loading?: boolean
  erro?: string
  vazio?: {
    titulo?: string
    descricao?: string
    icone?: React.ComponentType<{ className?: string }>
    acao?: {
      label: string
      onClick: () => void
    }
  }
  className?: string
  onOrdenacaoChange?: (ordenacao: ConfiguracaoOrdenacao) => void
  onPaginacaoChange?: (paginacao: ConfiguracaoPaginacao) => void
  onExportar?: (formato: 'csv' | 'excel' | 'pdf') => void
  onAtualizar?: () => void
}

const formatadores = {
  texto: (valor: any) => String(valor || ''),
  numero: (valor: any) => {
    const num = Number(valor)
    return isNaN(num) ? '-' : num.toLocaleString('pt-BR')
  },
  data: (valor: any) => {
    if (!valor) return '-'
    try {
      return format(new Date(valor), 'dd/MM/yyyy', { locale: ptBR })
    } catch {
      return String(valor)
    }
  },
  boolean: (valor: any) => (valor ? 'Sim' : 'Não'),
}

export function DataTable<T extends Record<string, any>>({
  dados,
  colunas,
  paginacao,
  ordenacao,
  selecao,
  busca,
  filtros,
  acoes,
  configuracao = {},
  loading = false,
  erro,
  vazio,
  className,
  onOrdenacaoChange,
  onPaginacaoChange,
  onExportar,
  onAtualizar,
}: DataTableProps<T>) {
  const {
    showPaginacao = true,
    showBusca = true,
    showFiltros = true,
    showSelecao = true,
    showAcoes = true,
    showExportar = true,
    showConfigurar = true,
    compacto = false,
    zebrado = true,
    hover = true,
    bordas = true,
  } = configuracao

  const [colunasVisiveis, setColunasVisiveis] = useState<Record<string, boolean>>(
    () => {
      const inicial: Record<string, boolean> = {}
      colunas.forEach(col => {
        inicial[col.id] = col.visivel !== false
      })
      return inicial
    }
  )

  const [filtrosLocais, setFiltrosLocais] = useState<Record<string, string>>({})
  const [showConfiguracao, setShowConfiguracao] = useState(false)

  const colunasVisivelList = useMemo(() => {
    return colunas.filter(col => colunasVisiveis[col.id])
  }, [colunas, colunasVisiveis])

  const dadosFiltrados = useMemo(() => {
    let resultado = [...dados]

    // Aplicar busca global
    if (busca?.valor) {
      const termoBusca = busca.valor.toLowerCase()
      const colunasBusca = busca.colunas || colunas.map(c => c.id)
      
      resultado = resultado.filter(item => {
        return colunasBusca.some(colunaId => {
          const coluna = colunas.find(c => c.id === colunaId)
          if (!coluna) return false
          
          const valor = getValorCelula(item, coluna)
          return String(valor).toLowerCase().includes(termoBusca)
        })
      })
    }

    // Aplicar filtros por coluna
    Object.entries(filtrosLocais).forEach(([colunaId, valorFiltro]) => {
      if (!valorFiltro) return
      
      const coluna = colunas.find(c => c.id === colunaId)
      if (!coluna) return
      
      resultado = resultado.filter(item => {
        const valor = getValorCelula(item, coluna)
        return String(valor).toLowerCase().includes(valorFiltro.toLowerCase())
      })
    })

    // Aplicar filtros externos
    if (filtros?.ativos) {
      Object.entries(filtros.ativos).forEach(([colunaId, valorFiltro]) => {
        if (!valorFiltro) return
        
        resultado = resultado.filter(item => {
          const valor = item[colunaId]
          
          if (Array.isArray(valorFiltro)) {
            return valorFiltro.includes(valor)
          }
          
          return valor === valorFiltro
        })
      })
    }

    return resultado
  }, [dados, busca?.valor, busca?.colunas, filtrosLocais, filtros?.ativos, colunas])

  const dadosOrdenados = useMemo(() => {
    if (!ordenacao?.coluna || !ordenacao.direcao) {
      return dadosFiltrados
    }

    const coluna = colunas.find(c => c.id === ordenacao.coluna)
    if (!coluna) return dadosFiltrados

    return [...dadosFiltrados].sort((a, b) => {
      const valorA = getValorCelula(a, coluna)
      const valorB = getValorCelula(b, coluna)

      let comparacao = 0

      if (coluna.tipo === 'numero') {
        comparacao = Number(valorA || 0) - Number(valorB || 0)
      } else if (coluna.tipo === 'data') {
        const dataA = new Date(valorA || 0).getTime()
        const dataB = new Date(valorB || 0).getTime()
        comparacao = dataA - dataB
      } else {
        comparacao = String(valorA || '').localeCompare(String(valorB || ''), 'pt-BR')
      }

      return ordenacao.direcao === 'desc' ? -comparacao : comparacao
    })
  }, [dadosFiltrados, ordenacao, colunas])

  const dadosPaginados = useMemo(() => {
    if (!paginacao) return dadosOrdenados

    const inicio = (paginacao.paginaAtual - 1) * paginacao.itensPorPagina
    const fim = inicio + paginacao.itensPorPagina
    
    return dadosOrdenados.slice(inicio, fim)
  }, [dadosOrdenados, paginacao])

  const itensSelecionados = useMemo(() => {
    if (!selecao) return []
    
    const chave = selecao.chaveId || 'id'
    return dados.filter(item => selecao.selecionados.includes(String(item[chave])))
  }, [dados, selecao])

  const getValorCelula = useCallback((item: T, coluna: ColunaDados) => {
    const accessor = coluna.accessor || coluna.id
    
    // Suporte para propriedades aninhadas (ex: 'usuario.nome')
    if (accessor.includes('.')) {
      return accessor.split('.').reduce((obj, key) => obj?.[key], item)
    }
    
    return item[accessor]
  }, [])

  const handleOrdenacao = (colunaId: string) => {
    const coluna = colunas.find(c => c.id === colunaId)
    if (!coluna?.ordenavel) return

    let novaOrdenacao: ConfiguracaoOrdenacao

    if (ordenacao?.coluna === colunaId) {
      // Ciclar entre asc -> desc -> null
      if (ordenacao.direcao === 'asc') {
        novaOrdenacao = { coluna: colunaId, direcao: 'desc' }
      } else if (ordenacao.direcao === 'desc') {
        novaOrdenacao = { coluna: '', direcao: null }
      } else {
        novaOrdenacao = { coluna: colunaId, direcao: 'asc' }
      }
    } else {
      novaOrdenacao = { coluna: colunaId, direcao: 'asc' }
    }

    onOrdenacaoChange?.(novaOrdenacao)
  }

  const handleSelecaoTodos = (checked: boolean) => {
    if (!selecao) return
    
    const chave = selecao.chaveId || 'id'
    
    if (checked) {
      const todosIds = dadosPaginados.map(item => String(item[chave]))
      const novosSelecionados = [...new Set([...selecao.selecionados, ...todosIds])]
      selecao.onSelecaoChange(novosSelecionados)
    } else {
      const idsRemover = dadosPaginados.map(item => String(item[chave]))
      const novosSelecionados = selecao.selecionados.filter(id => !idsRemover.includes(id))
      selecao.onSelecaoChange(novosSelecionados)
    }
  }

  const handleSelecaoItem = (item: T, checked: boolean) => {
    if (!selecao) return
    
    const chave = selecao.chaveId || 'id'
    const itemId = String(item[chave])
    
    if (selecao.tipo === 'single') {
      selecao.onSelecaoChange(checked ? [itemId] : [])
    } else {
      const novosSelecionados = checked
        ? [...selecao.selecionados, itemId]
        : selecao.selecionados.filter(id => id !== itemId)
      selecao.onSelecaoChange(novosSelecionados)
    }
  }

  const renderCelula = (item: T, coluna: ColunaDados) => {
    const valor = getValorCelula(item, coluna)

    if (coluna.formatador) {
      return coluna.formatador(valor, item)
    }

    switch (coluna.tipo) {
      case 'badge':
        if (!coluna.opcoesBadge || !valor) return '-'
        const opcaoBadge = coluna.opcoesBadge[valor]
        if (!opcaoBadge) return valor
        
        return (
          <Badge 
            variant={opcaoBadge.variante || 'default'}
            style={{ backgroundColor: opcaoBadge.cor }}
          >
            {opcaoBadge.label}
          </Badge>
        )

      case 'acao':
        if (!coluna.opcoesAcao) return null
        
        const acoesVisiveis = coluna.opcoesAcao.filter(acao => 
          !acao.condicao || acao.condicao(item)
        )
        
        if (acoesVisiveis.length === 0) return null
        
        if (acoesVisiveis.length === 1) {
          const acao = acoesVisiveis[0]
          const Icon = acao.icone
          
          return (
            <Button
              variant={acao.variante || 'ghost'}
              size="sm"
              onClick={() => acao.acao(item)}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {acao.label}
            </Button>
          )
        }
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {acoesVisiveis.map((acao, index) => {
                const Icon = acao.icone
                return (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => acao.acao(item)}
                    className={cn(
                      acao.variante === 'destructive' && 'text-destructive focus:text-destructive'
                    )}
                  >
                    {Icon && <Icon className="mr-2 h-4 w-4" />}
                    {acao.label}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )

      case 'boolean':
        return (
          <Badge variant={valor ? 'default' : 'secondary'}>
            {valor ? 'Sim' : 'Não'}
          </Badge>
        )

      case 'personalizado':
        return valor

      default:
        return formatadores[coluna.tipo]?.(valor) || String(valor || '-')
    }
  }

  const renderIconeOrdenacao = (colunaId: string) => {
    if (ordenacao?.coluna !== colunaId) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />
    }
    
    if (ordenacao.direcao === 'asc') {
      return <ArrowUp className="ml-2 h-4 w-4" />
    } else if (ordenacao.direcao === 'desc') {
      return <ArrowDown className="ml-2 h-4 w-4" />
    }
    
    return <ArrowUpDown className="ml-2 h-4 w-4" />
  }

  const totalPaginas = paginacao ? Math.ceil(dadosOrdenados.length / paginacao.itensPorPagina) : 1
  const temSelecionados = selecao && selecao.selecionados.length > 0
  const todosSelecionados = selecao && dadosPaginados.length > 0 && 
    dadosPaginados.every(item => {
      const chave = selecao.chaveId || 'id'
      return selecao.selecionados.includes(String(item[chave]))
    })
  const algunsSelecionados = selecao && selecao.selecionados.length > 0 && !todosSelecionados

  if (erro) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Erro ao carregar dados</h3>
          <p className="text-muted-foreground text-center mb-4">{erro}</p>
          {onAtualizar && (
            <Button onClick={onAtualizar} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar Novamente
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header com controles */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {/* Busca */}
          {showBusca && busca && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={busca.placeholder || 'Buscar...'}
                value={busca.valor}
                onChange={(e) => busca.onBuscaChange(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          )}
          
          {/* Filtros por coluna */}
          {showFiltros && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtros
                  {Object.values(filtrosLocais).filter(Boolean).length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {Object.values(filtrosLocais).filter(Boolean).length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80">
                <DropdownMenuLabel>Filtrar por coluna</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="p-2 space-y-2">
                  {colunas.filter(col => col.filtravel !== false && colunasVisiveis[col.id]).map(coluna => (
                    <div key={coluna.id} className="space-y-1">
                      <Label className="text-xs">{coluna.titulo}</Label>
                      <Input
                        placeholder={`Filtrar ${coluna.titulo.toLowerCase()}...`}
                        value={filtrosLocais[coluna.id] || ''}
                        onChange={(e) => setFiltrosLocais(prev => ({
                          ...prev,
                          [coluna.id]: e.target.value
                        }))}
                        className="h-8"
                      />
                    </div>
                  ))}
                  {Object.values(filtrosLocais).some(Boolean) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFiltrosLocais({})}
                      className="w-full"
                    >
                      Limpar Filtros
                    </Button>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Ações em lote */}
          {showAcoes && acoes && temSelecionados && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Ações ({selecao?.selecionados.length})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>{acoes.titulo || 'Ações em lote'}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {acoes.itens.map((acao, index) => {
                  const Icon = acao.icone
                  const podeExecutar = !acao.condicao || acao.condicao(itensSelecionados)
                  
                  return (
                    <DropdownMenuItem
                      key={index}
                      onClick={() => podeExecutar && acao.acao(itensSelecionados)}
                      disabled={!podeExecutar}
                      className={cn(
                        acao.variante === 'destructive' && 'text-destructive focus:text-destructive'
                      )}
                    >
                      {Icon && <Icon className="mr-2 h-4 w-4" />}
                      {acao.label}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {/* Exportar */}
          {showExportar && onExportar && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onExportar('csv')}>
                  Exportar CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExportar('excel')}>
                  Exportar Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExportar('pdf')}>
                  Exportar PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {/* Configurar colunas */}
          {showConfigurar && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Colunas
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Colunas visíveis</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {colunas.map(coluna => (
                  <DropdownMenuCheckboxItem
                    key={coluna.id}
                    checked={colunasVisiveis[coluna.id]}
                    onCheckedChange={(checked) => setColunasVisiveis(prev => ({
                      ...prev,
                      [coluna.id]: checked
                    }))}
                  >
                    {coluna.titulo}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {/* Atualizar */}
          {onAtualizar && (
            <Button variant="outline" size="sm" onClick={onAtualizar}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Tabela */}
      <Card>
        <div className="relative overflow-auto">
          <Table className={cn(
            compacto && 'text-sm',
            !bordas && 'border-none'
          )}>
            <TableHeader>
              <TableRow className={cn(!bordas && 'border-none')}>
                {/* Checkbox de seleção */}
                {showSelecao && selecao && selecao.tipo === 'multiple' && (
                  <TableHead className="w-12">
                    <Checkbox
                      checked={todosSelecionados}
                      ref={(el) => {
                        if (el) el.indeterminate = algunsSelecionados
                      }}
                      onCheckedChange={handleSelecaoTodos}
                    />
                  </TableHead>
                )}
                
                {colunasVisivelList.map(coluna => (
                  <TableHead
                    key={coluna.id}
                    className={cn(
                      coluna.alinhamento === 'centro' && 'text-center',
                      coluna.alinhamento === 'direita' && 'text-right',
                      coluna.ordenavel && 'cursor-pointer select-none hover:bg-muted/50',
                      coluna.fixo === 'esquerda' && 'sticky left-0 bg-background',
                      coluna.fixo === 'direita' && 'sticky right-0 bg-background'
                    )}
                    style={{
                      width: coluna.largura,
                      minWidth: coluna.minLargura,
                      maxWidth: coluna.maxLargura,
                    }}
                    onClick={() => coluna.ordenavel && handleOrdenacao(coluna.id)}
                  >
                    <div className="flex items-center">
                      {coluna.titulo}
                      {coluna.ordenavel && renderIconeOrdenacao(coluna.id)}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell 
                    colSpan={colunasVisivelList.length + (showSelecao && selecao ? 1 : 0)}
                    className="text-center py-12"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Carregando...
                    </div>
                  </TableCell>
                </TableRow>
              ) : dadosPaginados.length === 0 ? (
                <TableRow>
                  <TableCell 
                    colSpan={colunasVisivelList.length + (showSelecao && selecao ? 1 : 0)}
                    className="text-center py-12"
                  >
                    <div className="flex flex-col items-center gap-2">
                      {vazio?.icone ? (
                        <vazio.icone className="h-12 w-12 text-muted-foreground" />
                      ) : (
                        <Info className="h-12 w-12 text-muted-foreground" />
                      )}
                      <h3 className="text-lg font-semibold">
                        {vazio?.titulo || 'Nenhum dado encontrado'}
                      </h3>
                      <p className="text-muted-foreground">
                        {vazio?.descricao || 'Não há dados para exibir no momento.'}
                      </p>
                      {vazio?.acao && (
                        <Button onClick={vazio.acao.onClick} className="mt-2">
                          {vazio.acao.label}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                dadosPaginados.map((item, index) => {
                  const chave = selecao?.chaveId || 'id'
                  const itemId = String(item[chave])
                  const selecionado = selecao?.selecionados.includes(itemId)
                  
                  return (
                    <TableRow
                      key={itemId}
                      className={cn(
                        hover && 'hover:bg-muted/50',
                        zebrado && index % 2 === 0 && 'bg-muted/25',
                        selecionado && 'bg-primary/10',
                        !bordas && 'border-none'
                      )}
                    >
                      {/* Checkbox de seleção */}
                      {showSelecao && selecao && (
                        <TableCell className="w-12">
                          <Checkbox
                            checked={selecionado}
                            onCheckedChange={(checked) => handleSelecaoItem(item, checked)}
                          />
                        </TableCell>
                      )}
                      
                      {colunasVisivelList.map(coluna => (
                        <TableCell
                          key={coluna.id}
                          className={cn(
                            coluna.alinhamento === 'centro' && 'text-center',
                            coluna.alinhamento === 'direita' && 'text-right',
                            coluna.fixo === 'esquerda' && 'sticky left-0 bg-background',
                            coluna.fixo === 'direita' && 'sticky right-0 bg-background',
                            compacto && 'py-2'
                          )}
                        >
                          {renderCelula(item, coluna)}
                        </TableCell>
                      ))}
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
      
      {/* Paginação */}
      {showPaginacao && paginacao && totalPaginas > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Mostrando {((paginacao.paginaAtual - 1) * paginacao.itensPorPagina) + 1} a{' '}
              {Math.min(paginacao.paginaAtual * paginacao.itensPorPagina, dadosOrdenados.length)} de{' '}
              {dadosOrdenados.length} resultados
            </span>
            
            {paginacao.opcoesTamanho && (
              <div className="flex items-center gap-2 ml-4">
                <Label>Itens por página:</Label>
                <Select
                  value={String(paginacao.itensPorPagina)}
                  onValueChange={(valor) => {
                    const novoTamanho = Number(valor)
                    const novaPaginacao = {
                      ...paginacao,
                      itensPorPagina: novoTamanho,
                      paginaAtual: 1, // Resetar para primeira página
                    }
                    onPaginacaoChange?.(novaPaginacao)
                  }}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paginacao.opcoesTamanho.map(tamanho => (
                      <SelectItem key={tamanho} value={String(tamanho)}>
                        {tamanho}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPaginacaoChange?.({
                ...paginacao,
                paginaAtual: 1
              })}
              disabled={paginacao.paginaAtual === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPaginacaoChange?.({
                ...paginacao,
                paginaAtual: paginacao.paginaAtual - 1
              })}
              disabled={paginacao.paginaAtual === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-1">
              <span className="text-sm">Página</span>
              <Input
                type="number"
                min={1}
                max={totalPaginas}
                value={paginacao.paginaAtual}
                onChange={(e) => {
                  const novaPagina = Number(e.target.value)
                  if (novaPagina >= 1 && novaPagina <= totalPaginas) {
                    onPaginacaoChange?.({
                      ...paginacao,
                      paginaAtual: novaPagina
                    })
                  }
                }}
                className="w-16 text-center"
              />
              <span className="text-sm">de {totalPaginas}</span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPaginacaoChange?.({
                ...paginacao,
                paginaAtual: paginacao.paginaAtual + 1
              })}
              disabled={paginacao.paginaAtual === totalPaginas}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPaginacaoChange?.({
                ...paginacao,
                paginaAtual: totalPaginas
              })}
              disabled={paginacao.paginaAtual === totalPaginas}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Hook para gerenciar estado da tabela
export function useDataTable<T extends Record<string, any>>({
  dadosIniciais = [],
  paginacaoInicial = { paginaAtual: 1, itensPorPagina: 10, totalItens: 0 },
  ordenacaoInicial = { coluna: '', direcao: null },
}: {
  dadosIniciais?: T[]
  paginacaoInicial?: Partial<ConfiguracaoPaginacao>
  ordenacaoInicial?: ConfiguracaoOrdenacao
} = {}) {
  const [dados, setDados] = useState<T[]>(dadosIniciais)
  const [paginacao, setPaginacao] = useState<ConfiguracaoPaginacao>({
    paginaAtual: 1,
    itensPorPagina: 10,
    totalItens: 0,
    ...paginacaoInicial,
  })
  const [ordenacao, setOrdenacao] = useState<ConfiguracaoOrdenacao>(ordenacaoInicial)
  const [selecionados, setSelecionados] = useState<string[]>([])
  const [busca, setBusca] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const limparSelecao = useCallback(() => {
    setSelecionados([])
  }, [])

  const selecionarTodos = useCallback((chaveId = 'id') => {
    const todosIds = dados.map(item => String(item[chaveId]))
    setSelecionados(todosIds)
  }, [dados])

  const obterSelecionados = useCallback((chaveId = 'id') => {
    return dados.filter(item => selecionados.includes(String(item[chaveId])))
  }, [dados, selecionados])

  return {
    dados,
    setDados,
    paginacao,
    setPaginacao,
    ordenacao,
    setOrdenacao,
    selecionados,
    setSelecionados,
    busca,
    setBusca,
    loading,
    setLoading,
    erro,
    setErro,
    limparSelecao,
    selecionarTodos,
    obterSelecionados,
  }
}