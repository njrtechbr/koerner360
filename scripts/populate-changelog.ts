import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';

// Carregar variáveis de ambiente
config({ path: '.env.local' });

const prisma = new PrismaClient();

interface ChangelogEntry {
  versao: string;
  dataLancamento: Date;
  tipo: 'ADICIONADO' | 'ALTERADO' | 'CORRIGIDO' | 'REMOVIDO' | 'DEPRECIADO' | 'SEGURANCA';
  titulo: string;
  descricao: string;
  categoria?: 'FUNCIONALIDADE' | 'INTERFACE' | 'PERFORMANCE' | 'SEGURANCA' | 'CONFIGURACAO' | 'DOCUMENTACAO' | 'TECNICO';
  prioridade: 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA';
  publicado: boolean;
  itens: {
    tipo: 'ADICIONADO' | 'ALTERADO' | 'CORRIGIDO' | 'REMOVIDO' | 'DEPRECIADO' | 'SEGURANCA';
    titulo: string;
    descricao: string;
    ordem: number;
  }[];
}

function parseChangelogMd(): ChangelogEntry[] {
  try {
    const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
    const content = fs.readFileSync(changelogPath, 'utf-8');
    
    const changelogs: ChangelogEntry[] = [];
    const lines = content.split('\n');
    
    let currentVersion: string | null = null;
    let currentDate: Date | null = null;
    let currentTitle = '';
    let currentDescription = '';
    let currentItems: {
      tipo: 'ADICIONADO' | 'ALTERADO' | 'CORRIGIDO' | 'REMOVIDO' | 'DEPRECIADO' | 'SEGURANCA';
      titulo: string;
      descricao: string;
      ordem: number;
    }[] = [];
    let currentSection = '';
    let itemOrder = 1;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]?.trim() || '';
      
      // Detectar versão (ex: ## [0.2.1] - 2025-01-14)
      const versionMatch = line.match(/^##\s*\[([^\]]+)\]\s*-\s*(.+)$/);
      if (versionMatch && versionMatch[1] && versionMatch[2]) {
        // Salvar versão anterior se existir
        if (currentVersion && currentDate) {
          changelogs.push({
            versao: currentVersion,
            dataLancamento: currentDate,
            tipo: 'ADICIONADO',
            titulo: currentTitle || `Versão ${currentVersion}`,
            descricao: currentDescription || `Mudanças da versão ${currentVersion}`,
            categoria: determineCategory(currentVersion),
            prioridade: determinePriority(currentVersion),
            publicado: true,
            itens: currentItems
          });
        }
        
        // Iniciar nova versão
        currentVersion = versionMatch[1];
        currentDate = parseDate(versionMatch[2]);
        currentTitle = '';
        currentDescription = '';
        currentItems = [];
        currentSection = '';
        itemOrder = 1;
        continue;
      }
      
      // Pular versões não lançadas
      if (line.includes('[Não Lançado]') || line.includes('[Unreleased]')) {
        currentVersion = null;
        continue;
      }
      
      // Detectar seção (ex: ### 🔧 Alterado)
      const sectionMatch = line.match(/^###\s*[🔧✨🛠️🔄🐛🗑️🚀📚📊✅]?\s*(.+)$/);
      if (sectionMatch && sectionMatch[1]) {
        currentSection = sectionMatch[1].trim();
        continue;
      }
      
      // Detectar item (ex: - **Nome do Item**: Descrição)
      const itemMatch = line.match(/^-\s*\*\*([^*]+)\*\*:?\s*(.*)$/);
      if (itemMatch && itemMatch[1] && itemMatch[2] && currentVersion) {
        const titulo = itemMatch[1].trim();
        const descricao = itemMatch[2].trim();
        
        if (titulo && descricao) {
          currentItems.push({
            tipo: mapSectionToType(currentSection),
            titulo,
            descricao,
            ordem: itemOrder++
          });
        }
        continue;
      }
      
      // Detectar itens simples (ex: - Configuração inicial do projeto Next.js 15)
      const simpleItemMatch = line.match(/^-\s*(.+)$/);
      if (simpleItemMatch && simpleItemMatch[1] && currentVersion && currentSection) {
        const texto = simpleItemMatch[1].trim();
        
        if (texto && !texto.startsWith('✅') && !texto.startsWith('👑') && !texto.startsWith('👨‍💼')) {
          currentItems.push({
            tipo: mapSectionToType(currentSection),
            titulo: texto.length > 50 ? texto.substring(0, 50) + '...' : texto,
            descricao: texto,
            ordem: itemOrder++
          });
        }
        continue;
      }
      
      // Capturar título e descrição da versão
      if (currentVersion && !currentTitle && line && !line.startsWith('#') && !line.startsWith('-')) {
        if (line.length > 10) {
          currentTitle = line.length > 100 ? line.substring(0, 100) + '...' : line;
          currentDescription = line;
        }
      }
    }
    
    // Salvar última versão
    if (currentVersion && currentDate) {
      changelogs.push({
        versao: currentVersion,
        dataLancamento: currentDate,
        tipo: 'ADICIONADO',
        titulo: currentTitle || `Versão ${currentVersion}`,
        descricao: currentDescription || `Mudanças da versão ${currentVersion}`,
        categoria: determineCategory(currentVersion),
        prioridade: determinePriority(currentVersion),
        publicado: true,
        itens: currentItems
      });
    }
    
    return changelogs;
  } catch (error) {
    console.error('❌ Erro ao parsear CHANGELOG.md:', error);
    // Fallback para dados hardcoded se o parsing falhar
    const entries: ChangelogEntry[] = [];
  
  // Versão 0.2.1
  entries.push({
    versao: '0.2.1',
    dataLancamento: new Date('2025-01-14'),
    tipo: 'ADICIONADO',
    titulo: 'Sistema de Changelog Automático e Versionamento',
    descricao: 'Implementação completa do sistema de changelog automático com geração de build info, interface web e API completa.',
    categoria: 'FUNCIONALIDADE',
    prioridade: 'ALTA',
    publicado: true,
    itens: [
      {
        tipo: 'ADICIONADO',
        titulo: 'Sistema de Changelog Automático',
        descricao: 'Criação automática de changelogs baseada em commits Git',
        ordem: 1
      },
      {
        tipo: 'ADICIONADO',
        titulo: 'Geração de Build Info',
        descricao: 'Script para capturar informações de build, Git e ambiente',
        ordem: 2
      },
      {
        tipo: 'ADICIONADO',
        titulo: 'Interface Web de Changelog',
        descricao: 'Página pública para visualização de changelogs com paginação',
        ordem: 3
      },
      {
        tipo: 'ADICIONADO',
        titulo: 'API de Changelog',
        descricao: 'Endpoints completos para CRUD de changelogs e itens',
        ordem: 4
      },
      {
        tipo: 'ADICIONADO',
        titulo: 'Suporte a Conventional Commits',
        descricao: 'Classificação automática de mudanças por tipo',
        ordem: 5
      },
      {
        tipo: 'ADICIONADO',
        titulo: 'Versionamento Semântico',
        descricao: 'Scripts para incremento automático de versões',
        ordem: 6
      },
      {
        tipo: 'ADICIONADO',
        titulo: 'Documentação Completa',
        descricao: 'Guia detalhado do sistema de versionamento',
        ordem: 7
      },
      {
        tipo: 'ALTERADO',
        titulo: 'README.md',
        descricao: 'Adicionada seção sobre sistema de versionamento e novos scripts',
        ordem: 8
      },
      {
        tipo: 'ALTERADO',
        titulo: 'package.json',
        descricao: 'Incluídos scripts para build:info, changelog e versionamento',
        ordem: 9
      },
      {
        tipo: 'ALTERADO',
        titulo: 'Esquema Prisma',
        descricao: 'Adicionadas tabelas Changelog e ChangelogItem com enums',
        ordem: 10
      }
    ]
  });
  
  // Versão 0.2.0
  entries.push({
    versao: '0.2.0',
    dataLancamento: new Date('2025-01-13'),
    tipo: 'ADICIONADO',
    titulo: 'Sistema Completo de Gestão e Automação',
    descricao: 'Implementação completa do sistema com versionamento automático, CI/CD, Docker, Prisma ORM e migração do Supabase.',
    categoria: 'FUNCIONALIDADE',
    prioridade: 'CRITICA',
    publicado: true,
    itens: [
      {
        tipo: 'ADICIONADO',
        titulo: 'Sistema de Versionamento Automático',
        descricao: 'Scripts personalizados para build, changelog e tags Git',
        ordem: 1
      },
      {
        tipo: 'ADICIONADO',
        titulo: 'Pipeline CI/CD Completo',
        descricao: 'GitHub Actions com workflows de release automático',
        ordem: 2
      },
      {
        tipo: 'ADICIONADO',
        titulo: 'Configuração Docker',
        descricao: 'docker-compose.yml para PostgreSQL e PgAdmin',
        ordem: 3
      },
      {
        tipo: 'ADICIONADO',
        titulo: 'Implementação Prisma ORM',
        descricao: 'Schema completo com modelos Usuario, Avaliacao e Feedback',
        ordem: 4
      },
      {
        tipo: 'ADICIONADO',
        titulo: 'Sistema de Relacionamentos',
        descricao: 'Hierarquia supervisor/atendente com enums tipados',
        ordem: 5
      },
      {
        tipo: 'ADICIONADO',
        titulo: 'Migração Completa do Supabase',
        descricao: 'Script automatizado para transferir todas as tabelas',
        ordem: 6
      },
      {
        tipo: 'ADICIONADO',
        titulo: 'Páginas do Sistema',
        descricao: 'Avaliações, Feedbacks e Configurações com layout consistente',
        ordem: 7
      },
      {
        tipo: 'ADICIONADO',
        titulo: 'Sistema de Autenticação Robusto',
        descricao: 'NextAuth.js/Auth.js v5 com proteção de rotas',
        ordem: 8
      },
      {
        tipo: 'ADICIONADO',
        titulo: 'Gerenciamento de Usuários',
        descricao: 'CRUD completo com paginação, filtros e permissões',
        ordem: 9
      },
      {
        tipo: 'ADICIONADO',
        titulo: 'Scripts de Desenvolvimento',
        descricao: 'Teste de conexão, seed automático e validação de dados',
        ordem: 10
      },
      {
        tipo: 'CORRIGIDO',
        titulo: 'Sistema de Permissões',
        descricao: 'Inconsistências entre banco e código resolvidas',
        ordem: 11
      },
      {
        tipo: 'CORRIGIDO',
        titulo: 'Autenticação',
        descricao: 'Configuração corrigida para tabela usuarios PostgreSQL',
        ordem: 12
      },
      {
        tipo: 'REMOVIDO',
        titulo: 'Dependência Supabase',
        descricao: 'Cliente e configurações antigas removidas',
        ordem: 13
      }
    ]
  });
  
  // Versão 0.1.0
  entries.push({
    versao: '0.1.0',
    dataLancamento: new Date('2024-12-18'),
    tipo: 'ADICIONADO',
    titulo: 'Configuração Inicial do Projeto',
    descricao: 'Setup inicial do projeto Next.js 15 com TypeScript, autenticação, Supabase e interface completa.',
    categoria: 'CONFIGURACAO',
    prioridade: 'CRITICA',
    publicado: true,
    itens: [
      {
        tipo: 'ADICIONADO',
        titulo: 'Configuração inicial do projeto',
        descricao: 'Next.js 15 com TypeScript',
        ordem: 1
      },
      {
        tipo: 'ADICIONADO',
        titulo: 'Sistema de autenticação',
        descricao: 'NextAuth.js v5 com proteção de rotas',
        ordem: 2
      },
      {
        tipo: 'ADICIONADO',
        titulo: 'Integração com Supabase',
        descricao: 'Banco de dados PostgreSQL',
        ordem: 3
      },
      {
        tipo: 'ADICIONADO',
        titulo: 'Interface de usuário',
        descricao: 'Tailwind CSS e shadcn/ui',
        ordem: 4
      },
      {
        tipo: 'ADICIONADO',
        titulo: 'Página de login',
        descricao: 'Validação usando React Hook Form e Zod',
        ordem: 5
      },
      {
        tipo: 'ADICIONADO',
        titulo: 'Dashboard principal',
        descricao: 'Estatísticas e gráficos com Recharts',
        ordem: 6
      },
      {
        tipo: 'ADICIONADO',
        titulo: 'Sistema de roles',
        descricao: 'admin, supervisor, attendant',
        ordem: 7
      },
      {
        tipo: 'ADICIONADO',
        titulo: 'Middleware de proteção',
        descricao: 'Proteção de rotas baseada em autenticação',
        ordem: 8
      },
      {
        tipo: 'ADICIONADO',
        titulo: 'Componentes de UI',
        descricao: 'Alert, Button, Card, Input, Table, Dialog',
        ordem: 9
      },
      {
        tipo: 'ADICIONADO',
        titulo: 'Estrutura de documentação',
        descricao: 'README, guias de desenvolvimento e API',
        ordem: 10
      }
    ]
  });
  
    return entries;
  }
}

