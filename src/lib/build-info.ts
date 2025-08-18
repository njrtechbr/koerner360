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
  "version": "0.2.6-dev.2025-08-18T06-17-39",
  "branch": "dev",
  "commit": "61aa7e23a31540c7caf685f2923f65732cef8ac6",
  "commitShort": "61aa7e2",
  "commitMessage": "docs: add analysis of 404 errors for dashboard and vite client\n\nAdd detailed documentation analyzing the 404 errors encountered for \"/dashboard\" and \"/@vite/client\" routes in the Next.js development environment. The document describes the problem, impact, and potential causes without proposing solutions.",
  "hasUncommittedChanges": true,
  "lastCommitDate": "2025-08-17 20:23:46 -0300",
  "buildDate": "2025-08-18T06:17:39.593Z",
  "buildTimestamp": 1755497859593,
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
