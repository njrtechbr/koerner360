// Este arquivo é gerado automaticamente durante o build
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

export const buildInfo: BuildInfo = {
  "version": "0.2.4-dev.2025-08-15T07-45-25",
  "branch": "master",
  "commit": "988f15b88f0a4be305dfb8bc409a5f5ff9c3b4bf",
  "commitShort": "988f15b",
  "commitMessage": "chore: atualiza versão para 0.2.4 e changelog\n\n- Atualiza package.json para versão 0.2.4\n- Adiciona entrada no CHANGELOG.md para versão 0.2.4\n- Atualiza build-info.json com informações atualizadas\n- Documenta implementação da página pública de changelog",
  "hasUncommittedChanges": true,
  "lastCommitDate": "2025-08-14 22:52:06 -0300",
  "buildDate": "2025-08-15T07:45:25.713Z",
  "buildTimestamp": 1755243925713,
  "environment": "development",
  "nodeVersion": "v22.18.0",
  "platform": "win32",
  "arch": "x64",
  "buildNumber": null,
  "ciCommit": null,
  "ciBranch": null,
  "ciPipeline": null
};

export default buildInfo;
