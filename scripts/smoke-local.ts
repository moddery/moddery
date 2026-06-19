const apiUrl = trimTrailingSlash(
  process.env.SMOKE_API_URL ?? 'http://localhost:13001',
);
const webUrl = trimTrailingSlash(
  process.env.SMOKE_WEB_URL ?? 'http://localhost:15174',
);

interface ReadinessResult {
  checks: {
    name: string;
    status: string;
  }[];
  status: string;
}

interface GraphqlError {
  extensions?: unknown;
  message: string;
}

interface AuthPayload {
  accessToken: string;
  user: {
    username: string;
  };
}

interface RegisterResponse {
  data?: {
    register?: AuthPayload;
  };
  errors?: GraphqlError[];
}

interface FriendshipResponse {
  data?: {
    acceptFriendRequest?: FriendshipSummary;
    sendFriendRequest?: FriendshipSummary;
  };
  errors?: GraphqlError[];
}

interface FriendshipSearchResponse {
  data?: {
    viewerFriendRequestSearch?: FriendshipSearchResult;
    viewerFriendSearch?: FriendshipSearchResult;
  };
  errors?: GraphqlError[];
}

interface CreateDirectThreadResponse {
  data?: {
    createDirectThread?: ThreadSummary;
  };
  errors?: GraphqlError[];
}

interface CreateDirectThreadMessageResponse {
  data?: {
    createDirectThreadMessage?: ThreadSummary;
  };
  errors?: GraphqlError[];
}

interface MarkDirectThreadReadResponse {
  data?: {
    markDirectThreadRead?: ThreadSummary;
  };
  errors?: GraphqlError[];
}

interface DirectThreadSearchResponse {
  data?: {
    viewerDirectThreadSearch?: ThreadSearchResult;
  };
  errors?: GraphqlError[];
}

interface CreateProjectResponse {
  data?: {
    createProject?: ProjectSummary;
  };
  errors?: GraphqlError[];
}

interface ProjectBySlugResponse {
  data?: {
    projectBySlug?: ProjectSummary | null;
  };
  errors?: GraphqlError[];
}

interface PrepareUploadResponse {
  data?: {
    prepareProjectUpload?: ProjectUploadTarget;
  };
  errors?: GraphqlError[];
}

interface CreateVersionResponse {
  data?: {
    createVersion?: VersionSummary;
  };
  errors?: GraphqlError[];
}

interface CreateCollectionResponse {
  data?: {
    createCollection?: CollectionSummary;
  };
  errors?: GraphqlError[];
}

interface AddProjectToCollectionResponse {
  data?: {
    addProjectToCollection?: CollectionSummary;
  };
  errors?: GraphqlError[];
}

interface PublicCollectionBySlugResponse {
  data?: {
    publicCollectionBySlug?: CollectionSummary | null;
  };
  errors?: GraphqlError[];
}

interface CreateProjectReportResponse {
  data?: {
    createProjectReport?: ReportSummary;
  };
  errors?: GraphqlError[];
}

interface RecordProjectViewResponse {
  data?: {
    recordProjectView?: ProjectViewRecord;
  };
  errors?: GraphqlError[];
}

interface RecordDownloadResponse {
  data?: {
    recordDownload?: DownloadRecord;
  };
  errors?: GraphqlError[];
}

interface ProjectAnalyticsResponse {
  data?: {
    projectAnalytics?: ProjectAnalyticsSummary | null;
  };
  errors?: GraphqlError[];
}

interface CreateOrganizationResponse {
  data?: {
    createOrganization?: OrganizationSummary;
  };
  errors?: GraphqlError[];
}

interface AddProjectToOrganizationResponse {
  data?: {
    addProjectToOrganization?: OrganizationSummary;
  };
  errors?: GraphqlError[];
}

interface OrganizationBySlugResponse {
  data?: {
    organizationBySlug?: OrganizationSummary | null;
  };
  errors?: GraphqlError[];
}

interface OrganizationProjectSearchResponse {
  data?: {
    organizationProjectSearch?: OrganizationProjectSearchResult;
  };
  errors?: GraphqlError[];
}

interface VersionsForProjectResponse {
  data?: {
    versionsForProject?: VersionSummary[];
  };
  errors?: GraphqlError[];
}

interface ProjectSummary {
  kind: string;
  slug: string;
  status: string;
  title: string;
}

interface ProjectUploadTarget {
  bucket: string;
  key: string;
  method: string;
  objectUrl: string;
  uploadUrl: string;
}

interface VersionSummary {
  files: {
    fileName: string;
    id: string;
    primary: boolean;
    url: string;
  }[];
  id: string;
  projectSlug: string;
  status: string;
  versionNumber: string;
}

interface CollectionSummary {
  id: string;
  name: string;
  owner: {
    username: string;
  };
  projectCount: number;
  projects: ProjectSummary[];
  slug: string;
  visibility: string;
}

interface ReportSummary {
  body: string;
  project: ReportProjectTarget | null;
  reason: string;
  reporter: {
    username: string;
  } | null;
  state: string;
}

interface ReportProjectTarget {
  kind: string;
  slug: string;
  title: string;
}

interface ProjectViewRecord {
  projectSlug: string;
}

interface DownloadRecord {
  fileId: string;
  projectDownloads: number;
  versionDownloads: number;
}

