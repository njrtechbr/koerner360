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
    "commitHash": "3cbb726271bdc81191acafb11c6ae30dbd0d04e5",
    "commitShort": "3cbb726",
    "branch": "master",
    "commitDate": "2025-08-16 18:25:27 -0300",
    "commitMessage": "feat: implementa sistema completo de gestão de atendentes com criação de usuários",
    "commitAuthor": "Nereu Jr",
    "tag": "\"\"",
    "hasUncommittedChanges": false
  },
  "build": {
    "date": "2025-08-16T21:25:33.875Z",
    "timestamp": 1755379533875,
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
