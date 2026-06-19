import { type ProjectKind, type ReportReason } from '@moddery/shared';

export interface PublicUserProfile {
  avatarUrl: string | null;
  bio: string | null;
  collectionCount: number;
  collections: UserCollectionPreview[];
  createdAt: string;
  displayName: string | null;
  followedProjectCount: number;
  friendCount: number;
  id: string;
  isAdmin: boolean;
  organizationCount: number;
  projectCount: number;
  projects: UserProjectPreview[];
  role: string;
  username: string;
}

export interface PublicUserListItem {
  avatarUrl: string | null;
  bio: string | null;
  collectionCount: number;
  createdAt: string;
  displayName: string | null;
  friendCount: number;
  id: string;
  isAdmin: boolean;
  organizationCount: number;
  projectCount: number;
  projects: UserProjectPreview[];
  username: string;
}

export interface UserCollectionPreview {
  color: string | null;
  description: string | null;
  id: string;
  name: string;
  projectCount: number;
  projects: UserProjectPreview[];
  slug: string;
  updatedAt: string;
}

export interface UserProjectPreview {
  categories: string[];
  color: string | null;
  downloads: number;
  followers: number;
  gameVersions: string[];
  iconUrl: string | null;
  kind: ProjectKind;
  loaders: string[];
  owner?: {
    avatarUrl: string | null;
    displayName: string | null;
    id: string;
    username: string;
  } | null;
  organization?: {
    color: string | null;
    iconUrl: string | null;
    id: string;
    name: string;
    slug: string;
  } | null;
  slug: string;
  summary: string;
  title: string;
  updatedAt: string;
}

export interface UserReportSummary {
  body: string;
  closedAt: string | null;
  createdAt: string;
  id: string;
  projectId: string | null;
  reason: ReportReason;
  state: string;
  userTargetId: string | null;
  versionId: string | null;
}

export interface FriendshipSummary {
  acceptedAt: string | null;
  createdAt: string;
  direction: 'INCOMING' | 'OUTGOING' | 'MUTUAL';
  id: string;
  state: 'PENDING' | 'ACCEPTED' | 'BLOCKED';
  user: {
    avatarUrl: string | null;
    displayName: string | null;
    id: string;
    username: string;
  };
}

export interface FriendshipSearchResult {
  friendships: FriendshipSummary[];
  totalHits: number;
}

export interface PublicUsersResult {
  totalHits: number;
  users: PublicUserListItem[];
}

export interface PublicUserProjectsResult {
  projects: UserProjectPreview[];
  totalHits: number;
}

export interface PublicUserCollectionsResult {
  collections: UserCollectionPreview[];
  totalHits: number;
}
