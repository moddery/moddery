import { gql } from '@apollo/client';

const PROJECT_FIELDS_FRAGMENT = gql`
  fragment CatalogProjectFields on ProjectSummary {
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
    id
    issuesUrl
    kind
    license {
      id
      name
      url
    }
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
    links {
      kind
      label
      url
    }
    loaders
    organization {
      color
      iconUrl
      id
      name
      slug
    }
    owner {
      avatarUrl
      displayName
      id
      username
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
`;

const COLLECTION_FIELDS_FRAGMENT = gql`
  ${PROJECT_FIELDS_FRAGMENT}
  fragment CatalogCollectionFields on CollectionSummary {
    color
    createdAt
    description
    iconUrl
    id
    items {
      addedBy {
        avatarUrl
        displayName
        id
        username
      }
      createdAt
      project {
        ...CatalogProjectFields
      }
      sortOrder
    }
    name
    owner {
      avatarUrl
      displayName
      id
      username
    }
    projectCount
    projects {
      ...CatalogProjectFields
    }
    slug
    updatedAt
    visibility
  }
`;

export const PROJECTS_QUERY = gql`
  ${PROJECT_FIELDS_FRAGMENT}
  query CatalogProjects($query: CatalogQueryInput) {
    projectSearch(query: $query) {
      projects {
        ...CatalogProjectFields
      }
      totalHits
    }
  }
`;

export const PROJECT_BY_SLUG_QUERY = gql`
  ${PROJECT_FIELDS_FRAGMENT}
  query CatalogProjectBySlug($slug: String!) {
    projectBySlug(slug: $slug) {
      ...CatalogProjectFields
    }
  }
`;

export const VIEWER_FOLLOWED_PROJECTS_QUERY = gql`
  ${PROJECT_FIELDS_FRAGMENT}
  query ViewerFollowedProjects($limit: Int!, $offset: Int!) {
    viewerFollowedProjectSearch(limit: $limit, offset: $offset) {
      projects {
        ...CatalogProjectFields
      }
      totalHits
    }
  }
`;

export const VIEWER_COLLECTION_CHOICES_QUERY = gql`
  query ViewerCollectionChoices {
    viewer {
      collections {
        id
        items {
          project {
            slug
          }
        }
        name
        owner {
          username
        }
        projectCount
        slug
        visibility
      }
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

export const VERSION_SEARCH_FOR_PROJECT_QUERY = gql`
  query VersionSearchForProject(
    $gameVersion: String
    $limit: Int!
    $loader: String
    $offset: Int!
    $projectSlug: String!
    $search: String
  ) {
    versionSearchForProject(
      gameVersion: $gameVersion
      limit: $limit
      loader: $loader
      offset: $offset
      projectSlug: $projectSlug
      search: $search
    ) {
      totalHits
      versions {
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

export const PROJECT_MEMBER_SEARCH_QUERY = gql`
  query ProjectMemberSearch(
    $projectSlug: String!
    $limit: Int!
    $offset: Int!
  ) {
    projectMemberSearch(
      projectSlug: $projectSlug
      limit: $limit
      offset: $offset
    ) {
      members {
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
      totalHits
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

export const ADD_PROJECT_TO_COLLECTION_MUTATION = gql`
  mutation AddProjectToCollection($input: AddProjectToCollectionInput!) {
    addProjectToCollection(input: $input) {
      id
      projectCount
    }
  }
`;

export const REMOVE_PROJECT_FROM_COLLECTION_MUTATION = gql`
  mutation RemoveProjectFromCollection(
    $input: RemoveProjectFromCollectionInput!
  ) {
    removeProjectFromCollection(input: $input) {
      id
      projectCount
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
  ${COLLECTION_FIELDS_FRAGMENT}
  query PublicCollections($search: String, $limit: Int!, $offset: Int!) {
    publicCollectionSearch(search: $search, limit: $limit, offset: $offset) {
      collections {
        ...CatalogCollectionFields
      }
      totalHits
    }
  }
`;

export const PUBLIC_COLLECTION_BY_SLUG_QUERY = gql`
  ${COLLECTION_FIELDS_FRAGMENT}
  query PublicCollectionBySlug($ownerUsername: String!, $slug: String!) {
    publicCollectionBySlug(ownerUsername: $ownerUsername, slug: $slug) {
      ...CatalogCollectionFields
    }
  }
`;

export const PUBLIC_COLLECTION_ITEM_SEARCH_QUERY = gql`
  ${PROJECT_FIELDS_FRAGMENT}
  query PublicCollectionItemSearch(
    $ownerUsername: String!
    $slug: String!
    $limit: Int!
    $offset: Int!
  ) {
    publicCollectionItemSearch(
      ownerUsername: $ownerUsername
      slug: $slug
      limit: $limit
      offset: $offset
    ) {
      items {
        addedBy {
          avatarUrl
          displayName
          id
          username
        }
        createdAt
        project {
          ...CatalogProjectFields
        }
        sortOrder
      }
      totalHits
    }
  }
`;
