import { gql } from '@apollo/client';

export const ADMIN_USERS_QUERY = gql`
  query AdminUsers {
    adminUsers {
      avatarUrl
      collectionCount
      createdAt
      displayName
      email
      emailVerifiedAt
      id
      newsletterOptIn
      projectCount
      role
      status
      twoFactorEnabled
      username
    }
  }
`;

export const ADMIN_USER_SEARCH_QUERY = gql`
  query AdminUserSearch($search: String, $limit: Int!, $offset: Int!) {
    adminUserSearch(search: $search, limit: $limit, offset: $offset) {
      totalHits
      users {
        avatarUrl
        collectionCount
        createdAt
        displayName
        email
        emailVerifiedAt
        id
        newsletterOptIn
        projectCount
        role
        status
        twoFactorEnabled
        username
      }
    }
  }
`;

export const UPDATE_USER_ACCOUNT_MUTATION = gql`
  mutation UpdateUserAccount($input: UpdateUserAccountInput!) {
    updateUserAccount(input: $input) {
      avatarUrl
      collectionCount
      createdAt
      displayName
      email
      emailVerifiedAt
      id
      newsletterOptIn
      projectCount
      role
      status
      twoFactorEnabled
      username
    }
  }
`;

export const ADMIN_AUDIT_LOG_SEARCH_QUERY = gql`
  query AdminAuditLogSearch($limit: Int!, $offset: Int!) {
    adminAuditLogSearch(limit: $limit, offset: $offset) {
      auditLogs {
        action
        actor {
          displayName
          id
          username
        }
        actorId
        after {
          role
          status
        }
        before {
          role
          status
        }
        createdAt
        id
        moderationAction
        projectAfter {
          id
          requestedStatus
          slug
          status
          title
        }
        projectBefore {
          id
          requestedStatus
          slug
          status
          title
        }
        reason
        resource {
          id
          kind
          name
          slug
        }
        targetUser {
          displayName
          id
          username
        }
        targetUserId
        teamMemberAction
        teamMemberAfter {
          accepted
          owner
          permissions
          role
          username
        }
        teamMemberBefore {
          accepted
          owner
          permissions
          role
          username
        }
      }
      totalHits
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

export const MODERATION_PROJECT_SEARCH_QUERY = gql`
  query ModerationProjectSearch($limit: Int!, $offset: Int!) {
    moderationProjectSearch(limit: $limit, offset: $offset) {
      projects {
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
      totalHits
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
  query ModerationReports($limit: Int!, $offset: Int!) {
    moderationReportSearch(limit: $limit, offset: $offset) {
      reports {
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
      totalHits
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
