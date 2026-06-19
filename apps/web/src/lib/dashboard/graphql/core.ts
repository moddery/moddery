import { gql } from '@apollo/client';
import { DASHBOARD_PROJECT_FIELDS } from './fragments.js';

export const DASHBOARD_QUERY = gql`
  ${DASHBOARD_PROJECT_FIELDS}

  query Dashboard {
    viewer {
      avatarUrl
      bio
      collectionCount
      collections {
        color
        description
        iconUrl
        id
        items {
          createdAt
          project {
            iconUrl
            kind
            slug
            summary
            title
          }
          sortOrder
        }
        name
        projectCount
        slug
        updatedAt
        visibility
      }
      displayName
      email
      emailVerifiedAt
      followedProjectCount
      id
      isAdmin
      newsletterOptIn
      organizationCount
      projectCount
      projects {
        ...DashboardProjectFields
      }
      role
      status
      twoFactorEnabled
      username
    }
    viewerOrganizations {
      color
      description
      iconUrl
      id
      memberCount
      members {
        isOwner
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
      name
      projectCount
      slug
      updatedAt
    }
  }
`;
