import { gql } from '@apollo/client';

export const CREATE_VERSION_MUTATION = gql`
  mutation CreateVersion($input: CreateVersionInput!) {
    createVersion(input: $input) {
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
      id
      loaders
      name
      projectSlug
      versionNumber
    }
  }
`;

export const UPDATE_VERSION_MUTATION = gql`
  mutation UpdateVersion($input: UpdateVersionInput!) {
    updateVersion(input: $input) {
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
      id
      loaders
      name
      projectSlug
      versionNumber
    }
  }
`;

export const UPDATE_VERSION_DEPENDENCIES_MUTATION = gql`
  mutation UpdateVersionDependencies($input: UpdateVersionDependenciesInput!) {
    updateVersionDependencies(input: $input) {
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
      id
      loaders
      name
      projectSlug
      versionNumber
    }
  }
`;

export const RECORD_FILE_SCAN_MUTATION = gql`
  mutation RecordFileScan($input: RecordFileScanInput!) {
    recordFileScan(input: $input) {
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
      id
      loaders
      name
      projectSlug
      versionNumber
    }
  }
`;
