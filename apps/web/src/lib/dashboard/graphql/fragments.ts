import { gql } from '@apollo/client';

export const DASHBOARD_PROJECT_FIELDS = gql`
  fragment DashboardProjectFields on ProjectSummary {
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
      id
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
    viewerCapabilities {
      manageDetails
      manageMembers
      manageVersions
      viewAnalytics
    }
    wikiUrl
  }
`;

export const DASHBOARD_PROJECT_MEMBER_FIELDS = gql`
  fragment DashboardProjectMemberFields on ProjectTeamMemberSummary {
    accepted
    owner
    permissions
    role
    sortOrder
    user {
      avatarUrl
      displayName
      id
      username
    }
  }
`;
