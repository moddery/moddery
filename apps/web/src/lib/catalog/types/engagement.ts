export interface ProjectFollowState {
  followers: number;
  following: boolean;
  projectSlug: string;
}

export interface ProjectFollowStateQueryData {
  viewerProjectFollowState: ProjectFollowState | null;
}

export interface ProjectFollowStateMutationData {
  followProject?: ProjectFollowState;
  unfollowProject?: ProjectFollowState;
}

export interface AddProjectToCollectionMutationData {
  addProjectToCollection: {
    id: string;
    projectCount: number;
  };
}

export interface RemoveProjectFromCollectionMutationData {
  removeProjectFromCollection: {
    id: string;
    projectCount: number;
  };
}

export interface AddProjectToCollectionMutationVariables {
  input: {
    collectionId: string;
    projectSlug: string;
  };
}

export type RemoveProjectFromCollectionMutationVariables =
  AddProjectToCollectionMutationVariables;

export interface RecordDownloadMutationData {
  recordDownload: DownloadRecord;
}

export interface DownloadRecord {
  fileId: string;
  projectDownloads: number;
  projectId: string;
  versionDownloads: number;
  versionId: string;
}

export interface RecordProjectViewMutationData {
  recordProjectView: ProjectViewRecord;
}

export interface ProjectViewRecord {
  projectId: string;
  projectSlug: string;
}

export interface RecordDownloadMutationVariables {
  input: {
    fileId: string;
  };
}

export interface RecordProjectViewMutationVariables {
  input: {
    projectSlug: string;
  };
}