interface ProjectAnalyticsSummary {
  downloadsLast30Days: number;
  projectSlug: string;
  totalDownloads: number;
  totalViews: number;
  viewsLast30Days: number;
}

interface OrganizationSummary {
  id: string;
  memberCount: number;
  name: string;
  owner: {
    username: string;
  };
  projectCount: number;
  projects: ProjectSummary[];
  slug: string;
}

interface OrganizationProjectSearchResult {
  projects: ProjectSummary[];
  totalHits: number;
}

interface ProjectSearchResponse {
  data?: {
    projectSearch?: {
      projects: ProjectSummary[];
      totalHits: number;
    };
  };
  errors?: GraphqlError[];
}

interface FriendshipSummary {
  direction: string;
  state: string;
  user: {
    username: string;
  };
}

interface FriendshipSearchResult {
  friendships: FriendshipSummary[];
  totalHits: number;
}

interface ThreadSummary {
  id: string;
  members: {
    user: {
      username: string;
    };
  }[];
  messages: {
    author: {
      username: string;
    };
    body: string;
  }[];
  subject: string;
}

interface ThreadSearchResult {
  threads: ThreadSummary[];
  totalHits: number;
}

async function main(): Promise<void> {
  await checkReadiness();
  await checkWeb();
  await checkProjectSearch();
  await Promise.all([
    checkProjectType('MOD'),
    checkProjectType('PLUGIN'),
    checkProjectType('MODPACK'),
  ]);
  await checkCreatorFlow();

  console.log('Local smoke checks passed');
}

async function checkReadiness(): Promise<void> {
  const readiness = await readJson<ReadinessResult>(
    `${apiUrl}/health/ready`,
    'API readiness',
  );

  if (readiness.status !== 'ready') {
    throw new Error(`API is not ready: ${readiness.status}`);
  }

  const down = readiness.checks.filter((check) => check.status !== 'up');
  if (down.length > 0) {
    throw new Error(
      `API readiness checks failed: ${down
        .map((check) => check.name)
        .join(', ')}`,
    );
  }
}

async function checkWeb(): Promise<void> {
  const response = await fetch(webUrl);
  if (!response.ok) {
    throw new Error(`Web returned ${response.status.toString()}`);
  }

  const body = await response.text();
  if (!body.includes('<html') || !body.includes('id="root"')) {
    throw new Error('Web response did not look like the app shell');
  }
}

async function checkProjectSearch(): Promise<void> {
  const search = await projectSearch({});
  if (search.totalHits < 1 || search.projects.length < 1) {
    throw new Error('Project search returned no projects');
  }
}

async function checkProjectType(kind: string): Promise<void> {
  const search = await projectSearch({
    tags: [`kind:${kind}`],
  });

  if (search.totalHits < 1 || search.projects.length < 1) {
    throw new Error(`Project search returned no ${kind} projects`);
  }

  const mismatched = search.projects.find((project) => project.kind !== kind);
  if (mismatched !== undefined) {
    throw new Error(
      `Expected ${kind} project search, received ${mismatched.kind} ${mismatched.slug}`,
    );
  }
}

async function registerSmokeUser(input: {
  email: string;
  password: string;
  username: string;
}): Promise<AuthPayload> {
  const registerPayload = await readGraphql<RegisterResponse>({
    query: `
      mutation SmokeRegister($input: RegisterInput!) {
        register(input: $input) {
          accessToken
          user {
            username
          }
        }
      }
    `,
    variables: {
      input,
    },
  });
  assertNoGraphqlErrors(registerPayload, 'GraphQL register');

  const auth = required(registerPayload.data?.register, 'register payload');
  if (auth.user.username !== input.username) {
    throw new Error(
      `Registered username mismatch: expected ${input.username}, received ${auth.user.username}`,
    );
  }

  return auth;
}

