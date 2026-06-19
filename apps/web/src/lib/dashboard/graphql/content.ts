import { gql } from '@apollo/client';

export const CREATE_COLLECTION_MUTATION = gql`
  mutation CreateCollection($input: CreateCollectionInput!) {
    createCollection(input: $input) {
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
  }
`;

export const UPDATE_COLLECTION_MUTATION = gql`
  mutation UpdateCollection($input: UpdateCollectionInput!) {
    updateCollection(input: $input) {
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
  }
`;

export const UPDATE_COLLECTION_PROJECT_MUTATION = gql`
  mutation UpdateCollectionProject($input: UpdateCollectionProjectInput!) {
    updateCollectionProject(input: $input) {
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
  }
`;

export const CREATE_ORGANIZATION_MUTATION = gql`
  mutation CreateOrganization($input: CreateOrganizationInput!) {
    createOrganization(input: $input) {
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

export const UPDATE_ORGANIZATION_MUTATION = gql`
  mutation UpdateOrganization($input: UpdateOrganizationInput!) {
    updateOrganization(input: $input) {
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

export const ADD_PROJECT_TO_ORGANIZATION_MUTATION = gql`
  mutation AddProjectToOrganization($input: AddProjectToOrganizationInput!) {
    addProjectToOrganization(input: $input) {
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

export const REMOVE_PROJECT_FROM_ORGANIZATION_MUTATION = gql`
  mutation RemoveProjectFromOrganization(
    $input: RemoveProjectFromOrganizationInput!
  ) {
    removeProjectFromOrganization(input: $input) {
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

export const ADD_ORGANIZATION_TEAM_MEMBER_MUTATION = gql`
  mutation AddOrganizationTeamMember($input: AddOrganizationTeamMemberInput!) {
    addOrganizationTeamMember(input: $input) {
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

export const REMOVE_ORGANIZATION_TEAM_MEMBER_MUTATION = gql`
  mutation RemoveOrganizationTeamMember(
    $input: RemoveOrganizationTeamMemberInput!
  ) {
    removeOrganizationTeamMember(input: $input) {
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

export const ADD_PROJECT_TO_COLLECTION_MUTATION = gql`
  mutation AddProjectToCollection($input: AddProjectToCollectionInput!) {
    addProjectToCollection(input: $input) {
      color
      description
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
  }
`;

export const REMOVE_PROJECT_FROM_COLLECTION_MUTATION = gql`
  mutation RemoveProjectFromCollection(
    $input: RemoveProjectFromCollectionInput!
  ) {
    removeProjectFromCollection(input: $input) {
      color
      description
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
  }
`;
