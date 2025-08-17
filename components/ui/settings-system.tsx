'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
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
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Slider } from '@/components/ui/slider'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Database,
  Mail,
  Smartphone,
  Monitor,
  Key,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  Download,
  Upload,
  Trash2,
  Plus,
  Minus,
  Edit,
  Check,
  X,
  AlertTriangle,
  Info,
  HelpCircle,
  ExternalLink,
  Copy,
  RefreshCw,
  Search,
  Filter,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Folder,
  File,
  Image,
  Video,
  Music,
  FileText,
  Archive,
  Calendar,
  Clock,
  MapPin,
  Phone,
  AtSign,
  Link,
  Tag,
  Star,
  Heart,
  Bookmark,
  Flag,
  Zap,
  Activity,
  TrendingUp,
  BarChart3,
  PieChart,
  LineChart,
  Users,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  Crown,
  Award,
  Target,
  Crosshair,
  Layers,
  Grid,
  List,
  Layout,
  Sidebar,
  Menu,
  Navigation,
  Home,
  Building,
  MapIcon,
  Compass,
  Route,
  Car,
  Plane,
  Ship,
  Train,
  Bike,
  Walk,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudSnow,
  Wind,
  Thermometer,
  Droplets,
  Umbrella,
  Rainbow,
  Sunrise,
  Sunset,
  Mountain,
  Tree,
  Flower,
  Leaf,
  Seedling,
  Cactus,
  PalmTree,
  Waves,
  Fish,
  Bird,
  Bug,
  Butterfly,
  Cat,
  Dog,
  Rabbit,
  Turtle,
  Elephant,
  Lion,
  Tiger,
  Bear,
  Wolf,
  Fox,
  Deer,
  Horse,
  Cow,
  Pig,
  Sheep,
  Chicken,
  Duck,
  Penguin,
  Owl,
  Eagle,
  Dove,
  Peacock,
  Flamingo,
  Swan,
  Parrot,
  Toucan,
  Hummingbird,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'

type TipoConfiguracao = 'string' | 'number' | 'boolean' | 'select' | 'multiselect' | 'color' | 'file' | 'json' | 'password' | 'email' | 'url' | 'date' | 'time' | 'datetime' | 'range' | 'textarea'

type CategoriaConfiguracao = 'geral' | 'usuario' | 'notificacoes' | 'seguranca' | 'aparencia' | 'integracao' | 'sistema' | 'backup' | 'logs' | 'performance' | 'custom'

type NivelPermissao = 'admin' | 'supervisor' | 'user' | 'readonly'

interface OpcaoConfiguracao {
  valor: string | number
  label: string
  descricao?: string
  icone?: React.ComponentType<{ className?: string }>
  desabilitado?: boolean
  grupo?: string
}

interface ValidacaoConfiguracao {
  obrigatorio?: boolean
  min?: number
  max?: number
  pattern?: string
  custom?: (valor: unknown) => string | null
  dependencias?: string[]
}

interface ConfiguracaoItem {
  id: string
  chave: string
  nome: string
  descricao: string
  categoria: CategoriaConfiguracao
  tipo: TipoConfiguracao
  valor_atual: unknown
  valor_padrao: unknown
  opcoes?: OpcaoConfiguracao[]
  validacao?: ValidacaoConfiguracao
  nivel_permissao: NivelPermissao
  visivel: boolean
  editavel: boolean
  reiniciar_requerido: boolean
  grupo?: string
  ordem: number
  tags: string[]
  metadata: {
    unidade?: string
    placeholder?: string
    help_text?: string
    warning_text?: string
    link_documentacao?: string
    versao_introducao?: string
    deprecado?: boolean
    experimental?: boolean
  }
  historico: {
    timestamp: Date
    valor_anterior: unknown
    valor_novo: unknown
    usuario: string
    motivo?: string
  }[]
}

interface PerfilConfiguracao {
  id: string
  nome: string
  descricao: string
  configuracoes: Record<string, unknown>
  usuario_id?: string
  publico: boolean
  padrao: boolean
  criado_em: Date
  atualizado_em: Date
  tags: string[]
  metadata: Record<string, unknown>
}

interface BackupConfiguracao {
  id: string
  nome: string
  configuracoes: Record<string, unknown>
  criado_em: Date
  criado_por: string
  descricao?: string
  automatico: boolean
  tamanho: number
  checksum: string
}

