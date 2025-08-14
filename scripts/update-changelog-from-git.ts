import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';

// Carregar variáveis de ambiente
config({ path: '.env.local' });

const prisma = new PrismaClient();

interface GitCommit {
  hash: string;
  date: string;
  message: string;
  author: string;
  type: string;
}

interface ChangelogEntry {
  version: string;
  date: Date;
  commits: GitCommit[];
}

/**
 * Função para obter commits desde a última versão
 */
function getCommitsSinceLastTag(): GitCommit[] {
  try {
    // Obter a última tag
    let lastTag: string;
    try {
      lastTag = execSync('git describe --tags --abbrev=0', { encoding: 'utf-8' }).trim();
    } catch {
      // Se não há tags, usar o primeiro commit
      lastTag = execSync('git rev-list --max-parents=0 HEAD', { encoding: 'utf-8' }).trim();
    }

    // Obter commits desde a última tag
    const gitLog = execSync(
      `git log ${lastTag}..HEAD --pretty=format:"%H|%ai|%s|%an"`,
      { encoding: 'utf-8' }
    );

    if (!gitLog.trim()) {
      console.log('📝 Nenhum commit novo encontrado desde a última versão.');
      return [];
    }

    const commits: GitCommit[] = gitLog
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        const [hash, date, message, author] = line.split('|');
        return {
          hash: hash?.substring(0, 8) || '',
          date: date || '',
          message: message?.trim() || '',
          author: author?.trim() || '',
          type: determineCommitType(message || '')
        };
      });

    return commits;
  } catch (error) {
    console.error('❌ Erro ao obter commits:', error);
    return [];
  }
}

/**
 * Determinar o tipo do commit baseado na mensagem
 */
function determineCommitType(message: string): string {
  const msg = message.toLowerCase();
  
  if (msg.startsWith('feat') || msg.includes('add') || msg.includes('novo')) {
    return 'ADICIONADO';
  }
  if (msg.startsWith('fix') || msg.includes('corrig') || msg.includes('bug')) {
    return 'CORRIGIDO';
  }
  if (msg.startsWith('refactor') || msg.includes('alter') || msg.includes('modif')) {
    return 'ALTERADO';
  }
  if (msg.startsWith('remove') || msg.includes('delet') || msg.includes('remov')) {
    return 'REMOVIDO';
  }
  if (msg.includes('deprecat') || msg.includes('descontinua')) {
    return 'DEPRECIADO';
  }
  if (msg.includes('security') || msg.includes('segur')) {
    return 'SEGURANCA';
  }
  
  return 'ALTERADO';
}

/**
 * Obter a próxima versão baseada nos tipos de commits
 */
function getNextVersion(commits: GitCommit[]): string {
  try {
    // Obter versão atual do package.json
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    const currentVersion = packageJson.version;
    const [major, minor, patch] = currentVersion.split('.').map(Number);

    // Determinar tipo de incremento baseado nos commits
    const hasBreaking = commits.some(c => 
      c.message.includes('BREAKING CHANGE') || 
      c.message.includes('!:')
    );
    const hasFeature = commits.some(c => 
      c.type === 'ADICIONADO' || 
      c.message.startsWith('feat')
    );
    const hasFix = commits.some(c => 
      c.type === 'CORRIGIDO' || 
      c.message.startsWith('fix')
    );

    if (hasBreaking) {
      return `${major + 1}.0.0`;
    } else if (hasFeature) {
      return `${major}.${minor + 1}.0`;
    } else if (hasFix) {
      return `${major}.${minor}.${patch + 1}`;
    } else {
      return `${major}.${minor}.${patch + 1}`;
    }
  } catch (error) {
    console.error('❌ Erro ao determinar próxima versão:', error);
    return '0.0.1';
  }
}

/**
 * Gerar entrada do changelog baseada nos commits
 */
