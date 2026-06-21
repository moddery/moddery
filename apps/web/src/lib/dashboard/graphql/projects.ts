import { gql } from '@apollo/client';
import {
  DASHBOARD_PROJECT_FIELDS,
  DASHBOARD_PROJECT_MEMBER_FIELDS,
} from './fragments.js';

export const CREATE_PROJECT_MUTATION = gql`
  ${DASHBOARD_PROJECT_FIELDS}

  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      ...DashboardProjectFields
    }
  }
`;

export const ADD_PROJECT_GALLERY_IMAGE_MUTATION = gql`
  ${DASHBOARD_PROJECT_FIELDS}

  mutation AddProjectGalleryImage($input: AddProjectGalleryImageInput!) {
    addProjectGalleryImage(input: $input) {
      ...DashboardProjectFields
    }
  }
`;

export const REMOVE_PROJECT_GALLERY_IMAGE_MUTATION = gql`
  ${DASHBOARD_PROJECT_FIELDS}

  mutation RemoveProjectGalleryImage($input: RemoveProjectGalleryImageInput!) {
    removeProjectGalleryImage(input: $input) {
      ...DashboardProjectFields
    }
  }
`;

export const UPDATE_PROJECT_GALLERY_IMAGE_MUTATION = gql`
  ${DASHBOARD_PROJECT_FIELDS}

  mutation UpdateProjectGalleryImage($input: UpdateProjectGalleryImageInput!) {
    updateProjectGalleryImage(input: $input) {
      ...DashboardProjectFields
    }
  }
`;

export const ADD_PROJECT_TEAM_MEMBER_MUTATION = gql`
  ${DASHBOARD_PROJECT_MEMBER_FIELDS}

  mutation AddProjectTeamMember($input: AddProjectTeamMemberInput!) {
    addProjectTeamMember(input: $input) {
      ...DashboardProjectMemberFields
    }
  }
`;

export const REMOVE_PROJECT_TEAM_MEMBER_MUTATION = gql`
  ${DASHBOARD_PROJECT_MEMBER_FIELDS}

  mutation RemoveProjectTeamMember($input: RemoveProjectTeamMemberInput!) {
    removeProjectTeamMember(input: $input) {
      ...DashboardProjectMemberFields
    }
  }
`;

export const UPDATE_PROJECT_MUTATION = gql`
  ${DASHBOARD_PROJECT_FIELDS}

  mutation UpdateProject($input: UpdateProjectInput!) {
    updateProject(input: $input) {
      ...DashboardProjectFields
    }
  }
`;

export const DELETE_PROJECT_MUTATION = gql`
  mutation DeleteProject($projectSlug: String!) {
    deleteProject(projectSlug: $projectSlug)
  }
`;