// Função auxiliar para mapear seção para tipo
function mapSectionToType(section: string): 'ADICIONADO' | 'ALTERADO' | 'CORRIGIDO' | 'REMOVIDO' | 'DEPRECIADO' | 'SEGURANCA' {
  const sectionLower = section.toLowerCase();
  
  if (sectionLower.includes('adicionado') || sectionLower.includes('added')) {
    return 'ADICIONADO';
  }
  if (sectionLower.includes('alterado') || sectionLower.includes('changed') || sectionLower.includes('configuração')) {
    return 'ALTERADO';
  }
  if (sectionLower.includes('corrigido') || sectionLower.includes('fixed')) {
    return 'CORRIGIDO';
  }
  if (sectionLower.includes('removido') || sectionLower.includes('removed')) {
    return 'REMOVIDO';
  }
  if (sectionLower.includes('descontinuado') || sectionLower.includes('deprecated')) {
    return 'DEPRECIADO';
  }
  if (sectionLower.includes('segurança') || sectionLower.includes('security')) {
    return 'SEGURANCA';
  }
  
  return 'ADICIONADO'; // padrão
}

// Função auxiliar para determinar categoria
function determineCategory(version: string): 'FUNCIONALIDADE' | 'INTERFACE' | 'PERFORMANCE' | 'SEGURANCA' | 'CONFIGURACAO' | 'DOCUMENTACAO' | 'TECNICO' {
  const [major, minor] = version.split('.').map(Number);
  
  if (major === 0 && minor === 1) {
    return 'CONFIGURACAO';
  }
  if (major === 0 && minor === 2) {
    return 'FUNCIONALIDADE';
  }
  
  return 'TECNICO';
}

