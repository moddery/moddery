import { gql } from '@apollo/client';

const ADMIN_USER_FIELDS = gql`
  fragment AdminUserFields on UserProfile {
    avatarUrl
    collectionCount
    createdAt
    displayName
    email
    emailVerifiedAt
    id
    newsletterOptIn
    projectCount
    role
    status
    twoFactorEnabled
    username
  }
`;

export const ADMIN_USERS_QUERY = gql`
  query AdminUsers {
    adminUsers {
      ...AdminUserFields
    }
  }
  ${ADMIN_USER_FIELDS}
`;

export const ADMIN_USER_SEARCH_QUERY = gql`
  query AdminUserSearch($search: String, $limit: Int!, $offset: Int!) {
    adminUserSearch(search: $search, limit: $limit, offset: $offset) {
      totalHits
      users {
        ...AdminUserFields
      }
    }
  }
  ${ADMIN_USER_FIELDS}
`;

export const UPDATE_USER_ACCOUNT_MUTATION = gql`
  mutation UpdateUserAccount($input: UpdateUserAccountInput!) {
    updateUserAccount(input: $input) {
      ...AdminUserFields
    }
  }
  ${ADMIN_USER_FIELDS}
`;
