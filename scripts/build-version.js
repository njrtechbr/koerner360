#!/usr/bin/env node

/**
 * Script para gerar informações de versão e build
 * Cria arquivo com dados da versão atual, commit hash, data de build, etc.
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
    return 'unknown';
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

// Função principal
function generateBuildInfo() {
  console.log('🔧 Gerando informações de build...');
  
  const packageInfo = getPackageInfo();
  
  // Obter informações do Git
  const gitCommitHash = execGitCommand('git rev-parse HEAD');
  const gitCommitShort = execGitCommand('git rev-parse --short HEAD');
  const gitBranch = execGitCommand('git rev-parse --abbrev-ref HEAD');
  const gitCommitDate = execGitCommand('git log -1 --format=%ci');
  const gitCommitMessage = execGitCommand('git log -1 --format=%s');
  const gitCommitAuthor = execGitCommand('git log -1 --format=%an');
  const gitTag = execGitCommand('git describe --tags --exact-match 2>/dev/null || echo ""');
  
  // Verificar se há mudanças não commitadas
  const gitStatus = execGitCommand('git status --porcelain');
  const hasUncommittedChanges = gitStatus.length > 0;
  
  // Obter informações do ambiente
  const buildDate = new Date().toISOString();
  const buildTimestamp = Date.now();
  const nodeVersion = process.version;
  const platform = process.platform;
  const arch = process.arch;
  
  // Criar objeto com informações de build
  const buildInfo = {
    // Informações da versão
    version: packageInfo.version,
    name: packageInfo.name,
    description: packageInfo.description,
    
    // Informações do Git
    git: {
      commitHash: gitCommitHash,
      commitShort: gitCommitShort,
      branch: gitBranch,
      commitDate: gitCommitDate,
      commitMessage: gitCommitMessage,
      commitAuthor: gitCommitAuthor,
      tag: gitTag || null,
      hasUncommittedChanges
    },
    
    // Informações do build
    build: {
      date: buildDate,
      timestamp: buildTimestamp,
      nodeVersion,
      platform,
      arch,
      environment: process.env.NODE_ENV || 'development'
    },
    
    // Metadados adicionais
    metadata: {
      buildNumber: process.env.BUILD_NUMBER || null,
      buildId: process.env.BUILD_ID || null,
      ciProvider: process.env.CI ? (
        process.env.GITHUB_ACTIONS ? 'github-actions' :
        process.env.VERCEL ? 'vercel' :
        process.env.NETLIFY ? 'netlify' :
        'unknown'
      ) : null
    }
  };
  
  // Criar diretório se não existir
  const outputDir = path.join(process.cwd(), 'src', 'lib');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Escrever arquivo de informações de build
  const buildInfoPath = path.join(outputDir, 'build-info.ts');
  const buildInfoContent = `// Este arquivo é gerado automaticamente pelo script build-version.js
// Não edite manualmente - será sobrescrito no próximo build

export interface BuildInfo {
  version: string;
  name: string;
  description: string;
  git: {
    commitHash: string;
    commitShort: string;
    branch: string;
    commitDate: string;
    commitMessage: string;
    commitAuthor: string;
    tag: string | null;
    hasUncommittedChanges: boolean;
  };
  build: {
    date: string;
    timestamp: number;
    nodeVersion: string;
    platform: string;
    arch: string;
    environment: string;
  };
  metadata: {
    buildNumber: string | null;
    buildId: string | null;
    ciProvider: string | null;
  };
}

export const buildInfo: BuildInfo = ${JSON.stringify(buildInfo, null, 2)};

// Função utilitária para obter versão formatada
export function getVersionString(): string {
  const { version, git } = buildInfo;
  const suffix = git.hasUncommittedChanges ? '-dirty' : '';
  const tag = git.tag ? \` (\${git.tag})\` : '';
  return \`v\${version}\${suffix}\${tag}\`;
}

// Função utilitária para obter informações de build formatadas
export function getBuildString(): string {
  const { git, build } = buildInfo;
  return \`\${git.commitShort} - \${new Date(build.date).toLocaleString('pt-BR')}\`;
}

// Função utilitária para verificar se é build de produção
export function isProductionBuild(): boolean {
  return buildInfo.build.environment === 'production';
}

// Função utilitária para verificar se é build de desenvolvimento
export function isDevelopmentBuild(): boolean {
  return buildInfo.build.environment === 'development';
}
`;
  
  fs.writeFileSync(buildInfoPath, buildInfoContent, 'utf8');
  
  // Também criar um arquivo JSON para uso externo
  const buildInfoJsonPath = path.join(process.cwd(), 'build-info.json');
  fs.writeFileSync(buildInfoJsonPath, JSON.stringify(buildInfo, null, 2), 'utf8');
  
  console.log('✅ Informações de build geradas com sucesso!');
  console.log(`📦 Versão: ${buildInfo.version}`);
  console.log(`🌿 Branch: ${buildInfo.git.branch}`);
  console.log(`📝 Commit: ${buildInfo.git.commitShort} - ${buildInfo.git.commitMessage}`);
  console.log(`👤 Autor: ${buildInfo.git.commitAuthor}`);
  console.log(`📅 Data: ${new Date(buildInfo.build.date).toLocaleString('pt-BR')}`);
  
  if (buildInfo.git.hasUncommittedChanges) {
    console.log('⚠️  Aviso: Há mudanças não commitadas');
  }
  
  if (buildInfo.git.tag) {
    console.log(`🏷️  Tag: ${buildInfo.git.tag}`);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  generateBuildInfo();
}

module.exports = { generateBuildInfo };