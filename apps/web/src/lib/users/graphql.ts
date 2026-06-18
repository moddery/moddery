import { gql } from '@apollo/client';

const USER_PROJECT_PREVIEW_FRAGMENT = gql`
  fragment UserProjectPreviewFields on ProjectSummary {
    categories
    color
    downloads
    followers
    gameVersions
    iconUrl
    kind
    loaders
    organization {
      color
      iconUrl
      id
      name
      slug
    }
    owner {
      avatarUrl
      displayName
      id
      username
    }
    slug
    summary
    title
    updatedAt
  }
`;

const FRIENDSHIP_SUMMARY_FRAGMENT = gql`
  fragment FriendshipSummaryFields on FriendshipSummary {
    acceptedAt
    createdAt
    direction
    id
    state
    user {
      avatarUrl
      displayName
      id
      username
    }
  }
`;

export const USER_BY_USERNAME_QUERY = gql`
  ${USER_PROJECT_PREVIEW_FRAGMENT}
  query UserByUsername($username: String!) {
    userByUsername(username: $username) {
      avatarUrl
      bio
      collectionCount
      collections {
        color
        description
        id
        name
        projectCount
        projects {
          ...UserProjectPreviewFields
        }
        slug
        updatedAt
      }
      createdAt
      displayName
      followedProjectCount
      friendCount
      id
      isAdmin
      projectCount
      projects {
        ...UserProjectPreviewFields
      }
      role
      username
    }
  }
`;

export const PUBLIC_USERS_QUERY = gql`
  ${USER_PROJECT_PREVIEW_FRAGMENT}
  query PublicUsers($search: String, $limit: Int!, $offset: Int!) {
    publicUserSearch(search: $search, limit: $limit, offset: $offset) {
      totalHits
      users {
        avatarUrl
        bio
        collectionCount
        createdAt
        displayName
        friendCount
        id
        isAdmin
        projectCount
        projects {
          ...UserProjectPreviewFields
        }
        username
      }
    }
  }
`;

export const PUBLIC_USER_PROJECTS_QUERY = gql`
  ${USER_PROJECT_PREVIEW_FRAGMENT}
  query PublicUserProjects($username: String!, $limit: Int!, $offset: Int!) {
    publicUserProjectSearch(
      username: $username
      limit: $limit
      offset: $offset
    ) {
      projects {
        ...UserProjectPreviewFields
      }
      totalHits
    }
  }
`;

export const PUBLIC_USER_COLLECTIONS_QUERY = gql`
  ${USER_PROJECT_PREVIEW_FRAGMENT}
  query PublicUserCollections($username: String!, $limit: Int!, $offset: Int!) {
    publicUserCollectionSearch(
      username: $username
      limit: $limit
      offset: $offset
    ) {
      collections {
        color
        description
        id
        name
        projectCount
        projects {
          ...UserProjectPreviewFields
        }
        slug
        updatedAt
      }
      totalHits
    }
  }
`;

export const VIEWER_FRIENDSHIP_QUERY = gql`
  ${FRIENDSHIP_SUMMARY_FRAGMENT}
  query ViewerFriendship($username: String!) {
    viewer {
      username
    }
    viewerFriendship(username: $username) {
      ...FriendshipSummaryFields
    }
  }
`;

export const SEND_FRIEND_REQUEST_MUTATION = gql`
  ${FRIENDSHIP_SUMMARY_FRAGMENT}
  mutation SendFriendRequest($username: String!) {
    sendFriendRequest(username: $username) {
      ...FriendshipSummaryFields
    }
  }
`;

export const ACCEPT_FRIEND_REQUEST_MUTATION = gql`
  ${FRIENDSHIP_SUMMARY_FRAGMENT}
  mutation AcceptFriendRequest($username: String!) {
    acceptFriendRequest(username: $username) {
      ...FriendshipSummaryFields
    }
  }
`;

export const VIEWER_FRIENDS_QUERY = gql`
  ${FRIENDSHIP_SUMMARY_FRAGMENT}
  query ViewerFriends {
    viewerFriends {
      ...FriendshipSummaryFields
    }
  }
`;

export const VIEWER_FRIEND_SEARCH_QUERY = gql`
  ${FRIENDSHIP_SUMMARY_FRAGMENT}
  query ViewerFriendSearch($limit: Int!, $offset: Int!) {
    viewerFriendSearch(limit: $limit, offset: $offset) {
      friendships {
        ...FriendshipSummaryFields
      }
      totalHits
    }
  }
`;

export const VIEWER_FRIEND_REQUESTS_QUERY = gql`
  ${FRIENDSHIP_SUMMARY_FRAGMENT}
  query ViewerFriendRequests {
    viewerFriendRequests {
      ...FriendshipSummaryFields
    }
  }
`;

export const VIEWER_FRIEND_REQUEST_SEARCH_QUERY = gql`
  ${FRIENDSHIP_SUMMARY_FRAGMENT}
  query ViewerFriendRequestSearch($limit: Int!, $offset: Int!) {
    viewerFriendRequestSearch(limit: $limit, offset: $offset) {
      friendships {
        ...FriendshipSummaryFields
      }
      totalHits
    }
  }
`;

export const VIEWER_BLOCKED_USERS_QUERY = gql`
  ${FRIENDSHIP_SUMMARY_FRAGMENT}
  query ViewerBlockedUsers {
    viewerBlockedUsers {
      ...FriendshipSummaryFields
    }
  }
`;

export const VIEWER_BLOCKED_USER_SEARCH_QUERY = gql`
  ${FRIENDSHIP_SUMMARY_FRAGMENT}
  query ViewerBlockedUserSearch($limit: Int!, $offset: Int!) {
    viewerBlockedUserSearch(limit: $limit, offset: $offset) {
      friendships {
        ...FriendshipSummaryFields
      }
      totalHits
    }
  }
`;

export const REMOVE_FRIEND_MUTATION = gql`
  mutation RemoveFriend($username: String!) {
    removeFriend(username: $username)
  }
`;

export const BLOCK_USER_MUTATION = gql`
  ${FRIENDSHIP_SUMMARY_FRAGMENT}
  mutation BlockUser($username: String!) {
    blockUser(username: $username) {
      ...FriendshipSummaryFields
    }
  }
`;

export const CREATE_USER_REPORT_MUTATION = gql`
  mutation CreateUserReport($input: CreateUserReportInput!) {
    createUserReport(input: $input) {
      body
      closedAt
      createdAt
      id
      projectId
      reason
      state
      userTargetId
      versionId
    }
  }
`;

export const CREATE_USER_DIRECT_THREAD_MUTATION = gql`
  mutation CreateUserDirectThread($input: CreateDirectThreadInput!) {
    createDirectThread(input: $input) {
      id
    }
  }
`;
