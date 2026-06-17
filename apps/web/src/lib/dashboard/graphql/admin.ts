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
      approvedAt
      archivedAt
      body
      categories
      color
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
      moderationLock {
        createdAt
        expiresAt
        id
        moderator {
          displayName
          id
          username
        }
      }
      owner {
        avatarUrl
        displayName
        id
        username
      }
      organization {
        color
        iconUrl
        id
        name
        slug
      }
      publishedAt
      queuedAt
      requestedStatus
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
      approvedAt
      archivedAt
      body
      categories
      color
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
      moderationLock {
        createdAt
        expiresAt
        id
        moderator {
          displayName
          id
          username
        }
      }
      owner {
        avatarUrl
        displayName
        id
        username
      }
      organization {
        color
        iconUrl
        id
        name
        slug
      }
      publishedAt
      queuedAt
      requestedStatus
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

export const LOCK_PROJECT_FOR_MODERATION_MUTATION = gql`
  mutation LockProjectForModeration($projectSlug: String!) {
    lockProjectForModeration(projectSlug: $projectSlug) {
      approvedAt
      archivedAt
      body
      categories
      color
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
      moderationLock {
        createdAt
        expiresAt
        id
        moderator {
          displayName
          id
          username
        }
      }
      owner {
        avatarUrl
        displayName
        id
        username
      }
      organization {
        color
        iconUrl
        id
        name
        slug
      }
      publishedAt
      queuedAt
      requestedStatus
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

export const RELEASE_PROJECT_MODERATION_LOCK_MUTATION = gql`
  mutation ReleaseProjectModerationLock($projectSlug: String!) {
    releaseProjectModerationLock(projectSlug: $projectSlug) {
      approvedAt
      archivedAt
      body
      categories
      color
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
      moderationLock {
        createdAt
        expiresAt
        id
        moderator {
          displayName
          id
          username
        }
      }
      owner {
        avatarUrl
        displayName
        id
        username
      }
      organization {
        color
        iconUrl
        id
        name
        slug
      }
      publishedAt
      queuedAt
      requestedStatus
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
      closedAt
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
      version {
        id
        name
        project {
          id
          slug
          title
        }
        versionNumber
      }
      versionId
    }
  }
`;

export const UPDATE_REPORT_STATE_MUTATION = gql`
  mutation UpdateReportState($input: UpdateReportStateInput!) {
    updateReportState(input: $input) {
      body
      closedAt
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
      version {
        id
        name
        project {
          id
          slug
          title
        }
        versionNumber
      }
      versionId
    }
  }
`;

export const REPORT_THREAD_QUERY = gql`
  query ReportThread($reportId: String!) {
    reportThread(reportId: $reportId) {
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
  }
`;

export const CREATE_REPORT_THREAD_MESSAGE_MUTATION = gql`
  mutation CreateReportThreadMessage($input: CreateReportThreadMessageInput!) {
    createReportThreadMessage(input: $input) {
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
  }
`;
