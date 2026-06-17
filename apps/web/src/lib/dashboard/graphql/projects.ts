import { gql } from '@apollo/client';

export const CREATE_PROJECT_MUTATION = gql`
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
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

export const ADD_PROJECT_GALLERY_IMAGE_MUTATION = gql`
  mutation AddProjectGalleryImage($input: AddProjectGalleryImageInput!) {
    addProjectGalleryImage(input: $input) {
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

export const ADD_PROJECT_TEAM_MEMBER_MUTATION = gql`
  mutation AddProjectTeamMember($input: AddProjectTeamMemberInput!) {
    addProjectTeamMember(input: $input) {
      accepted
      owner
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

export const REMOVE_PROJECT_TEAM_MEMBER_MUTATION = gql`
  mutation RemoveProjectTeamMember($input: RemoveProjectTeamMemberInput!) {
    removeProjectTeamMember(input: $input) {
      accepted
      owner
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

export const UPDATE_PROJECT_MUTATION = gql`
  mutation UpdateProject($input: UpdateProjectInput!) {
    updateProject(input: $input) {
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
