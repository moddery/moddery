import { gql } from '@apollo/client';

export const CATEGORY_TAXONOMY_QUERY = gql`
  query CategoryTaxonomy {
    categories {
      description
      name
      projectKind
      slug
    }
  }
`;

export const GAME_VERSION_TAXONOMY_QUERY = gql`
  query GameVersionTaxonomy {
    gameVersions {
      isActive
      version
    }
  }
`;

export const UPSERT_CATEGORY_MUTATION = gql`
  mutation UpsertCategory($input: UpsertCategoryInput!) {
    upsertCategory(input: $input) {
      description
      name
      projectKind
      slug
    }
  }
`;

export const UPSERT_GAME_VERSION_MUTATION = gql`
  mutation UpsertGameVersion($input: UpsertGameVersionInput!) {
    upsertGameVersion(input: $input) {
      isActive
      version
    }
  }
`;
