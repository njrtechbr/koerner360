'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
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
  Plug,
  Webhook,
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
  Play,
  Pause,
  Square,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium,
  SignalZero,
  Activity,
  TrendingUp,
  TrendingDown,
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
  Zap,
  Link2,
  Unlink,
  Share,
  Share2,
  Send,
  MessageSquare,
  MessageCircle,
  Phone,
  PhoneCall,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Image,
  FileText,
  File,
  Folder,
  Archive,
  Package,
  Box,
  Truck,
  ShoppingCart,
  CreditCard,
  DollarSign,
  Euro,
  PoundSterling,
  Yen,
  Bitcoin,
  Banknote,
  Wallet,
  Receipt,
  Calculator,
  Calendar,
  Clock,
  Timer,
  Stopwatch,
  AlarmClock,
  Hourglass,
  MapPin,
  Map,
  Navigation2,
  Locate,
  LocateFixed,
  LocateOff,
  Radar,
  Satellite,
  Anchor,
  Flag,
  Bookmark,
  Tag,
  Tags,
  Star,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Smile,
  Frown,
  Meh,
  Angry,
  Laugh,
  Cry,
  Kiss,
  Wink,
  Surprised,
  Confused,
  Sleepy,
  Dizzy,
  Sick,
  Dead,
  Ghost,
  Alien,
  Robot,
  Monster,
  Skull,
  Crossbones,
  Biohazard,
  Radioactive,
  Warning,
  Danger,
  Construction,
  Wrench,
  Hammer,
  Screwdriver,
  Drill,
  Saw,
  Scissors,
  Ruler,
  Pencil,
  Pen,
  Paintbrush,
  Palette,
  Eraser,
  Paperclip,
  Pin,
  Pushpin,
  Thumbtack,
  Magnet,
  Flashlight,
  Candle,
  Lightbulb,
  Lamp,
  Lantern,
  Torch,
  Fire,
  Flame,
  Campfire,
  Fireplace,
  Chimney,
  Smoke,
  Steam,
  Snowflake,
  Snowman,
  IceCream,
  Cake,
  Cookie,
  Candy,
  Lollipop,
  Chocolate,
  Donut,
  Pizza,
  Hamburger,
  HotDog,
  Sandwich,
  Taco,
  Burrito,
  Salad,
  Soup,
  Stew,
  Pasta,
  Noodles,
  Rice,
  Bread,
  Croissant,
  Bagel,
  Pretzel,
  Cheese,
  Egg,
  Bacon,
  Sausage,
  Chicken2,
  Turkey,
  Duck2,
  Fish2,
  Shrimp,
  Lobster,
  Crab,
  Oyster,
  Clam,
  Squid,
  Octopus,
  Jellyfish,
  Starfish,
  Seahorse,
  Whale,
  Dolphin,
  Shark,
  Stingray,
  Turtle2,
  Frog,
  Lizard,
  Snake,
  Crocodile,
  Dinosaur,
  Dragon,
  Unicorn,
  Pegasus,
  Phoenix,
  Griffin,
  Sphinx,
  Centaur,
  Mermaid,
  Fairy,
  Angel,
  Devil,
  Demon,
  Vampire,
  Zombie,
  Witch,
  Wizard,
  Mage,
  Sorcerer,
  Warlock,
  Necromancer,
  Paladin,
  Knight,
  Warrior,
  Archer,
  Rogue,
  Assassin,
  Ninja,
  Samurai,
  Pirate,
  Viking,
  Barbarian,
  Gladiator,
  Spartan,
  Roman,
  Greek,
  Egyptian,
  Aztec,
  Mayan,
  Inca,
  Chinese,
  Japanese,
  Korean,
  Indian,
  Arabic,
  Persian,
  Turkish,
  Russian,
  German,
  French,
  Italian,
  Spanish,
  Portuguese,
  Dutch,
  Swedish,
  Norwegian,
  Danish,
  Finnish,
  Polish,
  Czech,
  Hungarian,
  Romanian,
  Bulgarian,
  Serbian,
  Croatian,
  Slovenian,
  Slovak,
  Lithuanian,
  Latvian,
  Estonian,
  Ukrainian,
  Belarusian,
  Moldovan,
  Georgian,
  Armenian,
  Azerbaijani,
  Kazakh,
  Uzbek,
  Turkmen,
  Kyrgyz,
  Tajik,
  Afghan,
  Pakistani,
  Bangladeshi,
  Sri Lankan,
  Nepalese,
  Bhutanese,
  Maldivian,
  Thai,
  Vietnamese,
  Cambodian,
  Laotian,
  Burmese,
  Malaysian,
  Singaporean,
  Indonesian,
  Filipino,
  Bruneian,
  Timorese,
  Papua New Guinean,
  Australian,
  New Zealander,
  Fijian,
  Tongan,
  Samoan,
  Tahitian,
  Hawaiian,
  Alaskan,
  Canadian,
  American,
  Mexican,
  Guatemalan,
  Belizean,
  Salvadoran,
  Honduran,
  Nicaraguan,
  Costa Rican,
  Panamanian,
  Colombian,
  Venezuelan,
  Guyanese,
  Surinamese,
  French Guianese,
  Brazilian,
  Uruguayan,
  Argentinian,
  Chilean,
  Bolivian,
  Paraguayan,
  Peruvian,
  Ecuadorian,
  Cuban,
  Jamaican,
  Haitian,
  Dominican,
  Puerto Rican,
  Trinidadian,
  Barbadian,
  Grenadian,
  Saint Lucian,
  Saint Vincentian,
  Antiguan,
  Kittitian,
  Nevisian,
  Montserratian,
  Anguillan,
  British Virgin Islander,
  US Virgin Islander,
  Caymanian,
  Turks and Caicos Islander,
  Bahamian,
  Bermudian,
  Greenlandic,
  Icelandic,
  Faroese,
  Irish,
  British,
  Welsh,
  Scottish,
  English,
  Northern Irish,
  Manx,
  Channel Islander,
  Gibraltarian,
  Maltese,
  Cypriot,
  Albanian,
  Montenegrin,
  Bosnian,
  Herzegovinian,
  Macedonian,
  Kosovar,
  Andorran,
  Monégasque,
  San Marinese,
  Vatican,
  Liechtensteiner,
  Swiss,
  Austrian,
  Belgian,
  Luxembourgish,
  Moroccan,
  Algerian,
  Tunisian,
  Libyan,
  Egyptian2,
  Sudanese,
  South Sudanese,
  Ethiopian,
  Eritrean,
  Djiboutian,
  Somali,
  Kenyan,
  Ugandan,
  Tanzanian,
  Rwandan,
  Burundian,
  Congolese,
  Central African,
  Cameroonian,
  Equatorial Guinean,
  Gabonese,
  São Toméan,
  Angolan,
  Zambian,
  Malawian,
  Mozambican,
  Zimbabwean,
  Botswanan,
  Namibian,
  South African,
  Swazi,
  Lesothan,
  Malagasy,
  Mauritian,
  Seychellois,
  Comorian,
  Mayotte,
  Réunionese,
  Saint Helenian,
  Ascension Islander,
  Tristan da Cunhan,
  Nigerian,
  Ghanaian,
  Ivorian,
  Burkinabé,
  Malian,
  Senegalese,
  Mauritanian,
  Gambian,
  Guinea-Bissauan,
  Guinean,
  Sierra Leonean,
  Liberian,
  Togolese,
  Beninese,
  Nigerien,
  Chadian,
  Israeli,
  Palestinian,
  Jordanian,
  Lebanese,
  Syrian,
  Iraqi,
  Iranian,
  Saudi Arabian,
  Yemeni,
  Omani,
  Emirati,
  Qatari,
  Bahraini,
  Kuwaiti,
  Mongolian,
  North Korean,
  South Korean,
  Taiwanese,
  Hong Konger,
  Macanese,
  Tibetan,
  Uyghur,
  Hui,
  Manchu,
  Zhuang,
  Miao,
  Yi,
  Tujia,
  Mongol,
  Tibetan2,
  Uyghur2,
  Hui2,
  Manchu2,
  Zhuang2,
  Miao2,
  Yi2,
  Tujia2,
  Mongol2,
  Bell,
  Shield,
  Hand,
  CheckCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'

