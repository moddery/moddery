import { gql } from '@apollo/client';

export const CREATE_COLLECTION_MUTATION = gql`
  mutation CreateCollection($input: CreateCollectionInput!) {
    createCollection(input: $input) {
      color
      description
      id
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
      id
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
      id
      memberCount
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
      id
      memberCount
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
      id
      memberCount
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
      id
      memberCount
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
      name
      projectCount
      slug
      updatedAt
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
      name
      projectCount
      slug
      updatedAt
      visibility
    }
  }
`;
