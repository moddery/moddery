import { gql } from '@apollo/client';

export const DASHBOARD_QUERY = gql`
  query Dashboard {
    viewer {
      avatarUrl
      bio
      collectionCount
      collections {
        color
        description
        id
        name
        projectCount
        slug
        updatedAt
        visibility
      }
      displayName
      followedProjectCount
      id
      isAdmin
      projectCount
      projects {
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
      role
      status
      username
    }
    viewerOrganizations {
      color
      description
      id
      memberCount
      name
      projectCount
      slug
      updatedAt
      visibility
    }
  }
`;