async function checkCreatorFlow(): Promise<void> {
  const suffix = `${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 8)}`;
  const username = `smoke_${suffix}`;
  const peerUsername = `smoke_peer_${suffix}`;
  const slug = `smoke-${suffix}`;
  const title = `Smoke Project ${suffix}`;

  const auth = await registerSmokeUser({
    email: `${username}@example.test`,
    password: `password-${suffix}`,
    username,
  });
  const peerAuth = await registerSmokeUser({
    email: `${peerUsername}@example.test`,
    password: `password-${suffix}-peer`,
    username: peerUsername,
  });

  await checkSocialFlow({
    peerToken: peerAuth.accessToken,
    peerUsername,
    token: auth.accessToken,
    username,
  });

  const createPayload = await readGraphql<CreateProjectResponse>(
    {
      query: `
        mutation SmokeCreateProject($input: CreateProjectInput!) {
          createProject(input: $input) {
            kind
            slug
            status
            title
          }
        }
      `,
      variables: {
        input: {
          categories: ['utility'],
          description:
            'A local smoke-test project created through the authenticated GraphQL flow.',
          gameVersions: ['1.21.6'],
          kind: 'MOD',
          loaders: ['fabric'],
          slug,
          summary: 'A local smoke-test project.',
          title,
        },
      },
    },
    auth.accessToken,
  );
  assertNoGraphqlErrors(createPayload, 'GraphQL create project');

  const createdProject = required(
    createPayload.data?.createProject,
    'created project',
  );
  assertProject(createdProject, { kind: 'MOD', slug, title });

  const publicPayload = await readGraphql<ProjectBySlugResponse>({
    query: `
      query SmokeProjectBySlug($slug: String!) {
        projectBySlug(slug: $slug) {
          kind
          slug
          status
          title
        }
      }
    `,
    variables: { slug },
  });
  assertNoGraphqlErrors(publicPayload, 'GraphQL project by slug');
  assertProject(required(publicPayload.data?.projectBySlug, 'public project'), {
    kind: 'MOD',
    slug,
    title,
  });

  const indexedProject = (await projectSearch({ search: slug })).projects.find(
    (project) => project.slug === slug,
  );
  assertProject(required(indexedProject, 'indexed project'), {
    kind: 'MOD',
    slug,
    title,
  });

  const uploadTarget = await prepareVersionUpload(slug, auth.accessToken);
  if (
    uploadTarget.bucket.length === 0 ||
    uploadTarget.key.length === 0 ||
    uploadTarget.method !== 'PUT' ||
    uploadTarget.objectUrl.length === 0 ||
    uploadTarget.uploadUrl.length === 0
  ) {
    throw new Error('Version upload target was incomplete');
  }

  const versionBytes = smokeVersionBytes(suffix);
  const versionHash = sha256Hex(versionBytes);
  await uploadVersionFile(uploadTarget, versionBytes);
  await verifyUploadedVersionFile(uploadTarget.objectUrl, versionBytes);

  const versionNumber = `1.0.${suffix}`;
  const versionPayload = await readGraphql<CreateVersionResponse>(
    {
      query: `
        mutation SmokeCreateVersion($input: CreateVersionInput!) {
          createVersion(input: $input) {
            files {
              fileName
              id
              primary
              url
            }
            id
            projectSlug
            status
            versionNumber
          }
        }
      `,
      variables: {
        input: {
          channel: 'RELEASE',
          changelog: 'Initial smoke-test release.',
          files: [
            {
              fileName: `smoke-${suffix}.jar`,
              hashes: [
                {
                  algorithm: 'SHA256',
                  value: versionHash,
                },
              ],
              primary: true,
              sizeBytes: 128,
              url: uploadTarget.objectUrl,
            },
          ],
          gameVersions: ['1.21.6'],
          loaders: ['fabric'],
          name: `Smoke Version ${suffix}`,
          projectSlug: slug,
          versionNumber,
        },
      },
    },
    auth.accessToken,
  );
  assertNoGraphqlErrors(versionPayload, 'GraphQL create version');

  const createdVersion = required(
    versionPayload.data?.createVersion,
    'created version',
  );
  assertVersion(createdVersion, {
    projectSlug: slug,
    versionNumber,
  });

  const versionsPayload = await readGraphql<VersionsForProjectResponse>({
    query: `
      query SmokeVersionsForProject($projectSlug: String!) {
        versionsForProject(projectSlug: $projectSlug) {
          files {
            fileName
            id
            primary
            url
          }
          id
          projectSlug
          status
          versionNumber
        }
      }
    `,
    variables: { projectSlug: slug },
  });
  assertNoGraphqlErrors(versionsPayload, 'GraphQL versions for project');

  const publicVersion = required(
    versionsPayload.data?.versionsForProject?.find(
      (version) => version.versionNumber === versionNumber,
    ),
    'public version',
  );
  assertVersion(publicVersion, {
    projectSlug: slug,
    versionNumber,
  });
  await checkAnalyticsFlow({
    fileId: required(publicVersion.files[0], 'public version file').id,
    projectSlug: slug,
  });
  await checkOrganizationFlow({
    projectSlug: slug,
    projectTitle: title,
    token: auth.accessToken,
    username,
  });

  await checkCollectionFlow({
    projectSlug: slug,
    projectTitle: title,
    token: auth.accessToken,
    username,
  });
  await checkProjectReportFlow({
    projectSlug: slug,
    projectTitle: title,
    token: auth.accessToken,
    username,
  });
}

