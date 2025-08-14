const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Script para criar entradas de changelog automaticamente
 * Baseado em commits do Git e tags de versão
 */

const prisma = new PrismaClient();

function executarComando(comando) {
  try {
    return execSync(comando, { encoding: 'utf8' }).trim();
  } catch (error) {
    console.warn(`Aviso: Não foi possível executar '${comando}':`, error.message);
    return null;
  }
}

function analisarCommitMessage(message) {
  const tipos = {
    'feat': 'ADICIONADO',
    'fix': 'CORRIGIDO',
    'docs': 'ADICIONADO',
    'style': 'ALTERADO',
    'refactor': 'ALTERADO',
    'perf': 'ALTERADO',
    'test': 'ALTERADO',
    'chore': 'ALTERADO',
    'security': 'SEGURANCA',
    'breaking': 'ALTERADO'
  };
  
  const categorias = {
    'feat': 'FUNCIONALIDADE',
    'fix': 'FUNCIONALIDADE',
    'docs': 'DOCUMENTACAO',
    'style': 'INTERFACE',
    'refactor': 'TECNICO',
    'perf': 'PERFORMANCE',
    'test': 'TECNICO',
    'chore': 'CONFIGURACAO',
    'security': 'SEGURANCA'
  };
  
  const prioridades = {
    'breaking': 'CRITICA',
    'security': 'ALTA',
    'feat': 'MEDIA',
    'fix': 'ALTA',
    'perf': 'MEDIA',
    'docs': 'BAIXA',
    'style': 'BAIXA',
    'refactor': 'MEDIA',
    'test': 'BAIXA',
    'chore': 'BAIXA'
  };
  
  // Analisar o tipo do commit (conventional commits)
  const conventionalMatch = message.match(/^(\w+)(\(.+\))?(!)?:\s*(.+)/);
  
  if (conventionalMatch) {
    const [, tipo, escopo, breaking, descricao] = conventionalMatch;
    const tipoLower = tipo.toLowerCase();
    
    return {
      tipo: breaking ? 'ALTERADO' : (tipos[tipoLower] || 'ALTERADO'),
      categoria: categorias[tipoLower] || 'TECNICO',
      prioridade: breaking ? 'CRITICA' : (prioridades[tipoLower] || 'MEDIA'),
      titulo: descricao.trim(),
      escopo: escopo ? escopo.replace(/[()]/g, '') : null,
      breaking: !!breaking
    };
  }
  
  // Fallback para commits não convencionais
  const messageLower = message.toLowerCase();
  
  if (messageLower.includes('fix') || messageLower.includes('corrig')) {
    return {
      tipo: 'CORRIGIDO',
      categoria: 'FUNCIONALIDADE',
      prioridade: 'ALTA',
      titulo: message,
      escopo: null,
      breaking: false
    };
  }
  
  if (messageLower.includes('add') || messageLower.includes('adic')) {
    return {
      tipo: 'ADICIONADO',
      categoria: 'FUNCIONALIDADE',
      prioridade: 'MEDIA',
      titulo: message,
      escopo: null,
      breaking: false
    };
  }
  
  return {
    tipo: 'ALTERADO',
    categoria: 'FUNCIONALIDADE',
    prioridade: 'MEDIA',
    titulo: message,
    escopo: null,
    breaking: false
  };
}

async function obterUsuarioAdmin() {
  // Tentar encontrar um usuário admin
  let admin = await prisma.usuario.findFirst({
    where: { tipoUsuario: 'ADMIN' }
  });
  
  if (!admin) {
    console.log('⚠️  Nenhum usuário admin encontrado. Criando usuário padrão...');
    
    admin = await prisma.usuario.create({
      data: {
        nome: 'Sistema',
        email: 'sistema@koerner360.com',
        senha: 'sistema123', // Senha temporária
        tipoUsuario: 'ADMIN',
        ativo: true
      }
    });
    
    console.log('✅ Usuário admin criado:', admin.email);
  }
  
  return admin;
}

async function obterCommitsDesdeUltimaTag() {
  // Obter a última tag
  const ultimaTag = executarComando('git describe --tags --abbrev=0 2>/dev/null');
  
  let comando;
  if (ultimaTag) {
    comando = `git log ${ultimaTag}..HEAD --pretty=format:"%H|%s|%an|%ae|%ci"`;
    console.log(`📝 Obtendo commits desde a tag: ${ultimaTag}`);
  } else {
    comando = 'git log --pretty=format:"%H|%s|%an|%ae|%ci" -10';
    console.log('📝 Nenhuma tag encontrada. Obtendo últimos 10 commits.');
  }
  
  const output = executarComando(comando);
  
  if (!output) {
    return [];
  }
  
  return output.split('\n').map(linha => {
    const [hash, message, author, email, date] = linha.split('|');
    return {
      hash,
      message,
      author,
      email,
      date: new Date(date)
    };
  }).filter(commit => commit.hash && commit.message);
}

