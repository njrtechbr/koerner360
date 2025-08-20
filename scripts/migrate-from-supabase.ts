import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Carregar variáveis de ambiente do .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const prisma = new PrismaClient();

// Dados do Supabase
const supabaseUsers = [
  {
    id: "58cd3a1d-9214-4535-b8d8-6f9d9957a570",
    name: "Administrador",
    email: "admin@koerner360.com",
    password: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
    role: "admin",
    accessType: "full",
    status: "active",
    avatarUrl: null,
    telefone: null,
    portaria: null,
    situacao: "ativo",
    dataAdmissao: "2024-01-01T00:00:00.000Z",
    dataNascimento: "1980-01-01T00:00:00.000Z",
    rg: null,
    cpf: null,
    createdAt: "2025-08-05T04:30:16.270Z",
    updatedAt: "2025-08-05T04:30:16.270Z"
  },
  {
    id: "8773973a-9a4e-436e-bd93-37150645852b",
    name: "João Supervisor",
    email: "supervisor@koerner360.com",
    password: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
    role: "supervisor",
    accessType: "limited",
    status: "active",
    avatarUrl: null,
    telefone: null,
    portaria: null,
    situacao: "ativo",
    dataAdmissao: "2024-02-01T00:00:00.000Z",
    dataNascimento: "1985-05-15T00:00:00.000Z",
    rg: null,
    cpf: null,
    createdAt: "2025-08-05T04:30:16.270Z",
    updatedAt: "2025-08-05T04:30:16.270Z"
  },
  {
    id: "70b5223e-7fb4-43c6-ac88-3513482a9139",
    name: "Maria Atendente",
    email: "atendente@koerner360.com",
    password: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
    role: "attendant",
    accessType: "restricted",
    status: "active",
    avatarUrl: null,
    telefone: null,
    portaria: null,
    situacao: "ativo",
    dataAdmissao: "2024-03-01T00:00:00.000Z",
    dataNascimento: "1990-08-20T00:00:00.000Z",
    rg: null,
    cpf: null,
    createdAt: "2025-08-05T04:30:16.270Z",
    updatedAt: "2025-08-05T04:30:16.270Z"
  },
  {
    id: "64a10ce1-5d8b-4675-94f7-965e7ed14afa",
    name: "Lucas",
    email: "lucas@koerner360.com",
    password: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
    role: "attendant",
    accessType: "restricted",
    status: "active",
    avatarUrl: null,
    telefone: null,
    portaria: null,
    situacao: "ativo",
    dataAdmissao: "2024-04-01T00:00:00.000Z",
    dataNascimento: "1988-12-10T00:00:00.000Z",
    rg: null,
    cpf: null,
    createdAt: "2025-08-05T04:30:16.270Z",
    updatedAt: "2025-08-05T04:30:16.270Z"
  },
  {
    id: "00c33394-ced5-4786-a785-e6509b2fa631",
    name: "Ana",
    email: "ana@koerner360.com",
    password: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
    role: "attendant",
    accessType: "restricted",
    status: "active",
    avatarUrl: null,
    telefone: null,
    portaria: null,
    situacao: "ativo",
    dataAdmissao: "2024-05-01T00:00:00.000Z",
    dataNascimento: "1992-03-25T00:00:00.000Z",
    rg: null,
    cpf: null,
    createdAt: "2025-08-05T04:30:16.270Z",
    updatedAt: "2025-08-05T04:30:16.270Z"
  },
  {
    id: "9f4782fa-8eec-4c10-b5df-f3e923b5a61d",
    name: "Carla",
    email: "carla@koerner360.com",
    password: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
    role: "attendant",
    accessType: "restricted",
    status: "active",
    avatarUrl: null,
    telefone: null,
    portaria: null,
    situacao: "ativo",
    dataAdmissao: "2024-06-01T00:00:00.000Z",
    dataNascimento: "1987-07-18T00:00:00.000Z",
    rg: null,
    cpf: null,
    createdAt: "2025-08-05T04:30:16.270Z",
    updatedAt: "2025-08-05T04:30:16.270Z"
  },
  {
    id: "10d6a02b-d440-463c-9738-210e5fff1429",
    name: "Fernanda",
    email: "fernanda@koerner360.com",
    password: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
    role: "attendant",
    accessType: "restricted",
    status: "active",
    avatarUrl: null,
    telefone: null,
    portaria: null,
    situacao: "ativo",
    dataAdmissao: "2024-07-01T00:00:00.000Z",
    dataNascimento: "1991-11-05T00:00:00.000Z",
    rg: null,
    cpf: null,
    createdAt: "2025-08-05T04:30:16.270Z",
    updatedAt: "2025-08-05T04:30:16.270Z"
  },
  {
    id: "6588666a-920b-4fd1-b2b5-024e894d2c20",
    name: "Roberto",
    email: "roberto@koerner360.com",
    password: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
    role: "attendant",
    accessType: "restricted",
    status: "active",
    avatarUrl: null,
    telefone: null,
    portaria: null,
    situacao: "ativo",
    dataAdmissao: "2024-08-01T00:00:00.000Z",
    dataNascimento: "1986-04-12T00:00:00.000Z",
    rg: null,
    cpf: null,
    createdAt: "2025-08-05T04:30:16.270Z",
    updatedAt: "2025-08-05T04:30:16.270Z"
  },
  {
    id: "98b4d9d1-b586-4bd8-b028-e753313d2bff",
    name: "Patricia",
    email: "patricia@koerner360.com",
    password: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
    role: "attendant",
    accessType: "restricted",
    status: "active",
    avatarUrl: null,
    telefone: null,
    portaria: null,
    situacao: "ativo",
    dataAdmissao: "2024-09-01T00:00:00.000Z",
    dataNascimento: "1989-09-30T00:00:00.000Z",
    rg: null,
    cpf: null,
    createdAt: "2025-08-05T04:30:16.270Z",
    updatedAt: "2025-08-05T04:30:16.270Z"
  },
  {
    id: "94c3bea1-94dc-4ab4-b102-04a90da009b2",
    name: "Ricardo",
    email: "ricardo@koerner360.com",
    password: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
    role: "attendant",
    accessType: "restricted",
    status: "active",
    avatarUrl: null,
    telefone: null,
    portaria: null,
    situacao: "ativo",
    dataAdmissao: "2024-10-01T00:00:00.000Z",
    dataNascimento: "1984-02-14T00:00:00.000Z",
    rg: null,
    cpf: null,
    createdAt: "2025-08-05T04:30:16.270Z",
    updatedAt: "2025-08-05T04:30:16.270Z"
  }
];