async function checkSocialFlow(options: {
  peerToken: string;
  peerUsername: string;
  token: string;
  username: string;
}): Promise<void> {
  const requestPayload = await readGraphql<FriendshipResponse>(
    {
      query: `
        mutation SmokeSendFriendRequest($username: String!) {
          sendFriendRequest(username: $username) {
            direction
            state
            user {
              username
            }
          }
        }
      `,
      variables: { username: options.peerUsername },
    },
    options.token,
  );
  assertNoGraphqlErrors(requestPayload, 'GraphQL send friend request');
  assertFriendship(
    required(requestPayload.data?.sendFriendRequest, 'sent friend request'),
    {
      direction: 'OUTGOING',
      state: 'PENDING',
      username: options.peerUsername,
    },
  );

  const peerRequestsPayload = await readGraphql<FriendshipSearchResponse>(
    {
      query: `
        query SmokeViewerFriendRequestSearch {
          viewerFriendRequestSearch(limit: 5, offset: 0) {
            friendships {
              direction
              state
              user {
                username
              }
            }
            totalHits
          }
        }
      `,
    },
    options.peerToken,
  );
  assertNoGraphqlErrors(
    peerRequestsPayload,
    'GraphQL viewer friend request search',
  );

  const peerRequests = required(
    peerRequestsPayload.data?.viewerFriendRequestSearch,
    'viewer friend request search',
  );
  if (peerRequests.totalHits < 1) {
    throw new Error('Peer friend request search returned no requests');
  }
  assertFriendship(
    required(
      peerRequests.friendships.find(
        (friendship) => friendship.user.username === options.username,
      ),
      'incoming friend request',
    ),
    {
      direction: 'INCOMING',
      state: 'PENDING',
      username: options.username,
    },
  );

  const acceptPayload = await readGraphql<FriendshipResponse>(
    {
      query: `
        mutation SmokeAcceptFriendRequest($username: String!) {
          acceptFriendRequest(username: $username) {
            direction
            state
            user {
              username
            }
          }
        }
      `,
      variables: { username: options.username },
    },
    options.peerToken,
  );
  assertNoGraphqlErrors(acceptPayload, 'GraphQL accept friend request');
  assertFriendship(
    required(acceptPayload.data?.acceptFriendRequest, 'accepted friendship'),
    {
      direction: 'MUTUAL',
      state: 'ACCEPTED',
      username: options.username,
    },
  );

  const viewerFriendsPayload = await readGraphql<FriendshipSearchResponse>(
    {
      query: `
        query SmokeViewerFriendSearch {
          viewerFriendSearch(limit: 5, offset: 0) {
            friendships {
              direction
              state
              user {
                username
              }
            }
            totalHits
          }
        }
      `,
    },
    options.token,
  );
  assertNoGraphqlErrors(viewerFriendsPayload, 'GraphQL viewer friend search');

  const viewerFriends = required(
    viewerFriendsPayload.data?.viewerFriendSearch,
    'viewer friend search',
  );
  if (viewerFriends.totalHits < 1) {
    throw new Error('Viewer friend search returned no friends');
  }
  assertFriendship(
    required(
      viewerFriends.friendships.find(
        (friendship) => friendship.user.username === options.peerUsername,
      ),
      'viewer friend',
    ),
    {
      direction: 'MUTUAL',
      state: 'ACCEPTED',
      username: options.peerUsername,
    },
  );

  await checkDirectThreadFlow(options);
}

async function checkDirectThreadFlow(options: {
  peerToken: string;
  peerUsername: string;
  token: string;
  username: string;
}): Promise<void> {
  const firstMessage = `Hello ${options.peerUsername}`;
  const replyMessage = `Reply to ${options.username}`;
  const createPayload = await readGraphql<CreateDirectThreadResponse>(
    {
      query: `
        mutation SmokeCreateDirectThread($input: CreateDirectThreadInput!) {
          createDirectThread(input: $input) {
            id
            members {
              user {
                username
              }
            }
            messages {
              author {
                username
              }
              body
            }
            subject
          }
        }
      `,
      variables: {
        input: {
          body: firstMessage,
          username: options.peerUsername,
        },
      },
    },
    options.token,
  );
  assertNoGraphqlErrors(createPayload, 'GraphQL create direct thread');

  const createdThread = required(
    createPayload.data?.createDirectThread,
    'created direct thread',
  );
  assertDirectThread(createdThread, {
    messages: [{ body: firstMessage, username: options.username }],
    usernames: [options.username, options.peerUsername],
  });

  const replyPayload = await readGraphql<CreateDirectThreadMessageResponse>(
    {
      query: `
        mutation SmokeCreateDirectThreadMessage($input: CreateDirectThreadMessageInput!) {
          createDirectThreadMessage(input: $input) {
            id
            members {
              user {
                username
              }
            }
            messages {
              author {
                username
              }
              body
            }
            subject
          }
        }
      `,
      variables: {
        input: {
          body: replyMessage,
          threadId: createdThread.id,
        },
      },
    },
    options.peerToken,
  );
  assertNoGraphqlErrors(replyPayload, 'GraphQL create direct thread message');

  assertDirectThread(
    required(replyPayload.data?.createDirectThreadMessage, 'replied thread'),
    {
      messages: [
        { body: firstMessage, username: options.username },
        { body: replyMessage, username: options.peerUsername },
      ],
      threadId: createdThread.id,
      usernames: [options.username, options.peerUsername],
    },
  );

  await assertViewerCanSeeDirectThread({
    expectedMessages: [firstMessage, replyMessage],
    threadId: createdThread.id,
    token: options.token,
    username: options.username,
  });
  await assertViewerCanSeeDirectThread({
    expectedMessages: [firstMessage, replyMessage],
    threadId: createdThread.id,
    token: options.peerToken,
    username: options.peerUsername,
  });

  const readPayload = await readGraphql<MarkDirectThreadReadResponse>(
    {
      query: `
        mutation SmokeMarkDirectThreadRead($threadId: String!) {
          markDirectThreadRead(threadId: $threadId) {
            id
            members {
              user {
                username
              }
            }
            messages {
              author {
                username
              }
              body
            }
            subject
          }
        }
      `,
      variables: { threadId: createdThread.id },
    },
    options.token,
  );
  assertNoGraphqlErrors(readPayload, 'GraphQL mark direct thread read');
  assertDirectThread(
    required(readPayload.data?.markDirectThreadRead, 'read direct thread'),
    {
      messages: [
        { body: firstMessage, username: options.username },
        { body: replyMessage, username: options.peerUsername },
      ],
      threadId: createdThread.id,
      usernames: [options.username, options.peerUsername],
    },
  );
}