type TipoIntegracao = 'api' | 'webhook' | 'database' | 'email' | 'sms' | 'push' | 'file' | 'oauth' | 'saml' | 'ldap' | 'custom'

type StatusIntegracao = 'ativo' | 'inativo' | 'erro' | 'configurando' | 'testando' | 'pausado' | 'manutencao'

type MetodoHttp = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'

type TipoAutenticacao = 'none' | 'basic' | 'bearer' | 'api_key' | 'oauth1' | 'oauth2' | 'jwt' | 'custom'

type FrequenciaSincronizacao = 'manual' | 'tempo_real' | '1min' | '5min' | '15min' | '30min' | '1h' | '6h' | '12h' | '24h' | 'semanal' | 'mensal'

interface ConfiguracaoAutenticacao {
  tipo: TipoAutenticacao
  credenciais: Record<string, any>
  headers_customizados?: Record<string, string>
  parametros_url?: Record<string, string>
  token_refresh?: {
    endpoint: string
    metodo: MetodoHttp
    campos: Record<string, string>
  }
}

interface ConfiguracaoWebhook {
  url: string
  metodo: MetodoHttp
  headers: Record<string, string>
  payload_template?: string
  retry_config: {
    max_tentativas: number
    delay_inicial: number
    backoff_multiplicador: number
    timeout: number
  }
  filtros?: {
    eventos: string[]
    condicoes: Record<string, any>
  }
}

interface ConfiguracaoSincronizacao {
  frequencia: FrequenciaSincronizacao
  direcao: 'entrada' | 'saida' | 'bidirecional'
  mapeamento_campos: Record<string, string>
  transformacoes?: {
    campo: string
    funcao: string
    parametros?: Record<string, any>
  }[]
  filtros?: {
    condicoes: Record<string, any>
    limite_registros?: number
  }
}

interface LogIntegracao {
  id: string
  timestamp: Date
  tipo: 'request' | 'response' | 'error' | 'sync' | 'webhook'
  status: 'sucesso' | 'erro' | 'warning'
  detalhes: {
    url?: string
    metodo?: string
    status_code?: number
    tempo_resposta?: number
    tamanho_payload?: number
    erro_mensagem?: string
    dados_enviados?: any
    dados_recebidos?: any
  }
  metadata: Record<string, any>
}

interface MetricaIntegracao {
  total_requests: number
  requests_sucesso: number
  requests_erro: number
  tempo_resposta_medio: number
  tempo_resposta_p95: number
  uptime_percentual: number
  ultima_sincronizacao: Date | null
  proxima_sincronizacao: Date | null
  dados_sincronizados: number
  erros_consecutivos: number
  status_saude: 'saudavel' | 'degradado' | 'critico'
}