interface SettingsSystemProps {
  configuracoes?: ConfiguracaoItem[]
  perfis?: PerfilConfiguracao[]
  backups?: BackupConfiguracao[]
  usuario_atual?: {
    id: string
    nome: string
    tipo: NivelPermissao
  }
  loading?: boolean
  onSalvarConfiguracao?: (chave: string, valor: unknown) => Promise<void>
  onResetarConfiguracao?: (chave: string) => Promise<void>
  onImportarConfiguracoes?: (arquivo: File) => Promise<void>
  onExportarConfiguracoes?: (categorias?: CategoriaConfiguracao[]) => Promise<void>
  onCriarPerfil?: (perfil: Omit<PerfilConfiguracao, 'id' | 'criado_em' | 'atualizado_em'>) => Promise<void>
  onAplicarPerfil?: (perfil_id: string) => Promise<void>
  onCriarBackup?: (nome: string, descricao?: string) => Promise<void>
  onRestaurarBackup?: (backup_id: string) => Promise<void>
  onBuscarConfiguracoes?: (termo: string) => Promise<void>
  className?: string
}

const categoriasConfiguracao = [
  { valor: 'geral', label: 'Geral', icone: Settings, descricao: 'Configurações gerais do sistema' },
  { valor: 'usuario', label: 'Usuário', icone: User, descricao: 'Preferências pessoais do usuário' },
  { valor: 'notificacoes', label: 'Notificações', icone: Bell, descricao: 'Configurações de notificações e alertas' },
  { valor: 'seguranca', label: 'Segurança', icone: Shield, descricao: 'Configurações de segurança e privacidade' },
  { valor: 'aparencia', label: 'Aparência', icone: Palette, descricao: 'Temas, cores e layout' },
  { valor: 'integracao', label: 'Integrações', icone: Globe, descricao: 'APIs e serviços externos' },
  { valor: 'sistema', label: 'Sistema', icone: Database, descricao: 'Configurações técnicas do sistema' },
  { valor: 'backup', label: 'Backup', icone: Archive, descricao: 'Configurações de backup e restauração' },
  { valor: 'logs', label: 'Logs', icone: FileText, descricao: 'Configurações de logging e auditoria' },
  { valor: 'performance', label: 'Performance', icone: Activity, descricao: 'Otimizações e cache' },
]



