import { gql } from '@apollo/client';

export const PREPARE_PROJECT_UPLOAD_MUTATION = gql`
  mutation PrepareProjectUpload($input: PrepareProjectUploadInput!) {
    prepareProjectUpload(input: $input) {
      bucket
      expiresAt
      key
      method
      objectUrl
      uploadUrl
    }
  }
`;
