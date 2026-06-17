import { type ReportReason } from '@moddery/shared';

import { apolloClient } from '../../../apollo.js';
import {
  CREATE_PROJECT_REPORT_MUTATION,
  CREATE_VERSION_REPORT_MUTATION,
} from '../queries.js';
import {
  type CreateProjectReportMutationData,
  type CreateProjectReportMutationVariables,
  type CreateVersionReportMutationData,
  type CreateVersionReportMutationVariables,
  type ReportSummary,
} from '../types.js';

export async function createProjectReport(input: {
  body: string;
  projectSlug: string;
  reason: ReportReason;
}): Promise<ReportSummary> {
  const { data } = await apolloClient.mutate<
    CreateProjectReportMutationData,
    CreateProjectReportMutationVariables
  >({
    mutation: CREATE_PROJECT_REPORT_MUTATION,
    variables: { input },
  });

  if (data === null || data === undefined) {
    throw new Error('Report did not return from the API');
  }

  return data.createProjectReport;
}

export async function createVersionReport(input: {
  body: string;
  reason: ReportReason;
  versionId: string;
}): Promise<ReportSummary> {
  const { data } = await apolloClient.mutate<
    CreateVersionReportMutationData,
    CreateVersionReportMutationVariables
  >({
    mutation: CREATE_VERSION_REPORT_MUTATION,
    variables: { input },
  });

  if (data === null || data === undefined) {
    throw new Error('Report did not return from the API');
  }

  return data.createVersionReport;
}
