'use client'

import { useState, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  FileText,
  Download,
  Share2,
  Calendar,
  Filter,
  Settings,
  Eye,
  Edit,
  Trash2,
  Plus,
  Save,
  Send,
  Clock,
  User,
  Users,
  BarChart3,
  PieChart,
  TrendingUp,
  Target,
  Award,
  Star,
  CheckCircle,
  AlertCircle,
  Info,
  RefreshCw,
  Search,
  SortAsc,
  SortDesc,
  Copy,
  ExternalLink,
  Mail,
  Printer,
  Bookmark,
  Tag,
  Folder,
  Archive,
  History,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type TipoRelatorio = 
  | 'performance' 
  | 'comparativo' 
  | 'tendencia' 
  | 'ranking' 
  | 'satisfacao' 
  | 'produtividade' 
  | 'personalizado'

type FormatoExportacao = 'pdf' | 'excel' | 'csv' | 'json' | 'html'

type StatusRelatorio = 'rascunho' | 'processando' | 'concluido' | 'erro' | 'agendado'

type FrequenciaAgendamento = 'diario' | 'semanal' | 'mensal' | 'trimestral' | 'anual'

interface FiltroRelatorio {
  campo: string
  operador: 'igual' | 'diferente' | 'maior' | 'menor' | 'contem' | 'entre'
  valor: any
  valorFim?: any
}

interface ConfiguracaoRelatorio {
  id?: string
  nome: string
  descricao?: string
  tipo: TipoRelatorio
  filtros: FiltroRelatorio[]
  metricas: string[]
  agrupamento?: string[]
  ordenacao?: {
    campo: string
    direcao: 'asc' | 'desc'
  }
  periodo: {
    inicio: Date
    fim: Date
  }
  formato: FormatoExportacao
  incluirGraficos: boolean
  incluirTabelas: boolean
  incluirResumo: boolean
  template?: string
  agendamento?: {
    ativo: boolean
    frequencia: FrequenciaAgendamento
    proximaExecucao?: Date
    destinatarios: string[]
  }
  criado_em?: Date
  criado_por?: string
  tags?: string[]
}

interface RelatorioGerado {
  id: string
  configuracao: ConfiguracaoRelatorio
  status: StatusRelatorio
  progresso?: number
  url_download?: string
  tamanho_arquivo?: number
  tempo_processamento?: number
  erro?: string
  gerado_em: Date
  gerado_por: string
  visualizacoes: number
  downloads: number
}

interface ReportSystemProps {
  relatorios?: RelatorioGerado[]
  configuracoes?: ConfiguracaoRelatorio[]
  loading?: boolean
  onGerarRelatorio?: (config: ConfiguracaoRelatorio) => Promise<void>
  onSalvarConfiguracao?: (config: ConfiguracaoRelatorio) => Promise<void>
  onExcluirRelatorio?: (id: string) => Promise<void>
  onDownloadRelatorio?: (id: string) => Promise<void>
  onCompartilharRelatorio?: (id: string, destinatarios: string[]) => Promise<void>
  className?: string
}

const tiposRelatorio = [
  { valor: 'performance', label: 'Performance Individual', icone: TrendingUp },
  { valor: 'comparativo', label: 'Comparativo de Equipes', icone: BarChart3 },
  { valor: 'tendencia', label: 'Análise de Tendências', icone: TrendingUp },
  { valor: 'ranking', label: 'Rankings e Classificações', icone: Award },
  { valor: 'satisfacao', label: 'Satisfação do Cliente', icone: Star },
  { valor: 'produtividade', label: 'Produtividade', icone: Target },
  { valor: 'personalizado', label: 'Relatório Personalizado', icone: Settings },
]

const formatosExportacao = [
  { valor: 'pdf', label: 'PDF', icone: FileText },
  { valor: 'excel', label: 'Excel', icone: FileText },
  { valor: 'csv', label: 'CSV', icone: FileText },
  { valor: 'json', label: 'JSON', icone: FileText },
  { valor: 'html', label: 'HTML', icone: FileText },
]

const metricasDisponiveis = [
  { valor: 'avaliacoes_total', label: 'Total de Avaliações' },
  { valor: 'media_notas', label: 'Média de Notas' },
  { valor: 'satisfacao', label: 'Índice de Satisfação' },
  { valor: 'pontuacao', label: 'Pontuação Total' },
  { valor: 'nivel', label: 'Nível Atual' },
  { valor: 'conquistas', label: 'Conquistas Desbloqueadas' },
  { valor: 'sequencia', label: 'Sequência de Dias' },
  { valor: 'tempo_resposta', label: 'Tempo Médio de Resposta' },
  { valor: 'resolucao_primeiro_contato', label: 'Resolução no Primeiro Contato' },
  { valor: 'feedback_positivo', label: 'Feedback Positivo (%)' },
]

const camposAgrupamento = [
  { valor: 'atendente', label: 'Por Atendente' },
  { valor: 'cargo', label: 'Por Cargo' },
  { valor: 'portaria', label: 'Por Portaria' },
  { valor: 'periodo', label: 'Por Período' },
  { valor: 'dia_semana', label: 'Por Dia da Semana' },
  { valor: 'turno', label: 'Por Turno' },
]

// Componente para configurar filtros
function FiltroConfigurator({ 
  filtros, 
  onChange 
}: { 
  filtros: FiltroRelatorio[]
  onChange: (filtros: FiltroRelatorio[]) => void 
}) {
  const adicionarFiltro = () => {
    onChange([
      ...filtros,
      { campo: '', operador: 'igual', valor: '' }
    ])
  }
  
  const removerFiltro = (index: number) => {
    onChange(filtros.filter((_, i) => i !== index))
  }
  
  const atualizarFiltro = (index: number, filtro: Partial<FiltroRelatorio>) => {
    const novosFiltros = [...filtros]
    novosFiltros[index] = { ...novosFiltros[index], ...filtro }
    onChange(novosFiltros)
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Filtros</Label>
        <Button onClick={adicionarFiltro} size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Filtro
        </Button>
      </div>
      
      {filtros.map((filtro, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-xs">Campo</Label>
                <Select 
                  value={filtro.campo} 
                  onValueChange={(valor) => atualizarFiltro(index, { campo: valor })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar campo" />
                  </SelectTrigger>
                  <SelectContent>
                    {metricasDisponiveis.map(metrica => (
                      <SelectItem key={metrica.valor} value={metrica.valor}>
                        {metrica.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-xs">Operador</Label>
                <Select 
                  value={filtro.operador} 
                  onValueChange={(valor) => atualizarFiltro(index, { operador: valor as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="igual">Igual a</SelectItem>
                    <SelectItem value="diferente">Diferente de</SelectItem>
                    <SelectItem value="maior">Maior que</SelectItem>
                    <SelectItem value="menor">Menor que</SelectItem>
                    <SelectItem value="contem">Contém</SelectItem>
                    <SelectItem value="entre">Entre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-xs">Valor</Label>
                <Input 
                  value={filtro.valor} 
                  onChange={(e) => atualizarFiltro(index, { valor: e.target.value })}
                  placeholder="Valor"
                />
              </div>
              
              <div className="flex items-end">
                <Button 
                  onClick={() => removerFiltro(index)} 
                  size="sm" 
                  variant="destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {filtro.operador === 'entre' && (
              <div className="mt-4">
                <Label className="text-xs">Valor Final</Label>
                <Input 
                  value={filtro.valorFim || ''} 
                  onChange={(e) => atualizarFiltro(index, { valorFim: e.target.value })}
                  placeholder="Valor final"
                />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Componente para configurar relatório
function RelatorioConfigurator({ 
  configuracao, 
  onChange, 
  onSalvar, 
  onGerar 
}: {
  configuracao: ConfiguracaoRelatorio
  onChange: (config: ConfiguracaoRelatorio) => void
  onSalvar?: () => void
  onGerar?: () => void
}) {
  const atualizarConfiguracao = (updates: Partial<ConfiguracaoRelatorio>) => {
    onChange({ ...configuracao, ...updates })
  }
  
  return (
    <div className="space-y-6">
      {/* Informações básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome do Relatório</Label>
            <Input 
              id="nome"
              value={configuracao.nome}
              onChange={(e) => atualizarConfiguracao({ nome: e.target.value })}
              placeholder="Digite o nome do relatório"
            />
          </div>
          
          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea 
              id="descricao"
              value={configuracao.descricao || ''}
              onChange={(e) => atualizarConfiguracao({ descricao: e.target.value })}
              placeholder="Descreva o objetivo do relatório"
              rows={3}
            />
          </div>
          
          <div>
            <Label>Tipo de Relatório</Label>
            <Select 
              value={configuracao.tipo} 
              onValueChange={(valor) => atualizarConfiguracao({ tipo: valor as TipoRelatorio })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tiposRelatorio.map(tipo => {
                  const Icon = tipo.icone
                  return (
                    <SelectItem key={tipo.valor} value={tipo.valor}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {tipo.label}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Tags</Label>
            <Input 
              value={configuracao.tags?.join(', ') || ''}
              onChange={(e) => atualizarConfiguracao({ 
                tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean) 
              })}
              placeholder="Digite as tags separadas por vírgula"
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Métricas e agrupamento */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Métricas e Agrupamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Métricas a Incluir</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {metricasDisponiveis.map(metrica => (
                <div key={metrica.valor} className="flex items-center space-x-2">
                  <Checkbox 
                    id={metrica.valor}
                    checked={configuracao.metricas.includes(metrica.valor)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        atualizarConfiguracao({ 
                          metricas: [...configuracao.metricas, metrica.valor] 
                        })
                      } else {
                        atualizarConfiguracao({ 
                          metricas: configuracao.metricas.filter(m => m !== metrica.valor) 
                        })
                      }
                    }}
                  />
                  <Label htmlFor={metrica.valor} className="text-sm">
                    {metrica.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <Label>Agrupar Por</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {camposAgrupamento.map(campo => (
                <div key={campo.valor} className="flex items-center space-x-2">
                  <Checkbox 
                    id={campo.valor}
                    checked={configuracao.agrupamento?.includes(campo.valor) || false}
                    onCheckedChange={(checked) => {
                      const agrupamento = configuracao.agrupamento || []
                      if (checked) {
                        atualizarConfiguracao({ 
                          agrupamento: [...agrupamento, campo.valor] 
                        })
                      } else {
                        atualizarConfiguracao({ 
                          agrupamento: agrupamento.filter(a => a !== campo.valor) 
                        })
                      }
                    }}
                  />
                  <Label htmlFor={campo.valor} className="text-sm">
                    {campo.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <FiltroConfigurator 
            filtros={configuracao.filtros}
            onChange={(filtros) => atualizarConfiguracao({ filtros })}
          />
        </CardContent>
      </Card>
      
      {/* Período */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Período</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="inicio">Data Início</Label>
              <Input 
                id="inicio"
                type="date"
                value={format(configuracao.periodo.inicio, 'yyyy-MM-dd')}
                onChange={(e) => atualizarConfiguracao({ 
                  periodo: { 
                    ...configuracao.periodo, 
                    inicio: new Date(e.target.value) 
                  } 
                })}
              />
            </div>
            
            <div>
              <Label htmlFor="fim">Data Fim</Label>
              <Input 
                id="fim"
                type="date"
                value={format(configuracao.periodo.fim, 'yyyy-MM-dd')}
                onChange={(e) => atualizarConfiguracao({ 
                  periodo: { 
                    ...configuracao.periodo, 
                    fim: new Date(e.target.value) 
                  } 
                })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Formato e opções */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Formato e Opções</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Formato de Exportação</Label>
            <RadioGroup 
              value={configuracao.formato} 
              onValueChange={(valor) => atualizarConfiguracao({ formato: valor as FormatoExportacao })}
              className="grid grid-cols-3 gap-4 mt-2"
            >
              {formatosExportacao.map(formato => {
                const Icon = formato.icone
                return (
                  <div key={formato.valor} className="flex items-center space-x-2">
                    <RadioGroupItem value={formato.valor} id={formato.valor} />
                    <Label htmlFor={formato.valor} className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {formato.label}
                    </Label>
                  </div>
                )
              })}
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="graficos"
                checked={configuracao.incluirGraficos}
                onCheckedChange={(checked) => atualizarConfiguracao({ incluirGraficos: !!checked })}
              />
              <Label htmlFor="graficos">Incluir Gráficos</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="tabelas"
                checked={configuracao.incluirTabelas}
                onCheckedChange={(checked) => atualizarConfiguracao({ incluirTabelas: !!checked })}
              />
              <Label htmlFor="tabelas">Incluir Tabelas</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="resumo"
                checked={configuracao.incluirResumo}
                onCheckedChange={(checked) => atualizarConfiguracao({ incluirResumo: !!checked })}
              />
              <Label htmlFor="resumo">Incluir Resumo Executivo</Label>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Agendamento */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Agendamento (Opcional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="agendamento"
              checked={configuracao.agendamento?.ativo || false}
              onCheckedChange={(checked) => atualizarConfiguracao({ 
                agendamento: {
                  ...configuracao.agendamento,
                  ativo: !!checked,
                  frequencia: 'mensal',
                  destinatarios: []
                }
              })}
            />
            <Label htmlFor="agendamento">Ativar Agendamento Automático</Label>
          </div>
          
          {configuracao.agendamento?.ativo && (
            <div className="space-y-4 pl-6">
              <div>
                <Label>Frequência</Label>
                <Select 
                  value={configuracao.agendamento.frequencia} 
                  onValueChange={(valor) => atualizarConfiguracao({ 
                    agendamento: {
                      ...configuracao.agendamento!,
                      frequencia: valor as FrequenciaAgendamento
                    }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diario">Diário</SelectItem>
                    <SelectItem value="semanal">Semanal</SelectItem>
                    <SelectItem value="mensal">Mensal</SelectItem>
                    <SelectItem value="trimestral">Trimestral</SelectItem>
                    <SelectItem value="anual">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Destinatários (emails separados por vírgula)</Label>
                <Textarea 
                  value={configuracao.agendamento.destinatarios.join(', ')}
                  onChange={(e) => atualizarConfiguracao({ 
                    agendamento: {
                      ...configuracao.agendamento!,
                      destinatarios: e.target.value.split(',').map(email => email.trim()).filter(Boolean)
                    }
                  })}
                  placeholder="email1@exemplo.com, email2@exemplo.com"
                  rows={2}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Ações */}
      <div className="flex gap-2">
        {onSalvar && (
          <Button onClick={onSalvar} variant="outline">
            <Save className="mr-2 h-4 w-4" />
            Salvar Configuração
          </Button>
        )}
        
        {onGerar && (
          <Button onClick={onGerar}>
            <FileText className="mr-2 h-4 w-4" />
            Gerar Relatório
          </Button>
        )}
      </div>
    </div>
  )
}

// Componente para listar relatórios gerados
function RelatoriosList({ 
  relatorios, 
  onDownload, 
  onCompartilhar, 
  onExcluir 
}: {
  relatorios: RelatorioGerado[]
  onDownload?: (id: string) => void
  onCompartilhar?: (id: string) => void
  onExcluir?: (id: string) => void
}) {
  const [filtroStatus, setFiltroStatus] = useState<StatusRelatorio | 'todos'>('todos')
  const [ordenacao, setOrdenacao] = useState<'data' | 'nome' | 'status'>('data')
  const [busca, setBusca] = useState('')
  
  const relatoriosFiltrados = useMemo(() => {
    let resultado = relatorios
    
    // Filtrar por status
    if (filtroStatus !== 'todos') {
      resultado = resultado.filter(r => r.status === filtroStatus)
    }
    
    // Filtrar por busca
    if (busca) {
      resultado = resultado.filter(r => 
        r.configuracao.nome.toLowerCase().includes(busca.toLowerCase()) ||
        r.configuracao.descricao?.toLowerCase().includes(busca.toLowerCase())
      )
    }
    
    // Ordenar
    resultado.sort((a, b) => {
      switch (ordenacao) {
        case 'nome':
          return a.configuracao.nome.localeCompare(b.configuracao.nome)
        case 'status':
          return a.status.localeCompare(b.status)
        case 'data':
        default:
          return new Date(b.gerado_em).getTime() - new Date(a.gerado_em).getTime()
      }
    })
    
    return resultado
  }, [relatorios, filtroStatus, ordenacao, busca])
  
  const getStatusColor = (status: StatusRelatorio) => {
    switch (status) {
      case 'concluido': return 'bg-green-100 text-green-800'
      case 'processando': return 'bg-blue-100 text-blue-800'
      case 'erro': return 'bg-red-100 text-red-800'
      case 'agendado': return 'bg-yellow-100 text-yellow-800'
      case 'rascunho': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  
  const getStatusIcon = (status: StatusRelatorio) => {
    switch (status) {
      case 'concluido': return CheckCircle
      case 'processando': return RefreshCw
      case 'erro': return AlertCircle
      case 'agendado': return Clock
      case 'rascunho': return Edit
      default: return Info
    }
  }
  
  return (
    <div className="space-y-4">
      {/* Filtros e busca */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar relatórios..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="concluido">Concluído</SelectItem>
            <SelectItem value="processando">Processando</SelectItem>
            <SelectItem value="erro">Erro</SelectItem>
            <SelectItem value="agendado">Agendado</SelectItem>
            <SelectItem value="rascunho">Rascunho</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={ordenacao} onValueChange={setOrdenacao}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="data">Data</SelectItem>
            <SelectItem value="nome">Nome</SelectItem>
            <SelectItem value="status">Status</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Lista de relatórios */}
      <div className="space-y-2">
        {relatoriosFiltrados.map(relatorio => {
          const StatusIcon = getStatusIcon(relatorio.status)
          
          return (
            <Card key={relatorio.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <StatusIcon className="h-5 w-5" />
                      <div>
                        <h3 className="font-semibold">{relatorio.configuracao.nome}</h3>
                        {relatorio.configuracao.descricao && (
                          <p className="text-sm text-muted-foreground">
                            {relatorio.configuracao.descricao}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-2">
                      <Badge className={getStatusColor(relatorio.status)}>
                        {relatorio.status}
                      </Badge>
                      
                      <span className="text-sm text-muted-foreground">
                        {format(relatorio.gerado_em, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </span>
                      
                      <span className="text-sm text-muted-foreground">
                        por {relatorio.gerado_por}
                      </span>
                      
                      {relatorio.configuracao.tags && relatorio.configuracao.tags.length > 0 && (
                        <div className="flex gap-1">
                          {relatorio.configuracao.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {relatorio.status === 'processando' && relatorio.progresso && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${relatorio.progresso}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {relatorio.progresso}%
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {relatorio.erro && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        {relatorio.erro}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {relatorio.status === 'concluido' && onDownload && (
                      <Button 
                        onClick={() => onDownload(relatorio.id)} 
                        size="sm" 
                        variant="outline"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {relatorio.status === 'concluido' && onCompartilhar && (
                      <Button 
                        onClick={() => onCompartilhar(relatorio.id)} 
                        size="sm" 
                        variant="outline"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {onExcluir && (
                      <Button 
                        onClick={() => onExcluir(relatorio.id)} 
                        size="sm" 
                        variant="destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      
      {relatoriosFiltrados.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum relatório encontrado</h3>
            <p className="text-muted-foreground text-center">
              {busca || filtroStatus !== 'todos' 
                ? 'Tente ajustar os filtros de busca'
                : 'Crie seu primeiro relatório para começar'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Componente principal do sistema de relatórios
export function ReportSystem({
  relatorios = [],
  configuracoes = [],
  loading = false,
  onGerarRelatorio,
  onSalvarConfiguracao,
  onExcluirRelatorio,
  onDownloadRelatorio,
  onCompartilharRelatorio,
  className,
}: ReportSystemProps) {
  const [configuracaoAtual, setConfiguracaoAtual] = useState<ConfiguracaoRelatorio>({
    nome: '',
    tipo: 'performance',
    filtros: [],
    metricas: ['avaliacoes_total', 'media_notas', 'satisfacao'],
    periodo: {
      inicio: subDays(new Date(), 30),
      fim: new Date(),
    },
    formato: 'pdf',
    incluirGraficos: true,
    incluirTabelas: true,
    incluirResumo: true,
  })
  
  const [abaSelecionada, setAbaSelecionada] = useState('novo')
  
  const handleGerarRelatorio = async () => {
    if (onGerarRelatorio) {
      await onGerarRelatorio(configuracaoAtual)
      setAbaSelecionada('relatorios')
    }
  }
  
  const handleSalvarConfiguracao = async () => {
    if (onSalvarConfiguracao) {
      await onSalvarConfiguracao(configuracaoAtual)
    }
  }
  
  const carregarConfiguracao = (config: ConfiguracaoRelatorio) => {
    setConfiguracaoAtual(config)
    setAbaSelecionada('novo')
  }
  
  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sistema de Relatórios</h1>
          <p className="text-muted-foreground mt-1">
            Crie, configure e gerencie relatórios personalizados
          </p>
        </div>
      </div>
      
      <Tabs value={abaSelecionada} onValueChange={setAbaSelecionada}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo Relatório
          </TabsTrigger>
          <TabsTrigger value="relatorios">
            <FileText className="mr-2 h-4 w-4" />
            Relatórios ({relatorios.length})
          </TabsTrigger>
          <TabsTrigger value="configuracoes">
            <Settings className="mr-2 h-4 w-4" />
            Configurações Salvas ({configuracoes.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="novo" className="space-y-6">
          <RelatorioConfigurator 
            configuracao={configuracaoAtual}
            onChange={setConfiguracaoAtual}
            onSalvar={handleSalvarConfiguracao}
            onGerar={handleGerarRelatorio}
          />
        </TabsContent>
        
        <TabsContent value="relatorios">
          <RelatoriosList 
            relatorios={relatorios}
            onDownload={onDownloadRelatorio}
            onCompartilhar={onCompartilharRelatorio}
            onExcluir={onExcluirRelatorio}
          />
        </TabsContent>
        
        <TabsContent value="configuracoes">
          <div className="space-y-4">
            {configuracoes.map((config, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{config.nome}</h3>
                      {config.descricao && (
                        <p className="text-sm text-muted-foreground">
                          {config.descricao}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">
                          {tiposRelatorio.find(t => t.valor === config.tipo)?.label}
                        </Badge>
                        <Badge variant="outline">
                          {config.metricas.length} métricas
                        </Badge>
                        {config.tags && config.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        onClick={() => carregarConfiguracao(config)} 
                        size="sm" 
                        variant="outline"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      
                      <Button 
                        onClick={() => {
                          setConfiguracaoAtual(config)
                          handleGerarRelatorio()
                        }} 
                        size="sm"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Gerar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {configuracoes.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Settings className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma configuração salva</h3>
                  <p className="text-muted-foreground text-center">
                    Salve configurações de relatórios para reutilizar facilmente
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Hook para gerenciar relatórios
export function useReports() {
  const [relatorios, setRelatorios] = useState<RelatorioGerado[]>([])
  const [configuracoes, setConfiguracoes] = useState<ConfiguracaoRelatorio[]>([])
  const [loading, setLoading] = useState(false)
  
  const gerarRelatorio = useCallback(async (config: ConfiguracaoRelatorio) => {
    setLoading(true)
    try {
      const response = await fetch('/api/relatorios/gerar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      
      if (!response.ok) {
        throw new Error('Erro ao gerar relatório')
      }
      
      const novoRelatorio = await response.json()
      setRelatorios(prev => [novoRelatorio, ...prev])
    } catch (error) {
      console.error('Erro ao gerar relatório:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])
  
  const salvarConfiguracao = useCallback(async (config: ConfiguracaoRelatorio) => {
    try {
      const response = await fetch('/api/relatorios/configuracoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      
      if (!response.ok) {
        throw new Error('Erro ao salvar configuração')
      }
      
      const novaConfiguracao = await response.json()
      setConfiguracoes(prev => [novaConfiguracao, ...prev])
    } catch (error) {
      console.error('Erro ao salvar configuração:', error)
      throw error
    }
  }, [])
  
  const downloadRelatorio = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/relatorios/${id}/download`)
      if (!response.ok) {
        throw new Error('Erro ao baixar relatório')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `relatorio-${id}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Erro ao baixar relatório:', error)
      throw error
    }
  }, [])
  
  const excluirRelatorio = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/relatorios/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Erro ao excluir relatório')
      }
      
      setRelatorios(prev => prev.filter(r => r.id !== id))
    } catch (error) {
      console.error('Erro ao excluir relatório:', error)
      throw error
    }
  }, [])
  
  return {
    relatorios,
    configuracoes,
    loading,
    gerarRelatorio,
    salvarConfiguracao,
    downloadRelatorio,
    excluirRelatorio,
  }
}