const supabaseReviews = [
  {
    id: "6002ff6d-ac09-4c64-95b3-e5987cc0b841",
    attendantId: "58cd3a1d-9214-4535-b8d8-6f9d9957a570",
    rating: 5,
    comment: "",
    date: "2025-08-05T11:13:58.789Z"
  },
  {
    id: "18944d44-1d1d-4d96-9411-93285fffde2d",
    attendantId: "8773973a-9a4e-436e-bd93-37150645852b",
    rating: 5,
    comment: "",
    date: "2025-08-06T20:09:07.692Z"
  },
  {
    id: "94cad7d2-6d5b-45c6-9f1d-cdfcdeb179a5",
    attendantId: "8773973a-9a4e-436e-bd93-37150645852b",
    rating: 5,
    comment: "",
    date: "2025-08-06T20:09:34.350Z"
  },
  {
    id: "5aae7ce4-502c-4df8-a8dc-567e11b0b1ff",
    attendantId: "8773973a-9a4e-436e-bd93-37150645852b",
    rating: 5,
    comment: "",
    date: "2025-08-07T17:58:05.724Z"
  },
  {
    id: "59a8effa-51ff-46d6-b243-ca79413b7d0a",
    attendantId: "8773973a-9a4e-436e-bd93-37150645852b",
    rating: 5,
    comment: "Ótimo atendimento.",
    date: "2025-08-07T18:21:28.204Z"
  },
  {
    id: "1835bf47-1879-4353-8a11-9c78095d870c",
    attendantId: "8773973a-9a4e-436e-bd93-37150645852b",
    rating: 1,
    comment: "",
    date: "2025-08-07T18:26:46.544Z"
  },
  {
    id: "89dcc97b-50ea-4333-aa10-7250549ab839",
    attendantId: "8773973a-9a4e-436e-bd93-37150645852b",
    rating: 5,
    comment: "",
    date: "2025-08-07T18:27:38.612Z"
  },
  {
    id: "7bf765c6-6d9d-4631-bb96-f85a7401919c",
    attendantId: "8773973a-9a4e-436e-bd93-37150645852b",
    rating: 5,
    comment: "",
    date: "2025-08-07T18:28:03.547Z"
  },
  {
    id: "79b04737-80ac-4d0a-b70c-2f2906b0ad3b",
    attendantId: "8773973a-9a4e-436e-bd93-37150645852b",
    rating: 5,
    comment: "",
    date: "2025-08-07T18:28:06.756Z"
  },
  {
    id: "ba1bf906-4760-459b-9ee5-30a2880f85cc",
    attendantId: "8773973a-9a4e-436e-bd93-37150645852b",
    rating: 5,
    comment: "",
    date: "2025-08-07T18:28:10.203Z"
  },
  {
    id: "d6857824-507d-40b1-a33f-7bb26d9e8185",
    attendantId: "8773973a-9a4e-436e-bd93-37150645852b",
    rating: 5,
    comment: "",
    date: "2025-08-07T18:34:09.684Z"
  },
  {
    id: "a78614e3-e4bb-4659-b94e-c8f725b3adf0",
    attendantId: "8773973a-9a4e-436e-bd93-37150645852b",
    rating: 5,
    comment: "Muito bom Atendimento",
    date: "2025-08-07T19:00:00.970Z"
  },
  {
    id: "4b470592-5f8b-4eb3-917b-85d19a5cd378",
    attendantId: "8773973a-9a4e-436e-bd93-37150645852b",
    rating: 5,
    comment: "",
    date: "2025-08-07T19:17:46.236Z"
  },
  {
    id: "2658e835-56e8-4b23-a704-d67231c64327",
    attendantId: "8773973a-9a4e-436e-bd93-37150645852b",
    rating: 5,
    comment: "",
    date: "2025-08-08T12:26:02.409Z"
  },
  {
    id: "414bce17-55c4-4da7-8052-562593e9b72a",
    attendantId: "8773973a-9a4e-436e-bd93-37150645852b",
    rating: 5,
    comment: "Ótimo atendimento!",
    date: "2025-08-08T12:29:56.928Z"
  },
  {
    id: "e69d02a3-4c79-4a85-8525-fd1212248ac7",
    attendantId: "70b5223e-7fb4-43c6-ac88-3513482a9139",
    rating: 5,
    comment: "Moça muito atenciosa.",
    date: "2025-08-08T16:25:49.341Z"
  },
  {
    id: "8ca9d8de-d1f4-40ff-9555-c77eb4cf81c0",
    attendantId: "64a10ce1-5d8b-4675-94f7-965e7ed14afa",
    rating: 5,
    comment: "",
    date: "2025-08-08T18:42:48.622Z"
  },
  {
    id: "572fc557-750d-4c90-9aa0-b4fc1bfeb998",
    attendantId: "64a10ce1-5d8b-4675-94f7-965e7ed14afa",
    rating: 5,
    comment: "Lucas é um profissão exemplar. Dedicado ao serviço e muito focado no atendimento do cliente. Tivemos uma demanda onde necessitamos o apoio dele e o resulto foi além do esperado. Sempre muito paciente e disponível para atender ao cliente. Parabéns.",
    date: "2025-08-08T19:15:11.341Z"
  },
  {
    id: "e8142186-bb2f-4348-b328-235ba7ea7e22",
    attendantId: "00c33394-ced5-4786-a785-e6509b2fa631",
    rating: 5,
    comment: "",
    date: "2025-08-08T21:25:11.409Z"
  },
  {
    id: "1b1db94c-d748-4d3c-a0f6-d92689451131",
    attendantId: "00c33394-ced5-4786-a785-e6509b2fa631",
    rating: 5,
    comment: "",
    date: "2025-08-08T21:36:17.388Z"
  },
  {
    id: "0b960024-e62e-48bc-815b-9090a29b8afc",
    attendantId: "9f4782fa-8eec-4c10-b5df-f3e923b5a61d",
    rating: 5,
    comment: "Atenciosa e sábia",
    date: "2025-08-12T13:08:53.244Z"
  },
  {
    id: "dd7a6e0c-0dfc-4715-a993-a626089bdfe0",
    attendantId: "10d6a02b-d440-463c-9738-210e5fff1429",
    rating: 5,
    comment: "",
    date: "2025-08-12T13:15:57.446Z"
  },
  {
    id: "07ea945c-8144-44b3-8ed5-f26ec87b5379",
    attendantId: "10d6a02b-d440-463c-9738-210e5fff1429",
    rating: 5,
    comment: "",
    date: "2025-08-12T14:33:56.058Z"
  },
  {
    id: "d261dcd9-5cd4-4757-ac50-eb78f50e609d",
    attendantId: "8773973a-9a4e-436e-bd93-37150645852b",
    rating: 5,
    comment: "",
    date: "2025-08-12T14:37:03.383Z"
  },
  {
    id: "4c3d80f7-cd7a-45b2-92ad-a99ce3970c5f",
    attendantId: "8773973a-9a4e-436e-bd93-37150645852b",
    rating: 5,
    comment: "",
    date: "2025-08-12T14:56:24.461Z"
  },
  {
    id: "f7b6b288-b9ea-4235-b5c3-240021f7e48c",
    attendantId: "8773973a-9a4e-436e-bd93-37150645852b",
    rating: 5,
    comment: "Muito bom",
    date: "2025-08-12T15:05:43.998Z"
  },
  {
    id: "4a908ffa-152f-4e22-872c-f25c837fab0c",
    attendantId: "8773973a-9a4e-436e-bd93-37150645852b",
    rating: 5,
    comment: "",
    date: "2025-08-12T15:06:31.024Z"
  },
  {
    id: "cf0a435b-44a8-4fb5-bcee-827e0f9c5204",
    attendantId: "8773973a-9a4e-436e-bd93-37150645852b",
    rating: 5,
    comment: "",
    date: "2025-08-12T17:08:42.938Z"
  },
  {
    id: "c0dfb0df-18fa-4bed-89d0-aea7697eaa79",
    attendantId: "10d6a02b-d440-463c-9738-210e5fff1429",
    rating: 5,
    comment: "",
    date: "2025-08-12T18:56:10.981Z"
  },
  {
    id: "1ab88c17-1c0f-4665-ae1a-b45235662bc7",
    attendantId: "10d6a02b-d440-463c-9738-210e5fff1429",
    rating: 5,
    comment: "Pratica e rápida!",
    date: "2025-08-12T19:06:57.998Z"
  },
  {
    id: "123c41d1-3e55-4a0d-b9c0-3e5232ba0e66",
    attendantId: "64a10ce1-5d8b-4675-94f7-965e7ed14afa",
    rating: 5,
    comment: "Lucas se mostrou um profissional, qualificado, dedicado, paciente e muito ético. Foi totalmente imparcial com relação às partes envolvidas no processo de registro dos fatos na ata notorial.",
    date: "2025-08-13T12:55:45.977Z"
  },
  {
    id: "3a336b16-c920-4a2a-ae57-609087888a78",
    attendantId: "9f4782fa-8eec-4c10-b5df-f3e923b5a61d",
    rating: 5,
    comment: "",
    date: "2025-08-13T13:18:32.063Z"
  },
  {
    id: "ac9a715a-9ad4-4dcc-8437-15ee02650a61",
    attendantId: "6588666a-920b-4fd1-b2b5-024e894d2c20",
    rating: 5,
    comment: "",
    date: "2025-08-13T17:51:57.335Z"
  },
  {
    id: "83dcb2d0-25a1-4fe8-bee8-37879251e237",
    attendantId: "98b4d9d1-b586-4bd8-b028-e753313d2bff",
    rating: 5,
    comment: "",
    date: "2025-08-13T18:58:33.024Z"
  },
  {
    id: "13504378-bcf0-4e8f-aef6-9b03132d34db",
    attendantId: "94c3bea1-94dc-4ab4-b102-04a90da009b2",
    rating: 5,
    comment: "",
    date: "2025-08-14T01:05:32.511Z"
  }
];

