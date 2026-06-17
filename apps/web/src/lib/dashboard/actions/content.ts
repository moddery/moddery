import { apolloClient } from '../../../apollo.js';
import {
  CREATE_COLLECTION_MUTATION,
  UPDATE_COLLECTION_MUTATION,
  CREATE_ORGANIZATION_MUTATION,
  UPDATE_ORGANIZATION_MUTATION,
  ADD_PROJECT_TO_ORGANIZATION_MUTATION,
  ADD_ORGANIZATION_TEAM_MEMBER_MUTATION,
  REMOVE_PROJECT_FROM_ORGANIZATION_MUTATION,
  REMOVE_ORGANIZATION_TEAM_MEMBER_MUTATION,
  ADD_PROJECT_TO_COLLECTION_MUTATION,
  REMOVE_PROJECT_FROM_COLLECTION_MUTATION,
} from '../graphql.js';
import {
  type CreateCollectionMutationData,
  type CreateCollectionMutationVariables,
  type UpdateCollectionMutationData,
  type UpdateCollectionMutationVariables,
  type CreateOrganizationMutationData,
  type CreateOrganizationMutationVariables,
  type UpdateOrganizationMutationData,
  type UpdateOrganizationMutationVariables,
  type AddProjectToOrganizationMutationData,
  type AddOrganizationTeamMemberMutationData,
  type RemoveProjectFromOrganizationMutationData,
  type RemoveOrganizationTeamMemberMutationData,
  type AddProjectToOrganizationMutationVariables,
  type AddOrganizationTeamMemberMutationVariables,
  type RemoveProjectFromOrganizationMutationVariables,
  type RemoveOrganizationTeamMemberMutationVariables,
  type AddProjectToCollectionMutationData,
  type RemoveProjectFromCollectionMutationData,
  type AddProjectToCollectionMutationVariables,
  type RemoveProjectFromCollectionMutationVariables,
} from '../internal-types.js';
import {
  type CreateCollectionInput,
  type AddOrganizationTeamMemberInput,
  type CreateOrganizationInput,
  type DashboardCollection,
  type DashboardOrganization,
  type RemoveOrganizationTeamMemberInput,
  type UpdateCollectionInput,
  type UpdateOrganizationInput,
} from '../types.js';

export async function createCollection(
  input: CreateCollectionInput,
): Promise<DashboardCollection> {
  const { data } = await apolloClient.mutate<
    CreateCollectionMutationData,
    CreateCollectionMutationVariables
  >({
    mutation: CREATE_COLLECTION_MUTATION,
    variables: { input },
  });

  if (!data?.createCollection) {
    throw new Error('Collection creation did not return a collection');
  }

  return data.createCollection;
}

export async function updateCollection(
  input: UpdateCollectionInput,
): Promise<DashboardCollection> {
  const { data } = await apolloClient.mutate<
    UpdateCollectionMutationData,
    UpdateCollectionMutationVariables
  >({
    mutation: UPDATE_COLLECTION_MUTATION,
    variables: { input },
  });

  if (!data?.updateCollection) {
    throw new Error('Collection update did not return a collection');
  }

  return data.updateCollection;
}

export async function createOrganization(
  input: CreateOrganizationInput,
): Promise<DashboardOrganization> {
  const { data } = await apolloClient.mutate<
    CreateOrganizationMutationData,
    CreateOrganizationMutationVariables
  >({
    mutation: CREATE_ORGANIZATION_MUTATION,
    variables: { input },
  });

  if (!data?.createOrganization) {
    throw new Error('Organization creation did not return an organization');
  }

  return data.createOrganization;
}

export async function updateOrganization(
  input: UpdateOrganizationInput,
): Promise<DashboardOrganization> {
  const { data } = await apolloClient.mutate<
    UpdateOrganizationMutationData,
    UpdateOrganizationMutationVariables
  >({
    mutation: UPDATE_ORGANIZATION_MUTATION,
    variables: { input },
  });

  if (!data?.updateOrganization) {
    throw new Error('Organization update did not return an organization');
  }

  return data.updateOrganization;
}

export async function addProjectToOrganization(
  organizationId: string,
  projectSlug: string,
): Promise<DashboardOrganization> {
  const { data } = await apolloClient.mutate<
    AddProjectToOrganizationMutationData,
    AddProjectToOrganizationMutationVariables
  >({
    mutation: ADD_PROJECT_TO_ORGANIZATION_MUTATION,
    variables: { input: { organizationId, projectSlug } },
  });

  if (!data?.addProjectToOrganization) {
    throw new Error('Organization update did not return an organization');
  }

  return data.addProjectToOrganization;
}

export async function addOrganizationTeamMember(
  input: AddOrganizationTeamMemberInput,
): Promise<DashboardOrganization> {
  const { data } = await apolloClient.mutate<
    AddOrganizationTeamMemberMutationData,
    AddOrganizationTeamMemberMutationVariables
  >({
    mutation: ADD_ORGANIZATION_TEAM_MEMBER_MUTATION,
    variables: { input },
  });

  if (!data?.addOrganizationTeamMember) {
    throw new Error('Organization update did not return an organization');
  }

  return data.addOrganizationTeamMember;
}

export async function removeProjectFromOrganization(
  organizationId: string,
  projectSlug: string,
): Promise<DashboardOrganization> {
  const { data } = await apolloClient.mutate<
    RemoveProjectFromOrganizationMutationData,
    RemoveProjectFromOrganizationMutationVariables
  >({
    mutation: REMOVE_PROJECT_FROM_ORGANIZATION_MUTATION,
    variables: { input: { organizationId, projectSlug } },
  });

  if (!data?.removeProjectFromOrganization) {
    throw new Error('Organization update did not return an organization');
  }

  return data.removeProjectFromOrganization;
}

export async function removeOrganizationTeamMember(
  input: RemoveOrganizationTeamMemberInput,
): Promise<DashboardOrganization> {
  const { data } = await apolloClient.mutate<
    RemoveOrganizationTeamMemberMutationData,
    RemoveOrganizationTeamMemberMutationVariables
  >({
    mutation: REMOVE_ORGANIZATION_TEAM_MEMBER_MUTATION,
    variables: { input },
  });

  if (!data?.removeOrganizationTeamMember) {
    throw new Error('Organization update did not return an organization');
  }

  return data.removeOrganizationTeamMember;
}

export async function addProjectToCollection(
  collectionId: string,
  projectSlug: string,
): Promise<DashboardCollection> {
  const { data } = await apolloClient.mutate<
    AddProjectToCollectionMutationData,
    AddProjectToCollectionMutationVariables
  >({
    mutation: ADD_PROJECT_TO_COLLECTION_MUTATION,
    variables: { input: { collectionId, projectSlug } },
  });

  if (!data?.addProjectToCollection) {
    throw new Error('Collection update did not return a collection');
  }

  return data.addProjectToCollection;
}

export async function removeProjectFromCollection(
  collectionId: string,
  projectSlug: string,
): Promise<DashboardCollection> {
  const { data } = await apolloClient.mutate<
    RemoveProjectFromCollectionMutationData,
    RemoveProjectFromCollectionMutationVariables
  >({
    mutation: REMOVE_PROJECT_FROM_COLLECTION_MUTATION,
    variables: { input: { collectionId, projectSlug } },
  });

  if (!data?.removeProjectFromCollection) {
    throw new Error('Collection update did not return a collection');
  }

  return data.removeProjectFromCollection;
}
