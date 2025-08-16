// Este arquivo é gerado automaticamente pelo script build-version.js
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

export const buildInfo: BuildInfo = {
  "version": "0.2.5",
  "name": "koerner360",
  "description": "Sistema completo de gestão de feedback e avaliações",
  "git": {
    "commitHash": "b5d79d07cc2da99a82fe416e7b8055b55a33e401",
    "commitShort": "b5d79d0",
    "branch": "master",
    "commitDate": "2025-08-15 21:23:07 -0300",
    "commitMessage": "chore: corrige sincronização de versão para 0.2.5 e adiciona regras de controle de versionamento",
    "commitAuthor": "Nereu Jr",
    "tag": "\"\"",
    "hasUncommittedChanges": true
  },
  "build": {
    "date": "2025-08-16T21:25:10.368Z",
    "timestamp": 1755379510368,
    "nodeVersion": "v22.18.0",
    "platform": "win32",
    "arch": "x64",
    "environment": "development"
  },
  "metadata": {
    "buildNumber": null,
    "buildId": null,
    "ciProvider": null
  }
};

// Função utilitária para obter versão formatada
export function getVersionString(): string {
  const { version, git } = buildInfo;
  const suffix = git.hasUncommittedChanges ? '-dirty' : '';
  const tag = git.tag ? ` (${git.tag})` : '';
  return `v${version}${suffix}${tag}`;
}

// Função utilitária para obter informações de build formatadas
export function getBuildString(): string {
  const { git, build } = buildInfo;
  return `${git.commitShort} - ${new Date(build.date).toLocaleString('pt-BR')}`;
}

// Função utilitária para verificar se é build de produção
export function isProductionBuild(): boolean {
  return buildInfo.build.environment === 'production';
}

// Função utilitária para verificar se é build de desenvolvimento
export function isDevelopmentBuild(): boolean {
  return buildInfo.build.environment === 'development';
}