async function assertViewerCanSeeDirectThread(options: {
  expectedMessages: string[];
  threadId: string;
  token: string;
  username: string;
}): Promise<void> {
  const payload = await readGraphql<DirectThreadSearchResponse>(
    {
      query: `
        query SmokeViewerDirectThreadSearch {
          viewerDirectThreadSearch(limit: 5, offset: 0) {
            threads {
              id
              members {
                user {
                  username
                }
              }
              messages {
                author {
                  username
                }
                body
              }
              subject
            }
            totalHits
          }
        }
      `,
    },
    options.token,
  );
  assertNoGraphqlErrors(payload, 'GraphQL viewer direct thread search');

  const result = required(
    payload.data?.viewerDirectThreadSearch,
    'viewer direct thread search',
  );
  if (result.totalHits < 1) {
    throw new Error(
      `Viewer ${options.username} direct thread search returned no threads`,
    );
  }

  const thread = required(
    result.threads.find((item) => item.id === options.threadId),
    `direct thread visible to ${options.username}`,
  );
  for (const message of options.expectedMessages) {
    if (!thread.messages.some((item) => item.body === message)) {
      throw new Error(
        `Thread ${options.threadId} visible to ${options.username} is missing message ${message}`,
      );
    }
  }
}

async function checkCollectionFlow(options: {
  projectSlug: string;
  projectTitle: string;
  token: string;
  username: string;
}): Promise<void> {
  const collectionSlug = `smoke-collection-${options.projectSlug}`;
  const collectionName = `Smoke Collection ${options.projectSlug}`;

  const createPayload = await readGraphql<CreateCollectionResponse>(
    {
      query: `
        mutation SmokeCreateCollection($input: CreateCollectionInput!) {
          createCollection(input: $input) {
            id
            name
            owner {
              username
            }
            projectCount
            projects {
              kind
              slug
              status
              title
            }
            slug
            visibility
          }
        }
      `,
      variables: {
        input: {
          description: 'A public smoke-test collection.',
          name: collectionName,
          slug: collectionSlug,
          visibility: 'PUBLIC',
        },
      },
    },
    options.token,
  );
  assertNoGraphqlErrors(createPayload, 'GraphQL create collection');

  const createdCollection = required(
    createPayload.data?.createCollection,
    'created collection',
  );
  assertCollection(createdCollection, {
    name: collectionName,
    ownerUsername: options.username,
    slug: collectionSlug,
  });

  const addPayload = await readGraphql<AddProjectToCollectionResponse>(
    {
      query: `
        mutation SmokeAddProjectToCollection($input: AddProjectToCollectionInput!) {
          addProjectToCollection(input: $input) {
            id
            name
            owner {
              username
            }
            projectCount
            projects {
              kind
              slug
              status
              title
            }
            slug
            visibility
          }
        }
      `,
      variables: {
        input: {
          collectionId: createdCollection.id,
          projectSlug: options.projectSlug,
        },
      },
    },
    options.token,
  );
  assertNoGraphqlErrors(addPayload, 'GraphQL add project to collection');

  const updatedCollection = required(
    addPayload.data?.addProjectToCollection,
    'updated collection',
  );
  assertCollection(updatedCollection, {
    name: collectionName,
    ownerUsername: options.username,
    projectSlug: options.projectSlug,
    projectTitle: options.projectTitle,
    slug: collectionSlug,
  });

  const publicPayload = await readGraphql<PublicCollectionBySlugResponse>({
    query: `
      query SmokePublicCollectionBySlug($ownerUsername: String!, $slug: String!) {
        publicCollectionBySlug(ownerUsername: $ownerUsername, slug: $slug) {
          id
          name
          owner {
            username
          }
          projectCount
          projects {
            kind
            slug
            status
            title
          }
          slug
          visibility
        }
      }
    `,
    variables: {
      ownerUsername: options.username,
      slug: collectionSlug,
    },
  });
  assertNoGraphqlErrors(publicPayload, 'GraphQL public collection by slug');
  assertCollection(
    required(publicPayload.data?.publicCollectionBySlug, 'public collection'),
    {
      name: collectionName,
      ownerUsername: options.username,
      projectSlug: options.projectSlug,
      projectTitle: options.projectTitle,
      slug: collectionSlug,
    },
  );
}

async function prepareVersionUpload(
  projectSlug: string,
  token: string,
): Promise<ProjectUploadTarget> {
  const payload = await readGraphql<PrepareUploadResponse>(
    {
      query: `
        mutation SmokePrepareProjectUpload($input: PrepareProjectUploadInput!) {
          prepareProjectUpload(input: $input) {
            bucket
            key
            method
            objectUrl
            uploadUrl
          }
        }
      `,
      variables: {
        input: {
          contentType: 'application/java-archive',
          fileName: 'smoke.jar',
          projectSlug,
          sizeBytes: 128,
          uploadKind: 'version-file',
        },
      },
    },
    token,
  );
  assertNoGraphqlErrors(payload, 'GraphQL prepare project upload');

  return required(payload.data?.prepareProjectUpload, 'project upload target');
}

function smokeVersionBytes(suffix: string): Uint8Array {
  const content = `smoke release artifact ${suffix}\n`;
  const bytes = new Uint8Array(128);
  bytes.set(new TextEncoder().encode(content));
  return bytes;
}

function sha256Hex(bytes: Uint8Array): string {
  return new Bun.CryptoHasher('sha256').update(bytes).digest('hex');
}

