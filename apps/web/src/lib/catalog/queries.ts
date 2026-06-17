import { gql } from '@apollo/client';

export const PROJECTS_QUERY = gql`
  query CatalogProjects($query: CatalogQueryInput) {
    projects(query: $query) {
      body
      color
      id
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
      approvedAt
      archivedAt
      publishedAt
      queuedAt
      requestedStatus
      slug
      title
      summary
      kind
      status
      categories
      discordUrl
      downloads
      followers
      gameVersions
      iconUrl
      issuesUrl
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
      sourceUrl
      gallery {
        createdAt
        description
        displayUrl
        featured
        rawUrl
        sortOrder
        title
      }
      updatedAt
      wikiUrl
    }
  }
`;

export const PROJECT_BY_SLUG_QUERY = gql`
  query CatalogProjectBySlug($slug: String!) {
    projectBySlug(slug: $slug) {
      body
      color
      id
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
      approvedAt
      archivedAt
      publishedAt
      queuedAt
      requestedStatus
      slug
      title
      summary
      kind
      status
      categories
      discordUrl
      downloads
      followers
      gameVersions
      iconUrl
      issuesUrl
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
      sourceUrl
      gallery {
        createdAt
        description
        displayUrl
        featured
        rawUrl
        sortOrder
        title
      }
      updatedAt
      wikiUrl
    }
  }
`;

export const VIEWER_FOLLOWED_PROJECTS_QUERY = gql`
  query ViewerFollowedProjects {
    viewerFollowedProjects {
      body
      color
      id
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
      approvedAt
      archivedAt
      publishedAt
      queuedAt
      requestedStatus
      slug
      title
      summary
      kind
      status
      categories
      discordUrl
      downloads
      followers
      gameVersions
      iconUrl
      issuesUrl
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
      sourceUrl
      gallery {
        createdAt
        description
        displayUrl
        featured
        rawUrl
        sortOrder
        title
      }
      updatedAt
      wikiUrl
    }
  }
`;

export const PLATFORM_METADATA_QUERY = gql`
  query CatalogPlatformMetadata {
    platformMetadata {
      categories {
        description
        name
        projectKind
        slug
      }
      gameVersions
      loaders
      licenses {
        key
        name
        url
      }
    }
  }
`;

export const VERSIONS_FOR_PROJECT_QUERY = gql`
  query VersionsForProject($projectSlug: String!) {
    versionsForProject(projectSlug: $projectSlug) {
      author {
        avatarUrl
        displayName
        id
        username
      }
      changelog
      channel
      createdAt
      datePublished
      dependencies {
        dependencyKind
        externalFileName
        id
        targetProject {
          id
          kind
          slug
          title
        }
        targetVersion {
          id
          versionNumber
        }
      }
      downloads
      featured
      files {
        fileName
        hashes {
          algorithm
          value
        }
        id
        kind
        primary
        scans {
          createdAt
          details
          id
          status
          verdict
        }
        sizeBytes
        url
      }
      gameVersions
      id
      loaders
      name
      requestedStatus
      sortOrder
      status
      updatedAt
      versionNumber
    }
  }
`;

export const PROJECT_MEMBERS_QUERY = gql`
  query ProjectMembers($projectSlug: String!) {
    projectMembers(projectSlug: $projectSlug) {
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
  }
`;

export const VIEWER_PROJECT_FOLLOW_STATE_QUERY = gql`
  query ViewerProjectFollowState($projectSlug: String!) {
    viewerProjectFollowState(projectSlug: $projectSlug) {
      followers
      following
      projectSlug
    }
  }
`;

export const PROJECT_ANALYTICS_QUERY = gql`
  query ProjectAnalytics($projectSlug: String!) {
    projectAnalytics(projectSlug: $projectSlug) {
      days {
        date
        downloads
        views
      }
      downloadsLast30Days
      projectSlug
      totalDownloads
      totalViews
      viewsLast30Days
    }
  }
`;

export const FOLLOW_PROJECT_MUTATION = gql`
  mutation FollowProject($projectSlug: String!) {
    followProject(projectSlug: $projectSlug) {
      followers
      following
      projectSlug
    }
  }
`;

