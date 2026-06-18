import { type ReportReason } from '@moddery/shared';

export interface ReportSummary {
  body: string;
  closedAt: string | null;
  createdAt: string;
  id: string;
  projectId: string | null;
  reason: ReportReason;
  state: string;
  userTargetId: string | null;
  versionId: string | null;
}

export interface CreateProjectReportMutationData {
  createProjectReport: ReportSummary;
}

export interface CreateVersionReportMutationData {
  createVersionReport: ReportSummary;
}

export interface CreateProjectReportMutationVariables {
  input: {
    body: string;
    projectSlug: string;
    reason: ReportReason;
  };
}

export interface CreateVersionReportMutationVariables {
  input: {
    body: string;
    reason: ReportReason;
    versionId: string;
  };
}