async function uploadVersionFile(
  target: ProjectUploadTarget,
  bytes: Uint8Array,
): Promise<void> {
  const response = await fetch(target.uploadUrl, {
    body: bytes,
    headers: {
      'content-length': bytes.byteLength.toString(),
      'content-type': 'application/java-archive',
    },
    method: target.method,
  });

  if (!response.ok) {
    throw new Error(
      `Version file upload returned ${response.status.toString()}`,
    );
  }
}

async function verifyUploadedVersionFile(
  objectUrl: string,
  expected: Uint8Array,
): Promise<void> {
  const response = await fetch(objectUrl);
  if (!response.ok) {
    throw new Error(
      `Version file download returned ${response.status.toString()}`,
    );
  }

  const actual = new Uint8Array(await response.arrayBuffer());
  if (actual.byteLength !== expected.byteLength) {
    throw new Error(
      `Version file size mismatch: expected ${expected.byteLength.toString()}, received ${actual.byteLength.toString()}`,
    );
  }

  if (!actual.every((byte, index) => byte === expected[index])) {
    throw new Error('Version file bytes did not match uploaded content');
  }
}

async function checkAnalyticsFlow(options: {
  fileId: string;
  projectSlug: string;
}): Promise<void> {
  const viewPayload = await readGraphql<RecordProjectViewResponse>({
    query: `
      mutation SmokeRecordProjectView($input: RecordProjectViewInput!) {
        recordProjectView(input: $input) {
          projectSlug
        }
      }
    `,
    variables: {
      input: {
        projectSlug: options.projectSlug,
      },
    },
  });
  assertNoGraphqlErrors(viewPayload, 'GraphQL record project view');

  const viewRecord = required(
    viewPayload.data?.recordProjectView,
    'project view record',
  );
  if (viewRecord.projectSlug !== options.projectSlug) {
    throw new Error(
      `Project view mismatch: expected ${options.projectSlug}, received ${viewRecord.projectSlug}`,
    );
  }

  const downloadPayload = await readGraphql<RecordDownloadResponse>({
    query: `
      mutation SmokeRecordDownload($input: RecordDownloadInput!) {
        recordDownload(input: $input) {
          fileId
          projectDownloads
          versionDownloads
        }
      }
    `,
    variables: {
      input: {
        fileId: options.fileId,
      },
    },
  });
  assertNoGraphqlErrors(downloadPayload, 'GraphQL record download');

  const downloadRecord = required(
    downloadPayload.data?.recordDownload,
    'download record',
  );
  if (
    downloadRecord.fileId !== options.fileId ||
    downloadRecord.projectDownloads < 1 ||
    downloadRecord.versionDownloads < 1
  ) {
    throw new Error(
      `Download mismatch for ${options.fileId}: received project=${downloadRecord.projectDownloads.toString()} version=${downloadRecord.versionDownloads.toString()}`,
    );
  }

  const analyticsPayload = await readGraphql<ProjectAnalyticsResponse>({
    query: `
      query SmokeProjectAnalytics($projectSlug: String!) {
        projectAnalytics(projectSlug: $projectSlug) {
          downloadsLast30Days
          projectSlug
          totalDownloads
          totalViews
          viewsLast30Days
        }
      }
    `,
    variables: {
      projectSlug: options.projectSlug,
    },
  });
  assertNoGraphqlErrors(analyticsPayload, 'GraphQL project analytics');

  const analytics = required(
    analyticsPayload.data?.projectAnalytics,
    'project analytics',
  );
  if (
    analytics.projectSlug !== options.projectSlug ||
    analytics.downloadsLast30Days < 1 ||
    analytics.totalDownloads < 1 ||
    analytics.totalViews < 1 ||
    analytics.viewsLast30Days < 1
  ) {
    throw new Error(
      `Analytics mismatch for ${options.projectSlug}: views=${analytics.totalViews.toString()} downloads=${analytics.totalDownloads.toString()}`,
    );
  }
}

