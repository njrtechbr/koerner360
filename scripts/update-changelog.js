#!/usr/bin/env node

/**
 * Script para atualizar automaticamente o CHANGELOG.md
 * Adiciona nova versão com base nos commits desde a última versão
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Função para executar comandos git
function execGitCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8' }).trim();
  } catch (error) {
    console.warn(`Aviso: Não foi possível executar '${command}':`, error.message);
    return '';
  }
}

// Função para obter informações do package.json
function getPackageInfo() {
  try {
    const packagePath = path.join(process.cwd(), 'package.json');
    const packageContent = fs.readFileSync(packagePath, 'utf8');
    return JSON.parse(packageContent);
  } catch (error) {
    console.error('Erro ao ler package.json:', error.message);
    process.exit(1);
  }
}

// Função para obter commits desde a última tag
function getCommitsSinceLastTag() {
  const lastTag = execGitCommand('git describe --tags --abbrev=0 2>/dev/null || echo ""');
  
  let gitLogCommand;
  if (lastTag) {
    gitLogCommand = `git log ${lastTag}..HEAD --oneline --no-merges`;
  } else {
    gitLogCommand = 'git log --oneline --no-merges';
  }
  
  const commits = execGitCommand(gitLogCommand);
  return commits ? commits.split('\n').filter(line => line.trim()) : [];
}

// Função para categorizar commits
function categorizeCommits(commits) {
  const categories = {
    features: [],
    fixes: [],
    docs: [],
    style: [],
    refactor: [],
    test: [],
    chore: [],
    breaking: [],
    other: []
  };
  
  commits.forEach(commit => {
    const message = commit.toLowerCase();
    
    if (message.includes('breaking') || message.includes('!:')) {
      categories.breaking.push(commit);
    } else if (message.startsWith('feat') || message.includes('feature')) {
      categories.features.push(commit);
    } else if (message.startsWith('fix') || message.includes('bugfix')) {
      categories.fixes.push(commit);
    } else if (message.startsWith('docs') || message.includes('documentation')) {
      categories.docs.push(commit);
    } else if (message.startsWith('style') || message.includes('formatting')) {
      categories.style.push(commit);
    } else if (message.startsWith('refactor')) {
      categories.refactor.push(commit);
    } else if (message.startsWith('test')) {
      categories.test.push(commit);
    } else if (message.startsWith('chore')) {
      categories.chore.push(commit);
    } else {
      categories.other.push(commit);
    }
  });
  
  return categories;
}

// Função para formatar commit para changelog
function formatCommit(commit) {
  // Remover hash do commit e limpar mensagem
  const message = commit.replace(/^[a-f0-9]+\s+/, '');
  
  // Capitalizar primeira letra
  return message.charAt(0).toUpperCase() + message.slice(1);
}

// Função para gerar seção do changelog
function generateChangelogSection(version, categories, date) {
  let section = `## [${version}] - ${date}\n\n`;
  
  // Mudanças que quebram compatibilidade
  if (categories.breaking.length > 0) {
    section += '### 💥 BREAKING CHANGES\n\n';
    categories.breaking.forEach(commit => {
      section += `- ${formatCommit(commit)}\n`;
    });
    section += '\n';
  }
  
  // Novas funcionalidades
  if (categories.features.length > 0) {
    section += '### ✨ Novas Funcionalidades\n\n';
    categories.features.forEach(commit => {
      section += `- ${formatCommit(commit)}\n`;
    });
    section += '\n';
  }
  
  // Correções de bugs
  if (categories.fixes.length > 0) {
    section += '### 🐛 Correções\n\n';
    categories.fixes.forEach(commit => {
      section += `- ${formatCommit(commit)}\n`;
    });
    section += '\n';
  }
  
  // Melhorias de documentação
  if (categories.docs.length > 0) {
    section += '### 📚 Documentação\n\n';
    categories.docs.forEach(commit => {
      section += `- ${formatCommit(commit)}\n`;
    });
    section += '\n';
  }
  
  // Refatorações
  if (categories.refactor.length > 0) {
    section += '### ♻️ Refatoração\n\n';
    categories.refactor.forEach(commit => {
      section += `- ${formatCommit(commit)}\n`;
    });
    section += '\n';
  }
  
  // Melhorias de estilo
  if (categories.style.length > 0) {
    section += '### 💄 Estilo\n\n';
    categories.style.forEach(commit => {
      section += `- ${formatCommit(commit)}\n`;
    });
    section += '\n';
  }
  
  // Testes
  if (categories.test.length > 0) {
    section += '### 🧪 Testes\n\n';
    categories.test.forEach(commit => {
      section += `- ${formatCommit(commit)}\n`;
    });
    section += '\n';
  }
  
  // Tarefas de manutenção
  if (categories.chore.length > 0) {
    section += '### 🔧 Manutenção\n\n';
    categories.chore.forEach(commit => {
      section += `- ${formatCommit(commit)}\n`;
    });
    section += '\n';
  }
  
  // Outras mudanças
  if (categories.other.length > 0) {
    section += '### 📝 Outras Mudanças\n\n';
    categories.other.forEach(commit => {
      section += `- ${formatCommit(commit)}\n`;
    });
    section += '\n';
  }
  
  return section;
}

// Função para atualizar o changelog
function updateChangelog() {
  console.log('📝 Atualizando CHANGELOG.md...');
  
  const packageInfo = getPackageInfo();
  const version = packageInfo.version;
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  // Obter commits desde a última tag
  const commits = getCommitsSinceLastTag();
  
  if (commits.length === 0) {
    console.log('ℹ️  Nenhum commit novo encontrado desde a última versão.');
    return;
  }
  
  console.log(`📋 Encontrados ${commits.length} commits para processar.`);
  
  // Categorizar commits
  const categories = categorizeCommits(commits);
  
  // Gerar nova seção do changelog
  const newSection = generateChangelogSection(version, categories, date);
  
  // Ler changelog existente
  const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
  let existingChangelog = '';
  
  if (fs.existsSync(changelogPath)) {
    existingChangelog = fs.readFileSync(changelogPath, 'utf8');
  } else {
    // Criar changelog inicial se não existir
    existingChangelog = `# Changelog\n\nTodas as mudanças notáveis neste projeto serão documentadas neste arquivo.\n\nO formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),\ne este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).\n\n`;
  }
  
  // Encontrar onde inserir a nova seção
  const lines = existingChangelog.split('\n');
  let insertIndex = -1;
  
  // Procurar pela primeira seção de versão existente
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/^## \[\d+\.\d+\.\d+\]/)) {
      insertIndex = i;
      break;
    }
  }
  
  // Se não encontrou nenhuma seção, inserir após o cabeçalho
  if (insertIndex === -1) {
    // Procurar pelo final do cabeçalho
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === '' && i > 0) {
        insertIndex = i + 1;
        break;
      }
    }
  }
  
  // Inserir nova seção
  if (insertIndex !== -1) {
    lines.splice(insertIndex, 0, newSection);
  } else {
    lines.push('', newSection);
  }
  
  // Escrever changelog atualizado
  const updatedChangelog = lines.join('\n');
  fs.writeFileSync(changelogPath, updatedChangelog, 'utf8');
  
  console.log('✅ CHANGELOG.md atualizado com sucesso!');
  console.log(`📦 Versão ${version} adicionada com ${commits.length} mudanças.`);
  
  // Mostrar resumo das categorias
  const summary = [];
  if (categories.breaking.length > 0) summary.push(`${categories.breaking.length} breaking changes`);
  if (categories.features.length > 0) summary.push(`${categories.features.length} novas funcionalidades`);
  if (categories.fixes.length > 0) summary.push(`${categories.fixes.length} correções`);
  if (categories.docs.length > 0) summary.push(`${categories.docs.length} melhorias de documentação`);
  if (categories.refactor.length > 0) summary.push(`${categories.refactor.length} refatorações`);
  if (categories.other.length > 0) summary.push(`${categories.other.length} outras mudanças`);
  
  if (summary.length > 0) {
    console.log(`📊 Resumo: ${summary.join(', ')}.`);
  }
}

// Função para validar se há mudanças para commitar
function validateChanges() {
  const status = execGitCommand('git status --porcelain');
  if (!status) {
    console.log('ℹ️  Nenhuma mudança detectada no repositório.');
    return false;
  }
  return true;
}

// Função principal
function main() {
  try {
    // Verificar se estamos em um repositório git
    execGitCommand('git rev-parse --git-dir');
    
    // Atualizar changelog
    updateChangelog();
    
  } catch (error) {
    console.error('❌ Erro ao atualizar changelog:', error.message);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { updateChangelog, categorizeCommits, formatCommit };