export const UNFOLLOW_PROJECT_MUTATION = gql`
  mutation UnfollowProject($projectSlug: String!) {
    unfollowProject(projectSlug: $projectSlug) {
      followers
      following
      projectSlug
    }
  }
`;

export const RECORD_DOWNLOAD_MUTATION = gql`
  mutation RecordDownload($input: RecordDownloadInput!) {
    recordDownload(input: $input) {
      fileId
      projectDownloads
      projectId
      versionDownloads
      versionId
    }
  }
`;

export const RECORD_PROJECT_VIEW_MUTATION = gql`
  mutation RecordProjectView($input: RecordProjectViewInput!) {
    recordProjectView(input: $input) {
      projectId
      projectSlug
    }
  }
`;

export const CREATE_PROJECT_REPORT_MUTATION = gql`
  mutation CreateProjectReport($input: CreateProjectReportInput!) {
    createProjectReport(input: $input) {
      body
      closedAt
      createdAt
      id
      projectId
      reason
      state
      userTargetId
      versionId
    }
  }
`;

export const CREATE_VERSION_REPORT_MUTATION = gql`
  mutation CreateVersionReport($input: CreateVersionReportInput!) {
    createVersionReport(input: $input) {
      body
      closedAt
      createdAt
      id
      projectId
      reason
      state
      userTargetId
      versionId
    }
  }
`;

export const PUBLIC_COLLECTIONS_QUERY = gql`
  query PublicCollections {
    publicCollections {
      color
      createdAt
      description
      iconUrl
      id
      name
      owner {
        avatarUrl
        displayName
        id
        username
      }
      items {
        addedBy {
          avatarUrl
          displayName
          id
          username
        }
        createdAt
        project {
          body
          color
          id
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
          approvedAt
          archivedAt
          publishedAt
          queuedAt
          requestedStatus
          slug
          title
          summary
          kind
          status
          categories
          discordUrl
          downloads
          followers
          gameVersions
          iconUrl
          issuesUrl
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
          sourceUrl
          gallery {
            createdAt
            description
            displayUrl
            featured
            rawUrl
            sortOrder
            title
          }
          updatedAt
          wikiUrl
        }
        sortOrder
      }
      projectCount
      projects {
        body
        color
        id
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
        approvedAt
        archivedAt
        publishedAt
        queuedAt
        requestedStatus
        slug
        title
        summary
        kind
        status
        categories
        discordUrl
        downloads
        followers
        gameVersions
        iconUrl
        issuesUrl
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
        sourceUrl
        gallery {
          createdAt
          description
          displayUrl
          featured
          rawUrl
          sortOrder
          title
        }
        updatedAt
        wikiUrl
      }
      slug
      updatedAt
      visibility
    }
  }
`;

export const PUBLIC_COLLECTION_BY_SLUG_QUERY = gql`
  query PublicCollectionBySlug($ownerUsername: String!, $slug: String!) {
    publicCollectionBySlug(ownerUsername: $ownerUsername, slug: $slug) {
      color
      createdAt
      description
      iconUrl
      id
      name
      owner {
        avatarUrl
        displayName
        id
        username
      }
      items {
        addedBy {
          avatarUrl
          displayName
          id
          username
        }
        createdAt
        project {
          body
          color
          id
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
          approvedAt
          archivedAt
          publishedAt
          queuedAt
          requestedStatus
          slug
          title
          summary
          kind
          status
          categories
          discordUrl
          downloads
          followers
          gameVersions
          iconUrl
          issuesUrl
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
          sourceUrl
          gallery {
            createdAt
            description
            displayUrl
            featured
            rawUrl
            sortOrder
            title
          }
          updatedAt
          wikiUrl
        }
        sortOrder
      }
      projectCount
      projects {
        body
        color
        id
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
        approvedAt
        archivedAt
        publishedAt
        queuedAt
        requestedStatus
        slug
        title
        summary
        kind
        status
        categories
        discordUrl
        downloads
        followers
        gameVersions
        iconUrl
        issuesUrl
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
        sourceUrl
        gallery {
          createdAt
          description
          displayUrl
          featured
          rawUrl
          sortOrder
          title
        }
        updatedAt
        wikiUrl
      }
      slug
      updatedAt
      visibility
    }
  }
`;