async function checkOrganizationFlow(options: {
  projectSlug: string;
  projectTitle: string;
  token: string;
  username: string;
}): Promise<void> {
  const organizationSlug = `smoke-org-${options.projectSlug}`;
  const organizationName = `Smoke Org ${options.projectSlug}`;

  const createPayload = await readGraphql<CreateOrganizationResponse>(
    {
      query: `
        mutation SmokeCreateOrganization($input: CreateOrganizationInput!) {
          createOrganization(input: $input) {
            id
            memberCount
            name
            owner {
              username
            }
            projectCount
            projects {
              kind
              slug
              status
              title
            }
            slug
          }
        }
      `,
      variables: {
        input: {
          color: '#4f46e5',
          description: 'A smoke-test creator organization.',
          name: organizationName,
          slug: organizationSlug,
        },
      },
    },
    options.token,
  );
  assertNoGraphqlErrors(createPayload, 'GraphQL create organization');

  const createdOrganization = required(
    createPayload.data?.createOrganization,
    'created organization',
  );
  assertOrganization(createdOrganization, {
    name: organizationName,
    ownerUsername: options.username,
    slug: organizationSlug,
  });

  const addPayload = await readGraphql<AddProjectToOrganizationResponse>(
    {
      query: `
        mutation SmokeAddProjectToOrganization($input: AddProjectToOrganizationInput!) {
          addProjectToOrganization(input: $input) {
            id
            memberCount
            name
            owner {
              username
            }
            projectCount
            projects {
              kind
              slug
              status
              title
            }
            slug
          }
        }
      `,
      variables: {
        input: {
          organizationId: createdOrganization.id,
          projectSlug: options.projectSlug,
        },
      },
    },
    options.token,
  );
  assertNoGraphqlErrors(addPayload, 'GraphQL add project to organization');

  const updatedOrganization = required(
    addPayload.data?.addProjectToOrganization,
    'updated organization',
  );
  assertOrganization(updatedOrganization, {
    name: organizationName,
    ownerUsername: options.username,
    projectSlug: options.projectSlug,
    projectTitle: options.projectTitle,
    slug: organizationSlug,
  });

  const publicPayload = await readGraphql<OrganizationBySlugResponse>({
    query: `
      query SmokeOrganizationBySlug($slug: String!) {
        organizationBySlug(slug: $slug) {
          id
          memberCount
          name
          owner {
            username
          }
          projectCount
          projects {
            kind
            slug
            status
            title
          }
          slug
        }
      }
    `,
    variables: { slug: organizationSlug },
  });
  assertNoGraphqlErrors(publicPayload, 'GraphQL organization by slug');
  assertOrganization(
    required(publicPayload.data?.organizationBySlug, 'public organization'),
    {
      name: organizationName,
      ownerUsername: options.username,
      projectSlug: options.projectSlug,
      projectTitle: options.projectTitle,
      slug: organizationSlug,
    },
  );

  const projectsPayload = await readGraphql<OrganizationProjectSearchResponse>({
    query: `
      query SmokeOrganizationProjectSearch($slug: String!) {
        organizationProjectSearch(slug: $slug, limit: 5, offset: 0) {
          projects {
            kind
            slug
            status
            title
          }
          totalHits
        }
      }
    `,
    variables: { slug: organizationSlug },
  });
  assertNoGraphqlErrors(projectsPayload, 'GraphQL organization project search');

  const projectSearch = required(
    projectsPayload.data?.organizationProjectSearch,
    'organization project search',
  );
  if (projectSearch.totalHits < 1) {
    throw new Error(`Organization ${organizationSlug} returned no projects`);
  }
  assertProject(
    required(
      projectSearch.projects.find(
        (project) => project.slug === options.projectSlug,
      ),
      'organization project',
    ),
    {
      kind: 'MOD',
      slug: options.projectSlug,
      title: options.projectTitle,
    },
  );
}

async function checkProjectReportFlow(options: {
  projectSlug: string;
  projectTitle: string;
  token: string;
  username: string;
}): Promise<void> {
  const body = `Smoke report for ${options.projectSlug}`;
  const payload = await readGraphql<CreateProjectReportResponse>(
    {
      query: `
        mutation SmokeCreateProjectReport($input: CreateProjectReportInput!) {
          createProjectReport(input: $input) {
            body
            project {
              kind
              slug
              title
            }
            reason
            reporter {
              username
            }
            state
          }
        }
      `,
      variables: {
        input: {
          body,
          projectSlug: options.projectSlug,
          reason: 'BROKEN_OR_MISLEADING',
        },
      },
    },
    options.token,
  );
  assertNoGraphqlErrors(payload, 'GraphQL create project report');

  const report = required(payload.data?.createProjectReport, 'project report');
  if (
    report.body !== body ||
    report.reason !== 'BROKEN_OR_MISLEADING' ||
    report.reporter?.username !== options.username ||
    report.state !== 'OPEN'
  ) {
    throw new Error(
      `Report mismatch for ${options.projectSlug}: received ${report.reason} ${report.state}`,
    );
  }

  assertReportProjectTarget(required(report.project, 'reported project'), {
    kind: 'MOD',
    slug: options.projectSlug,
    title: options.projectTitle,
  });
}

async function projectSearch(query: {
  search?: string;
  tags?: string[];
}): Promise<NonNullable<ProjectSearchResponse['data']>['projectSearch']> {
  const payload = await readGraphql<ProjectSearchResponse>({
    query: `
      query SmokeProjectSearch($query: CatalogQueryInput) {
        projectSearch(query: $query) {
          totalHits
          projects {
            kind
            slug
            title
          }
        }
      }
    `,
    variables: {
      query: {
        limit: 5,
        offset: 0,
        ...query,
      },
    },
  });

  if (payload.errors !== undefined && payload.errors.length > 0) {
    throw new Error(
      `GraphQL project search failed: ${payload.errors
        .map((error) => error.message)
        .join('; ')}`,
    );
  }

  const search = payload.data?.projectSearch;
  if (search === undefined) {
    throw new Error('GraphQL project search did not return data');
  }

  return search;
}

