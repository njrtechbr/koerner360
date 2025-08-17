'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Calendar } from '@/components/ui/calendar'
import { Slider } from '@/components/ui/slider'
import {
  Filter,
  Search,
  X,
  Calendar as CalendarIcon,
  ChevronDown,
  Check,
  RotateCcw,
  Download,
  Save,
  Upload,
  Settings,
  Plus,
  Minus,
  Eye,
  EyeOff,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, parseISO, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type TipoFiltro = 'texto' | 'select' | 'multiselect' | 'range' | 'date' | 'daterange' | 'boolean' | 'number'
type OperadorComparacao = 'igual' | 'diferente' | 'contem' | 'nao_contem' | 'maior' | 'menor' | 'maior_igual' | 'menor_igual' | 'entre' | 'vazio' | 'nao_vazio'

interface OpcaoFiltro {
  valor: string | number
  label: string
  cor?: string
  icone?: React.ComponentType<{ className?: string }>
  descricao?: string
  grupo?: string
}

interface ConfiguracaoFiltro {
  id: string
  nome: string
  tipo: TipoFiltro
  operadores?: OperadorComparacao[]
  opcoes?: OpcaoFiltro[]
  placeholder?: string
  min?: number
  max?: number
  step?: number
  obrigatorio?: boolean
  multiplo?: boolean
  busca?: boolean
  grupo?: string
  dependeDe?: string
  condicao?: (valor: any) => boolean
  formatador?: (valor: any) => string
  validador?: (valor: any) => boolean | string
}

interface FiltroAtivo {
  id: string
  operador: OperadorComparacao
  valor: any
  valorSecundario?: any // Para ranges
  label?: string
}

interface FiltroSalvo {
  id: string
  nome: string
  descricao?: string
  filtros: FiltroAtivo[]
  publico?: boolean
  criadoEm: Date
  criadoPor: string
}

interface AdvancedFiltersProps {
  configuracoes: ConfiguracaoFiltro[]
  filtrosAtivos: FiltroAtivo[]
  filtrosSalvos?: FiltroSalvo[]
  showSaveLoad?: boolean
  showPresets?: boolean
  showExport?: boolean
  showSearch?: boolean
  showGrouping?: boolean
  compacto?: boolean
  className?: string
  onFiltrosChange: (filtros: FiltroAtivo[]) => void
  onSalvarFiltro?: (nome: string, descricao?: string) => void
  onCarregarFiltro?: (filtro: FiltroSalvo) => void
  onExportarFiltros?: () => void
  onImportarFiltros?: (arquivo: File) => void
}

const operadoresLabels: Record<OperadorComparacao, string> = {
  igual: 'Igual a',
  diferente: 'Diferente de',
  contem: 'Contém',
  nao_contem: 'Não contém',
  maior: 'Maior que',
  menor: 'Menor que',
  maior_igual: 'Maior ou igual a',
  menor_igual: 'Menor ou igual a',
  entre: 'Entre',
  vazio: 'Está vazio',
  nao_vazio: 'Não está vazio',
}

const operadoresPorTipo: Record<TipoFiltro, OperadorComparacao[]> = {
  texto: ['igual', 'diferente', 'contem', 'nao_contem', 'vazio', 'nao_vazio'],
  select: ['igual', 'diferente', 'vazio', 'nao_vazio'],
  multiselect: ['contem', 'nao_contem', 'vazio', 'nao_vazio'],
  range: ['entre', 'maior', 'menor', 'maior_igual', 'menor_igual'],
  date: ['igual', 'diferente', 'maior', 'menor', 'maior_igual', 'menor_igual', 'entre'],
  daterange: ['entre'],
  boolean: ['igual'],
  number: ['igual', 'diferente', 'maior', 'menor', 'maior_igual', 'menor_igual', 'entre'],
}

export function AdvancedFilters({
  configuracoes,
  filtrosAtivos,
  filtrosSalvos = [],
  showSaveLoad = true,
  showPresets = true,
  showExport = true,
  showSearch = true,
  showGrouping = true,
  compacto = false,
  className,
  onFiltrosChange,
  onSalvarFiltro,
  onCarregarFiltro,
  onExportarFiltros,
  onImportarFiltros,
}: AdvancedFiltersProps) {
  const [busca, setBusca] = useState('')
  const [grupoExpandido, setGrupoExpandido] = useState<Record<string, boolean>>({})
  const [filtroSelecionado, setFiltroSelecionado] = useState<string | null>(null)
  const [novoFiltro, setNovoFiltro] = useState<Partial<FiltroAtivo> | null>(null)
  const [showSalvarDialog, setShowSalvarDialog] = useState(false)
  const [nomeFiltroSalvo, setNomeFiltroSalvo] = useState('')
  const [descricaoFiltroSalvo, setDescricaoFiltroSalvo] = useState('')

  const configuracoesAgrupadas = useMemo(() => {
    const grupos: Record<string, ConfiguracaoFiltro[]> = {}
    
    configuracoes.forEach(config => {
      const grupo = config.grupo || 'Geral'
      if (!grupos[grupo]) grupos[grupo] = []
      grupos[grupo].push(config)
    })
    
    return grupos
  }, [configuracoes])

  const configuracoesFiltradas = useMemo(() => {
    if (!busca) return configuracoes
    
    return configuracoes.filter(config =>
      config.nome.toLowerCase().includes(busca.toLowerCase()) ||
      config.grupo?.toLowerCase().includes(busca.toLowerCase())
    )
  }, [configuracoes, busca])

  const filtrosAtivosPorId = useMemo(() => {
    const map: Record<string, FiltroAtivo> = {}
    filtrosAtivos.forEach(filtro => {
      map[filtro.id] = filtro
    })
    return map
  }, [filtrosAtivos])

  const adicionarFiltro = (configId: string) => {
    const config = configuracoes.find(c => c.id === configId)
    if (!config) return

    const operadoresDisponiveis = config.operadores || operadoresPorTipo[config.tipo]
    const operadorPadrao = operadoresDisponiveis[0]

    setNovoFiltro({
      id: configId,
      operador: operadorPadrao,
      valor: config.tipo === 'boolean' ? true : '',
    })
  }

  const confirmarNovoFiltro = () => {
    if (!novoFiltro || !novoFiltro.id || !novoFiltro.operador) return

    const config = configuracoes.find(c => c.id === novoFiltro.id)
    if (!config) return

    // Validar valor
    if (config.validador && !config.validador(novoFiltro.valor)) {
      return
    }

    const filtroCompleto: FiltroAtivo = {
      id: novoFiltro.id,
      operador: novoFiltro.operador,
      valor: novoFiltro.valor,
      valorSecundario: novoFiltro.valorSecundario,
      label: config.nome,
    }

    const novosFiltros = [...filtrosAtivos.filter(f => f.id !== novoFiltro.id), filtroCompleto]
    onFiltrosChange(novosFiltros)
    setNovoFiltro(null)
  }

  const removerFiltro = (filtroId: string) => {
    const novosFiltros = filtrosAtivos.filter(f => f.id !== filtroId)
    onFiltrosChange(novosFiltros)
  }

  const limparFiltros = () => {
    onFiltrosChange([])
  }

  const salvarFiltro = () => {
    if (!nomeFiltroSalvo.trim() || !onSalvarFiltro) return
    
    onSalvarFiltro(nomeFiltroSalvo.trim(), descricaoFiltroSalvo.trim() || undefined)
    setShowSalvarDialog(false)
    setNomeFiltroSalvo('')
    setDescricaoFiltroSalvo('')
  }

  const renderValorInput = (config: ConfiguracaoFiltro, valor: any, onChange: (valor: any) => void, isSecundario = false) => {
    const placeholder = isSecundario ? 'Valor final' : (config.placeholder || `Digite ${config.nome.toLowerCase()}`)

    switch (config.tipo) {
      case 'texto':
        return (
          <Input
            placeholder={placeholder}
            value={valor || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full"
          />
        )

      case 'number':
        return (
          <Input
            type="number"
            placeholder={placeholder}
            value={valor || ''}
            min={config.min}
            max={config.max}
            step={config.step}
            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
            className="w-full"
          />
        )

      case 'select':
        return (
          <Select value={valor || ''} onValueChange={onChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {config.opcoes?.map((opcao) => (
                <SelectItem key={opcao.valor} value={String(opcao.valor)}>
                  <div className="flex items-center gap-2">
                    {opcao.icone && <opcao.icone className="h-4 w-4" />}
                    <span>{opcao.label}</span>
                    {opcao.cor && (
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: opcao.cor }}
                      />
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'multiselect':
        const valoresArray = Array.isArray(valor) ? valor : []
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                {valoresArray.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {valoresArray.slice(0, 2).map((v: string) => {
                      const opcao = config.opcoes?.find(o => String(o.valor) === v)
                      return (
                        <Badge key={v} variant="secondary" className="text-xs">
                          {opcao?.label || v}
                        </Badge>
                      )
                    })}
                    {valoresArray.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{valoresArray.length - 2}
                      </Badge>
                    )}
                  </div>
                ) : (
                  placeholder
                )}
                <ChevronDown className="ml-auto h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <Command>
                {config.busca && <CommandInput placeholder="Buscar..." />}
                <CommandList>
                  <CommandEmpty>Nenhuma opção encontrada.</CommandEmpty>
                  <CommandGroup>
                    {config.opcoes?.map((opcao) => (
                      <CommandItem
                        key={opcao.valor}
                        onSelect={() => {
                          const valorStr = String(opcao.valor)
                          const novosValores = valoresArray.includes(valorStr)
                            ? valoresArray.filter((v: string) => v !== valorStr)
                            : [...valoresArray, valorStr]
                          onChange(novosValores)
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            valoresArray.includes(String(opcao.valor)) ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        <div className="flex items-center gap-2">
                          {opcao.icone && <opcao.icone className="h-4 w-4" />}
                          <span>{opcao.label}</span>
                          {opcao.cor && (
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: opcao.cor }}
                            />
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )

      case 'boolean':
        return (
          <RadioGroup
            value={valor ? 'true' : 'false'}
            onValueChange={(v) => onChange(v === 'true')}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id="true" />
              <Label htmlFor="true">Sim</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id="false" />
              <Label htmlFor="false">Não</Label>
            </div>
          </RadioGroup>
        )

      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {valor ? format(new Date(valor), 'dd/MM/yyyy', { locale: ptBR }) : placeholder}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={valor ? new Date(valor) : undefined}
                onSelect={(date) => onChange(date?.toISOString())}
                initialFocus
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        )

      case 'range':
        const valorRange = Array.isArray(valor) ? valor : [config.min || 0, config.max || 100]
        return (
          <div className="space-y-2">
            <Slider
              value={valorRange}
              onValueChange={onChange}
              min={config.min || 0}
              max={config.max || 100}
              step={config.step || 1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{valorRange[0]}</span>
              <span>{valorRange[1]}</span>
            </div>
          </div>
        )

      default:
        return (
          <Input
            placeholder={placeholder}
            value={valor || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full"
          />
        )
    }
  }

  const renderFiltroAtivo = (filtro: FiltroAtivo) => {
    const config = configuracoes.find(c => c.id === filtro.id)
    if (!config) return null

    const operadorLabel = operadoresLabels[filtro.operador]
    let valorDisplay = ''

    if (filtro.operador === 'vazio' || filtro.operador === 'nao_vazio') {
      valorDisplay = ''
    } else if (filtro.operador === 'entre' && filtro.valorSecundario !== undefined) {
      valorDisplay = `${filtro.valor} e ${filtro.valorSecundario}`
    } else if (config.tipo === 'multiselect' && Array.isArray(filtro.valor)) {
      const labels = filtro.valor.map(v => {
        const opcao = config.opcoes?.find(o => String(o.valor) === v)
        return opcao?.label || v
      })
      valorDisplay = labels.join(', ')
    } else if (config.tipo === 'select') {
      const opcao = config.opcoes?.find(o => String(o.valor) === String(filtro.valor))
      valorDisplay = opcao?.label || String(filtro.valor)
    } else if (config.tipo === 'date') {
      valorDisplay = format(new Date(filtro.valor), 'dd/MM/yyyy', { locale: ptBR })
    } else if (config.tipo === 'boolean') {
      valorDisplay = filtro.valor ? 'Sim' : 'Não'
    } else {
      valorDisplay = config.formatador ? config.formatador(filtro.valor) : String(filtro.valor)
    }

    return (
      <Badge key={filtro.id} variant="secondary" className="flex items-center gap-2 px-3 py-1">
        <span className="font-medium">{config.nome}</span>
        <span className="text-muted-foreground">{operadorLabel}</span>
        {valorDisplay && <span>{valorDisplay}</span>}
        <Button
          variant="ghost"
          size="sm"
          className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
          onClick={() => removerFiltro(filtro.id)}
        >
          <X className="h-3 w-3" />
        </Button>
      </Badge>
    )
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className={cn('pb-4', compacto && 'pb-2')}>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros Avançados
            {filtrosAtivos.length > 0 && (
              <Badge variant="outline">{filtrosAtivos.length}</Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {showSaveLoad && filtrosAtivos.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSalvarDialog(true)}
              >
                <Save className="h-4 w-4" />
              </Button>
            )}
            
            {showExport && onExportarFiltros && (
              <Button variant="outline" size="sm" onClick={onExportarFiltros}>
                <Download className="h-4 w-4" />
              </Button>
            )}
            
            {filtrosAtivos.length > 0 && (
              <Button variant="outline" size="sm" onClick={limparFiltros}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Busca */}
        {showSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar filtros..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10"
            />
          </div>
        )}
      </CardHeader>
      
      <CardContent className={cn('space-y-4', compacto && 'space-y-2')}>
        {/* Filtros Ativos */}
        {filtrosAtivos.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Filtros Ativos</Label>
            <div className="flex flex-wrap gap-2">
              {filtrosAtivos.map(renderFiltroAtivo)}
            </div>
            <Separator />
          </div>
        )}
        
        {/* Novo Filtro */}
        {novoFiltro && (
          <Card className="border-dashed">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <Label className="font-medium">Novo Filtro</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setNovoFiltro(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Campo</Label>
                  <Select
                    value={novoFiltro.id || ''}
                    onValueChange={(id) => setNovoFiltro({ ...novoFiltro, id })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um campo" />
                    </SelectTrigger>
                    <SelectContent>
                      {configuracoesFiltradas.map((config) => (
                        <SelectItem key={config.id} value={config.id}>
                          {config.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {novoFiltro.id && (() => {
                  const config = configuracoes.find(c => c.id === novoFiltro.id)
                  if (!config) return null
                  
                  const operadoresDisponiveis = config.operadores || operadoresPorTipo[config.tipo]
                  
                  return (
                    <>
                      <div className="space-y-2">
                        <Label>Operador</Label>
                        <Select
                          value={novoFiltro.operador || ''}
                          onValueChange={(op) => setNovoFiltro({ 
                            ...novoFiltro, 
                            operador: op as OperadorComparacao 
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um operador" />
                          </SelectTrigger>
                          <SelectContent>
                            {operadoresDisponiveis.map((op) => (
                              <SelectItem key={op} value={op}>
                                {operadoresLabels[op]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {novoFiltro.operador && 
                       novoFiltro.operador !== 'vazio' && 
                       novoFiltro.operador !== 'nao_vazio' && (
                        <div className="space-y-2">
                          <Label>Valor</Label>
                          {renderValorInput(
                            config,
                            novoFiltro.valor,
                            (valor) => setNovoFiltro({ ...novoFiltro, valor })
                          )}
                          
                          {novoFiltro.operador === 'entre' && (
                            <div className="mt-2">
                              <Label>Valor Final</Label>
                              {renderValorInput(
                                config,
                                novoFiltro.valorSecundario,
                                (valor) => setNovoFiltro({ ...novoFiltro, valorSecundario: valor }),
                                true
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setNovoFiltro(null)}>
                  Cancelar
                </Button>
                <Button onClick={confirmarNovoFiltro}>
                  Adicionar Filtro
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Lista de Filtros Disponíveis */}
        {showGrouping ? (
          <div className="space-y-4">
            {Object.entries(configuracoesAgrupadas).map(([grupo, configs]) => {
              const isExpandido = grupoExpandido[grupo] ?? true
              const configsFiltradas = configs.filter(config =>
                !busca || 
                config.nome.toLowerCase().includes(busca.toLowerCase()) ||
                grupo.toLowerCase().includes(busca.toLowerCase())
              )
              
              if (configsFiltradas.length === 0) return null
              
              return (
                <div key={grupo} className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-2 h-auto"
                    onClick={() => setGrupoExpandido(prev => ({ 
                      ...prev, 
                      [grupo]: !isExpandido 
                    }))}
                  >
                    <span className="font-medium">{grupo}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {configsFiltradas.length}
                      </Badge>
                      {isExpandido ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </div>
                  </Button>
                  
                  {isExpandido && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 pl-4">
                      {configsFiltradas.map((config) => {
                        const jaAdicionado = filtrosAtivosPorId[config.id]
                        
                        return (
                          <Button
                            key={config.id}
                            variant={jaAdicionado ? "secondary" : "outline"}
                            className="justify-start h-auto p-3"
                            onClick={() => !jaAdicionado && adicionarFiltro(config.id)}
                            disabled={jaAdicionado}
                          >
                            <div className="flex items-center gap-2 w-full">
                              {jaAdicionado ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <Plus className="h-4 w-4" />
                              )}
                              <div className="text-left">
                                <div className="font-medium">{config.nome}</div>
                                {config.placeholder && (
                                  <div className="text-xs text-muted-foreground">
                                    {config.placeholder}
                                  </div>
                                )}
                              </div>
                            </div>
                          </Button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {configuracoesFiltradas.map((config) => {
              const jaAdicionado = filtrosAtivosPorId[config.id]
              
              return (
                <Button
                  key={config.id}
                  variant={jaAdicionado ? "secondary" : "outline"}
                  className="justify-start h-auto p-3"
                  onClick={() => !jaAdicionado && adicionarFiltro(config.id)}
                  disabled={jaAdicionado}
                >
                  <div className="flex items-center gap-2 w-full">
                    {jaAdicionado ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    <div className="text-left">
                      <div className="font-medium">{config.nome}</div>
                      {config.placeholder && (
                        <div className="text-xs text-muted-foreground">
                          {config.placeholder}
                        </div>
                      )}
                    </div>
                  </div>
                </Button>
              )
            })}
          </div>
        )}
        
        {/* Filtros Salvos */}
        {showSaveLoad && filtrosSalvos.length > 0 && (
          <div className="space-y-2">
            <Separator />
            <Label className="text-sm font-medium">Filtros Salvos</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {filtrosSalvos.map((filtroSalvo) => (
                <Button
                  key={filtroSalvo.id}
                  variant="outline"
                  className="justify-start h-auto p-3"
                  onClick={() => onCarregarFiltro?.(filtroSalvo)}
                >
                  <div className="text-left w-full">
                    <div className="font-medium">{filtroSalvo.nome}</div>
                    {filtroSalvo.descricao && (
                      <div className="text-xs text-muted-foreground">
                        {filtroSalvo.descricao}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      {filtroSalvo.filtros.length} filtros • {format(filtroSalvo.criadoEm, 'dd/MM/yyyy', { locale: ptBR })}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      
      {/* Dialog para Salvar Filtro */}
      {showSalvarDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Salvar Filtro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do Filtro</Label>
                <Input
                  placeholder="Digite um nome para o filtro"
                  value={nomeFiltroSalvo}
                  onChange={(e) => setNomeFiltroSalvo(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Descrição (opcional)</Label>
                <Input
                  placeholder="Descreva o propósito deste filtro"
                  value={descricaoFiltroSalvo}
                  onChange={(e) => setDescricaoFiltroSalvo(e.target.value)}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowSalvarDialog(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={salvarFiltro}
                  disabled={!nomeFiltroSalvo.trim()}
                >
                  Salvar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Card>
  )
}

// Hook para gerenciar filtros
export function useAdvancedFilters(configuracoes: ConfiguracaoFiltro[]) {
  const [filtrosAtivos, setFiltrosAtivos] = useState<FiltroAtivo[]>([])
  const [filtrosSalvos, setFiltrosSalvos] = useState<FiltroSalvo[]>([])

  const aplicarFiltros = (dados: any[]) => {
    return dados.filter(item => {
      return filtrosAtivos.every(filtro => {
        const config = configuracoes.find(c => c.id === filtro.id)
        if (!config) return true

        const valorItem = item[filtro.id]
        
        switch (filtro.operador) {
          case 'igual':
            return valorItem === filtro.valor
          case 'diferente':
            return valorItem !== filtro.valor
          case 'contem':
            return String(valorItem).toLowerCase().includes(String(filtro.valor).toLowerCase())
          case 'nao_contem':
            return !String(valorItem).toLowerCase().includes(String(filtro.valor).toLowerCase())
          case 'maior':
            return Number(valorItem) > Number(filtro.valor)
          case 'menor':
            return Number(valorItem) < Number(filtro.valor)
          case 'maior_igual':
            return Number(valorItem) >= Number(filtro.valor)
          case 'menor_igual':
            return Number(valorItem) <= Number(filtro.valor)
          case 'entre':
            return Number(valorItem) >= Number(filtro.valor) && 
                   Number(valorItem) <= Number(filtro.valorSecundario)
          case 'vazio':
            return !valorItem || valorItem === '' || valorItem === null || valorItem === undefined
          case 'nao_vazio':
            return valorItem && valorItem !== '' && valorItem !== null && valorItem !== undefined
          default:
            return true
        }
      })
    })
  }

  const salvarFiltro = (nome: string, descricao?: string) => {
    const novoFiltro: FiltroSalvo = {
      id: Date.now().toString(),
      nome,
      descricao,
      filtros: [...filtrosAtivos],
      criadoEm: new Date(),
      criadoPor: 'usuario-atual', // Substituir pela lógica de usuário
    }
    
    setFiltrosSalvos(prev => [...prev, novoFiltro])
  }

  const carregarFiltro = (filtroSalvo: FiltroSalvo) => {
    setFiltrosAtivos([...filtroSalvo.filtros])
  }

  const exportarFiltros = () => {
    const dados = {
      filtrosAtivos,
      filtrosSalvos,
      exportadoEm: new Date().toISOString(),
    }
    
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `filtros-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return {
    filtrosAtivos,
    setFiltrosAtivos,
    filtrosSalvos,
    aplicarFiltros,
    salvarFiltro,
    carregarFiltro,
    exportarFiltros,
  }
}