interface Integracao {
  id: string
  nome: string
  descricao: string
  tipo: TipoIntegracao
  status: StatusIntegracao
  provedor: string
  versao: string
  url_base?: string
  configuracao_auth: ConfiguracaoAutenticacao
  configuracao_webhook?: ConfiguracaoWebhook
  configuracao_sync?: ConfiguracaoSincronizacao
  configuracoes_customizadas: Record<string, any>
  ativo: boolean
  criado_em: Date
  atualizado_em: Date
  criado_por: string
  tags: string[]
  dependencias: string[]
  metricas: MetricaIntegracao
  logs_recentes: LogIntegracao[]
  metadata: {
    documentacao_url?: string
    suporte_url?: string
    changelog_url?: string
    icone?: string
    cor?: string
    categoria?: string
    popularidade?: number
    rating?: number
    certificacoes?: string[]
  }
}

interface TemplateIntegracao {
  id: string
  nome: string
  descricao: string
  tipo: TipoIntegracao
  provedor: string
  configuracao_padrao: Partial<Integracao>
  campos_obrigatorios: string[]
  campos_opcionais: string[]
  exemplos: {
    nome: string
    descricao: string
    configuracao: Record<string, any>
  }[]
  documentacao: {
    setup_guide: string
    api_reference: string
    troubleshooting: string
  }
  metadata: {
    icone: string
    cor: string
    categoria: string
    popularidade: number
    dificuldade: 'facil' | 'medio' | 'dificil'
    tempo_setup: string
  }
}

interface IntegrationSystemProps {
  integracoes?: Integracao[]
  templates?: TemplateIntegracao[]
  usuario_atual?: {
    id: string
    nome: string
    tipo: 'admin' | 'supervisor' | 'user'
  }
  loading?: boolean
  onCriarIntegracao?: (integracao: Omit<Integracao, 'id' | 'criado_em' | 'atualizado_em' | 'metricas' | 'logs_recentes'>) => Promise<void>
  onAtualizarIntegracao?: (id: string, dados: Partial<Integracao>) => Promise<void>
  onExcluirIntegracao?: (id: string) => Promise<void>
  onTestarIntegracao?: (id: string) => Promise<{ sucesso: boolean; detalhes: any }>
  onSincronizarIntegracao?: (id: string) => Promise<void>
  onPausarIntegracao?: (id: string) => Promise<void>
  onReativarIntegracao?: (id: string) => Promise<void>
  onExportarLogs?: (id: string, filtros?: any) => Promise<void>
  onImportarConfiguracao?: (arquivo: File) => Promise<void>
  className?: string
}

const tiposIntegracao = [
  { valor: 'api', label: 'API REST', icone: Globe, descricao: 'Integração com APIs REST' },
  { valor: 'webhook', label: 'Webhook', icone: Webhook, descricao: 'Receber notificações via webhook' },
  { valor: 'database', label: 'Banco de Dados', icone: Database, descricao: 'Conexão com banco de dados externo' },
  { valor: 'email', label: 'Email', icone: Mail, descricao: 'Envio e recebimento de emails' },
  { valor: 'sms', label: 'SMS', icone: Smartphone, descricao: 'Envio de mensagens SMS' },
  { valor: 'push', label: 'Push Notification', icone: Bell, descricao: 'Notificações push' },
  { valor: 'file', label: 'Arquivo', icone: FileText, descricao: 'Importação/exportação de arquivos' },
  { valor: 'oauth', label: 'OAuth', icone: Key, descricao: 'Autenticação OAuth' },
  { valor: 'saml', label: 'SAML', icone: Shield, descricao: 'Autenticação SAML' },
  { valor: 'ldap', label: 'LDAP', icone: Users, descricao: 'Diretório LDAP' },
  { valor: 'custom', label: 'Personalizada', icone: Settings, descricao: 'Integração personalizada' },
]

const statusIntegracao = [
  { valor: 'ativo', label: 'Ativo', cor: 'green', icone: Check },
  { valor: 'inativo', label: 'Inativo', cor: 'gray', icone: Pause },
  { valor: 'erro', label: 'Erro', cor: 'red', icone: AlertTriangle },
  { valor: 'configurando', label: 'Configurando', cor: 'blue', icone: Settings },
  { valor: 'testando', label: 'Testando', cor: 'yellow', icone: Play },
  { valor: 'pausado', label: 'Pausado', cor: 'orange', icone: Pause },
  { valor: 'manutencao', label: 'Manutenção', cor: 'purple', icone: Wrench },
]

const metodosHttp = [
  { valor: 'GET', label: 'GET', cor: 'green' },
  { valor: 'POST', label: 'POST', cor: 'blue' },
  { valor: 'PUT', label: 'PUT', cor: 'orange' },
  { valor: 'PATCH', label: 'PATCH', cor: 'yellow' },
  { valor: 'DELETE', label: 'DELETE', cor: 'red' },
  { valor: 'HEAD', label: 'HEAD', cor: 'gray' },
  { valor: 'OPTIONS', label: 'OPTIONS', cor: 'purple' },
]

const tiposAutenticacao = [
  { valor: 'none', label: 'Nenhuma', icone: Unlock },
  { valor: 'basic', label: 'Basic Auth', icone: Lock },
  { valor: 'bearer', label: 'Bearer Token', icone: Key },
  { valor: 'api_key', label: 'API Key', icone: Key },
  { valor: 'oauth1', label: 'OAuth 1.0', icone: Shield },
  { valor: 'oauth2', label: 'OAuth 2.0', icone: Shield },
  { valor: 'jwt', label: 'JWT', icone: Key },
  { valor: 'custom', label: 'Personalizada', icone: Settings },
]