async function readGraphql<T>(body: unknown, token?: string): Promise<T> {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
  };
  if (token !== undefined) {
    headers.authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${apiUrl}/graphql`, {
    body: JSON.stringify(body),
    headers,
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(
      `GraphQL returned ${response.status.toString()}: ${await response.text()}`,
    );
  }

  return (await response.json()) as T;
}

function assertNoGraphqlErrors(
  payload: { errors?: GraphqlError[] },
  label: string,
): void {
  if (payload.errors !== undefined && payload.errors.length > 0) {
    throw new Error(
      `${label} failed: ${payload.errors
        .map((error) => JSON.stringify(error))
        .join('; ')}`,
    );
  }
}

function assertProject(
  project: ProjectSummary,
  expected: { kind: string; slug: string; title: string },
): void {
  if (
    project.kind !== expected.kind ||
    project.slug !== expected.slug ||
    project.title !== expected.title
  ) {
    throw new Error(
      `Project mismatch: expected ${expected.kind} ${expected.slug} ${expected.title}, received ${project.kind} ${project.slug} ${project.title}`,
    );
  }
}

function assertOrganization(
  organization: OrganizationSummary,
  expected: {
    name: string;
    ownerUsername: string;
    projectSlug?: string;
    projectTitle?: string;
    slug: string;
  },
): void {
  if (
    organization.memberCount !== 1 ||
    organization.name !== expected.name ||
    organization.owner.username !== expected.ownerUsername ||
    organization.slug !== expected.slug
  ) {
    throw new Error(
      `Organization mismatch: expected ${expected.ownerUsername}/${expected.slug}, received ${organization.owner.username}/${organization.slug}`,
    );
  }

  if (expected.projectSlug === undefined) {
    if (organization.projectCount !== 0 || organization.projects.length !== 0) {
      throw new Error(
        `Expected empty organization ${organization.slug}, received ${organization.projectCount.toString()} projects`,
      );
    }
    return;
  }

  if (organization.projectCount !== 1) {
    throw new Error(
      `Expected organization ${organization.slug} to contain one project, received ${organization.projectCount.toString()}`,
    );
  }

  const project = organization.projects.find(
    (item) => item.slug === expected.projectSlug,
  );
  assertProject(required(project, 'organization project'), {
    kind: 'MOD',
    slug: expected.projectSlug,
    title: required(expected.projectTitle, 'organization project title'),
  });
}

function assertReportProjectTarget(
  project: ReportProjectTarget,
  expected: { kind: string; slug: string; title: string },
): void {
  if (
    project.kind !== expected.kind ||
    project.slug !== expected.slug ||
    project.title !== expected.title
  ) {
    throw new Error(
      `Report project mismatch: expected ${expected.kind} ${expected.slug} ${expected.title}, received ${project.kind} ${project.slug} ${project.title}`,
    );
  }
}

function assertVersion(
  version: VersionSummary,
  expected: { projectSlug: string; versionNumber: string },
): void {
  if (
    version.projectSlug !== expected.projectSlug ||
    version.versionNumber !== expected.versionNumber ||
    version.status !== 'APPROVED' ||
    version.files.length !== 1 ||
    !version.files[0]?.primary
  ) {
    throw new Error(
      `Version mismatch: expected ${expected.projectSlug} ${expected.versionNumber}, received ${version.projectSlug} ${version.versionNumber}`,
    );
  }
}

function assertCollection(
  collection: CollectionSummary,
  expected: {
    name: string;
    ownerUsername: string;
    projectSlug?: string;
    projectTitle?: string;
    slug: string;
  },
): void {
  if (
    collection.name !== expected.name ||
    collection.owner.username !== expected.ownerUsername ||
    collection.slug !== expected.slug ||
    collection.visibility !== 'PUBLIC'
  ) {
    throw new Error(
      `Collection mismatch: expected ${expected.ownerUsername}/${expected.slug}, received ${collection.owner.username}/${collection.slug}`,
    );
  }

  if (expected.projectSlug === undefined) {
    if (collection.projectCount !== 0 || collection.projects.length !== 0) {
      throw new Error(
        `Expected empty collection ${collection.slug}, received ${collection.projectCount.toString()} projects`,
      );
    }
    return;
  }

  if (collection.projectCount !== 1) {
    throw new Error(
      `Expected collection ${collection.slug} to contain one project, received ${collection.projectCount.toString()}`,
    );
  }

  const project = collection.projects.find(
    (item) => item.slug === expected.projectSlug,
  );
  assertProject(required(project, 'collection project'), {
    kind: 'MOD',
    slug: expected.projectSlug,
    title: required(expected.projectTitle, 'collection project title'),
  });
}

function assertFriendship(
  friendship: FriendshipSummary,
  expected: { direction: string; state: string; username: string },
): void {
  if (
    friendship.direction !== expected.direction ||
    friendship.state !== expected.state ||
    friendship.user.username !== expected.username
  ) {
    throw new Error(
      `Friendship mismatch: expected ${expected.direction} ${expected.state} ${expected.username}, received ${friendship.direction} ${friendship.state} ${friendship.user.username}`,
    );
  }
}

function assertDirectThread(
  thread: ThreadSummary,
  expected: {
    messages: { body: string; username: string }[];
    threadId?: string;
    usernames: string[];
  },
): void {
  if (expected.threadId !== undefined && thread.id !== expected.threadId) {
    throw new Error(
      `Direct thread mismatch: expected ${expected.threadId}, received ${thread.id}`,
    );
  }

  for (const username of expected.usernames) {
    if (!thread.members.some((member) => member.user.username === username)) {
      throw new Error(
        `Direct thread ${thread.id} is missing member ${username}`,
      );
    }
  }

  for (const message of expected.messages) {
    if (
      !thread.messages.some(
        (item) =>
          item.author.username === message.username &&
          item.body === message.body,
      )
    ) {
      throw new Error(
        `Direct thread ${thread.id} is missing message from ${message.username}: ${message.body}`,
      );
    }
  }
}

function required<T>(value: T | null | undefined, name: string): T {
  if (value === null || value === undefined) {
    throw new Error(`Missing ${name}`);
  }

  return value;
}

async function readJson<T>(url: string, name: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${name} returned ${response.status.toString()}`);
  }

  return (await response.json()) as T;
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/u, '');
}

await main();