// Componente para renderizar um campo de configuração
function ConfiguracaoField({ configuracao, valor, onChange, disabled }: {
  configuracao: ConfiguracaoItem
  valor: unknown
  onChange: (valor: unknown) => void
  disabled?: boolean
}) {
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  
  const validarValor = useCallback((novoValor: unknown) => {
    if (!configuracao.validacao) return null
    
    const { obrigatorio, min, max, pattern, custom } = configuracao.validacao
    
    if (obrigatorio && (!novoValor || novoValor === '')) {
      return 'Este campo é obrigatório'
    }
    
    if (typeof novoValor === 'string' && pattern) {
      const regex = new RegExp(pattern)
      if (!regex.test(novoValor)) {
        return 'Formato inválido'
      }
    }
    
    if (typeof novoValor === 'number') {
      if (min !== undefined && novoValor < min) {
        return `Valor mínimo: ${min}`
      }
      if (max !== undefined && novoValor > max) {
        return `Valor máximo: ${max}`
      }
    }
    
    if (custom) {
      return custom(novoValor)
    }
    
    return null
  }, [configuracao.validacao])
  
  const handleChange = useCallback((novoValor: unknown) => {
    const erroValidacao = validarValor(novoValor)
    setErro(erroValidacao)
    
    if (!erroValidacao) {
      onChange(novoValor)
    }
  }, [onChange, validarValor])
  
  const renderField = () => {
    switch (configuracao.tipo) {
      case 'boolean':
        return (
          <Switch
            checked={valor || false}
            onCheckedChange={handleChange}
            disabled={disabled}
          />
        )
      
      case 'number':
        return (
          <Input
            type="number"
            value={valor || ''}
            onChange={(e) => handleChange(Number(e.target.value))}
            placeholder={configuracao.metadata.placeholder}
            disabled={disabled}
            min={configuracao.validacao?.min}
            max={configuracao.validacao?.max}
          />
        )
      
      case 'password':
        return (
          <div className="relative">
            <Input
              type={mostrarSenha ? 'text' : 'password'}
              value={valor || ''}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={configuracao.metadata.placeholder}
              disabled={disabled}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setMostrarSenha(!mostrarSenha)}
              disabled={disabled}
            >
              {mostrarSenha ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        )
      
      case 'select':
        return (
          <Select value={valor || ''} onValueChange={handleChange} disabled={disabled}>
            <SelectTrigger>
              <SelectValue placeholder={configuracao.metadata.placeholder || 'Selecione...'} />
            </SelectTrigger>
            <SelectContent>
              {configuracao.opcoes?.map(opcao => (
                <SelectItem 
                  key={opcao.valor} 
                  value={String(opcao.valor)}
                  disabled={opcao.desabilitado}
                >
                  <div className="flex items-center gap-2">
                    {opcao.icone && <opcao.icone className="h-4 w-4" />}
                    <span>{opcao.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      
      case 'multiselect':
        const valoresArray = Array.isArray(valor) ? valor : []
        return (
          <div className="space-y-2">
            {configuracao.opcoes?.map(opcao => (
              <div key={opcao.valor} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`${configuracao.id}-${opcao.valor}`}
                  checked={valoresArray.includes(opcao.valor)}
                  onChange={(e) => {
                    const novosValores = e.target.checked
                      ? [...valoresArray, opcao.valor]
                      : valoresArray.filter(v => v !== opcao.valor)
                    handleChange(novosValores)
                  }}
                  disabled={disabled || opcao.desabilitado}
                  className="rounded border-gray-300"
                />
                <label 
                  htmlFor={`${configuracao.id}-${opcao.valor}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  <div className="flex items-center gap-2">
                    {opcao.icone && <opcao.icone className="h-4 w-4" />}
                    <span>{opcao.label}</span>
                  </div>
                </label>
              </div>
            ))}
          </div>
        )
      
      case 'color':
        return (
          <div className="flex items-center gap-2">
            <Input
              type="color"
              value={valor || '#000000'}
              onChange={(e) => handleChange(e.target.value)}
              disabled={disabled}
              className="w-16 h-10 p-1 border rounded"
            />
            <Input
              type="text"
              value={valor || ''}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="#000000"
              disabled={disabled}
              className="flex-1"
            />
          </div>
        )
      
      case 'range':
        const [min, max] = Array.isArray(valor) ? valor : [0, 100]
        return (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Mín: {min}</span>
              <span>Máx: {max}</span>
            </div>
            <Slider
              value={[min, max]}
              onValueChange={([novoMin, novoMax]) => handleChange([novoMin, novoMax])}
              min={configuracao.validacao?.min || 0}
              max={configuracao.validacao?.max || 100}
              step={1}
              disabled={disabled}
              className="w-full"
            />
          </div>
        )
      
      case 'textarea':
        return (
          <Textarea
            value={valor || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={configuracao.metadata.placeholder}
            disabled={disabled}
            rows={4}
          />
        )
      
      case 'json':
        return (
          <Textarea
            value={typeof valor === 'object' ? JSON.stringify(valor, null, 2) : valor || ''}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value)
                handleChange(parsed)
              } catch {
                // Manter o valor como string se não for JSON válido
                handleChange(e.target.value)
              }
            }}
            placeholder={configuracao.metadata.placeholder || '{}'}
            disabled={disabled}
            rows={6}
            className="font-mono text-sm"
          />
        )
      
      case 'file':
        return (
          <Input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                handleChange(file)
              }
            }}
            disabled={disabled}
          />
        )
      
      case 'date':
        return (
          <Input
            type="date"
            value={valor ? format(new Date(valor), 'yyyy-MM-dd') : ''}
            onChange={(e) => handleChange(e.target.value ? new Date(e.target.value) : null)}
            disabled={disabled}
          />
        )
      
      case 'time':
        return (
          <Input
            type="time"
            value={valor || ''}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled}
          />
        )
      
      case 'datetime':
        return (
          <Input
            type="datetime-local"
            value={valor ? format(new Date(valor), "yyyy-MM-dd'T'HH:mm") : ''}
            onChange={(e) => handleChange(e.target.value ? new Date(e.target.value) : null)}
            disabled={disabled}
          />
        )
      
      default:
        return (
          <Input
            type={configuracao.tipo === 'email' ? 'email' : configuracao.tipo === 'url' ? 'url' : 'text'}
            value={valor || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={configuracao.metadata.placeholder}
            disabled={disabled}
          />
        )
    }
  }
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={configuracao.id} className="text-sm font-medium">
          {configuracao.nome}
          {configuracao.validacao?.obrigatorio && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </Label>
        
        <div className="flex items-center gap-2">
          {configuracao.metadata.experimental && (
            <Badge variant="outline" className="text-xs">
              Experimental
            </Badge>
          )}
          
          {configuracao.metadata.deprecado && (
            <Badge variant="destructive" className="text-xs">
              Depreciado
            </Badge>
          )}
          
          {configuracao.reiniciar_requerido && (
            <Badge variant="secondary" className="text-xs">
              Reiniciar
            </Badge>
          )}
        </div>
      </div>
      
      {renderField()}
      
      {erro && (
        <p className="text-sm text-red-600">{erro}</p>
      )}
      
      {configuracao.descricao && (
        <p className="text-sm text-muted-foreground">{configuracao.descricao}</p>
      )}
      
      {configuracao.metadata.help_text && (
        <div className="flex items-start gap-2 p-2 bg-blue-50 rounded text-sm">
          <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <span className="text-blue-800">{configuracao.metadata.help_text}</span>
        </div>
      )}
      
      {configuracao.metadata.warning_text && (
        <div className="flex items-start gap-2 p-2 bg-yellow-50 rounded text-sm">
          <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
          <span className="text-yellow-800">{configuracao.metadata.warning_text}</span>
        </div>
      )}
      
      {configuracao.metadata.link_documentacao && (
        <a 
          href={configuracao.metadata.link_documentacao}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
        >
          <ExternalLink className="h-3 w-3" />
          Documentação
        </a>
      )}
    </div>
  )
}

// Componente principal do sistema de configurações
export function SettingsSystem({
  configuracoes = [],
  perfis = [],
  backups = [],
  usuario_atual,
  loading = false,
  onSalvarConfiguracao,
  onResetarConfiguracao,

  className,
}: SettingsSystemProps) {
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<CategoriaConfiguracao>('geral')
  const [termoBusca, setTermoBusca] = useState('')
  const [configuracoesPendentes, setConfiguracoesPendentes] = useState<Record<string, unknown>>({})
  const [mostrarAvancado, setMostrarAvancado] = useState(false)
  const [dialogPerfil, setDialogPerfil] = useState(false)
  const [dialogBackup, setDialogBackup] = useState(false)

  
  // Filtrar configurações por categoria e busca
  const configuracoesFiltradas = useMemo(() => {
    let filtradas = configuracoes.filter(config => {
      // Filtro por categoria
      if (categoriaSelecionada !== 'geral' && config.categoria !== categoriaSelecionada) {
        return false
      }
      
      // Filtro por busca
      if (termoBusca) {
        const termo = termoBusca.toLowerCase()
        return (
          config.nome.toLowerCase().includes(termo) ||
          config.descricao.toLowerCase().includes(termo) ||
          config.chave.toLowerCase().includes(termo) ||
          config.tags.some(tag => tag.toLowerCase().includes(termo))
        )
      }
      
      return true
    })
    
    // Filtro por nível avançado
    if (!mostrarAvancado) {
      filtradas = filtradas.filter(config => 
        !config.tags.includes('avancado') && 
        !config.metadata.experimental
      )
    }
    
    // Filtro por permissão
    if (usuario_atual) {
      filtradas = filtradas.filter(config => {
        switch (usuario_atual.tipo) {
          case 'admin': return true
          case 'supervisor': return ['admin', 'supervisor'].includes(config.nivel_permissao)
          case 'user': return ['admin', 'supervisor', 'user'].includes(config.nivel_permissao)
          default: return config.nivel_permissao === 'readonly'
        }
      })
    }
    
    return filtradas.sort((a, b) => a.ordem - b.ordem)
  }, [configuracoes, categoriaSelecionada, termoBusca, mostrarAvancado, usuario_atual])
  
  // Agrupar configurações
  const configuracaesAgrupadas = useMemo(() => {
    const grupos: Record<string, ConfiguracaoItem[]> = {}
    
    configuracoesFiltradas.forEach(config => {
      const grupo = config.grupo || 'Geral'
      if (!grupos[grupo]) {
        grupos[grupo] = []
      }
      grupos[grupo].push(config)
    })
    
    return grupos
  }, [configuracoesFiltradas])
  
  const handleSalvarConfiguracao = useCallback(async (chave: string, valor: unknown) => {
    try {
      if (onSalvarConfiguracao) {
        await onSalvarConfiguracao(chave, valor)
        toast.success('Configuração salva com sucesso')
        
        // Remover da lista de pendentes
        setConfiguracoesPendentes(prev => {
          const nova = { ...prev }
          delete nova[chave]
          return nova
        })
      }
    } catch (error) {
      console.error('Erro ao salvar configuração:', error)
      toast.error('Erro ao salvar configuração')
    }
  }, [onSalvarConfiguracao])
  
  const handleResetarConfiguracao = useCallback(async (chave: string) => {
    try {
      if (onResetarConfiguracao) {
        await onResetarConfiguracao(chave)
        toast.success('Configuração resetada para o valor padrão')
        
        // Remover da lista de pendentes
        setConfiguracoesPendentes(prev => {
          const nova = { ...prev }
          delete nova[chave]
          return nova
        })
      }
    } catch (error) {
      console.error('Erro ao resetar configuração:', error)
      toast.error('Erro ao resetar configuração')
    }
  }, [onResetarConfiguracao])
  
  const handleAlterarConfiguracao = useCallback((chave: string, valor: unknown) => {
    setConfiguracoesPendentes(prev => ({
      ...prev,
      [chave]: valor
    }))
  }, [])
  
  const handleSalvarTodas = useCallback(async () => {
    try {
      const promises = Object.entries(configuracoesPendentes).map(([chave, valor]) => 
        onSalvarConfiguracao?.(chave, valor)
      )
      
      await Promise.all(promises)
      setConfiguracoesPendentes({})
      toast.success(`${Object.keys(configuracoesPendentes).length} configurações salvas`)
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      toast.error('Erro ao salvar algumas configurações')
    }
  }, [configuracoesPendentes, onSalvarConfiguracao])
  
  const handleExportar = useCallback(async () => {
    try {
      if (onExportarConfiguracoes) {
        await onExportarConfiguracoes([categoriaSelecionada])
        toast.success('Configurações exportadas com sucesso')
      }
    } catch (error) {
      console.error('Erro ao exportar configurações:', error)
      toast.error('Erro ao exportar configurações')
    }
  }, [categoriaSelecionada])
  
  const handleCriarBackup = useCallback(async () => {
    try {
      if (onCriarBackup) {
        const nome = `Backup ${format(new Date(), 'dd/MM/yyyy HH:mm')}`
        await onCriarBackup(nome, 'Backup manual das configurações')
        toast.success('Backup criado com sucesso')
        setDialogBackup(false)
      }
    } catch (error) {
      console.error('Erro ao criar backup:', error)
      toast.error('Erro ao criar backup')
    }
  }, [])
  
  const configuracoesPendentesCount = Object.keys(configuracoesPendentes).length
  
  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie as configurações do sistema e preferências pessoais
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {configuracoesPendentesCount > 0 && (
            <Button onClick={handleSalvarTodas} className="relative">
              <Save className="h-4 w-4 mr-2" />
              Salvar Todas
              <Badge className="ml-2 bg-white text-primary">
                {configuracoesPendentesCount}
              </Badge>
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportar}>
                <Download className="h-4 w-4 mr-2" />
                Exportar Configurações
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => setDialogBackup(true)}>
                <Archive className="h-4 w-4 mr-2" />
                Criar Backup
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => setDialogPerfil(true)}>
                <User className="h-4 w-4 mr-2" />
                Gerenciar Perfis
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem>
                <RefreshCw className="h-4 w-4 mr-2" />
                Recarregar Configurações
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Busca e filtros */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar configurações..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Label htmlFor="mostrar-avancado" className="text-sm">
            Mostrar avançadas
          </Label>
          <Switch
            id="mostrar-avancado"
            checked={mostrarAvancado}
            onCheckedChange={setMostrarAvancado}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar de categorias */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Categorias</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {categoriasConfiguracao.map(categoria => {
                  const count = configuracoes.filter(c => c.categoria === categoria.valor).length
                  const IconeCategoria = categoria.icone
                  
                  return (
                    <button
                      key={categoria.valor}
                      onClick={() => setCategoriaSelecionada(categoria.valor as CategoriaConfiguracao)}
                      className={cn(
                        'w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted transition-colors',
                        categoriaSelecionada === categoria.valor && 'bg-muted border-r-2 border-primary'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <IconeCategoria className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{categoria.label}</div>
                          <div className="text-xs text-muted-foreground">{categoria.descricao}</div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {count}
                      </Badge>
                    </button>
                  )
                })}
              </nav>
            </CardContent>
          </Card>
        </div>
        
        {/* Conteúdo principal */}
        <div className="lg:col-span-3 space-y-6">
          {Object.entries(configuracaesAgrupadas).map(([grupo, configs]) => (
            <Card key={grupo}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{grupo}</span>
                  <Badge variant="outline">
                    {configs.length} {configs.length === 1 ? 'item' : 'itens'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {configs.map(configuracao => {
                  const valorAtual = configuracoesPendentes[configuracao.chave] ?? configuracao.valor_atual
                  const temAlteracao = configuracoesPendentes.hasOwnProperty(configuracao.chave)
                  const podeEditar = configuracao.editavel && usuario_atual && 
                    ['admin', 'supervisor'].includes(usuario_atual.tipo)
                  
                  return (
                    <div key={configuracao.id} className={cn(
                      'p-4 border rounded-lg',
                      temAlteracao && 'border-yellow-300 bg-yellow-50'
                    )}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <ConfiguracaoField
                            configuracao={configuracao}
                            valor={valorAtual}
                            onChange={(valor) => handleAlterarConfiguracao(configuracao.chave, valor)}
                            disabled={!podeEditar}
                          />
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          {temAlteracao && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleSalvarConfiguracao(configuracao.chave, valorAtual)}
                                disabled={loading}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setConfiguracoesPendentes(prev => {
                                    const nova = { ...prev }
                                    delete nova[configuracao.chave]
                                    return nova
                                  })
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          
                          {podeEditar && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="ghost">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  onClick={() => handleResetarConfiguracao(configuracao.chave)}
                                >
                                  <RotateCcw className="h-4 w-4 mr-2" />
                                  Resetar para Padrão
                                </DropdownMenuItem>
                                
                                <DropdownMenuItem 
                                  onClick={() => {
                                    navigator.clipboard.writeText(String(valorAtual))
                                    toast.success('Valor copiado')
                                  }}
                                >
                                  <Copy className="h-4 w-4 mr-2" />
                                  Copiar Valor
                                </DropdownMenuItem>
                                
                                {configuracao.historico.length > 0 && (
                                  <DropdownMenuItem>
                                    <Clock className="h-4 w-4 mr-2" />
                                    Ver Histórico
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                      
                      {/* Informações adicionais */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <span>Chave: {configuracao.chave}</span>
                          {configuracao.valor_padrao !== undefined && (
                            <span>Padrão: {String(configuracao.valor_padrao)}</span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {configuracao.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          ))}
          
          {configuracoesFiltradas.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Settings className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma configuração encontrada</h3>
                <p className="text-muted-foreground text-center">
                  {termoBusca 
                    ? `Nenhuma configuração corresponde à busca "${termoBusca}"`
                    : 'Nenhuma configuração disponível nesta categoria'
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Dialog para gerenciar perfis */}
      <Dialog open={dialogPerfil} onOpenChange={setDialogPerfil}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gerenciar Perfis de Configuração</DialogTitle>
            <DialogDescription>
              Crie, aplique ou gerencie perfis de configuração salvos
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {perfis.map(perfil => (
                <Card key={perfil.id} className={cn(
                  'cursor-pointer transition-colors',
                  perfilSelecionado === perfil.id && 'border-primary'
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{perfil.nome}</h4>
                        <p className="text-sm text-muted-foreground">{perfil.descricao}</p>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {perfil.padrao && (
                          <Badge variant="default" className="text-xs">
                            Padrão
                          </Badge>
                        )}
                        
                        {perfil.publico && (
                          <Badge variant="outline" className="text-xs">
                            Público
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground mb-3">
                      Criado em {format(perfil.criado_em, 'dd/MM/yyyy', { locale: ptBR })}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => onAplicarPerfil?.(perfil.id)}
                        className="flex-1"
                      >
                        Aplicar
                      </Button>
                      
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogPerfil(false)}>
              Fechar
            </Button>
            
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Criar Novo Perfil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog para gerenciar backups */}
      <Dialog open={dialogBackup} onOpenChange={setDialogBackup}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gerenciar Backups</DialogTitle>
            <DialogDescription>
              Crie backups das configurações ou restaure de backups anteriores
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {backups.map(backup => (
                <Card key={backup.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{backup.nome}</h4>
                        <p className="text-sm text-muted-foreground">{backup.descricao}</p>
                        <div className="text-xs text-muted-foreground mt-1">
                          Criado por {backup.criado_por} em {format(backup.criado_em, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {(backup.tamanho / 1024).toFixed(1)} KB
                        </Badge>
                        
                        {backup.automatico && (
                          <Badge variant="secondary" className="text-xs">
                            Auto
                          </Badge>
                        )}
                        
                        <Button 
                          size="sm" 
                          onClick={() => onRestaurarBackup?.(backup.id)}
                        >
                          Restaurar
                        </Button>
                        
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                        
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogBackup(false)}>
              Fechar
            </Button>
            
            <Button onClick={handleCriarBackup}>
              <Archive className="h-4 w-4 mr-2" />
              Criar Backup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Hook para gerenciar configurações
export function useSettingsSystem() {
  const [configuracoes, setConfiguracoes] = useState<ConfiguracaoItem[]>([])
  const [perfis] = useState<PerfilConfiguracao[]>([])
  const [backups, setBackups] = useState<BackupConfiguracao[]>([])
  const [loading, setLoading] = useState(false)
  
  const carregarConfiguracoes = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/settings/configuracoes')
      if (response.ok) {
        const data = await response.json()
        setConfiguracoes(data.data)
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])
  
  const salvarConfiguracao = useCallback(async (chave: string, valor: unknown) => {
    try {
      const response = await fetch('/api/settings/configuracoes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chave, valor }),
      })
      
      if (!response.ok) {
        throw new Error('Erro ao salvar configuração')
      }
      
      await carregarConfiguracoes()
    } catch (error) {
      console.error('Erro ao salvar configuração:', error)
      throw error
    }
  }, [carregarConfiguracoes])
  
  const resetarConfiguracao = useCallback(async (chave: string) => {
    try {
      const response = await fetch(`/api/settings/configuracoes/${chave}/reset`, {
        method: 'POST',
      })
      
      if (!response.ok) {
        throw new Error('Erro ao resetar configuração')
      }
      
      await carregarConfiguracoes()
    } catch (error) {
      console.error('Erro ao resetar configuração:', error)
      throw error
    }
  }, [carregarConfiguracoes])
  
  const exportarConfiguracoes = useCallback(async (categorias?: CategoriaConfiguracao[]) => {
    try {
      const params = new URLSearchParams()
      if (categorias) {
        params.append('categorias', categorias.join(','))
      }
      
      const response = await fetch(`/api/settings/export?${params}`)
      if (!response.ok) {
        throw new Error('Erro ao exportar configurações')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `configuracoes-${format(new Date(), 'yyyy-MM-dd')}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Erro ao exportar configurações:', error)
      throw error
    }
  }, [])
  
  const criarBackup = useCallback(async (nome: string, descricao?: string) => {
    try {
      const response = await fetch('/api/settings/backups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, descricao }),
      })
      
      if (!response.ok) {
        throw new Error('Erro ao criar backup')
      }
      
      // Recarregar lista de backups
      const backupsResponse = await fetch('/api/settings/backups')
      if (backupsResponse.ok) {
        const data = await backupsResponse.json()
        setBackups(data.data)
      }
    } catch (error) {
      console.error('Erro ao criar backup:', error)
      throw error
    }
  }, [])
  
  return {
    configuracoes,
    perfis,
    backups,
    loading,
    carregarConfiguracoes,
    salvarConfiguracao,
    resetarConfiguracao,
    exportarConfiguracoes,
    criarBackup,
  }
}