const frequenciasSincronizacao = [
  { valor: 'manual', label: 'Manual', icone: Hand },
  { valor: 'tempo_real', label: 'Tempo Real', icone: Zap },
  { valor: '1min', label: '1 minuto', icone: Clock },
  { valor: '5min', label: '5 minutos', icone: Clock },
  { valor: '15min', label: '15 minutos', icone: Clock },
  { valor: '30min', label: '30 minutos', icone: Clock },
  { valor: '1h', label: '1 hora', icone: Clock },
  { valor: '6h', label: '6 horas', icone: Clock },
  { valor: '12h', label: '12 horas', icone: Clock },
  { valor: '24h', label: '24 horas', icone: Clock },
  { valor: 'semanal', label: 'Semanal', icone: Calendar },
  { valor: 'mensal', label: 'Mensal', icone: Calendar },
]

// Hook para gerenciar integrações
function useIntegrationSystem({
  integracoes: integracoesIniciais = [],
  onCriarIntegracao,
  onAtualizarIntegracao,
  onExcluirIntegracao,
  onTestarIntegracao,
  onSincronizarIntegracao,
  onPausarIntegracao,
  onReativarIntegracao,
  onExportarLogs,
  onImportarConfiguracao,
}: Partial<IntegrationSystemProps>) {
  const [integracoes, setIntegracoes] = useState<Integracao[]>(integracoesIniciais)
  const [loading, setLoading] = useState(false)
  const [filtros, setFiltros] = useState({
    busca: '',
    tipo: '' as TipoIntegracao | '',
    status: '' as StatusIntegracao | '',
    provedor: '',
    tags: [] as string[],
  })
  const [ordenacao, setOrdenacao] = useState({
    campo: 'nome' as keyof Integracao,
    direcao: 'asc' as 'asc' | 'desc',
  })

  // Filtrar e ordenar integrações
  const integracoesFiltradas = useMemo(() => {
    let resultado = [...integracoes]

    // Aplicar filtros
    if (filtros.busca) {
      const busca = filtros.busca.toLowerCase()
      resultado = resultado.filter(
        (integracao) =>
          integracao.nome.toLowerCase().includes(busca) ||
          integracao.descricao.toLowerCase().includes(busca) ||
          integracao.provedor.toLowerCase().includes(busca)
      )
    }

    if (filtros.tipo) {
      resultado = resultado.filter((integracao) => integracao.tipo === filtros.tipo)
    }

    if (filtros.status) {
      resultado = resultado.filter((integracao) => integracao.status === filtros.status)
    }

    if (filtros.provedor) {
      resultado = resultado.filter((integracao) =>
        integracao.provedor.toLowerCase().includes(filtros.provedor.toLowerCase())
      )
    }

    if (filtros.tags.length > 0) {
      resultado = resultado.filter((integracao) =>
        filtros.tags.some((tag) => integracao.tags.includes(tag))
      )
    }

    // Aplicar ordenação
    resultado.sort((a, b) => {
      const valorA = a[ordenacao.campo]
      const valorB = b[ordenacao.campo]

      if (valorA < valorB) return ordenacao.direcao === 'asc' ? -1 : 1
      if (valorA > valorB) return ordenacao.direcao === 'asc' ? 1 : -1
      return 0
    })

    return resultado
  }, [integracoes, filtros, ordenacao])

  // Estatísticas das integrações
  const estatisticas = useMemo(() => {
    const total = integracoes.length
    const ativas = integracoes.filter((i) => i.status === 'ativo').length
    const com_erro = integracoes.filter((i) => i.status === 'erro').length
    const pausadas = integracoes.filter((i) => i.status === 'pausado').length

    const tipos = integracoes.reduce((acc, integracao) => {
      acc[integracao.tipo] = (acc[integracao.tipo] || 0) + 1
      return acc
    }, {} as Record<TipoIntegracao, number>)

    const provedores = integracoes.reduce((acc, integracao) => {
      acc[integracao.provedor] = (acc[integracao.provedor] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      total,
      ativas,
      com_erro,
      pausadas,
      tipos,
      provedores,
      uptime_medio: integracoes.reduce((acc, i) => acc + i.metricas.uptime_percentual, 0) / total || 0,
      tempo_resposta_medio: integracoes.reduce((acc, i) => acc + i.metricas.tempo_resposta_medio, 0) / total || 0,
    }
  }, [integracoes])

  // Funções de ação
  const criarIntegracao = useCallback(
    async (dados: Omit<Integracao, 'id' | 'criado_em' | 'atualizado_em' | 'metricas' | 'logs_recentes'>) => {
      setLoading(true)
      try {
        await onCriarIntegracao?.(dados)
        toast.success('Integração criada com sucesso!')
      } catch (error) {
        toast.error('Erro ao criar integração')
        throw error
      } finally {
        setLoading(false)
      }
    },
    [onCriarIntegracao]
  )

  const atualizarIntegracao = useCallback(
    async (id: string, dados: Partial<Integracao>) => {
      setLoading(true)
      try {
        await onAtualizarIntegracao?.(id, dados)
        setIntegracoes((prev) =>
          prev.map((integracao) =>
            integracao.id === id ? { ...integracao, ...dados } : integracao
          )
        )
        toast.success('Integração atualizada com sucesso!')
      } catch (error) {
        toast.error('Erro ao atualizar integração')
        throw error
      } finally {
        setLoading(false)
      }
    },
    [onAtualizarIntegracao]
  )

  const excluirIntegracao = useCallback(
    async (id: string) => {
      setLoading(true)
      try {
        await onExcluirIntegracao?.(id)
        setIntegracoes((prev) => prev.filter((integracao) => integracao.id !== id))
        toast.success('Integração excluída com sucesso!')
      } catch (error) {
        toast.error('Erro ao excluir integração')
        throw error
      } finally {
        setLoading(false)
      }
    },
    [onExcluirIntegracao]
  )

  const testarIntegracao = useCallback(
    async (id: string) => {
      setLoading(true)
      try {
        const resultado = await onTestarIntegracao?.(id)
        if (resultado?.sucesso) {
          toast.success('Teste da integração realizado com sucesso!')
        } else {
          toast.error('Falha no teste da integração')
        }
        return resultado
      } catch (error) {
        toast.error('Erro ao testar integração')
        throw error
      } finally {
        setLoading(false)
      }
    },
    [onTestarIntegracao]
  )

  const sincronizarIntegracao = useCallback(
    async (id: string) => {
      setLoading(true)
      try {
        await onSincronizarIntegracao?.(id)
        toast.success('Sincronização iniciada com sucesso!')
      } catch (error) {
        toast.error('Erro ao sincronizar integração')
        throw error
      } finally {
        setLoading(false)
      }
    },
    [onSincronizarIntegracao]
  )

  const pausarIntegracao = useCallback(
    async (id: string) => {
      setLoading(true)
      try {
        await onPausarIntegracao?.(id)
        await atualizarIntegracao(id, { status: 'pausado' })
      } catch (error) {
        toast.error('Erro ao pausar integração')
        throw error
      } finally {
        setLoading(false)
      }
    },
    [onPausarIntegracao, atualizarIntegracao]
  )

  const reativarIntegracao = useCallback(
    async (id: string) => {
      setLoading(true)
      try {
        await onReativarIntegracao?.(id)
        await atualizarIntegracao(id, { status: 'ativo' })
      } catch (error) {
        toast.error('Erro ao reativar integração')
        throw error
      } finally {
        setLoading(false)
      }
    },
    [onReativarIntegracao, atualizarIntegracao]
  )

  const exportarLogs = useCallback(
    async (id: string, filtrosLogs?: any) => {
      setLoading(true)
      try {
        await onExportarLogs?.(id, filtrosLogs)
        toast.success('Logs exportados com sucesso!')
      } catch (error) {
        toast.error('Erro ao exportar logs')
        throw error
      } finally {
        setLoading(false)
      }
    },
    [onExportarLogs]
  )

  const importarConfiguracao = useCallback(
    async (arquivo: File) => {
      setLoading(true)
      try {
        await onImportarConfiguracao?.(arquivo)
        toast.success('Configuração importada com sucesso!')
      } catch (error) {
        toast.error('Erro ao importar configuração')
        throw error
      } finally {
        setLoading(false)
      }
    },
    [onImportarConfiguracao]
  )

  return {
    integracoes: integracoesFiltradas,
    estatisticas,
    loading,
    filtros,
    setFiltros,
    ordenacao,
    setOrdenacao,
    criarIntegracao,
    atualizarIntegracao,
    excluirIntegracao,
    testarIntegracao,
    sincronizarIntegracao,
    pausarIntegracao,
    reativarIntegracao,
    exportarLogs,
    importarConfiguracao,
  }
}

// Componente para exibir card de integração
function IntegracaoCard({ integracao, onEditar, onExcluir, onTestar, onSincronizar, onPausar, onReativar }: {
  integracao: Integracao
  onEditar?: (integracao: Integracao) => void
  onExcluir?: (id: string) => void
  onTestar?: (id: string) => void
  onSincronizar?: (id: string) => void
  onPausar?: (id: string) => void
  onReativar?: (id: string) => void
}) {
  const tipoInfo = tiposIntegracao.find((t) => t.valor === integracao.tipo)
  const statusInfo = statusIntegracao.find((s) => s.valor === integracao.status)
  const IconeTipo = tipoInfo?.icone || Settings
  const IconeStatus = statusInfo?.icone || AlertTriangle

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <IconeTipo className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">{integracao.nome}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {integracao.provedor} • {tipoInfo?.label}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={statusInfo?.cor === 'green' ? 'default' : 'secondary'}
              className={cn(
                'flex items-center gap-1',
                statusInfo?.cor === 'red' && 'bg-red-100 text-red-700',
                statusInfo?.cor === 'yellow' && 'bg-yellow-100 text-yellow-700',
                statusInfo?.cor === 'blue' && 'bg-blue-100 text-blue-700',
                statusInfo?.cor === 'orange' && 'bg-orange-100 text-orange-700',
                statusInfo?.cor === 'purple' && 'bg-purple-100 text-purple-700'
              )}
            >
              <IconeStatus className="h-3 w-3" />
              {statusInfo?.label}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onEditar?.(integracao)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onTestar?.(integracao.id)}>
                  <Play className="h-4 w-4 mr-2" />
                  Testar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSincronizar?.(integracao.id)}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sincronizar
                </DropdownMenuItem>
                {integracao.status === 'ativo' ? (
                  <DropdownMenuItem onClick={() => onPausar?.(integracao.id)}>
                    <Pause className="h-4 w-4 mr-2" />
                    Pausar
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => onReativar?.(integracao.id)}>
                    <Play className="h-4 w-4 mr-2" />
                    Reativar
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onExcluir?.(integracao.id)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{integracao.descricao}</p>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Uptime</p>
            <p className="text-sm font-semibold">
              {integracao.metricas.uptime_percentual.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Tempo Resposta</p>
            <p className="text-sm font-semibold">
              {integracao.metricas.tempo_resposta_medio}ms
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Requests</p>
            <p className="text-sm font-semibold">
              {integracao.metricas.total_requests.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Taxa Sucesso</p>
            <p className="text-sm font-semibold">
              {integracao.metricas.total_requests > 0
                ? ((integracao.metricas.requests_sucesso / integracao.metricas.total_requests) * 100).toFixed(1)
                : 0}%
            </p>
          </div>
        </div>

        {integracao.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {integracao.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Componente para estatísticas rápidas
function EstatisticasRapidas({ estatisticas }: { estatisticas: any }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-100">
              <Settings className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{estatisticas.total}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-green-100">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ativas</p>
              <p className="text-2xl font-bold">{estatisticas.ativas}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-red-100">
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Com Erro</p>
              <p className="text-2xl font-bold">{estatisticas.com_erro}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-yellow-100">
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Uptime Médio</p>
              <p className="text-2xl font-bold">{estatisticas.uptime_medio.toFixed(1)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente para filtros
function FiltrosIntegracao({ filtros, setFiltros, integracoes }: {
  filtros: any
  setFiltros: (filtros: any) => void
  integracoes: Integracao[]
}) {
  const todasTags = useMemo(() => {
    const tags = new Set<string>()
    integracoes.forEach((integracao) => {
      integracao.tags.forEach((tag) => tags.add(tag))
    })
    return Array.from(tags)
  }, [integracoes])

  const todosProvedores = useMemo(() => {
    const provedores = new Set<string>()
    integracoes.forEach((integracao) => {
      provedores.add(integracao.provedor)
    })
    return Array.from(provedores)
  }, [integracoes])

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Filtros</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <Label htmlFor="busca">Buscar</Label>
            <Input
              id="busca"
              placeholder="Nome, descrição ou provedor..."
              value={filtros.busca}
              onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
            />
          </div>
          
          <div>
            <Label htmlFor="tipo">Tipo</Label>
            <Select
              value={filtros.tipo}
              onValueChange={(value) => setFiltros({ ...filtros, tipo: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os tipos</SelectItem>
                {tiposIntegracao.map((tipo) => (
                  <SelectItem key={tipo.valor} value={tipo.valor}>
                    {tipo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={filtros.status}
              onValueChange={(value) => setFiltros({ ...filtros, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os status</SelectItem>
                {statusIntegracao.map((status) => (
                  <SelectItem key={status.valor} value={status.valor}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="provedor">Provedor</Label>
            <Select
              value={filtros.provedor}
              onValueChange={(value) => setFiltros({ ...filtros, provedor: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os provedores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os provedores</SelectItem>
                {todosProvedores.map((provedor) => (
                  <SelectItem key={provedor} value={provedor}>
                    {provedor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => setFiltros({
                busca: '',
                tipo: '',
                status: '',
                provedor: '',
                tags: [],
              })}
              className="w-full"
            >
              <X className="h-4 w-4 mr-2" />
              Limpar
            </Button>
          </div>
        </div>
        
        {todasTags.length > 0 && (
          <div className="mt-4">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {todasTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={filtros.tags.includes(tag) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => {
                    const novasTags = filtros.tags.includes(tag)
                      ? filtros.tags.filter((t: string) => t !== tag)
                      : [...filtros.tags, tag]
                    setFiltros({ ...filtros, tags: novasTags })
                  }}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Componente principal do sistema de integração
export function IntegrationSystem({
  integracoes: integracoesIniciais = [],
  templates = [],
  onCriarIntegracao,
  onAtualizarIntegracao,
  onExcluirIntegracao,
  onTestarIntegracao,
  onSincronizarIntegracao,
  onPausarIntegracao,
  onReativarIntegracao,
  onExportarLogs,
  onImportarConfiguracao,
  className,
}: IntegrationSystemProps) {
  const {
    integracoes,
    estatisticas,
    loading,
    filtros,
    setFiltros,
    ordenacao,
    setOrdenacao,
    criarIntegracao,
    atualizarIntegracao,
    excluirIntegracao,
    testarIntegracao,
    sincronizarIntegracao,
    pausarIntegracao,
    reativarIntegracao,
    exportarLogs,
    importarConfiguracao,
  } = useIntegrationSystem({
    integracoes: integracoesIniciais,
    onCriarIntegracao,
    onAtualizarIntegracao,
    onExcluirIntegracao,
    onTestarIntegracao,
    onSincronizarIntegracao,
    onPausarIntegracao,
    onReativarIntegracao,
    onExportarLogs,
    onImportarConfiguracao,
  })

  const [integracaoSelecionada, setIntegracaoSelecionada] = useState<Integracao | null>(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [modoEdicao, setModoEdicao] = useState(false)

  const abrirModalCriacao = () => {
    setIntegracaoSelecionada(null)
    setModoEdicao(false)
    setModalAberto(true)
  }

  const abrirModalEdicao = (integracao: Integracao) => {
    setIntegracaoSelecionada(integracao)
    setModoEdicao(true)
    setModalAberto(true)
  }

  const fecharModal = () => {
    setModalAberto(false)
    setIntegracaoSelecionada(null)
    setModoEdicao(false)
  }

  const handleSalvarIntegracao = async (dados: any) => {
    try {
      if (modoEdicao && integracaoSelecionada) {
        await atualizarIntegracao(integracaoSelecionada.id, dados)
      } else {
        await criarIntegracao(dados)
      }
      fecharModal()
    } catch (error) {
      console.error('Erro ao salvar integração:', error)
    }
  }

  const handleExcluirIntegracao = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta integração?')) {
      try {
        await excluirIntegracao(id)
      } catch (error) {
        console.error('Erro ao excluir integração:', error)
      }
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sistema de Integrações</h2>
          <p className="text-muted-foreground">
            Gerencie integrações com APIs externas, webhooks e sincronizações
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={abrirModalCriacao}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Integração
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <EstatisticasRapidas estatisticas={estatisticas} />

      {/* Filtros */}
      <FiltrosIntegracao
        filtros={filtros}
        setFiltros={setFiltros}
        integracoes={integracoesIniciais}
      />

      {/* Lista de integrações */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {integracoes.length} integração(ões) encontrada(s)
          </p>
          <div className="flex items-center gap-2">
            <Label htmlFor="ordenacao" className="text-sm">
              Ordenar por:
            </Label>
            <Select
              value={`${ordenacao.campo}-${ordenacao.direcao}`}
              onValueChange={(value) => {
                const [campo, direcao] = value.split('-')
                setOrdenacao({ campo: campo as keyof Integracao, direcao: direcao as 'asc' | 'desc' })
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nome-asc">Nome (A-Z)</SelectItem>
                <SelectItem value="nome-desc">Nome (Z-A)</SelectItem>
                <SelectItem value="criado_em-desc">Mais recentes</SelectItem>
                <SelectItem value="criado_em-asc">Mais antigas</SelectItem>
                <SelectItem value="status-asc">Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : integracoes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Settings className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma integração encontrada</h3>
              <p className="text-muted-foreground text-center mb-4">
                {filtros.busca || filtros.tipo || filtros.status || filtros.provedor || filtros.tags.length > 0
                  ? 'Nenhuma integração corresponde aos filtros aplicados.'
                  : 'Comece criando sua primeira integração.'}
              </p>
              {(!filtros.busca && !filtros.tipo && !filtros.status && !filtros.provedor && filtros.tags.length === 0) && (
                <Button onClick={abrirModalCriacao}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Integração
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integracoes.map((integracao) => (
              <IntegracaoCard
                key={integracao.id}
                integracao={integracao}
                onEditar={abrirModalEdicao}
                onExcluir={handleExcluirIntegracao}
                onTestar={testarIntegracao}
                onSincronizar={sincronizarIntegracao}
                onPausar={pausarIntegracao}
                onReativar={reativarIntegracao}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Componente de Configuração de Integração
interface ConfiguracaoIntegracaoProps {
  integracao?: Integracao
  template?: TemplateIntegracao
  onSave: (data: Partial<Integracao>) => void
  onCancel: () => void
}

function ConfiguracaoIntegracao({
  integracao,
  template,
  onSave,
  onCancel,
}: ConfiguracaoIntegracaoProps) {
  const [formData, setFormData] = useState<Partial<Integracao>>({
    nome: integracao?.nome || template?.nome || '',
    descricao: integracao?.descricao || template?.descricao || '',
    tipo: integracao?.tipo || template?.tipo || 'api',
    provedor: integracao?.provedor || template?.provedor || '',
    url_base: integracao?.url_base || '',
    ativo: integracao?.ativo ?? true,
    configuracao_auth: integracao?.configuracao_auth || {
      tipo: 'api_key',
      credenciais: {},
    },
    configuracao_webhook: integracao?.configuracao_webhook || {
      url: '',
      metodo: 'POST',
      headers: {},
      retry_config: {
        max_tentativas: 3,
        delay_inicial: 1000,
        backoff_multiplicador: 2,
        timeout: 30000,
      },
    },
    configuracao_sync: integracao?.configuracao_sync || {
      frequencia: 'manual',
      direcao: 'entrada',
      mapeamento_campos: {},
    },
    tags: integracao?.tags || [],
  })

  const [showSecret, setShowSecret] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)

  const handleSave = () => {
    onSave(formData)
  }

  const handleTestConnection = async () => {
    setTestingConnection(true)
    try {
      // Simular teste de conexão
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('Conexão testada com sucesso!')
    } catch (error) {
      toast.error('Falha no teste de conexão')
    } finally {
      setTestingConnection(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome da Integração</Label>
          <Input
            id="nome"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            placeholder="Ex: Sistema CRM"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="provedor">Provedor</Label>
          <Input
            id="provedor"
            value={formData.provedor}
            onChange={(e) => setFormData({ ...formData, provedor: e.target.value })}
            placeholder="Ex: Salesforce, HubSpot"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          value={formData.descricao}
          onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
          placeholder="Descreva o propósito desta integração..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tipo">Tipo de Integração</Label>
          <Select
            value={formData.tipo}
            onValueChange={(value: TipoIntegracao) => setFormData({ ...formData, tipo: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIPOS_INTEGRACAO.map((tipo) => (
                 <SelectItem key={tipo.value} value={tipo.value}>
                   <div className="flex items-center gap-2">
                     <tipo.icon className="h-4 w-4" />
                     {tipo.label}
                   </div>
                 </SelectItem>
               ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="url_base">URL Base</Label>
          <Input
            id="url_base"
            value={formData.url_base}
            onChange={(e) => setFormData({ ...formData, url_base: e.target.value })}
            placeholder="https://api.exemplo.com/v1"
          />
        </div>
      </div>

      <Tabs defaultValue="autenticacao" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="autenticacao">Autenticação</TabsTrigger>
          <TabsTrigger value="webhook">Webhook</TabsTrigger>
          <TabsTrigger value="sincronizacao">Sincronização</TabsTrigger>
        </TabsList>

        <TabsContent value="autenticacao" className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo de Autenticação</Label>
            <Select
              value={formData.configuracao_auth?.tipo}
              onValueChange={(value: TipoAutenticacao) =>
                setFormData({
                  ...formData,
                  configuracao_auth: {
                    ...formData.configuracao_auth!,
                    tipo: value,
                  },
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_AUTENTICACAO.map((tipo) => (
                 <SelectItem key={tipo.value} value={tipo.value}>
                   <div className="flex items-center gap-2">
                     <tipo.icon className="h-4 w-4" />
                     {tipo.label}
                   </div>
                 </SelectItem>
               ))}
              </SelectContent>
            </Select>
          </div>

          {formData.configuracao_auth?.tipo === 'api_key' && (
            <div className="space-y-2">
              <Label htmlFor="api_key">API Key</Label>
              <div className="relative">
                <Input
                  id="api_key"
                  type={showSecret ? 'text' : 'password'}
                  value={formData.configuracao_auth?.credenciais?.api_key || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      configuracao_auth: {
                        ...formData.configuracao_auth!,
                        credenciais: {
                          ...formData.configuracao_auth!.credenciais,
                          api_key: e.target.value,
                        },
                      },
                    })
                  }
                  placeholder="Insira sua API Key"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowSecret(!showSecret)}
                >
                  {showSecret ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleTestConnection}
              disabled={testingConnection}
            >
              {testingConnection ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              Testar Conexão
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="webhook" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">URL do Webhook</Label>
            <Input
              id="webhook-url"
              value={formData.configuracao_webhook?.url || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  configuracao_webhook: {
                    ...formData.configuracao_webhook!,
                    url: e.target.value,
                  },
                })
              }
              placeholder="https://seu-site.com/webhook"
            />
          </div>

          <div className="space-y-2">
            <Label>Método HTTP</Label>
            <Select
              value={formData.configuracao_webhook?.metodo}
              onValueChange={(value: MetodoHttp) =>
                setFormData({
                  ...formData,
                  configuracao_webhook: {
                    ...formData.configuracao_webhook!,
                    metodo: value,
                  },
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {metodosHttp.map((metodo) => (
                  <SelectItem key={metodo.valor} value={metodo.valor}>
                    <Badge className={`bg-${metodo.cor}-100 text-${metodo.cor}-700`}>
                      {metodo.label}
                    </Badge>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </TabsContent>

        <TabsContent value="sincronizacao" className="space-y-4">
          <div className="space-y-2">
            <Label>Frequência de Sincronização</Label>
            <Select
              value={formData.configuracao_sync?.frequencia}
              onValueChange={(value: FrequenciaSincronizacao) =>
                setFormData({
                  ...formData,
                  configuracao_sync: {
                    ...formData.configuracao_sync!,
                    frequencia: value,
                  },
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FREQUENCIAS_SINCRONIZACAO.map((freq) => (
                 <SelectItem key={freq.value} value={freq.value}>
                   <div className="flex items-center gap-2">
                     <freq.icon className="h-4 w-4" />
                     {freq.label}
                   </div>
                 </SelectItem>
               ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Direção da Sincronização</Label>
            <Select
              value={formData.configuracao_sync?.direcao}
              onValueChange={(value: 'entrada' | 'saida' | 'bidirecional') =>
                setFormData({
                  ...formData,
                  configuracao_sync: {
                    ...formData.configuracao_sync!,
                    direcao: value,
                  },
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entrada">Entrada (Receber dados)</SelectItem>
                <SelectItem value="saida">Saída (Enviar dados)</SelectItem>
                <SelectItem value="bidirecional">Bidirecional</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex items-center space-x-2">
        <Switch
          id="ativo"
          checked={formData.ativo || false}
          onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
        />
        <Label htmlFor="ativo">Integração Ativa</Label>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="button" onClick={handleSave}>
          Salvar Integração
        </Button>
      </div>
    </div>
  )
}

// Componente de Logs de Integração
interface LogsIntegracaoProps {
  integracao: Integracao
}

function LogsIntegracao({ integracao }: LogsIntegracaoProps) {
  const [filtroTipo, setFiltroTipo] = useState<string>('todos')
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')

  const logsFiltrados = useMemo(() => {
    return integracao.logs_recentes.filter((log) => {
      const tipoMatch = filtroTipo === 'todos' || log.tipo === filtroTipo
      const statusMatch = filtroStatus === 'todos' || log.status === filtroStatus
      return tipoMatch && statusMatch
    })
  }, [integracao.logs_recentes, filtroTipo, filtroStatus])

  const getLogIcon = (tipo: string) => {
    switch (tipo) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'request':
        return <Send className="h-4 w-4 text-blue-500" />
      case 'response':
        return <Download className="h-4 w-4 text-green-500" />
      case 'sync':
        return <RefreshCw className="h-4 w-4 text-purple-500" />
      case 'webhook':
        return <Webhook className="h-4 w-4 text-orange-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      sucesso: 'default',
      erro: 'destructive',
      warning: 'secondary',
    }

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status}
      </Badge>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Select value={filtroTipo} onValueChange={setFiltroTipo}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            <SelectItem value="request">Request</SelectItem>
            <SelectItem value="response">Response</SelectItem>
            <SelectItem value="error">Erro</SelectItem>
            <SelectItem value="sync">Sincronização</SelectItem>
            <SelectItem value="webhook">Webhook</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="sucesso">Sucesso</SelectItem>
            <SelectItem value="erro">Erro</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-2">
          {logsFiltrados.map((log) => (
            <Card key={log.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {getLogIcon(log.tipo)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium capitalize">{log.tipo}</span>
                      {getStatusBadge(log.status)}
                    </div>
                    {log.detalhes.url && (
                      <p className="text-sm text-muted-foreground mb-1">
                        {log.detalhes.metodo} {log.detalhes.url}
                      </p>
                    )}
                    {log.detalhes.erro_mensagem && (
                      <p className="text-sm text-red-600 mb-2">
                        {log.detalhes.erro_mensagem}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {log.detalhes.tempo_resposta && (
                        <span>Duração: {log.detalhes.tempo_resposta}ms</span>
                      )}
                      {log.detalhes.status_code && (
                        <span>Status: {log.detalhes.status_code}</span>
                      )}
                      <span>{format(log.timestamp, 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

export { IntegrationSystem, useIntegrationSystem, ConfiguracaoIntegracao, LogsIntegracao }
export default IntegrationSystem