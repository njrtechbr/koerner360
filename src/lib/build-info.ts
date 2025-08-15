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
  "version": "0.2.4-dev.2025-08-15T01-51-55",
  "branch": "master",
  "commit": "c9741d0d0568d0569aee164ed40952f83d238840",
  "commitShort": "c9741d0",
  "commitMessage": "feat: implementa página pública de changelog e layout público\n\n- Cria componente PublicLayout para páginas sem autenticação\n- Atualiza página de changelog para usar layout público\n- Configura middleware para permitir acesso público ao changelog\n- Atualiza build-info.json com nova versão\n- Melhora acessibilidade da página de changelog",
  "hasUncommittedChanges": true,
  "lastCommitDate": "2025-08-14 22:51:09 -0300",
  "buildDate": "2025-08-15T01:51:55.304Z",
  "buildTimestamp": 1755222715304,
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
