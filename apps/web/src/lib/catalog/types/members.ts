export interface ProjectMember {
  role: string;
  accepted: boolean;
  owner: boolean;
  permissions: string[];
  sortOrder: number;
  user: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export interface ProjectMembersQueryData {
  projectMembers: ProjectMemberSummary[];
}

export interface ProjectMembersQueryVariables {
  projectSlug: string;
}

export interface ProjectMemberSearchQueryData {
  projectMemberSearch: {
    members: ProjectMemberSummary[];
    totalHits: number;
  };
}

export interface ProjectMemberSearchQueryVariables {
  limit: number;
  offset: number;
  projectSlug: string;
}

export interface ProjectMemberSearchResult {
  members: ProjectMember[];
  totalHits: number;
}

export interface ProjectMemberSummary {
  accepted: boolean;
  owner: boolean;
  permissions: string[];
  role: string;
  sortOrder: number;
  user: {
    avatarUrl: string | null;
    displayName: string | null;
    id: string;
    username: string;
  };
}