function generateChangelogEntry(version: string, commits: GitCommit[]): string {
  const date = new Date().toISOString().split('T')[0];
  
  let entry = `\n## [${version}] - ${date}\n\n`;
  
  // Agrupar commits por tipo
  const groupedCommits = commits.reduce((acc, commit) => {
    if (!acc[commit.type]) {
      acc[commit.type] = [];
    }
    acc[commit.type]?.push(commit);
    return acc;
  }, {} as Record<string, GitCommit[]>);

  // Ordem de exibição dos tipos
  const typeOrder = ['ADICIONADO', 'ALTERADO', 'CORRIGIDO', 'REMOVIDO', 'DEPRECIADO', 'SEGURANCA'];
  const typeEmojis = {
    'ADICIONADO': '✨',
    'ALTERADO': '🔧',
    'CORRIGIDO': '🐛',
    'REMOVIDO': '🗑️',
    'DEPRECIADO': '⚠️',
    'SEGURANCA': '🔒'
  };
  const typeNames = {
    'ADICIONADO': 'Adicionado',
    'ALTERADO': 'Alterado',
    'CORRIGIDO': 'Corrigido',
    'REMOVIDO': 'Removido',
    'DEPRECIADO': 'Descontinuado',
    'SEGURANCA': 'Segurança'
  };

  for (const type of typeOrder) {
    if (groupedCommits[type] && groupedCommits[type].length > 0) {
      entry += `### ${typeEmojis[type as keyof typeof typeEmojis]} ${typeNames[type as keyof typeof typeNames]}\n`;
      
      for (const commit of groupedCommits[type]) {
        // Limpar mensagem do commit
        let message = commit.message
          .replace(/^(feat|fix|refactor|remove|docs|style|test|chore)\s*[\(\[]?[^\)\]]*[\)\]]?\s*:?\s*/i, '')
          .replace(/^\s*-\s*/, '')
          .trim();
        
        // Capitalizar primeira letra
        message = message.charAt(0).toUpperCase() + message.slice(1);
        
        entry += `- **${message}** (${commit.hash})\n`;
      }
      
      entry += '\n';
    }
  }

  return entry;
}

/**
 * Atualizar o arquivo CHANGELOG.md
 */
function updateChangelogFile(newEntry: string): void {
  try {
    const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
    let content = fs.readFileSync(changelogPath, 'utf-8');
    
    // Encontrar onde inserir a nova entrada (após "## [Não Lançado]")
    const unreleasedIndex = content.indexOf('## [Não Lançado]');
    if (unreleasedIndex !== -1) {
      // Encontrar o final da seção "Não Lançado"
      const nextVersionIndex = content.indexOf('\n## [', unreleasedIndex + 1);
      if (nextVersionIndex !== -1) {
        // Inserir antes da próxima versão
        content = content.slice(0, nextVersionIndex) + newEntry + content.slice(nextVersionIndex);
      } else {
        // Adicionar no final
        content += newEntry;
      }
    } else {
      // Se não há seção "Não Lançado", adicionar após o cabeçalho
      const headerEnd = content.indexOf('\n---\n');
      if (headerEnd !== -1) {
        content = content.slice(0, headerEnd + 5) + newEntry + content.slice(headerEnd + 5);
      } else {
        content += newEntry;
      }
    }
    
    fs.writeFileSync(changelogPath, content, 'utf-8');
    console.log('✅ CHANGELOG.md atualizado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao atualizar CHANGELOG.md:', error);
  }
}

/**
 * Função principal
 */
async function updateChangelogFromGit() {
  try {
    console.log('🚀 Iniciando atualização do changelog baseada no Git...');
    
    // Obter commits desde a última versão
    const commits = getCommitsSinceLastTag();
    
    if (commits.length === 0) {
      console.log('📝 Nenhum commit novo encontrado. Changelog já está atualizado.');
      return;
    }
    
    console.log(`📋 Encontrados ${commits.length} commits novos:`);
    commits.forEach(commit => {
      console.log(`   - [${commit.type}] ${commit.message} (${commit.hash})`);
    });
    
    // Determinar próxima versão
    const nextVersion = getNextVersion(commits);
    console.log(`🏷️  Próxima versão: ${nextVersion}`);
    
    // Gerar entrada do changelog
    const changelogEntry = generateChangelogEntry(nextVersion, commits);
    
    // Atualizar arquivo CHANGELOG.md
    updateChangelogFile(changelogEntry);
    
    // Atualizar package.json com nova versão
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    packageJson.version = nextVersion;
    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2) + '\n', 'utf-8');
    console.log('✅ package.json atualizado com nova versão!');
    
    // Popular banco de dados com nova entrada
    console.log('📊 Atualizando banco de dados...');
    execSync('npm run db:populate-changelog', { stdio: 'inherit' });
    
    console.log('🎉 Changelog atualizado com sucesso!');
    console.log(`📋 Nova versão: ${nextVersion}`);
    console.log(`📝 Total de mudanças: ${commits.length}`);
    
  } catch (error) {
    console.error('❌ Erro ao atualizar changelog:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  updateChangelogFromGit()
    .then(() => {
      console.log('\n✅ Atualização concluída!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erro na atualização:', error);
      process.exit(1);
    });
}

export { updateChangelogFromGit };