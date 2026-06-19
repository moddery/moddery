import { gql } from '@apollo/client';

import { DASHBOARD_PROJECT_FIELDS } from '../fragments.js';

const DASHBOARD_MODERATION_PROJECT_FIELDS = gql`
  fragment DashboardModerationProjectFields on ProjectSummary {
    ...DashboardProjectFields
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
  }
  ${DASHBOARD_PROJECT_FIELDS}
`;

export const MODERATION_PROJECTS_QUERY = gql`
  query ModerationProjects {
    moderationProjects {
      ...DashboardModerationProjectFields
    }
  }
  ${DASHBOARD_MODERATION_PROJECT_FIELDS}
`;

export const MODERATION_PROJECT_SEARCH_QUERY = gql`
  query ModerationProjectSearch($limit: Int!, $offset: Int!) {
    moderationProjectSearch(limit: $limit, offset: $offset) {
      projects {
        ...DashboardModerationProjectFields
      }
      totalHits
    }
  }
  ${DASHBOARD_MODERATION_PROJECT_FIELDS}
`;

export const MODERATE_PROJECT_MUTATION = gql`
  mutation ModerateProject($input: ModerateProjectInput!) {
    moderateProject(input: $input) {
      ...DashboardModerationProjectFields
    }
  }
  ${DASHBOARD_MODERATION_PROJECT_FIELDS}
`;

export const LOCK_PROJECT_FOR_MODERATION_MUTATION = gql`
  mutation LockProjectForModeration($projectSlug: String!) {
    lockProjectForModeration(projectSlug: $projectSlug) {
      ...DashboardModerationProjectFields
    }
  }
  ${DASHBOARD_MODERATION_PROJECT_FIELDS}
`;

export const RELEASE_PROJECT_MODERATION_LOCK_MUTATION = gql`
  mutation ReleaseProjectModerationLock($projectSlug: String!) {
    releaseProjectModerationLock(projectSlug: $projectSlug) {
      ...DashboardModerationProjectFields
    }
  }
  ${DASHBOARD_MODERATION_PROJECT_FIELDS}
`;
