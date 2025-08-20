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
  "version": "0.2.6-dev.2025-08-20T20-00-39",
  "branch": "dev",
  "commit": "0c7932376134fff2bf25c1db8c771f7f8b94980c",
  "commitShort": "0c79323",
  "commitMessage": "refactor(usuarios): rename tipoUsuario to userType across the application\n\nUpdate schema, components, hooks and pages to use userType instead of tipoUsuario for consistency. Includes changes to validation schemas, API endpoints, and UI components. Also improves type safety and adds better error handling in use-usuarios hook.\n\nExtract usuario details page into separate component and update related types. Fix TypeScript errors and improve validation messages. Add new utility types and constants for user management.\n\nThe changes include:\n- Rename tipoUsuario field to userType in Prisma schema\n- Update all related API endpoints and database queries\n- Refactor usuario validation schemas and types\n- Improve use-usuarios hook with better error handling\n- Extract usuario details page into standalone component\n- Add comprehensive type definitions and error messages\n- Fix TypeScript errors across the application",
  "hasUncommittedChanges": true,
  "lastCommitDate": "2025-08-20 16:24:46 -0300",
  "buildDate": "2025-08-20T20:00:39.538Z",
  "buildTimestamp": 1755720039538,
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