const supabaseSystemConfig = [
  {
    id: "0d4cef8e-f606-456f-82d5-4d64f185baeb",
    configKey: "company_info",
    configValue: {
      name: "Koerner 360",
      description: "Sistema 360° para gestão empresarial completa",
      foundingYear: 2017
    },
    description: "Informações básicas da empresa",
    createdAt: "2025-08-05T04:30:16.270Z",
    updatedAt: "2025-08-05T04:30:16.270Z"
  },
  {
    id: "16a4266a-74ab-4de7-94b3-e17534216b67",
    configKey: "app_settings",
    configValue: {
      theme: "light",
      language: "pt-BR",
      timezone: "America/Sao_Paulo",
      dateFormat: "DD/MM/YYYY"
    },
    description: "Configurações gerais da aplicação",
    createdAt: "2025-08-05T04:30:16.270Z",
    updatedAt: "2025-08-05T04:30:16.270Z"
  },
  {
    id: "6372ab8b-ff3a-463b-953a-a96934fe595a",
    configKey: "company_config",
    configValue: {
      name: "Koerner 360",
      modules: [
        {
          id: "satisfaction-survey",
          icon: "MessageSquare",
          name: "Pesquisa de Satisfação",
          route: "/dashboard",
          enabled: true,
          description: "Módulo para coleta e análise de feedback de clientes"
        },
        {
          id: "performance-management",
          icon: "TrendingUp",
          name: "Gestão de Performance",
          route: "/performance",
          enabled: true,
          description: "Avaliação e acompanhamento de desempenho"
        },
        {
          id: "training-development",
          icon: "GraduationCap",
          name: "Treinamento e Desenvolvimento",
          route: "/training",
          enabled: true,
          description: "Gestão de capacitação e desenvolvimento"
        },
        {
          id: "quality-management",
          icon: "Shield",
          name: "Gestão da Qualidade",
          route: "/quality",
          enabled: true,
          description: "Controle e melhoria de processos"
        },
        {
          id: "user-management",
          icon: "Users",
          name: "Gestão de Usuários",
          route: "/attendants",
          enabled: true,
          description: "Gerenciamento completo de usuários do sistema"
        },
        {
          id: "reviews-management",
          icon: "MessageSquare",
          name: "Gestão de Avaliações",
          route: "/reviews",
          enabled: true,
          description: "Visualização e análise de todas as avaliações"
        },
        {
          id: "qr-generator",
          icon: "QrCode",
          name: "Gerador de QR Code",
          route: "/qr-code-generator",
          enabled: true,
          description: "Geração de QR codes para pesquisas de satisfação"
        },
        {
          id: "system-settings",
          icon: "Settings",
          name: "Configurações do Sistema",
          route: "/settings",
          enabled: true,
          description: "Configurações avançadas e administração do sistema"
        }
      ],
      description: "Sistema 360° para gestão empresarial completa",
      foundingYear: 2017,
      gamification: {
        enabled: true,
        levelSystem: {
          enabled: true,
          thresholds: [0, 100, 250, 500, 1000, 2000, 3500, 5000, 7500, 10000]
        },
        streakSystem: {
          enabled: true,
          maxDays: 30
        },
        currentPeriod: {
          name: "Período 2025 - 1º Semestre",
          endDate: "2025-06-30",
          startDate: "2025-01-01",
          description: "Período de gamificação do primeiro semestre de 2025"
        },
        achievementBadges: [
          {
            id: "first_review",
            icon: "Star",
            name: "Primeira Avaliação",
            type: "bronze",
            color: "bg-amber-600",
            enabled: true,
            description: "Receba sua primeira avaliação",
            requirement: {
              type: "reviews_count",
              value: 1
            }
          },
          {
            id: "ten_reviews",
            icon: "Target",
            name: "Dedicado",
            type: "silver",
            color: "bg-gray-400",
            enabled: true,
            description: "Receba 10 avaliações",
            requirement: {
              type: "reviews_count",
              value: 10
            }
          },
          {
            id: "fifty_reviews",
            icon: "Trophy",
            name: "Comprometido",
            type: "gold",
            color: "bg-yellow-500",
            enabled: true,
            description: "Receba 50 avaliações",
            requirement: {
              type: "reviews_count",
              value: 50
            }
          },
          {
            id: "hundred_reviews",
            icon: "Crown",
            name: "Excepcional",
            type: "platinum",
            color: "bg-purple-500",
            enabled: true,
            description: "Receba 100 avaliações",
            requirement: {
              type: "reviews_count",
              value: 100
            }
          },
          {
            id: "perfect_rating",
            icon: "Medal",
            name: "Perfeição",
            type: "platinum",
            color: "bg-purple-500",
            enabled: true,
            description: "Mantenha nota 5.0 com pelo menos 10 avaliações",
            requirement: {
              type: "average_rating",
              value: 5,
              minReviews: 10
            }
          },
          {
            id: "high_rating",
            icon: "Award",
            name: "Excelência",
            type: "gold",
            color: "bg-yellow-500",
            enabled: true,
            description: "Mantenha nota média acima de 4.5",
            requirement: {
              type: "average_rating",
              value: 4.5,
              minReviews: 5
            }
          },
          {
            id: "streak_week",
            icon: "Flame",
            name: "Consistente",
            type: "silver",
            color: "bg-gray-400",
            enabled: true,
            description: "Receba avaliações por 7 dias consecutivos",
            requirement: {
              type: "streak_days",
              value: 7
            }
          },
          {
            id: "positive_ratio",
            icon: "TrendingUp",
            name: "Satisfação Garantida",
            type: "gold",
            color: "bg-yellow-500",
            enabled: true,
            description: "90% de avaliações positivas (4-5 estrelas)",
            requirement: {
              type: "positive_ratio",
              value: 90,
              minReviews: 10
            }
          }
        ]
      },
      serviceTimeBadges: [
        {
          color: "bg-blue-500",
          title: "Iniciante",
          maxYears: 2,
          minYears: 1,
          description: "Primeiros passos na empresa"
        },
        {
          color: "bg-green-500",
          title: "Dedicado",
          maxYears: 4,
          minYears: 3,
          description: "Comprometimento demonstrado"
        },
        {
          color: "bg-purple-500",
          title: "Veterano",
          maxYears: 6,
          minYears: 5,
          description: "Experiência consolidada"
        },
        {
          color: "bg-yellow-500",
          title: "Especialista",
          maxYears: 8,
          minYears: 7,
          description: "Conhecimento especializado"
        },
        {
          color: "bg-orange-500",
          title: "Mestre",
          minYears: 9,
          description: "Excelência e liderança"
        }
      ]
    },
    description: "Configurações da empresa incluindo gamificação",
    createdAt: "2025-08-05T08:23:09.845Z",
    updatedAt: "2025-08-05T10:52:29.803Z"
  }
];

