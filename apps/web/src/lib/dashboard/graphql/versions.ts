import { gql } from '@apollo/client';

const DASHBOARD_VERSION_FIELDS = gql`
  fragment DashboardVersionFields on VersionSummary {
    changelog
    channel
    dependencies {
      dependencyKind
      externalFileName
      id
      targetProject {
        id
        slug
        title
      }
      targetVersion {
        id
        versionNumber
      }
    }
    gameVersions
    featured
    id
    loaders
    name
    projectSlug
    requestedStatus
    sortOrder
    status
    versionNumber
  }
`;

export const VIEWER_PROJECT_VERSION_SEARCH_QUERY = gql`
  query ViewerProjectVersionSearch(
    $limit: Int!
    $offset: Int!
    $projectSlug: String!
  ) {
    viewerProjectVersionSearch(
      limit: $limit
      offset: $offset
      projectSlug: $projectSlug
    ) {
      totalHits
      versions {
        ...DashboardVersionFields
      }
    }
  }
  ${DASHBOARD_VERSION_FIELDS}
`;

export const CREATE_VERSION_MUTATION = gql`
  mutation CreateVersion($input: CreateVersionInput!) {
    createVersion(input: $input) {
      ...DashboardVersionFields
    }
  }
  ${DASHBOARD_VERSION_FIELDS}
`;

export const UPDATE_VERSION_MUTATION = gql`
  mutation UpdateVersion($input: UpdateVersionInput!) {
    updateVersion(input: $input) {
      ...DashboardVersionFields
    }
  }
  ${DASHBOARD_VERSION_FIELDS}
`;

export const UPDATE_VERSION_DEPENDENCIES_MUTATION = gql`
  mutation UpdateVersionDependencies($input: UpdateVersionDependenciesInput!) {
    updateVersionDependencies(input: $input) {
      ...DashboardVersionFields
    }
  }
  ${DASHBOARD_VERSION_FIELDS}
`;

export const RECORD_FILE_SCAN_MUTATION = gql`
  mutation RecordFileScan($input: RecordFileScanInput!) {
    recordFileScan(input: $input) {
      ...DashboardVersionFields
    }
  }
  ${DASHBOARD_VERSION_FIELDS}
`;
