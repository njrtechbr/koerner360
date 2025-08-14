const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Script para gerar informações de build automaticamente
 * Executa durante o processo de build para capturar dados do Git e ambiente
 */

function executarComando(comando) {
  try {
    return execSync(comando, { encoding: 'utf8' }).trim();
  } catch (error) {
    console.warn(`Aviso: Não foi possível executar '${comando}':`, error.message);
    return null;
  }
}

function obterInformacoesBuild() {
  const agora = new Date();
  
  // Informações do Git
  const branch = executarComando('git rev-parse --abbrev-ref HEAD') || 'unknown';
  const commit = executarComando('git rev-parse HEAD') || 'unknown';
  const commitShort = executarComando('git rev-parse --short HEAD') || 'unknown';
  const commitMessage = executarComando('git log -1 --pretty=%B') || 'unknown';
  const hasUncommittedChanges = executarComando('git status --porcelain') !== '';
  const lastCommitDate = executarComando('git log -1 --format=%ci') || agora.toISOString();
  
  // Informações do package.json
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  let packageInfo = { version: '0.0.0' };
  
  if (fs.existsSync(packageJsonPath)) {
    try {
      packageInfo = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    } catch (error) {
      console.warn('Aviso: Não foi possível ler package.json:', error.message);
    }
  }
  
  // Gerar versão automática baseada na data se não houver tag
  let versao = packageInfo.version;
  const gitTag = executarComando('git describe --tags --exact-match HEAD 2>/dev/null');
  
  if (!gitTag && hasUncommittedChanges) {
    // Versão de desenvolvimento
    const timestamp = agora.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    versao = `${packageInfo.version}-dev.${timestamp}`;
  } else if (gitTag) {
    versao = gitTag.replace(/^v/, '');
  }
  
  const buildInfo = {
    version: versao,
    branch: branch,
    commit: commit,
    commitShort: commitShort,
    commitMessage: commitMessage,
    hasUncommittedChanges: hasUncommittedChanges,
    lastCommitDate: lastCommitDate,
    buildDate: agora.toISOString(),
    buildTimestamp: agora.getTime(),
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    buildNumber: process.env.BUILD_NUMBER || null,
    ciCommit: process.env.CI_COMMIT_SHA || process.env.GITHUB_SHA || null,
    ciBranch: process.env.CI_COMMIT_REF_NAME || process.env.GITHUB_REF_NAME || null,
    ciPipeline: process.env.CI_PIPELINE_ID || process.env.GITHUB_RUN_ID || null
  };
  
  return buildInfo;
}

function gerarArquivoBuildInfo() {
  const buildInfo = obterInformacoesBuild();
  
  // Gerar arquivo TypeScript
  const tsContent = `// Este arquivo é gerado automaticamente durante o build
// Não edite manualmente - será sobrescrito

export interface BuildInfo {
  version: string;
  branch: string;
  commit: string;
  commitShort: string;
  commitMessage: string;
  hasUncommittedChanges: boolean;
  lastCommitDate: string;
  buildDate: string;
  buildTimestamp: number;
  environment: string;
  nodeVersion: string;
  platform: string;
  arch: string;
  buildNumber: string | null;
  ciCommit: string | null;
  ciBranch: string | null;
  ciPipeline: string | null;
}

export const buildInfo: BuildInfo = ${JSON.stringify(buildInfo, null, 2)};

export default buildInfo;
`;
  
  // Salvar arquivo
  const outputPath = path.join(process.cwd(), 'src', 'lib', 'build-info.ts');
  const outputDir = path.dirname(outputPath);
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, tsContent, 'utf8');
  
  console.log('✅ Informações de build geradas:', outputPath);
  console.log('📦 Versão:', buildInfo.version);
  console.log('🌿 Branch:', buildInfo.branch);
  console.log('📝 Commit:', buildInfo.commitShort);
  console.log('🏗️  Build:', buildInfo.buildDate);
  
  return buildInfo;
}

function atualizarChangelog(buildInfo) {
  const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
  
  if (!fs.existsSync(changelogPath)) {
    console.log('📝 Criando CHANGELOG.md inicial...');
    
    const changelogInicial = `# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [${buildInfo.version}] - ${buildInfo.buildDate.split('T')[0]}

### Adicionado
- Sistema de versionamento automático
- Geração automática de informações de build
- Integração com Git para rastreamento de mudanças

### Técnico
- Build automático configurado
- Informações de ambiente capturadas
- Integração com CI/CD preparada
`;
    
    fs.writeFileSync(changelogPath, changelogInicial, 'utf8');
    console.log('✅ CHANGELOG.md criado');
  } else {
    console.log('📝 CHANGELOG.md já existe - não modificado');
  }
}

function main() {
  console.log('🚀 Gerando informações de build...');
  
  try {
    const buildInfo = gerarArquivoBuildInfo();
    atualizarChangelog(buildInfo);
    
    console.log('✅ Build info gerado com sucesso!');
    
    // Salvar também em JSON para uso em outros scripts
    const jsonPath = path.join(process.cwd(), 'build-info.json');
    fs.writeFileSync(jsonPath, JSON.stringify(buildInfo, null, 2), 'utf8');
    
  } catch (error) {
    console.error('❌ Erro ao gerar build info:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = {
  obterInformacoesBuild,
  gerarArquivoBuildInfo,
  atualizarChangelog
};