import { gql } from '@apollo/client';

export const ADMIN_USERS_QUERY = gql`
  query AdminUsers {
    adminUsers {
      avatarUrl
      createdAt
      displayName
      id
      role
      status
      username
    }
  }
`;

export const UPDATE_USER_ACCOUNT_MUTATION = gql`
  mutation UpdateUserAccount($input: UpdateUserAccountInput!) {
    updateUserAccount(input: $input) {
      avatarUrl
      createdAt
      displayName
      id
      role
      status
      username
    }
  }
`;

export const MODERATION_PROJECTS_QUERY = gql`
  query ModerationProjects {
    moderationProjects {
      body
      categories
      discordUrl
      downloads
      followers
      gallery {
        createdAt
        description
        displayUrl
        featured
        rawUrl
        sortOrder
        title
      }
      gameVersions
      iconUrl
      issuesUrl
      kind
      license {
        id
        name
        url
      }
      links {
        kind
        label
        url
      }
      loaders
      slug
      sourceUrl
      status
      summary
      title
      updatedAt
      wikiUrl
    }
  }
`;

export const MODERATE_PROJECT_MUTATION = gql`
  mutation ModerateProject($input: ModerateProjectInput!) {
    moderateProject(input: $input) {
      body
      categories
      discordUrl
      downloads
      followers
      gallery {
        createdAt
        description
        displayUrl
        featured
        rawUrl
        sortOrder
        title
      }
      gameVersions
      iconUrl
      issuesUrl
      kind
      license {
        id
        name
        url
      }
      links {
        kind
        label
        url
      }
      loaders
      slug
      sourceUrl
      status
      summary
      title
      updatedAt
      wikiUrl
    }
  }
`;

export const MODERATION_REPORTS_QUERY = gql`
  query ModerationReports {
    moderationReports {
      body
      createdAt
      id
      project {
        id
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
      versionId
    }
  }
`;

export const UPDATE_REPORT_STATE_MUTATION = gql`
  mutation UpdateReportState($input: UpdateReportStateInput!) {
    updateReportState(input: $input) {
      body
      createdAt
      id
      project {
        id
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
      versionId
    }
  }
`;

export const REPORT_THREAD_QUERY = gql`
  query ReportThread($reportId: String!) {
    reportThread(reportId: $reportId) {
      createdAt
      id
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
  }
`;

export const CREATE_REPORT_THREAD_MESSAGE_MUTATION = gql`
  mutation CreateReportThreadMessage($input: CreateReportThreadMessageInput!) {
    createReportThreadMessage(input: $input) {
      createdAt
      id
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
  }
`;
