import { gql } from '@apollo/client';

export {
  MARK_NOTIFICATION_READ_MUTATION,
  NOTIFICATIONS_QUERY,
} from '../../lib/notifications.ts';

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

export const REQUEST_PASSWORD_RESET_MUTATION = gql`
  mutation NavRequestPasswordReset($input: RequestPasswordResetInput!) {
    requestPasswordReset(input: $input)
  }
`;

export const CONFIRM_PASSWORD_RESET_MUTATION = gql`
  mutation NavConfirmPasswordReset($input: ConfirmPasswordResetInput!) {
    confirmPasswordReset(input: $input)
  }
`;
