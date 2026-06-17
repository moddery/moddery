import { gql } from '@apollo/client';

export const ME_QUERY = gql`
  query NavMe {
    me {
      username
      isAdmin
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation NavLogin($input: LoginInput!) {
    login(input: $input) {
      accessToken
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation NavRegister($input: RegisterInput!) {
    register(input: $input) {
      accessToken
    }
  }
`;

export const NOTIFICATIONS_QUERY = gql`
  query NavNotifications {
    unreadNotificationCount
    viewerNotifications {
      actionUrl
      body
      createdAt
      id
      readAt
      state
      title
      type
    }
  }
`;

export const MARK_NOTIFICATION_READ_MUTATION = gql`
  mutation MarkNotificationRead($id: String!) {
    markNotificationRead(id: $id) {
      id
      readAt
      state
    }
  }
`;