const supabaseSystemModules = [
  {
    id: "a0338e8d-58b9-40b1-bd83-9733b513eff8",
    moduleId: "satisfaction-survey",
    name: "Pesquisa de Satisfação",
    description: "Módulo para coleta e análise de feedback de clientes",
    enabled: true,
    icon: "MessageSquare",
    route: "/dashboard",
    sortOrder: 1,
    createdAt: "2025-08-05T04:30:16.270Z",
    updatedAt: "2025-08-05T04:30:16.270Z"
  }
];

async function migrateData() {
  try {
    console.log('🚀 Iniciando migração dos dados do Supabase para PostgreSQL local...');

    // Limpar dados existentes
    console.log('🗑️ Limpando dados existentes...');
    await prisma.auditLog.deleteMany();
    await prisma.feedback.deleteMany();
    await prisma.avaliacao.deleteMany();
    await prisma.usuario.deleteMany();
    console.log('✅ Dados existentes removidos');

    // Migrar usuários
    console.log('👥 Migrando usuários...');
    for (const user of supabaseUsers) {
      // Mapear roles do Supabase para o enum do Prisma
      let userType: 'ADMIN' | 'SUPERVISOR' | 'ATENDENTE';
      switch (user.role) {
        case 'admin':
          userType = 'ADMIN';
          break;
        case 'supervisor':
          userType = 'SUPERVISOR';
          break;
        case 'attendant':
          userType = 'ATENDENTE';
          break;
        default:
          userType = 'ATENDENTE';
      }

      await prisma.usuario.create({
        data: {
          id: user.id,
          nome: user.name,
          email: user.email,
          senha: user.password,
          userType: userType,
          ativo: user.status === 'active',
          criadoEm: new Date(user.createdAt),
          atualizadoEm: new Date(user.updatedAt)
        }
      });
    }
    console.log(`✅ ${supabaseUsers.length} usuários migrados`);

    // Migrar avaliações
    console.log('⭐ Migrando avaliações...');
    for (let i = 0; i < supabaseReviews.length; i++) {
      const review = supabaseReviews[i];
      if (!review) continue;
      
      // Criar um avaliador fictício (admin) para as avaliações do Supabase
      const adminUser = supabaseUsers.find(u => u.role === 'admin');
      if (!adminUser) continue;

      // Criar um período único para cada avaliação para evitar conflitos
      const reviewDate = new Date(review.date);
      const periodo = `${reviewDate.getFullYear()}-${String(reviewDate.getMonth() + 1).padStart(2, '0')}-${String(reviewDate.getDate()).padStart(2, '0')}-${i}`;

      await prisma.avaliacao.create({
        data: {
          id: review.id,
          avaliadoId: review.attendantId,
          avaliadorId: adminUser.id, // Usar admin como avaliador fictício
          nota: review.rating,
          comentario: review.comment || null,
          periodo: periodo, // Período único baseado na data e índice
          criadoEm: new Date(review.date),
          atualizadoEm: new Date(review.date)
        }
      });
    }
    console.log(`✅ ${supabaseReviews.length} avaliações migradas`);

    // Criar alguns feedbacks de exemplo baseados nas avaliações
    console.log('💬 Criando feedbacks de exemplo...');
    let feedbackCount = 0;
    for (let i = 0; i < Math.min(5, supabaseReviews.length); i++) {
      const review = supabaseReviews[i];
      if (!review) continue;
      
      const adminUser = supabaseUsers.find(u => u.role === 'admin');
      if (!adminUser || !review.comment) continue;

      await prisma.feedback.create({
        data: {
          titulo: `Feedback baseado em avaliação`,
          conteudo: review.comment,
          tipo: review.rating >= 4 ? 'ELOGIO' : 'SUGESTAO',
          prioridade: 'MEDIA',
          status: 'RESOLVIDO',
          receptorId: review.attendantId,
          remetenteId: adminUser.id,
          criadoEm: new Date(review.date),
          atualizadoEm: new Date(review.date)
        }
      });
      feedbackCount++;
    }
    console.log(`✅ ${feedbackCount} feedbacks criados`);

    // Migrar audit_logs (tabela vazia no Supabase)
    console.log('📋 Verificando audit_logs...');
    console.log('ℹ️ Tabela audit_logs está vazia no Supabase - nenhum dado para migrar');

    // Verificar dados migrados
    console.log('\n📊 Verificando dados migrados...');
    const userCount = await prisma.usuario.count();
    const reviewCount = await prisma.avaliacao.count();
    const totalFeedbackCount = await prisma.feedback.count();

    console.log(`👥 Usuários: ${userCount}`);
    console.log(`⭐ Avaliações: ${reviewCount}`);
    console.log(`💬 Feedbacks: ${totalFeedbackCount}`);

    // Mostrar estatísticas por tipo de usuário
    const adminCount = await prisma.usuario.count({ where: { userType: 'ADMIN' } });
    const supervisorCount = await prisma.usuario.count({ where: { userType: 'SUPERVISOR' } });
    const atendenteCount = await prisma.usuario.count({ where: { userType: 'ATENDENTE' } });

    console.log(`\n📈 Estatísticas por tipo:`);
    console.log(`👑 Administradores: ${adminCount}`);
    console.log(`👨‍💼 Supervisores: ${supervisorCount}`);
    console.log(`👥 Atendentes: ${atendenteCount}`);

    console.log('\n🎉 Migração concluída com sucesso!');

  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateData()
  .then(() => {
    console.log('✅ Script de migração finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Falha na migração:', error);
    process.exit(1);
  });