async function criarChangelogAutomatico() {
  try {
    console.log('🚀 Iniciando criação automática de changelog...');
    
    // Obter informações da versão atual
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    let versao = '1.0.0';
    
    if (fs.existsSync(packageJsonPath)) {
      const packageInfo = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      versao = packageInfo.version;
    }
    
    // Verificar se já existe um changelog para esta versão
    const changelogExistente = await prisma.changelog.findFirst({
      where: { versao }
    });
    
    if (changelogExistente) {
      console.log(`⚠️  Changelog para versão ${versao} já existe. ID: ${changelogExistente.id}`);
      return changelogExistente;
    }
    
    // Obter usuário admin
    const admin = await obterUsuarioAdmin();
    
    // Obter commits desde a última tag
    const commits = await obterCommitsDesdeUltimaTag();
    
    if (commits.length === 0) {
      console.log('⚠️  Nenhum commit novo encontrado.');
      return null;
    }
    
    console.log(`📝 Encontrados ${commits.length} commits para processar`);
    
    // Analisar commits e agrupar por tipo
    const itensAgrupados = {};
    const tiposEncontrados = new Set();
    
    commits.forEach((commit, index) => {
      const analise = analisarCommitMessage(commit.message);
      tiposEncontrados.add(analise.tipo);
      
      if (!itensAgrupados[analise.tipo]) {
        itensAgrupados[analise.tipo] = [];
      }
      
      itensAgrupados[analise.tipo].push({
        titulo: analise.titulo,
        descricao: `Commit: ${commit.hash.slice(0, 8)} por ${commit.author}`,
        tipo: analise.tipo,
        ordem: index + 1
      });
    });
    
    // Determinar tipo principal do changelog
    const tiposPrioridade = ['SEGURANCA', 'CORRIGIDO', 'ADICIONADO', 'ALTERADO', 'DEPRECIADO', 'REMOVIDO'];
    const tipoPrincipal = tiposPrioridade.find(tipo => tiposEncontrados.has(tipo)) || 'ALTERADO';
    
    // Determinar prioridade baseada nos tipos de mudança
    let prioridade = 'MEDIA';
    if (tiposEncontrados.has('SEGURANCA')) prioridade = 'CRITICA';
    else if (tiposEncontrados.has('CORRIGIDO')) prioridade = 'ALTA';
    else if (tiposEncontrados.has('ADICIONADO')) prioridade = 'MEDIA';
    
    // Criar o changelog
    const changelog = await prisma.changelog.create({
      data: {
        versao,
        dataLancamento: new Date(),
        tipo: tipoPrincipal,
        titulo: `Versão ${versao}`,
        descricao: `Release automático com ${commits.length} mudanças. Inclui: ${Array.from(tiposEncontrados).join(', ').toLowerCase()}.`,
        categoria: 'FUNCIONALIDADE',
        prioridade,
        publicado: false, // Não publicar automaticamente
        autorId: admin.id
      }
    });
    
    console.log(`✅ Changelog criado: ${changelog.id}`);
    
    // Criar itens do changelog
    const itensParaCriar = [];
    
    Object.entries(itensAgrupados).forEach(([tipo, itens]) => {
      itens.forEach(item => {
        itensParaCriar.push({
          ...item,
          changelogId: changelog.id
        });
      });
    });
    
    if (itensParaCriar.length > 0) {
      await prisma.changelogItem.createMany({
        data: itensParaCriar
      });
      
      console.log(`✅ ${itensParaCriar.length} itens de changelog criados`);
    }
    
    console.log('🎉 Changelog automático criado com sucesso!');
    console.log(`📋 ID: ${changelog.id}`);
    console.log(`📦 Versão: ${changelog.versao}`);
    console.log(`📝 Título: ${changelog.titulo}`);
    console.log(`🔒 Status: ${changelog.publicado ? 'Publicado' : 'Rascunho'}`);
    
    return changelog;
    
  } catch (error) {
    console.error('❌ Erro ao criar changelog automático:', error);
    throw error;
  }
}

async function publicarUltimoChangelog() {
  try {
    const ultimoChangelog = await prisma.changelog.findFirst({
      where: { publicado: false },
      orderBy: { criadoEm: 'desc' }
    });
    
    if (!ultimoChangelog) {
      console.log('⚠️  Nenhum changelog não publicado encontrado.');
      return null;
    }
    
    const changelogAtualizado = await prisma.changelog.update({
      where: { id: ultimoChangelog.id },
      data: { 
        publicado: true,
        atualizadoEm: new Date()
      }
    });
    
    console.log(`✅ Changelog ${changelogAtualizado.versao} publicado!`);
    return changelogAtualizado;
    
  } catch (error) {
    console.error('❌ Erro ao publicar changelog:', error);
    throw error;
  }
}

async function main() {
  const comando = process.argv[2];
  
  try {
    switch (comando) {
      case 'create':
        await criarChangelogAutomatico();
        break;
        
      case 'publish':
        await publicarUltimoChangelog();
        break;
        
      case 'auto':
        const changelog = await criarChangelogAutomatico();
        if (changelog) {
          await publicarUltimoChangelog();
        }
        break;
        
      default:
        console.log('Uso: node create-changelog.js [create|publish|auto]');
        console.log('  create  - Criar changelog baseado nos commits');
        console.log('  publish - Publicar o último changelog não publicado');
        console.log('  auto    - Criar e publicar automaticamente');
        process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = {
  criarChangelogAutomatico,
  publicarUltimoChangelog,
  analisarCommitMessage
};