// Função auxiliar para determinar prioridade
function determinePriority(version: string): 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA' {
  const [major, minor] = version.split('.').map(Number);
  
  if (major && major > 0) {
    return 'CRITICA';
  }
  if (minor === 1) {
    return 'CRITICA';
  }
  
  return 'ALTA';
}

// Função auxiliar para parsear data
function parseDate(dateStr: string): Date {
  // Formato esperado: 2025-08-14 ou 2025-08-13
  const match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (match && match[1] && match[2] && match[3]) {
    return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
  }
  
  // Para próximos changelogs, usar data atual do sistema
  return new Date();
}

async function populateChangelog() {
  try {
    console.log('🚀 Iniciando população da tabela de changelog...');
    
    // Limpar dados existentes
    console.log('🧹 Limpando dados existentes...');
    await prisma.changelogItem.deleteMany();
    await prisma.changelog.deleteMany();
    
    const entries = parseChangelogMd();
    
    console.log(`📝 Criando ${entries.length} entradas de changelog...`);
    
    for (const entry of entries) {
      console.log(`   📋 Criando changelog para versão ${entry.versao}...`);
      
      const changelog = await prisma.changelog.create({
        data: {
          versao: entry.versao,
          dataLancamento: entry.dataLancamento,
          tipo: entry.tipo,
          titulo: entry.titulo,
          descricao: entry.descricao,
          categoria: entry.categoria,
          prioridade: entry.prioridade,
          publicado: entry.publicado
        }
      });
      
      console.log(`   📝 Criando ${entry.itens.length} itens para versão ${entry.versao}...`);
      
      for (const item of entry.itens) {
        await prisma.changelogItem.create({
          data: {
            changelogId: changelog.id,
            tipo: item.tipo,
            titulo: item.titulo,
            descricao: item.descricao,
            ordem: item.ordem
          }
        });
      }
    }
    
    console.log('✅ Changelog populado com sucesso!');
    
    // Verificar dados criados
    const totalChangelogs = await prisma.changelog.count();
    const totalItens = await prisma.changelogItem.count();
    
    console.log(`📊 Estatísticas:`);
    console.log(`   📋 Total de changelogs: ${totalChangelogs}`);
    console.log(`   📝 Total de itens: ${totalItens}`);
    
  } catch (error) {
    console.error('❌ Erro ao popular changelog:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  populateChangelog()
    .then(() => {
      console.log('🎉 Script executado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erro na execução do script:', error);
      process.exit(1);
    });
}

export { populateChangelog };