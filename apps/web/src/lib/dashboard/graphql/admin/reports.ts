import { gql } from '@apollo/client';

const MODERATION_REPORT_FIELDS = gql`
  fragment ModerationReportFields on ReportSummary {
    body
    closedAt
    createdAt
    id
    project {
      id
      kind
      slug
      title
    }
    projectId
    reason
    reporter {
      displayName
      id
      username
    }
    state
    userTarget {
      displayName
      id
      username
    }
    userTargetId
    version {
      id
      name
      project {
        id
        kind
        slug
        title
      }
      versionNumber
    }
    versionId
  }
`;

const REPORT_THREAD_FIELDS = gql`
  fragment ReportThreadFields on ThreadSummary {
    createdAt
    id
    members {
      createdAt
      lastReadAt
      user {
        displayName
        id
        username
      }
    }
    messages {
      author {
        displayName
        id
        username
      }
      body
      createdAt
      id
    }
    reportId
    subject
    updatedAt
  }
`;

export const MODERATION_REPORTS_QUERY = gql`
  query ModerationReports($limit: Int!, $offset: Int!) {
    moderationReportSearch(limit: $limit, offset: $offset) {
      reports {
        ...ModerationReportFields
      }
      totalHits
    }
  }
  ${MODERATION_REPORT_FIELDS}
`;

export const UPDATE_REPORT_STATE_MUTATION = gql`
  mutation UpdateReportState($input: UpdateReportStateInput!) {
    updateReportState(input: $input) {
      ...ModerationReportFields
    }
  }
  ${MODERATION_REPORT_FIELDS}
`;

export const REPORT_THREAD_QUERY = gql`
  query ReportThread($reportId: String!) {
    reportThread(reportId: $reportId) {
      ...ReportThreadFields
    }
  }
  ${REPORT_THREAD_FIELDS}
`;

export const CREATE_REPORT_THREAD_MESSAGE_MUTATION = gql`
  mutation CreateReportThreadMessage($input: CreateReportThreadMessageInput!) {
    createReportThreadMessage(input: $input) {
      ...ReportThreadFields
    }
  }
  ${REPORT_THREAD_FIELDS}
`;
