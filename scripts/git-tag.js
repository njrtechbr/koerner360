#!/usr/bin/env node

/**
 * Script para criar tags automaticamente no Git
 * Cria tag baseada na versão do package.json e faz push para o repositório remoto
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Função para executar comandos git
function execGitCommand(command, options = {}) {
  try {
    return execSync(command, { 
      encoding: 'utf8', 
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options 
    }).trim();
  } catch (error) {
    if (!options.silent) {
      console.error(`❌ Erro ao executar '${command}':`, error.message);
    }
    throw error;
  }
}

// Função para obter informações do package.json
function getPackageInfo() {
  try {
    const packagePath = path.join(process.cwd(), 'package.json');
    const packageContent = fs.readFileSync(packagePath, 'utf8');
    return JSON.parse(packageContent);
  } catch (error) {
    console.error('❌ Erro ao ler package.json:', error.message);
    process.exit(1);
  }
}

// Função para verificar se a tag já existe
function tagExists(tagName) {
  try {
    execGitCommand(`git rev-parse ${tagName}`, { silent: true });
    return true;
  } catch (error) {
    return false;
  }
}

// Função para obter a última tag
function getLastTag() {
  try {
    return execGitCommand('git describe --tags --abbrev=0', { silent: true });
  } catch (error) {
    return null;
  }
}

// Função para obter commits desde a última tag
function getCommitsSinceLastTag() {
  const lastTag = getLastTag();
  
  let gitLogCommand;
  if (lastTag) {
    gitLogCommand = `git log ${lastTag}..HEAD --oneline --no-merges`;
  } else {
    gitLogCommand = 'git log --oneline --no-merges';
  }
  
  try {
    const commits = execGitCommand(gitLogCommand, { silent: true });
    return commits ? commits.split('\n').filter(line => line.trim()) : [];
  } catch (error) {
    return [];
  }
}

// Função para gerar mensagem da tag
function generateTagMessage(version, commits) {
  let message = `Release ${version}`;
  
  if (commits.length > 0) {
    message += `\n\nMudanças nesta versão:\n`;
    
    // Categorizar commits para a mensagem
    const features = commits.filter(c => 
      c.toLowerCase().includes('feat') || 
      c.toLowerCase().includes('feature')
    );
    
    const fixes = commits.filter(c => 
      c.toLowerCase().includes('fix') || 
      c.toLowerCase().includes('bugfix')
    );
    
    const docs = commits.filter(c => 
      c.toLowerCase().includes('docs') || 
      c.toLowerCase().includes('documentation')
    );
    
    const others = commits.filter(c => 
      !features.includes(c) && 
      !fixes.includes(c) && 
      !docs.includes(c)
    );
    
    if (features.length > 0) {
      message += `\n✨ Novas funcionalidades (${features.length}):`;
      features.slice(0, 5).forEach(commit => {
        const cleanCommit = commit.replace(/^[a-f0-9]+\s+/, '');
        message += `\n- ${cleanCommit}`;
      });
      if (features.length > 5) {
        message += `\n- ... e mais ${features.length - 5} funcionalidades`;
      }
    }
    
    if (fixes.length > 0) {
      message += `\n\n🐛 Correções (${fixes.length}):`;
      fixes.slice(0, 5).forEach(commit => {
        const cleanCommit = commit.replace(/^[a-f0-9]+\s+/, '');
        message += `\n- ${cleanCommit}`;
      });
      if (fixes.length > 5) {
        message += `\n- ... e mais ${fixes.length - 5} correções`;
      }
    }
    
    if (docs.length > 0) {
      message += `\n\n📚 Documentação (${docs.length}):`;
      docs.slice(0, 3).forEach(commit => {
        const cleanCommit = commit.replace(/^[a-f0-9]+\s+/, '');
        message += `\n- ${cleanCommit}`;
      });
      if (docs.length > 3) {
        message += `\n- ... e mais ${docs.length - 3} melhorias de documentação`;
      }
    }
    
    if (others.length > 0) {
      message += `\n\n📝 Outras mudanças (${others.length}):`;
      others.slice(0, 3).forEach(commit => {
        const cleanCommit = commit.replace(/^[a-f0-9]+\s+/, '');
        message += `\n- ${cleanCommit}`;
      });
      if (others.length > 3) {
        message += `\n- ... e mais ${others.length - 3} mudanças`;
      }
    }
    
    message += `\n\nTotal de commits: ${commits.length}`;
  }
  
  return message;
}

// Função para verificar se há mudanças não commitadas
function hasUncommittedChanges() {
  try {
    const status = execGitCommand('git status --porcelain', { silent: true });
    return status.length > 0;
  } catch (error) {
    return false;
  }
}

// Função para verificar se estamos na branch principal
function isOnMainBranch() {
  try {
    const currentBranch = execGitCommand('git branch --show-current', { silent: true });
    return ['main', 'master'].includes(currentBranch);
  } catch (error) {
    return false;
  }
}

// Função para criar tag
function createTag(force = false) {
  console.log('🏷️  Criando tag Git...');
  
  // Verificar se estamos em um repositório git
  try {
    execGitCommand('git rev-parse --git-dir', { silent: true });
  } catch (error) {
    console.error('❌ Não é um repositório Git válido.');
    process.exit(1);
  }
  
  // Obter informações do package.json
  const packageInfo = getPackageInfo();
  const version = packageInfo.version;
  const tagName = `v${version}`;
  
  console.log(`📦 Versão atual: ${version}`);
  
  // Verificar se a tag já existe
  if (tagExists(tagName) && !force) {
    console.error(`❌ Tag '${tagName}' já existe. Use --force para sobrescrever.`);
    process.exit(1);
  }
  
  // Verificar mudanças não commitadas
  if (hasUncommittedChanges()) {
    console.warn('⚠️  Há mudanças não commitadas. Recomenda-se fazer commit antes de criar a tag.');
    
    // Perguntar se deve continuar (em ambiente interativo)
    if (process.stdin.isTTY && !force) {
      console.log('Deseja continuar mesmo assim? (y/N)');
      // Para simplicidade, vamos continuar automaticamente em modo não-interativo
    }
  }
  
  // Verificar se estamos na branch principal
  if (!isOnMainBranch() && !force) {
    console.warn('⚠️  Não está na branch principal (main/master). Recomenda-se criar tags apenas na branch principal.');
  }
  
  // Obter commits desde a última tag
  const commits = getCommitsSinceLastTag();
  console.log(`📋 Encontrados ${commits.length} commits desde a última tag.`);
  
  // Gerar mensagem da tag
  const tagMessage = generateTagMessage(version, commits);
  
  try {
    // Deletar tag existente se force estiver habilitado
    if (tagExists(tagName) && force) {
      console.log(`🗑️  Removendo tag existente '${tagName}'...`);
      execGitCommand(`git tag -d ${tagName}`, { silent: true });
      
      // Tentar remover do remoto também
      try {
        execGitCommand(`git push origin :refs/tags/${tagName}`, { silent: true });
        console.log('🗑️  Tag removida do repositório remoto.');
      } catch (error) {
        console.warn('⚠️  Não foi possível remover a tag do repositório remoto.');
      }
    }
    
    // Criar nova tag
    console.log(`🏷️  Criando tag '${tagName}'...`);
    
    // Escrever mensagem em arquivo temporário para evitar problemas com caracteres especiais
    const tempFile = path.join(process.cwd(), '.git-tag-message.tmp');
    fs.writeFileSync(tempFile, tagMessage, 'utf8');
    
    try {
      execGitCommand(`git tag -a ${tagName} -F "${tempFile}"`);
      console.log('✅ Tag criada com sucesso!');
    } finally {
      // Limpar arquivo temporário
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
    }
    
    // Fazer push da tag para o repositório remoto
    console.log('📤 Enviando tag para o repositório remoto...');
    try {
      execGitCommand(`git push origin ${tagName}`);
      console.log('✅ Tag enviada para o repositório remoto!');
    } catch (error) {
      console.warn('⚠️  Não foi possível enviar a tag para o repositório remoto.');
      console.warn('💡 Execute manualmente: git push origin ' + tagName);
    }
    
    // Mostrar informações da tag criada
    console.log('\n📋 Informações da tag:');
    console.log(`   Nome: ${tagName}`);
    console.log(`   Versão: ${version}`);
    console.log(`   Commits incluídos: ${commits.length}`);
    
    const lastTag = getLastTag();
    if (lastTag && lastTag !== tagName) {
      console.log(`   Tag anterior: ${lastTag}`);
    }
    
    console.log('\n🎉 Tag criada e enviada com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao criar tag:', error.message);
    process.exit(1);
  }
}

// Função para listar tags
function listTags() {
  console.log('🏷️  Tags existentes:');
  
  try {
    const tags = execGitCommand('git tag -l --sort=-version:refname', { silent: true });
    
    if (!tags) {
      console.log('   Nenhuma tag encontrada.');
      return;
    }
    
    const tagList = tags.split('\n').filter(tag => tag.trim());
    
    tagList.slice(0, 10).forEach((tag, index) => {
      try {
        const tagInfo = execGitCommand(`git show ${tag} --format="%ci %s" --no-patch`, { silent: true });
        const [date, ...messageParts] = tagInfo.split(' ');
        const message = messageParts.join(' ');
        const shortDate = date.split(' ')[0]; // YYYY-MM-DD
        
        console.log(`   ${tag.padEnd(12)} ${shortDate} ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`);
      } catch (error) {
        console.log(`   ${tag}`);
      }
    });
    
    if (tagList.length > 10) {
      console.log(`   ... e mais ${tagList.length - 10} tags`);
    }
    
  } catch (error) {
    console.error('❌ Erro ao listar tags:', error.message);
  }
}

// Função principal
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const force = args.includes('--force') || args.includes('-f');
  
  switch (command) {
    case 'list':
    case 'ls':
      listTags();
      break;
      
    case 'create':
    case undefined:
      createTag(force);
      break;
      
    case 'help':
    case '--help':
    case '-h':
      console.log(`
🏷️  Script de Gerenciamento de Tags Git

Uso:
  node git-tag.js [comando] [opções]

Comandos:
  create, (padrão)  Criar nova tag baseada na versão do package.json
  list, ls          Listar tags existentes
  help              Mostrar esta ajuda

Opções:
  --force, -f       Forçar criação mesmo se a tag já existir

Exemplos:
  node git-tag.js                 # Criar tag da versão atual
  node git-tag.js create --force  # Recriar tag existente
  node git-tag.js list            # Listar todas as tags
`);
      break;
      
    default:
      console.error(`❌ Comando desconhecido: ${command}`);
      console.log('💡 Use "node git-tag.js help" para ver os comandos disponíveis.');
      process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { createTag, listTags, tagExists, getLastTag };