import { PrismaClient } from '@prisma/client';
import { createHmac } from 'node:crypto';

const apiUrl = trimTrailingSlash(
  process.env.SMOKE_API_URL ?? 'http://localhost:13001',
);
const webUrl = trimTrailingSlash(
  process.env.SMOKE_WEB_URL ?? 'http://localhost:15174',
);
const mailpitUrl = trimTrailingSlash(
  process.env.SMOKE_MAILPIT_URL ?? 'http://localhost:8026',
);
const databaseUrl =
  process.env.SMOKE_DATABASE_URL ??
  process.env.DATABASE_URL ??
  'postgresql://moddery:moddery@localhost:5433/moddery?schema=public';
const seedFixtures = process.env.SMOKE_SEED_FIXTURES === 'true';
const smokeDownloadCountryCode = 'AU';
const smokeDownloadUserAgent = 'ModderySmokeDownload/1.0';
const smokeViewCountryCode = 'NZ';
const smokeViewReferrer = `${webUrl}/mods`;
const smokeViewUserAgent = 'ModderySmokeView/1.0';
const smokeVersionFileSizeBytes = 128;

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

interface LoginResponse {
  data?: {
    login?: AuthPayload;
  };
  errors?: GraphqlError[];
}

interface MeResponse {
  data?: {
    me?: {
      isAdmin: boolean;
      role: string;
      username: string;
    };
  };
  errors?: GraphqlError[];
}

interface ConfirmEmailVerificationResponse {
  data?: {
    confirmEmailVerification?: boolean;
  };
  errors?: GraphqlError[];
}

interface RequestEmailVerificationResponse {
  data?: {
    requestEmailVerification?: boolean;
  };
  errors?: GraphqlError[];
}

interface ConfirmPasswordResetResponse {
  data?: {
    confirmPasswordReset?: boolean;
  };
  errors?: GraphqlError[];
}

interface RequestPasswordResetResponse {
  data?: {
    requestPasswordReset?: boolean;
  };
  errors?: GraphqlError[];
}

interface SetupTwoFactorResponse {
  data?: {
    setupTwoFactor?: TwoFactorSetup;
  };
  errors?: GraphqlError[];
}

interface EnableTwoFactorResponse {
  data?: {
    enableTwoFactor?: boolean;
  };
  errors?: GraphqlError[];
}

interface CreateApiTokenResponse {
  data?: {
    createApiToken?: CreatedApiToken;
  };
  errors?: GraphqlError[];
}

interface RevokeApiTokenResponse {
  data?: {
    revokeApiToken?: ApiTokenSummary;
  };
  errors?: GraphqlError[];
}

interface CreateOAuthClientResponse {
  data?: {
    createOAuthClient?: CreatedOAuthClient;
  };
  errors?: GraphqlError[];
}

interface RevokeOAuthClientResponse {
  data?: {
    revokeOAuthClient?: OAuthClientSummary;
  };
  errors?: GraphqlError[];
}

interface ViewerOAuthClientSearchResponse {
  data?: {
    viewerOAuthClientSearch?: OAuthClientSearchResult;
  };
  errors?: GraphqlError[];
}

interface MailpitMessageList {
  messages?: MailpitMessageSummary[];
}

interface MailpitMessageSummary {
  ID?: string;
  To?: MailpitAddress[];
}

interface MailpitAddress {
  Address?: string;
}

interface MailpitMessage {
  Text?: string;
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

interface AddProjectGalleryImageResponse {
  data?: {
    addProjectGalleryImage?: ProjectSummary;
  };
  errors?: GraphqlError[];
}

interface AddProjectTeamMemberResponse {
  data?: {
    addProjectTeamMember?: ProjectMemberSummary[];
  };
  errors?: GraphqlError[];
}

interface ModerateProjectResponse {
  data?: {
    moderateProject?: ProjectSummary;
  };
  errors?: GraphqlError[];
}

interface ModerateVersionResponse {
  data?: {
    moderateVersion?: VersionSummary;
  };
  errors?: GraphqlError[];
}

interface NotificationSearchResponse {
  data?: {
    viewerNotificationSearch?: NotificationSearchResult;
  };
  errors?: GraphqlError[];
}

interface ProjectBySlugResponse {
  data?: {
    projectBySlug?: ProjectSummary | null;
  };
  errors?: GraphqlError[];
}

interface ViewerDashboardResponse {
  data?: {
    viewer?: ViewerDashboardSummary | null;
  };
  errors?: GraphqlError[];
}

interface ProjectMemberSearchResponse {
  data?: {
    projectMemberSearch?: ProjectMemberSearchResult;
  };
  errors?: GraphqlError[];
}

interface TeamInvitationSearchResponse {
  data?: {
    viewerTeamInvitationSearch?: TeamInvitationSearchResult;
  };
  errors?: GraphqlError[];
}

interface AcceptTeamInvitationResponse {
  data?: {
    acceptTeamInvitation?: TeamInvitationSummary;
  };
  errors?: GraphqlError[];
}

interface AdminAuditLogSearchResponse {
  data?: {
    adminAuditLogSearch?: AuditLogSearchResult;
  };
  errors?: GraphqlError[];
}

interface ProjectFollowResponse {
  data?: {
    followProject?: ProjectFollowState;
    unfollowProject?: ProjectFollowState;
    viewerProjectFollowState?: ProjectFollowState | null;
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

interface UpdateVersionDependenciesResponse {
  data?: {
    updateVersionDependencies?: VersionSummary;
  };
  errors?: GraphqlError[];
}

interface RecordFileScanResponse {
  data?: {
    recordFileScan?: VersionSummary;
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

interface CreateVersionReportResponse {
  data?: {
    createVersionReport?: ReportSummary;
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

interface ViewerProjectVersionSearchResponse {
  data?: {
    viewerProjectVersionSearch?: VersionSearchResult;
  };
  errors?: GraphqlError[];
}

interface VersionSearchForProjectResponse {
  data?: {
    versionSearchForProject?: VersionSearchResult;
  };
  errors?: GraphqlError[];
}

interface ProjectSummary {
  gallery?: GalleryImageSummary[];
  kind: string;
  slug: string;
  status: string;
  title: string;
}

interface ApiTokenSummary {
  id: string;
  name: string;
  revokedAt: string | null;
  scopes: string[];
}

interface CreatedApiToken {
  token: string;
  tokenSummary: ApiTokenSummary;
}

interface OAuthClientSummary {
  clientId: string | null;
  id: string;
  name: string;
  redirectUris: {
    uri: string;
  }[];
  revokedAt: string | null;
  scopes: string[];
  status: string;
}

interface CreatedOAuthClient {
  client: OAuthClientSummary;
  clientSecret: string;
}

interface OAuthClientSearchResult {
  clients: OAuthClientSummary[];
  totalHits: number;
}

interface TwoFactorSetup {
  otpAuthUrl: string;
  secret: string;
}

interface GalleryImageSummary {
  description: string | null;
  displayUrl: string;
  featured: boolean;
  rawUrl: string;
  sortOrder: number;
  title: string | null;
}

interface ViewerDashboardProject extends ProjectSummary {
  viewerCapabilities: {
    manageDetails: boolean;
    manageMembers: boolean;
    manageVersions: boolean;
    viewAnalytics: boolean;
  } | null;
}

interface ViewerDashboardSummary {
  projectCount: number;
  projects: ViewerDashboardProject[];
  username: string;
}

interface ProjectMemberSummary {
  accepted: boolean;
  owner: boolean;
  permissions: string[];
  role: string;
  user: {
    username: string;
  };
}

interface ProjectMemberSearchResult {
  members: ProjectMemberSummary[];
  totalHits: number;
}

interface TeamInvitationSummary {
  id: string;
  permissions: string[];
  role: string;
  target: {
    name: string;
    projectKind: string | null;
    slug: string;
    type: string;
  };
}

interface TeamInvitationSearchResult {
  invitations: TeamInvitationSummary[];
  totalHits: number;
}

interface AuditLogSearchResult {
  auditLogs: AuditLogSummary[];
  totalHits: number;
}

interface AuditLogSummary {
  action: string;
  actor: {
    username: string;
  } | null;
  moderationAction: string | null;
  projectAfter: {
    slug: string;
    status: string;
  } | null;
  projectBefore: {
    slug: string;
    status: string;
  } | null;
  resource: {
    kind: string;
    slug: string;
  } | null;
  securityAction: string | null;
  targetUser: {
    username: string;
  } | null;
  teamMemberAction: string | null;
  teamMemberAfter: {
    accepted: boolean;
    permissions: string[];
    role: string;
    username: string;
  } | null;
  teamMemberBefore: {
    accepted: boolean;
    username: string;
  } | null;
  versionAfter: {
    projectSlug: string;
    status: string;
    versionNumber: string;
  } | null;
  versionBefore: {
    projectSlug: string;
    status: string;
    versionNumber: string;
  } | null;
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
    scans?: VersionFileScan[];
    url: string;
  }[];
  id: string;
  projectSlug: string;
  status: string;
  versionNumber: string;
}

interface VersionSearchResult {
  totalHits: number;
  versions: VersionSummary[];
}

interface VersionFileScan {
  details: string | null;
  status: string;
  verdict: string | null;
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

interface ProjectFollowState {
  followers: number;
  following: boolean;
  projectSlug: string;
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

interface NotificationSearchResult {
  notifications: NotificationSummary[];
  totalHits: number;
}

interface NotificationSummary {
  actionUrl: string | null;
  body: string | null;
  title: string;
  type: string;
}

async function main(): Promise<void> {
  await checkReadiness();
  await checkWeb();
  await seedSmokeFixturesIfRequested();
  await checkProjectSearch();
  await Promise.all([
    checkProjectType('MOD'),
    checkProjectType('PLUGIN'),
    checkProjectType('MODPACK'),
  ]);
  await checkCreatorFlow();

  console.log('Local smoke checks passed');
}

async function seedSmokeFixturesIfRequested(): Promise<void> {
  if (!seedFixtures) return;

  const suffix = `${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 8)}`;
  const username = `smoke_seed_${suffix}`;
  const email = `${username}@example.test`;
  const auth = await registerSmokeUser({
    email,
    password: `password-${suffix}`,
    username,
  });
  await confirmSmokeUserEmail({
    email,
    token: auth.accessToken,
    username,
  });
  await promoteSmokeUserToAdmin(username);

  for (const kind of ['MOD', 'PLUGIN', 'MODPACK']) {
    await seedSmokeProject({
      kind,
      suffix,
      token: auth.accessToken,
    });
  }
}

async function seedSmokeProject(options: {
  kind: string;
  suffix: string;
  token: string;
}): Promise<void> {
  const slug = `smoke-fixture-${options.kind.toLowerCase()}-${options.suffix}`;
  const title = `Smoke ${options.kind} Fixture ${options.suffix}`;
  const createPayload = await readGraphql<CreateProjectResponse>(
    {
      query: `
        mutation SmokeSeedProject($input: CreateProjectInput!) {
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
          description: `Smoke fixture ${options.kind} project for stack verification.`,
          gameVersions: ['1.21.6'],
          kind: options.kind,
          loaders: ['fabric'],
          slug,
          summary: `Smoke fixture ${options.kind} project.`,
          title,
        },
      },
    },
    options.token,
  );
  assertNoGraphqlErrors(createPayload, `GraphQL seed ${options.kind} project`);
  assertProject(required(createPayload.data?.createProject, 'seed project'), {
    kind: options.kind,
    slug,
    title,
  });

  const approved = await approveSmokeProject(slug, options.token);
  assertProject(approved, {
    kind: options.kind,
    slug,
    title,
  });
  if (approved.status !== 'APPROVED') {
    throw new Error(
      `Expected seed project ${slug} to be approved, received ${approved.status}`,
    );
  }
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
  const rootHtml = await checkWebRoute('/');
  await checkWebEntrypoints(rootHtml);

  const routes = [
    '/collections',
    '/dashboard',
    '/mods',
    '/mods?project=smoke-route&type=mod',
    '/modpacks',
    '/modpacks?project=smoke-route-pack&type=modpack',
    '/notifications',
    '/organizations',
    '/organizations/smoke-route-org',
    '/platform',
    '/plugins',
    '/plugins?project=smoke-route-plugin&type=plugin',
    '/status',
    '/users',
    '/users/smoke-route-user',
    '/collections/smoke-route-user/smoke-route-collection',
  ];

  for (const route of routes) {
    await checkWebRoute(route);
  }
}

async function checkWebRoute(route: string): Promise<string> {
  const response = await fetch(`${webUrl}${route}`);
  if (!response.ok) {
    throw new Error(
      `Web route ${route} returned ${response.status.toString()}`,
    );
  }

  const body = await response.text();
  if (!body.includes('<html') || !body.includes('id="root"')) {
    throw new Error(`Web route ${route} did not look like the app shell`);
  }

  return body;
}

async function checkWebEntrypoints(html: string): Promise<void> {
  const localEntrypoints = webEntrypointPaths(html);
  if (localEntrypoints.length === 0) {
    throw new Error('Web shell did not reference any local entrypoints');
  }

  await Promise.all(
    localEntrypoints.map(async (entrypoint) => {
      const response = await fetch(`${webUrl}${entrypoint}`);
      if (!response.ok) {
        throw new Error(
          `Web entrypoint ${entrypoint} returned ${response.status.toString()}`,
        );
      }
    }),
  );
}

function webEntrypointPaths(html: string): string[] {
  const paths = new Set<string>();
  const attributePattern = /\s(?:href|src)="([^"]+)"/g;

  for (const match of html.matchAll(attributePattern)) {
    const value = match[1];
    if (value === undefined) continue;
    if (!value.startsWith('/')) continue;
    if (value.startsWith('//')) continue;
    paths.add(value);
  }

  return [...paths].sort();
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

async function loginSmokeUser(input: {
  identifier: string;
  password: string;
  twoFactorCode?: string;
  username: string;
}): Promise<AuthPayload> {
  const loginPayload = await readGraphql<LoginResponse>({
    query: `
      mutation SmokeLogin($input: LoginInput!) {
        login(input: $input) {
          accessToken
          user {
            username
          }
        }
      }
    `,
    variables: {
      input: {
        identifier: input.identifier,
        password: input.password,
        twoFactorCode: input.twoFactorCode,
      },
    },
  });
  assertNoGraphqlErrors(loginPayload, 'GraphQL login');

  const auth = required(loginPayload.data?.login, 'login payload');
  if (auth.user.username !== input.username) {
    throw new Error(
      `Logged-in username mismatch: expected ${input.username}, received ${auth.user.username}`,
    );
  }

  await checkMe({
    token: auth.accessToken,
    username: input.username,
  });

  return auth;
}

async function checkMe(options: {
  token: string;
  username: string;
}): Promise<void> {
  const payload = await readGraphql<MeResponse>(
    {
      query: `
        query SmokeMe {
          me {
            isAdmin
            role
            username
          }
        }
      `,
    },
    options.token,
  );
  assertNoGraphqlErrors(payload, 'GraphQL me');

  const me = required(payload.data?.me, 'me payload');
  if (me.username !== options.username || me.role !== 'USER' || me.isAdmin) {
    throw new Error(
      `Unexpected me payload for ${options.username}: ${me.username} ${me.role}`,
    );
  }
}

async function confirmSmokeUserEmail(options: {
  email: string;
  token: string;
  username: string;
}): Promise<void> {
  const requestPayload = await readGraphql<RequestEmailVerificationResponse>(
    {
      query: `
        mutation SmokeRequestEmailVerification {
          requestEmailVerification
        }
      `,
    },
    options.token,
  );
  assertNoGraphqlErrors(requestPayload, 'GraphQL request email verification');
  if (requestPayload.data?.requestEmailVerification !== true) {
    throw new Error('Email verification request failed');
  }

  const verificationToken = await readMailpitTokenForRecipient({
    email: options.email,
    label: 'verification',
    tokenPattern: /Verification token:\s*([^\s]+)/u,
  });
  const confirmPayload = await readGraphql<ConfirmEmailVerificationResponse>({
    query: `
      mutation SmokeConfirmEmailVerification($input: ConfirmEmailVerificationInput!) {
        confirmEmailVerification(input: $input)
      }
    `,
    variables: {
      input: {
        token: verificationToken,
      },
    },
  });
  assertNoGraphqlErrors(confirmPayload, 'GraphQL confirm email verification');
  if (confirmPayload.data?.confirmEmailVerification !== true) {
    throw new Error('Email verification confirmation failed');
  }

  await assertSmokeUserEmailVerified(options.username);
}

async function readMailpitTokenForRecipient(options: {
  email: string;
  label: string;
  tokenPattern: RegExp;
}): Promise<string> {
  const deadline = Date.now() + 15_000;

  while (Date.now() < deadline) {
    const messageList = await readJson<MailpitMessageList>(
      `${mailpitUrl}/api/v1/messages`,
      'Mailpit message list',
    );
    const summaries =
      messageList.messages?.filter((message) =>
        message.To?.some((recipient) => recipient.Address === options.email),
      ) ?? [];

    for (const summary of summaries) {
      if (summary.ID === undefined || summary.ID.length === 0) continue;

      const message = await readJson<MailpitMessage>(
        `${mailpitUrl}/api/v1/message/${encodeURIComponent(summary.ID)}`,
        'Mailpit message',
      );
      const token = message.Text?.match(options.tokenPattern)?.[1];
      if (token !== undefined && token.length > 0) {
        return token;
      }
    }

    await sleep(250);
  }

  throw new Error(
    `Mailpit did not receive ${options.label} token for ${options.email}`,
  );
}

async function sleep(milliseconds: number): Promise<void> {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

async function assertSmokeUserEmailVerified(username: string): Promise<void> {
  const prisma = new PrismaClient({
    datasources: {
      db: { url: databaseUrl },
    },
  });

  try {
    const user = await prisma.user.findUnique({
      select: { emailVerifiedAt: true },
      where: { username },
    });
    const emailVerifiedAt = user?.emailVerifiedAt;

    if (emailVerifiedAt === undefined || emailVerifiedAt === null) {
      throw new Error(`Expected ${username} to have a verified email`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

async function checkPasswordResetFlow(options: {
  email: string;
  oldPassword: string;
  username: string;
}): Promise<AuthPayload> {
  const newPassword = `${options.oldPassword}-reset`;
  const requestPayload = await readGraphql<RequestPasswordResetResponse>({
    query: `
      mutation SmokeRequestPasswordReset($input: RequestPasswordResetInput!) {
        requestPasswordReset(input: $input)
      }
    `,
    variables: {
      input: {
        identifier: options.email,
      },
    },
  });
  assertNoGraphqlErrors(requestPayload, 'GraphQL request password reset');
  if (requestPayload.data?.requestPasswordReset !== true) {
    throw new Error('Password reset request failed');
  }

  const resetToken = await readMailpitTokenForRecipient({
    email: options.email,
    label: 'password reset',
    tokenPattern: /Reset token:\s*([^\s]+)/u,
  });
  const confirmPayload = await readGraphql<ConfirmPasswordResetResponse>({
    query: `
      mutation SmokeConfirmPasswordReset($input: ConfirmPasswordResetInput!) {
        confirmPasswordReset(input: $input)
      }
    `,
    variables: {
      input: {
        newPassword,
        token: resetToken,
      },
    },
  });
  assertNoGraphqlErrors(confirmPayload, 'GraphQL confirm password reset');
  if (confirmPayload.data?.confirmPasswordReset !== true) {
    throw new Error('Password reset confirmation failed');
  }

  const oldLoginPayload = await readGraphql<LoginResponse>({
    query: `
      mutation SmokeRejectedOldPassword($input: LoginInput!) {
        login(input: $input) {
          accessToken
          user {
            username
          }
        }
      }
    `,
    variables: {
      input: {
        identifier: options.username,
        password: options.oldPassword,
      },
    },
  });
  assertGraphqlError(
    oldLoginPayload,
    'Invalid credentials',
    'GraphQL old password login',
  );

  return loginSmokeUser({
    identifier: options.username,
    password: newPassword,
    username: options.username,
  });
}

async function checkTwoFactorFlow(options: {
  password: string;
  token: string;
  username: string;
}): Promise<AuthPayload> {
  const setupPayload = await readGraphql<SetupTwoFactorResponse>(
    {
      query: `
        mutation SmokeSetupTwoFactor {
          setupTwoFactor {
            otpAuthUrl
            secret
          }
        }
      `,
    },
    options.token,
  );
  assertNoGraphqlErrors(setupPayload, 'GraphQL setup two-factor');

  const setup = required(setupPayload.data?.setupTwoFactor, 'two-factor setup');
  if (
    setup.secret.length === 0 ||
    !setup.otpAuthUrl.includes(`secret=${setup.secret}`)
  ) {
    throw new Error('Two-factor setup did not return usable secret metadata');
  }

  const enablePayload = await readGraphql<EnableTwoFactorResponse>(
    {
      query: `
        mutation SmokeEnableTwoFactor($input: VerifyTwoFactorInput!) {
          enableTwoFactor(input: $input)
        }
      `,
      variables: {
        input: {
          code: currentTotpCode(setup.secret),
        },
      },
    },
    options.token,
  );
  assertNoGraphqlErrors(enablePayload, 'GraphQL enable two-factor');
  if (enablePayload.data?.enableTwoFactor !== true) {
    throw new Error('Two-factor enable did not return true');
  }

  const rejectedLoginPayload = await readGraphql<LoginResponse>({
    query: `
      mutation SmokeRejectedTwoFactorLogin($input: LoginInput!) {
        login(input: $input) {
          accessToken
        }
      }
    `,
    variables: {
      input: {
        identifier: options.username,
        password: options.password,
      },
    },
  });
  assertGraphqlError(
    rejectedLoginPayload,
    'Invalid two-factor code',
    'two-factor login without code',
  );

  return loginSmokeUser({
    identifier: options.username,
    password: options.password,
    twoFactorCode: currentTotpCode(setup.secret),
    username: options.username,
  });
}

async function promoteSmokeUserToAdmin(username: string): Promise<void> {
  const prisma = new PrismaClient({
    datasources: {
      db: { url: databaseUrl },
    },
  });

  try {
    await prisma.user.update({
      data: { role: 'ADMIN' },
      where: { username },
    });
  } finally {
    await prisma.$disconnect();
  }
}

async function checkCreatorFlow(): Promise<void> {
  const suffix = `${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 8)}`;
  const username = `smoke_${suffix}`;
  const peerUsername = `smoke_peer_${suffix}`;
  const email = `${username}@example.test`;
  const slug = `smoke-${suffix}`;
  const title = `Smoke Project ${suffix}`;
  const password = `password-${suffix}`;
  const peerPassword = `password-${suffix}-peer`;

  await registerSmokeUser({
    email,
    password,
    username,
  });
  await registerSmokeUser({
    email: `${peerUsername}@example.test`,
    password: peerPassword,
    username: peerUsername,
  });
  let auth = await loginSmokeUser({
    identifier: username,
    password,
    username,
  });
  const peerAuth = await loginSmokeUser({
    identifier: peerUsername,
    password: peerPassword,
    username: peerUsername,
  });
  auth = await checkPasswordResetFlow({
    email,
    oldPassword: password,
    username,
  });
  auth = await checkTwoFactorFlow({
    password: `${password}-reset`,
    token: auth.accessToken,
    username,
  });

  await checkSocialFlow({
    peerToken: peerAuth.accessToken,
    peerUsername,
    token: auth.accessToken,
    username,
  });
  await confirmSmokeUserEmail({
    email,
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
  if (createdProject.status !== 'PENDING_REVIEW') {
    throw new Error(
      `Expected created project to be queued, received ${createdProject.status}`,
    );
  }
  await checkViewerDashboardProject({
    expectedStatus: 'PENDING_REVIEW',
    projectSlug: slug,
    token: auth.accessToken,
    username,
  });

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
  assertNoGraphqlErrors(publicPayload, 'GraphQL queued project by slug');
  if (publicPayload.data === undefined) {
    throw new Error('Queued project lookup did not return data');
  }
  if (publicPayload.data.projectBySlug !== null) {
    throw new Error('Queued project was visible before moderation approval');
  }
  await checkQueuedProjectAnalyticsGuard(slug);
  await checkQueuedProjectReportGuard({
    projectSlug: slug,
    token: auth.accessToken,
  });
  await checkQueuedProjectCollectionGuard({
    projectSlug: slug,
    token: auth.accessToken,
  });
  await checkQueuedProjectFollowGuard({
    projectSlug: slug,
    token: auth.accessToken,
  });
  await checkQueuedProjectReleaseGuards({
    projectSlug: slug,
    token: auth.accessToken,
  });

  await promoteSmokeUserToAdmin(username);
  const approvedProject = await approveSmokeProject(slug, auth.accessToken);
  assertProject(approvedProject, {
    kind: 'MOD',
    slug,
    title,
  });
  if (approvedProject.status !== 'APPROVED') {
    throw new Error(
      `Expected approved project status, received ${approvedProject.status}`,
    );
  }
  await checkReviewNotification({
    bodyIncludes: `${title} was approved.`,
    title: 'Project approved',
    token: auth.accessToken,
  });
  await checkViewerDashboardProject({
    expectedStatus: 'APPROVED',
    projectSlug: slug,
    token: auth.accessToken,
    username,
  });
  await checkProjectTeamInvitationFlow({
    peerToken: peerAuth.accessToken,
    peerUsername,
    projectSlug: slug,
    projectTitle: title,
    token: auth.accessToken,
  });

  const approvedPublicPayload = await readGraphql<ProjectBySlugResponse>({
    query: `
      query SmokeApprovedProjectBySlug($slug: String!) {
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
  assertNoGraphqlErrors(approvedPublicPayload, 'GraphQL project by slug');
  assertProject(
    required(approvedPublicPayload.data?.projectBySlug, 'public project'),
    {
      kind: 'MOD',
      slug,
      title,
    },
  );
  await checkProjectGalleryFlow({
    projectSlug: slug,
    projectTitle: title,
    token: auth.accessToken,
  });

  const indexedSearch = await projectSearch({ search: slug });
  const indexedProject = indexedSearch.projects.find(
    (project) => project.slug === slug,
  );
  assertProject(required(indexedProject, 'indexed project'), {
    kind: 'MOD',
    slug,
    title,
  });
  await checkApprovedProjectFilterSearch({
    projectSlug: slug,
    projectTitle: title,
  });

  await checkExternalVersionFileUrlGuard({
    projectSlug: slug,
    token: auth.accessToken,
  });

  const versionBytes = smokeVersionBytes(suffix);
  const uploadTarget = await prepareVersionUpload({
    projectSlug: slug,
    sizeBytes: versionBytes.byteLength,
    token: auth.accessToken,
  });
  if (
    uploadTarget.bucket.length === 0 ||
    uploadTarget.key.length === 0 ||
    uploadTarget.method !== 'PUT' ||
    uploadTarget.objectUrl.length === 0 ||
    uploadTarget.uploadUrl.length === 0
  ) {
    throw new Error('Version upload target was incomplete');
  }

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
              sizeBytes: versionBytes.byteLength,
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
  assertVersionIdentity(createdVersion, { projectSlug: slug, versionNumber });
  if (createdVersion.status !== 'PENDING_REVIEW') {
    throw new Error(
      `Created version should be queued, received ${createdVersion.status}`,
    );
  }
  await checkQueuedVersionDownloadGuard(
    required(createdVersion.files[0], 'queued version file').id,
  );
  await checkQueuedVersionReportGuard({
    token: auth.accessToken,
    versionId: createdVersion.id,
  });
  await checkQueuedVersionDependencyGuard({
    token: auth.accessToken,
    versionId: createdVersion.id,
  });

  const approvedVersion = await approveSmokeVersion(
    createdVersion.id,
    auth.accessToken,
  );
  assertVersion(approvedVersion, { projectSlug: slug, versionNumber });
  await checkReviewNotification({
    bodyIncludes: `Smoke Version ${suffix} ${versionNumber} was approved.`,
    title: 'Release approved',
    token: auth.accessToken,
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
  await checkPublicVersionSearchFlow({
    projectSlug: slug,
    versionNumber,
  });
  await checkApiTokenFlow({
    projectSlug: slug,
    token: auth.accessToken,
    versionNumber,
  });
  await checkDeveloperApplicationFlow({
    token: auth.accessToken,
  });
  await checkFileScanFlow({
    fileId: required(publicVersion.files[0], 'public version file').id,
    projectSlug: slug,
    token: auth.accessToken,
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
  await checkAuditLogFlow({
    peerToken: peerAuth.accessToken,
    peerUsername,
    projectSlug: slug,
    token: auth.accessToken,
    username,
    versionNumber,
  });
}

async function approveSmokeProject(
  projectSlug: string,
  token: string,
): Promise<ProjectSummary> {
  const payload = await readGraphql<ModerateProjectResponse>(
    {
      query: `
        mutation SmokeApproveProject($input: ModerateProjectInput!) {
          moderateProject(input: $input) {
            kind
            slug
            status
            title
          }
        }
      `,
      variables: {
        input: {
          action: 'APPROVE',
          projectSlug,
          reason: 'Smoke test approval',
        },
      },
    },
    token,
  );
  assertNoGraphqlErrors(payload, 'GraphQL approve project');

  return required(payload.data?.moderateProject, 'approved project');
}

async function approveSmokeVersion(
  versionId: string,
  token: string,
): Promise<VersionSummary> {
  const payload = await readGraphql<ModerateVersionResponse>(
    {
      query: `
        mutation SmokeApproveVersion($input: ModerateVersionInput!) {
          moderateVersion(input: $input) {
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
          action: 'APPROVE',
          reason: 'Smoke test release approval',
          versionId,
        },
      },
    },
    token,
  );
  assertNoGraphqlErrors(payload, 'GraphQL approve version');

  return required(payload.data?.moderateVersion, 'approved version');
}

async function checkApiTokenFlow(options: {
  projectSlug: string;
  token: string;
  versionNumber: string;
}): Promise<void> {
  const createPayload = await readGraphql<CreateApiTokenResponse>(
    {
      query: `
        mutation SmokeCreateApiToken($input: CreateApiTokenInput!) {
          createApiToken(input: $input) {
            token
            tokenSummary {
              id
              name
              revokedAt
              scopes
            }
          }
        }
      `,
      variables: {
        input: {
          name: 'Smoke read-only token',
          scopes: ['read:projects'],
        },
      },
    },
    options.token,
  );
  assertNoGraphqlErrors(createPayload, 'GraphQL create API token');

  const createdToken = required(
    createPayload.data?.createApiToken,
    'created API token',
  );
  if (
    createdToken.token.length === 0 ||
    createdToken.tokenSummary.name !== 'Smoke read-only token' ||
    createdToken.tokenSummary.revokedAt !== null ||
    createdToken.tokenSummary.scopes.length !== 1 ||
    createdToken.tokenSummary.scopes[0] !== 'read:projects'
  ) {
    throw new Error('Created API token did not match requested read scope');
  }

  const readPayload = await readGraphql<ViewerProjectVersionSearchResponse>(
    {
      query: `
        query SmokeApiTokenReadProjectVersions($projectSlug: String!) {
          viewerProjectVersionSearch(projectSlug: $projectSlug, limit: 10, offset: 0) {
            totalHits
            versions {
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
        }
      `,
      variables: { projectSlug: options.projectSlug },
    },
    createdToken.token,
  );
  assertNoGraphqlErrors(readPayload, 'GraphQL API token project version read');
  const versionSearch = required(
    readPayload.data?.viewerProjectVersionSearch,
    'API token project version search',
  );
  const version = versionSearch.versions.find(
    (candidate) => candidate.versionNumber === options.versionNumber,
  );
  assertVersion(required(version, 'API token visible version'), {
    projectSlug: options.projectSlug,
    versionNumber: options.versionNumber,
  });

  const writePayload = await readGraphql<CreateProjectResponse>(
    {
      query: `
        mutation SmokeApiTokenRejectedProjectWrite($input: CreateProjectInput!) {
          createProject(input: $input) {
            slug
          }
        }
      `,
      variables: {
        input: {
          categories: ['utility'],
          description:
            'This project should never be created by a read-only smoke token.',
          gameVersions: ['1.21.6'],
          kind: 'MOD',
          loaders: ['fabric'],
          slug: `${options.projectSlug}-api-token-write`,
          summary: 'A rejected read-only API token write.',
          title: 'Rejected API Token Write',
        },
      },
    },
    createdToken.token,
  );
  assertGraphqlError(
    writePayload,
    'Personal access token requires write:projects',
    'read-only API token project write',
  );

  const revokePayload = await readGraphql<RevokeApiTokenResponse>(
    {
      query: `
        mutation SmokeRevokeApiToken($tokenId: String!) {
          revokeApiToken(tokenId: $tokenId) {
            id
            name
            revokedAt
            scopes
          }
        }
      `,
      variables: { tokenId: createdToken.tokenSummary.id },
    },
    options.token,
  );
  assertNoGraphqlErrors(revokePayload, 'GraphQL revoke API token');
  const revokedToken = required(
    revokePayload.data?.revokeApiToken,
    'revoked API token',
  );
  if (
    revokedToken.id !== createdToken.tokenSummary.id ||
    revokedToken.revokedAt === null
  ) {
    throw new Error('Revoked API token did not return revocation metadata');
  }

  const revokedReadPayload =
    await readGraphql<ViewerProjectVersionSearchResponse>(
      {
        query: `
          query SmokeRevokedApiTokenReadProjectVersions($projectSlug: String!) {
            viewerProjectVersionSearch(projectSlug: $projectSlug, limit: 1, offset: 0) {
              totalHits
            }
          }
        `,
        variables: { projectSlug: options.projectSlug },
      },
      createdToken.token,
    );
  assertGraphqlError(
    revokedReadPayload,
    'Invalid bearer token',
    'revoked API token project version read',
  );
}

async function checkDeveloperApplicationFlow(options: {
  token: string;
}): Promise<void> {
  const redirectUri = 'http://localhost:3000/oauth/callback';
  const createPayload = await readGraphql<CreateOAuthClientResponse>(
    {
      query: `
        mutation SmokeCreateOAuthClient($input: CreateOAuthClientInput!) {
          createOAuthClient(input: $input) {
            clientSecret
            client {
              clientId
              id
              name
              redirectUris {
                uri
              }
              revokedAt
              scopes
              status
            }
          }
        }
      `,
      variables: {
        input: {
          description: 'Smoke test OAuth application.',
          homepageUrl: 'https://example.test/smoke-app',
          name: 'Smoke OAuth application',
          redirectUris: [redirectUri, ` ${redirectUri} `],
          scopes: ['read:projects'],
        },
      },
    },
    options.token,
  );
  assertNoGraphqlErrors(createPayload, 'GraphQL create OAuth client');

  const created = required(
    createPayload.data?.createOAuthClient,
    'created OAuth client',
  );
  if (
    created.client.clientId === null ||
    created.client.clientId.length === 0 ||
    created.client.name !== 'Smoke OAuth application' ||
    created.client.revokedAt !== null ||
    created.client.status !== 'ACTIVE' ||
    created.clientSecret.length === 0 ||
    created.client.redirectUris.length !== 1 ||
    created.client.redirectUris[0]?.uri !== redirectUri ||
    created.client.scopes.length !== 1 ||
    created.client.scopes[0] !== 'read:projects'
  ) {
    throw new Error('Created OAuth client did not match requested metadata');
  }

  const searchPayload = await readGraphql<ViewerOAuthClientSearchResponse>(
    {
      query: `
        query SmokeOAuthClientSearch {
          viewerOAuthClientSearch(limit: 20, offset: 0) {
            clients {
              id
              name
              revokedAt
              status
            }
            totalHits
          }
        }
      `,
    },
    options.token,
  );
  assertNoGraphqlErrors(searchPayload, 'GraphQL OAuth client search');
  const clientSearch = required(
    searchPayload.data?.viewerOAuthClientSearch,
    'OAuth client search',
  );
  const listedClient = clientSearch.clients.find(
    (client) => client.id === created.client.id,
  );
  if (
    listedClient?.name !== 'Smoke OAuth application' ||
    listedClient.status !== 'ACTIVE'
  ) {
    throw new Error('Created OAuth client was not visible in viewer search');
  }

  const revokePayload = await readGraphql<RevokeOAuthClientResponse>(
    {
      query: `
        mutation SmokeRevokeOAuthClient($clientId: String!) {
          revokeOAuthClient(clientId: $clientId) {
            id
            name
            revokedAt
            status
          }
        }
      `,
      variables: { clientId: created.client.id },
    },
    options.token,
  );
  assertNoGraphqlErrors(revokePayload, 'GraphQL revoke OAuth client');
  const revokedClient = required(
    revokePayload.data?.revokeOAuthClient,
    'revoked OAuth client',
  );
  if (
    revokedClient.id !== created.client.id ||
    revokedClient.revokedAt === null ||
    revokedClient.status !== 'REVOKED'
  ) {
    throw new Error('Revoked OAuth client did not return revocation metadata');
  }
}

async function checkReviewNotification(options: {
  bodyIncludes: string;
  title: string;
  token: string;
}): Promise<void> {
  const payload = await readGraphql<NotificationSearchResponse>(
    {
      query: `
        query SmokeReviewNotificationSearch {
          viewerNotificationSearch(type: "moderation", limit: 10, offset: 0) {
            notifications {
              actionUrl
              body
              title
              type
            }
            totalHits
          }
        }
      `,
    },
    options.token,
  );
  assertNoGraphqlErrors(payload, 'GraphQL review notification search');

  const search = required(
    payload.data?.viewerNotificationSearch,
    'review notification search',
  );
  if (search.totalHits < 1) {
    throw new Error('Review notification search returned no notifications');
  }

  const notification = search.notifications.find(
    (candidate) =>
      candidate.title === options.title &&
      candidate.type === 'moderation' &&
      candidate.actionUrl === '/dashboard#dashboard-projects' &&
      candidate.body?.includes(options.bodyIncludes) === true,
  );
  if (notification === undefined) {
    throw new Error(`Missing ${options.title} creator notification`);
  }
}

async function checkProjectGalleryFlow(options: {
  projectSlug: string;
  projectTitle: string;
  token: string;
}): Promise<void> {
  const galleryUrl = `${apiUrl}/smoke-gallery/${encodeURIComponent(
    options.projectSlug,
  )}.png`;
  const payload = await readGraphql<AddProjectGalleryImageResponse>(
    {
      query: `
        mutation SmokeAddProjectGalleryImage($input: AddProjectGalleryImageInput!) {
          addProjectGalleryImage(input: $input) {
            gallery {
              description
              displayUrl
              featured
              rawUrl
              sortOrder
              title
            }
            kind
            slug
            status
            title
          }
        }
      `,
      variables: {
        input: {
          description: 'Smoke gallery description',
          displayUrl: galleryUrl,
          featured: true,
          projectSlug: options.projectSlug,
          rawUrl: galleryUrl,
          sortOrder: 7,
          title: 'Smoke gallery image',
        },
      },
    },
    options.token,
  );
  assertNoGraphqlErrors(payload, 'GraphQL add project gallery image');
  assertProject(
    required(payload.data?.addProjectGalleryImage, 'gallery project'),
    {
      kind: 'MOD',
      slug: options.projectSlug,
      title: options.projectTitle,
    },
  );

  const publicPayload = await readGraphql<ProjectBySlugResponse>({
    query: `
      query SmokeGalleryProjectBySlug($slug: String!) {
        projectBySlug(slug: $slug) {
          gallery {
            description
            displayUrl
            featured
            rawUrl
            sortOrder
            title
          }
          kind
          slug
          status
          title
        }
      }
    `,
    variables: { slug: options.projectSlug },
  });
  assertNoGraphqlErrors(publicPayload, 'GraphQL gallery project by slug');

  const project = required(
    publicPayload.data?.projectBySlug,
    'public gallery project',
  );
  assertProject(project, {
    kind: 'MOD',
    slug: options.projectSlug,
    title: options.projectTitle,
  });
  assertProjectGalleryImage(project, {
    description: 'Smoke gallery description',
    displayUrl: galleryUrl,
    featured: true,
    rawUrl: galleryUrl,
    sortOrder: 7,
    title: 'Smoke gallery image',
  });
}

async function checkApprovedProjectFilterSearch(options: {
  projectSlug: string;
  projectTitle: string;
}): Promise<void> {
  const cases = [
    { label: 'category', tags: ['kind:MOD', 'category:utility'] },
    { label: 'loader', tags: ['kind:MOD', 'loader:fabric'] },
    {
      label: 'game version',
      tags: ['kind:MOD', 'game-version:1.21.6'],
    },
    {
      label: 'combined filters',
      tags: [
        'kind:MOD',
        'category:utility',
        'loader:fabric',
        'game-version:1.21.6',
      ],
    },
  ];

  for (const item of cases) {
    const search = await projectSearch({
      search: options.projectSlug,
      tags: item.tags,
    });
    const project = search.projects.find(
      (candidate) => candidate.slug === options.projectSlug,
    );

    assertProject(required(project, `${item.label} filtered project search`), {
      kind: 'MOD',
      slug: options.projectSlug,
      title: options.projectTitle,
    });
  }
}

async function checkQueuedProjectAnalyticsGuard(
  projectSlug: string,
): Promise<void> {
  const viewPayload = await readGraphql<RecordProjectViewResponse>({
    query: `
      mutation SmokeRecordQueuedProjectView($input: RecordProjectViewInput!) {
        recordProjectView(input: $input) {
          projectSlug
        }
      }
    `,
    variables: {
      input: {
        projectSlug,
      },
    },
  });
  assertGraphqlError(
    viewPayload,
    'Project not found',
    'queued project view analytics',
  );
}

async function checkQueuedProjectReportGuard({
  projectSlug,
  token,
}: {
  projectSlug: string;
  token: string;
}): Promise<void> {
  const reportPayload = await readGraphql<CreateProjectReportResponse>(
    {
      query: `
        mutation SmokeReportQueuedProject($input: CreateProjectReportInput!) {
          createProjectReport(input: $input) {
            id
          }
        }
      `,
      variables: {
        input: {
          body: 'Queued project should not be reportable',
          projectSlug,
          reason: 'BROKEN_OR_MISLEADING',
        },
      },
    },
    token,
  );
  assertGraphqlError(
    reportPayload,
    'Project not found',
    'queued project report',
  );
}

async function checkQueuedProjectCollectionGuard({
  projectSlug,
  token,
}: {
  projectSlug: string;
  token: string;
}): Promise<void> {
  const collectionPayload = await readGraphql<CreateCollectionResponse>(
    {
      query: `
        mutation SmokeCreateQueuedProjectCollection($input: CreateCollectionInput!) {
          createCollection(input: $input) {
            id
          }
        }
      `,
      variables: {
        input: {
          name: `Queued Collection ${projectSlug}`,
          slug: `queued-${projectSlug}`,
          visibility: 'PUBLIC',
        },
      },
    },
    token,
  );
  assertNoGraphqlErrors(
    collectionPayload,
    'GraphQL create queued project collection',
  );

  const collectionId = required(
    collectionPayload.data?.createCollection,
    'queued project collection',
  ).id;
  const addPayload = await readGraphql<AddProjectToCollectionResponse>(
    {
      query: `
        mutation SmokeAddQueuedProjectToCollection($input: AddProjectToCollectionInput!) {
          addProjectToCollection(input: $input) {
            id
          }
        }
      `,
      variables: {
        input: {
          collectionId,
          projectSlug,
        },
      },
    },
    token,
  );
  assertGraphqlError(
    addPayload,
    'Project not found',
    'queued project collection save',
  );
}

async function checkQueuedProjectFollowGuard({
  projectSlug,
  token,
}: {
  projectSlug: string;
  token: string;
}): Promise<void> {
  const statePayload = await readGraphql<ProjectFollowResponse>(
    {
      query: `
        query SmokeQueuedProjectFollowState($projectSlug: String!) {
          viewerProjectFollowState(projectSlug: $projectSlug) {
            projectSlug
          }
        }
      `,
      variables: { projectSlug },
    },
    token,
  );
  assertNoGraphqlErrors(statePayload, 'GraphQL queued project follow state');
  if (statePayload.data?.viewerProjectFollowState !== null) {
    throw new Error('Queued project returned viewer follow state');
  }

  const followPayload = await readGraphql<ProjectFollowResponse>(
    {
      query: `
        mutation SmokeFollowQueuedProject($projectSlug: String!) {
          followProject(projectSlug: $projectSlug) {
            projectSlug
          }
        }
      `,
      variables: { projectSlug },
    },
    token,
  );
  assertGraphqlError(
    followPayload,
    'Project not found',
    'queued project follow',
  );

  const unfollowPayload = await readGraphql<ProjectFollowResponse>(
    {
      query: `
        mutation SmokeUnfollowQueuedProject($projectSlug: String!) {
          unfollowProject(projectSlug: $projectSlug) {
            projectSlug
          }
        }
      `,
      variables: { projectSlug },
    },
    token,
  );
  assertGraphqlError(
    unfollowPayload,
    'Project not found',
    'queued project unfollow',
  );
}

async function checkQueuedVersionDownloadGuard(fileId: string): Promise<void> {
  const downloadPayload = await readGraphql<RecordDownloadResponse>({
    query: `
      mutation SmokeRecordQueuedVersionDownload($input: RecordDownloadInput!) {
        recordDownload(input: $input) {
          fileId
        }
      }
    `,
    variables: {
      input: {
        fileId,
      },
    },
  });
  assertGraphqlError(
    downloadPayload,
    'File not found',
    'queued version download analytics',
  );
}

async function checkQueuedVersionReportGuard({
  token,
  versionId,
}: {
  token: string;
  versionId: string;
}): Promise<void> {
  const reportPayload = await readGraphql<CreateVersionReportResponse>(
    {
      query: `
        mutation SmokeReportQueuedVersion($input: CreateVersionReportInput!) {
          createVersionReport(input: $input) {
            id
          }
        }
      `,
      variables: {
        input: {
          body: 'Queued release should not be reportable',
          reason: 'BROKEN_OR_MISLEADING',
          versionId,
        },
      },
    },
    token,
  );
  assertGraphqlError(
    reportPayload,
    'Version not found',
    'queued version report',
  );
}

async function checkQueuedVersionDependencyGuard({
  token,
  versionId,
}: {
  token: string;
  versionId: string;
}): Promise<void> {
  const dependencyPayload =
    await readGraphql<UpdateVersionDependenciesResponse>(
      {
        query: `
          mutation SmokeQueuedVersionDependency($input: UpdateVersionDependenciesInput!) {
            updateVersionDependencies(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: {
            dependencies: [
              {
                dependencyKind: 'REQUIRED',
                targetVersionId: versionId,
              },
            ],
            versionId,
          },
        },
      },
      token,
    );
  assertGraphqlError(
    dependencyPayload,
    'Dependency version not found',
    'queued version dependency',
  );
}

async function checkQueuedProjectReleaseGuards(options: {
  projectSlug: string;
  token: string;
}): Promise<void> {
  const uploadPayload = await readGraphql<PrepareUploadResponse>(
    {
      query: `
        mutation SmokePrepareQueuedProjectUpload($input: PrepareProjectUploadInput!) {
          prepareProjectUpload(input: $input) {
            key
          }
        }
      `,
      variables: {
        input: {
          contentType: 'application/java-archive',
          fileName: 'queued-smoke.jar',
          projectSlug: options.projectSlug,
          sizeBytes: 128,
          uploadKind: 'version-file',
        },
      },
    },
    options.token,
  );
  assertGraphqlError(
    uploadPayload,
    'Project must be approved before release files can be uploaded',
    'queued project upload',
  );

  const versionPayload = await readGraphql<CreateVersionResponse>(
    {
      query: `
        mutation SmokeCreateQueuedProjectVersion($input: CreateVersionInput!) {
          createVersion(input: $input) {
            id
          }
        }
      `,
      variables: {
        input: {
          channel: 'RELEASE',
          changelog: 'This queued release should not publish.',
          files: [
            {
              fileName: 'queued-smoke.jar',
              hashes: [
                {
                  algorithm: 'SHA256',
                  value:
                    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
                },
              ],
              primary: true,
              sizeBytes: 128,
              url: 'https://cdn.example.test/queued-smoke.jar',
            },
          ],
          gameVersions: ['1.21.6'],
          loaders: ['fabric'],
          name: 'Queued Smoke Version',
          projectSlug: options.projectSlug,
          versionNumber: '0.0.0-queued',
        },
      },
    },
    options.token,
  );
  assertGraphqlError(
    versionPayload,
    'Project must be approved before publishing versions',
    'queued project version',
  );
}

async function checkViewerDashboardProject(options: {
  expectedStatus: string;
  projectSlug: string;
  token: string;
  username: string;
}): Promise<void> {
  const payload = await readGraphql<ViewerDashboardResponse>(
    {
      query: `
        query SmokeViewerDashboardProject {
          viewer {
            projectCount
            projects {
              kind
              slug
              status
              title
              viewerCapabilities {
                manageDetails
                manageMembers
                manageVersions
                viewAnalytics
              }
            }
            username
          }
        }
      `,
    },
    options.token,
  );
  assertNoGraphqlErrors(payload, 'GraphQL viewer dashboard project');

  const viewer = required(payload.data?.viewer, 'viewer dashboard');
  if (viewer.username !== options.username) {
    throw new Error(
      `Expected dashboard for ${options.username}, received ${viewer.username}`,
    );
  }

  const project = viewer.projects.find(
    (item) => item.slug === options.projectSlug,
  );
  if (project === undefined) {
    throw new Error(
      `Viewer dashboard did not include managed project ${options.projectSlug}`,
    );
  }
  if (project.status !== options.expectedStatus) {
    throw new Error(
      `Expected dashboard project ${options.projectSlug} status ${options.expectedStatus}, received ${project.status}`,
    );
  }
  if (viewer.projectCount < viewer.projects.length) {
    throw new Error(
      `Viewer project count ${viewer.projectCount.toString()} was lower than returned projects ${viewer.projects.length.toString()}`,
    );
  }

  const capabilities = required(
    project.viewerCapabilities,
    'viewer project capabilities',
  );
  if (
    !capabilities.manageDetails ||
    !capabilities.manageMembers ||
    !capabilities.manageVersions ||
    !capabilities.viewAnalytics
  ) {
    throw new Error(
      `Project ${options.projectSlug} did not expose owner dashboard capabilities`,
    );
  }
}

async function checkProjectTeamInvitationFlow(options: {
  peerToken: string;
  peerUsername: string;
  projectSlug: string;
  projectTitle: string;
  token: string;
}): Promise<void> {
  const permissions = ['MANAGE_VERSIONS', 'VIEW_ANALYTICS'];
  const addPayload = await readGraphql<AddProjectTeamMemberResponse>(
    {
      query: `
        mutation SmokeInviteProjectMember($input: AddProjectTeamMemberInput!) {
          addProjectTeamMember(input: $input) {
            accepted
            owner
            permissions
            role
            user {
              username
            }
          }
        }
      `,
      variables: {
        input: {
          permissions,
          projectSlug: options.projectSlug,
          role: 'Release collaborator',
          username: options.peerUsername,
        },
      },
    },
    options.token,
  );
  assertNoGraphqlErrors(addPayload, 'GraphQL invite project member');

  const pendingMember = required(
    addPayload.data?.addProjectTeamMember?.find(
      (member) => member.user.username === options.peerUsername,
    ),
    'pending project team member',
  );
  assertProjectMember(pendingMember, {
    accepted: false,
    owner: false,
    permissions,
    role: 'Release collaborator',
    username: options.peerUsername,
  });

  const invitationPayload = await readGraphql<TeamInvitationSearchResponse>(
    {
      query: `
        query SmokeViewerProjectTeamInvitationSearch {
          viewerTeamInvitationSearch(limit: 10, offset: 0) {
            invitations {
              id
              permissions
              role
              target {
                name
                projectKind
                slug
                type
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
    invitationPayload,
    'GraphQL project team invitation search',
  );

  const invitationSearch = required(
    invitationPayload.data?.viewerTeamInvitationSearch,
    'project team invitation search',
  );
  const invitation = required(
    invitationSearch.invitations.find(
      (candidate) => candidate.target.slug === options.projectSlug,
    ),
    'project team invitation',
  );
  assertTeamInvitation(invitation, {
    permissions,
    projectKind: 'MOD',
    projectSlug: options.projectSlug,
    projectTitle: options.projectTitle,
    role: 'Release collaborator',
  });

  const acceptPayload = await readGraphql<AcceptTeamInvitationResponse>(
    {
      query: `
        mutation SmokeAcceptProjectTeamInvitation($invitationId: String!) {
          acceptTeamInvitation(invitationId: $invitationId) {
            id
            permissions
            role
            target {
              name
              projectKind
              slug
              type
            }
          }
        }
      `,
      variables: { invitationId: invitation.id },
    },
    options.peerToken,
  );
  assertNoGraphqlErrors(
    acceptPayload,
    'GraphQL accept project team invitation',
  );
  const acceptedInvitation = required(
    acceptPayload.data?.acceptTeamInvitation,
    'accepted project team invitation',
  );
  if (acceptedInvitation.id !== invitation.id) {
    throw new Error('Accepted project team invitation id changed');
  }
  assertTeamInvitation(acceptedInvitation, {
    permissions,
    projectKind: 'MOD',
    projectSlug: options.projectSlug,
    projectTitle: options.projectTitle,
    role: 'Release collaborator',
  });

  const membersPayload = await readGraphql<ProjectMemberSearchResponse>({
    query: `
      query SmokeProjectMemberSearch($projectSlug: String!) {
        projectMemberSearch(projectSlug: $projectSlug, limit: 10, offset: 0) {
          members {
            accepted
            owner
            permissions
            role
            user {
              username
            }
          }
          totalHits
        }
      }
    `,
    variables: { projectSlug: options.projectSlug },
  });
  assertNoGraphqlErrors(membersPayload, 'GraphQL project member search');
  const memberSearch = required(
    membersPayload.data?.projectMemberSearch,
    'project member search',
  );
  if (memberSearch.totalHits < 2) {
    throw new Error('Project member search did not include owner and peer');
  }
  const acceptedMember = required(
    memberSearch.members.find(
      (member) => member.user.username === options.peerUsername,
    ),
    'accepted project team member',
  );
  assertProjectMember(acceptedMember, {
    accepted: true,
    owner: false,
    permissions,
    role: 'Release collaborator',
    username: options.peerUsername,
  });

  await checkViewerDashboardProjectCapabilities({
    expectedCapabilities: {
      manageDetails: false,
      manageMembers: false,
      manageVersions: true,
      viewAnalytics: true,
    },
    expectedStatus: 'APPROVED',
    projectSlug: options.projectSlug,
    token: options.peerToken,
    username: options.peerUsername,
  });
}

async function checkViewerDashboardProjectCapabilities(options: {
  expectedCapabilities: {
    manageDetails: boolean;
    manageMembers: boolean;
    manageVersions: boolean;
    viewAnalytics: boolean;
  };
  expectedStatus: string;
  projectSlug: string;
  token: string;
  username: string;
}): Promise<void> {
  const payload = await readGraphql<ViewerDashboardResponse>(
    {
      query: `
        query SmokeViewerDashboardProjectCapabilities {
          viewer {
            projects {
              slug
              status
              viewerCapabilities {
                manageDetails
                manageMembers
                manageVersions
                viewAnalytics
              }
            }
            username
          }
        }
      `,
    },
    options.token,
  );
  assertNoGraphqlErrors(payload, 'GraphQL viewer dashboard capabilities');

  const viewer = required(payload.data?.viewer, 'viewer dashboard');
  if (viewer.username !== options.username) {
    throw new Error(
      `Expected dashboard for ${options.username}, received ${viewer.username}`,
    );
  }

  const project = required(
    viewer.projects.find((item) => item.slug === options.projectSlug),
    `viewer dashboard project ${options.projectSlug}`,
  );
  if (project.status !== options.expectedStatus) {
    throw new Error(
      `Expected dashboard project ${options.projectSlug} status ${options.expectedStatus}, received ${project.status}`,
    );
  }

  const capabilities = required(
    project.viewerCapabilities,
    'viewer project capabilities',
  );
  const expected = options.expectedCapabilities;
  if (
    capabilities.manageDetails !== expected.manageDetails ||
    capabilities.manageMembers !== expected.manageMembers ||
    capabilities.manageVersions !== expected.manageVersions ||
    capabilities.viewAnalytics !== expected.viewAnalytics
  ) {
    throw new Error(
      `Project ${options.projectSlug} dashboard capabilities did not match team permissions`,
    );
  }
}

async function checkExternalVersionFileUrlGuard(options: {
  projectSlug: string;
  token: string;
}): Promise<void> {
  const versionPayload = await readGraphql<CreateVersionResponse>(
    {
      query: `
        mutation SmokeCreateExternalFileVersion($input: CreateVersionInput!) {
          createVersion(input: $input) {
            id
          }
        }
      `,
      variables: {
        input: {
          channel: 'RELEASE',
          changelog: 'This release should reject external file URLs.',
          files: [
            {
              fileName: 'external-smoke.jar',
              hashes: [
                {
                  algorithm: 'SHA256',
                  value:
                    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
                },
              ],
              primary: true,
              sizeBytes: 128,
              url: 'https://downloads.example.test/external-smoke.jar',
            },
          ],
          gameVersions: ['1.21.6'],
          loaders: ['fabric'],
          name: 'External URL Smoke Version',
          projectSlug: options.projectSlug,
          versionNumber: '0.0.0-external-url',
        },
      },
    },
    options.token,
  );
  assertGraphqlError(
    versionPayload,
    'Version file URL must use this project release storage',
    'external version file URL',
  );
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

async function prepareVersionUpload({
  projectSlug,
  sizeBytes,
  token,
}: {
  projectSlug: string;
  sizeBytes: number;
  token: string;
}): Promise<ProjectUploadTarget> {
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
          sizeBytes,
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
  const bytes = new Uint8Array(smokeVersionFileSizeBytes);
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

async function checkPublicVersionSearchFlow(options: {
  projectSlug: string;
  versionNumber: string;
}): Promise<void> {
  const query = `
    query SmokeVersionSearchForProject(
      $gameVersion: String
      $loader: String
      $projectSlug: String!
      $search: String
    ) {
      versionSearchForProject(
        gameVersion: $gameVersion
        limit: 5
        loader: $loader
        offset: 0
        projectSlug: $projectSlug
        search: $search
      ) {
        totalHits
        versions {
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
    }
  `;

  const matchingPayload = await readGraphql<VersionSearchForProjectResponse>({
    query,
    variables: {
      gameVersion: '1.21.6',
      loader: 'fabric',
      projectSlug: options.projectSlug,
      search: options.versionNumber,
    },
  });
  assertNoGraphqlErrors(
    matchingPayload,
    'GraphQL version search for matching public release',
  );
  const matchingResult = required(
    matchingPayload.data?.versionSearchForProject,
    'matching version search result',
  );
  const matchingVersion = required(
    matchingResult.versions.find(
      (version) => version.versionNumber === options.versionNumber,
    ),
    'matching version search item',
  );
  assertVersion(matchingVersion, options);

  const incompatibleLoaderPayload =
    await readGraphql<VersionSearchForProjectResponse>({
      query,
      variables: {
        loader: 'forge',
        projectSlug: options.projectSlug,
      },
    });
  assertNoGraphqlErrors(
    incompatibleLoaderPayload,
    'GraphQL version search for incompatible loader',
  );
  assertEmptyVersionSearchResult(
    required(
      incompatibleLoaderPayload.data?.versionSearchForProject,
      'incompatible loader version search result',
    ),
    'incompatible loader version search',
  );

  const missingSearchPayload =
    await readGraphql<VersionSearchForProjectResponse>({
      query,
      variables: {
        projectSlug: options.projectSlug,
        search: `missing-${options.versionNumber}`,
      },
    });
  assertNoGraphqlErrors(
    missingSearchPayload,
    'GraphQL version search for missing text',
  );
  assertEmptyVersionSearchResult(
    required(
      missingSearchPayload.data?.versionSearchForProject,
      'missing text version search result',
    ),
    'missing text version search',
  );
}

function assertEmptyVersionSearchResult(
  result: VersionSearchResult,
  label: string,
): void {
  if (result.totalHits !== 0 || result.versions.length !== 0) {
    throw new Error(
      `Expected ${label} to return no versions, received ${result.totalHits.toString()} hits`,
    );
  }
}

async function checkAnalyticsFlow(options: {
  fileId: string;
  projectSlug: string;
}): Promise<void> {
  const viewPayload = await readGraphql<RecordProjectViewResponse>(
    {
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
    },
    undefined,
    {
      referer: smokeViewReferrer,
      'user-agent': smokeViewUserAgent,
      'x-country-code': smokeViewCountryCode,
    },
  );
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

  const downloadResponse = await fetch(
    `${apiUrl}/downloads/files/${encodeURIComponent(options.fileId)}`,
    {
      headers: {
        'user-agent': smokeDownloadUserAgent,
        'x-country-code': smokeDownloadCountryCode,
      },
      redirect: 'manual',
    },
  );
  if (downloadResponse.status !== 302) {
    throw new Error(
      `Download redirect returned ${downloadResponse.status.toString()}`,
    );
  }

  const downloadLocation = downloadResponse.headers.get('location');
  if (downloadLocation === null || downloadLocation.length === 0) {
    throw new Error('Download redirect did not include a storage location');
  }

  const downloadUrl = new URL(downloadLocation, apiUrl);
  if (downloadUrl.protocol !== 'http:' && downloadUrl.protocol !== 'https:') {
    throw new Error(`Download redirect used ${downloadUrl.protocol}`);
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

  await checkAnalyticsMetadata(options.projectSlug);
}

async function checkAnalyticsMetadata(projectSlug: string): Promise<void> {
  const prisma = new PrismaClient({
    datasources: {
      db: { url: databaseUrl },
    },
  });

  try {
    const project = await prisma.project.findUnique({
      select: { id: true },
      where: { slug: projectSlug },
    });
    const projectId = required(project, 'analytics metadata project').id;

    const [viewEvent, downloadEvent] = await Promise.all([
      prisma.projectViewEvent.findFirst({
        orderBy: { createdAt: 'desc' },
        where: {
          countryCode: smokeViewCountryCode,
          projectId,
          referrer: smokeViewReferrer,
          userAgent: smokeViewUserAgent,
        },
      }),
      prisma.downloadEvent.findFirst({
        orderBy: { createdAt: 'desc' },
        where: {
          countryCode: smokeDownloadCountryCode,
          projectId,
          userAgent: smokeDownloadUserAgent,
        },
      }),
    ]);

    if (viewEvent === null) {
      throw new Error('Smoke project view did not capture request metadata');
    }
    if (downloadEvent === null) {
      throw new Error('Smoke download did not capture request metadata');
    }
  } finally {
    await prisma.$disconnect();
  }
}

async function checkFileScanFlow(options: {
  fileId: string;
  projectSlug: string;
  token: string;
  versionNumber: string;
}): Promise<void> {
  const scanPayload = await readGraphql<RecordFileScanResponse>(
    {
      query: `
        mutation SmokeRecordFileScan($input: RecordFileScanInput!) {
          recordFileScan(input: $input) {
            files {
              id
              primary
              scans {
                details
                status
                verdict
              }
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
          details: '{ "engine": "smoke" }',
          fileId: options.fileId,
          status: 'COMPLETE',
          verdict: 'CLEAN',
        },
      },
    },
    options.token,
  );
  assertNoGraphqlErrors(scanPayload, 'GraphQL record file scan');

  const scannedVersion = required(
    scanPayload.data?.recordFileScan,
    'scanned version',
  );
  assertVersion(scannedVersion, {
    projectSlug: options.projectSlug,
    versionNumber: options.versionNumber,
  });
  assertVersionFileScan(scannedVersion, options.fileId);

  const versionsPayload = await readGraphql<VersionsForProjectResponse>({
    query: `
      query SmokeScannedVersionsForProject($projectSlug: String!) {
        versionsForProject(projectSlug: $projectSlug) {
          files {
            id
            scans {
              details
              status
              verdict
            }
          }
          id
          projectSlug
          status
          versionNumber
        }
      }
    `,
    variables: { projectSlug: options.projectSlug },
  });
  assertNoGraphqlErrors(versionsPayload, 'GraphQL scanned versions');

  const publicVersion = required(
    versionsPayload.data?.versionsForProject?.find(
      (version) => version.versionNumber === options.versionNumber,
    ),
    'public scanned version',
  );
  assertVersionFileScan(publicVersion, options.fileId);
}

function assertVersionFileScan(version: VersionSummary, fileId: string): void {
  const file = required(
    version.files.find((item) => item.id === fileId),
    'scanned version file',
  );
  const scan = required(file.scans?.[0], 'version file scan');
  if (
    scan.status !== 'COMPLETE' ||
    scan.verdict !== 'CLEAN' ||
    scan.details !== '{\n  "engine": "smoke"\n}'
  ) {
    throw new Error(
      `File scan mismatch for ${fileId}: received ${scan.status} ${scan.verdict ?? 'none'}`,
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

async function checkAuditLogFlow(options: {
  peerToken: string;
  peerUsername: string;
  projectSlug: string;
  token: string;
  username: string;
  versionNumber: string;
}): Promise<void> {
  const rejectedPayload = await readGraphql<AdminAuditLogSearchResponse>(
    {
      query: `
        query SmokeRejectedAdminAuditLogSearch {
          adminAuditLogSearch(limit: 1, offset: 0) {
            totalHits
          }
        }
      `,
    },
    options.peerToken,
  );
  assertGraphqlError(
    rejectedPayload,
    'Admin access required',
    'non-admin audit log search',
  );

  const auditLogs = await readAdminAuditLogs(options.token);

  assertAuditLogEvent(auditLogs, 'two-factor enable audit log', (log) => {
    return (
      log.action === 'SECURITY_EVENT' &&
      log.securityAction === 'TWO_FACTOR_ENABLED' &&
      log.actor?.username === options.username &&
      log.targetUser?.username === options.username
    );
  });
  assertAuditLogEvent(auditLogs, 'API token create audit log', (log) => {
    return (
      log.action === 'SECURITY_EVENT' &&
      log.securityAction === 'API_TOKEN_CREATED' &&
      log.actor?.username === options.username &&
      log.targetUser?.username === options.username
    );
  });
  assertAuditLogEvent(auditLogs, 'API token revoke audit log', (log) => {
    return (
      log.action === 'SECURITY_EVENT' &&
      log.securityAction === 'API_TOKEN_REVOKED' &&
      log.actor?.username === options.username &&
      log.targetUser?.username === options.username
    );
  });
  assertAuditLogEvent(auditLogs, 'OAuth client create audit log', (log) => {
    return (
      log.action === 'SECURITY_EVENT' &&
      log.securityAction === 'OAUTH_CLIENT_CREATED' &&
      log.actor?.username === options.username &&
      log.targetUser?.username === options.username
    );
  });
  assertAuditLogEvent(auditLogs, 'OAuth client revoke audit log', (log) => {
    return (
      log.action === 'SECURITY_EVENT' &&
      log.securityAction === 'OAUTH_CLIENT_REVOKED' &&
      log.actor?.username === options.username &&
      log.targetUser?.username === options.username
    );
  });
  assertAuditLogEvent(auditLogs, 'project approval audit log', (log) => {
    return (
      log.action === 'PROJECT_MODERATED' &&
      log.moderationAction === 'APPROVE' &&
      log.actor?.username === options.username &&
      log.projectBefore?.slug === options.projectSlug &&
      log.projectBefore.status === 'PENDING_REVIEW' &&
      log.projectAfter?.slug === options.projectSlug &&
      log.projectAfter.status === 'APPROVED'
    );
  });
  assertAuditLogEvent(auditLogs, 'version approval audit log', (log) => {
    return (
      log.action === 'VERSION_MODERATED' &&
      log.moderationAction === 'APPROVE' &&
      log.actor?.username === options.username &&
      log.versionBefore?.projectSlug === options.projectSlug &&
      log.versionBefore.versionNumber === options.versionNumber &&
      log.versionBefore.status === 'PENDING_REVIEW' &&
      log.versionAfter?.projectSlug === options.projectSlug &&
      log.versionAfter.versionNumber === options.versionNumber &&
      log.versionAfter.status === 'APPROVED'
    );
  });
  assertAuditLogEvent(auditLogs, 'team invite add audit log', (log) => {
    return (
      log.action === 'TEAM_MEMBERSHIP_CHANGED' &&
      log.teamMemberAction === 'ADD' &&
      log.actor?.username === options.username &&
      log.targetUser?.username === options.peerUsername &&
      log.resource?.kind === 'PROJECT' &&
      log.resource.slug === options.projectSlug &&
      log.teamMemberAfter?.accepted === false &&
      log.teamMemberAfter.username === options.peerUsername
    );
  });
  assertAuditLogEvent(auditLogs, 'team invite accept audit log', (log) => {
    return (
      log.action === 'TEAM_MEMBERSHIP_CHANGED' &&
      log.teamMemberAction === 'ACCEPT' &&
      log.actor?.username === options.peerUsername &&
      log.targetUser?.username === options.peerUsername &&
      log.resource?.kind === 'PROJECT' &&
      log.resource.slug === options.projectSlug &&
      log.teamMemberBefore?.accepted === false &&
      log.teamMemberBefore.username === options.peerUsername &&
      log.teamMemberAfter?.accepted === true &&
      log.teamMemberAfter.username === options.peerUsername &&
      stringSetsEqual(log.teamMemberAfter.permissions, [
        'MANAGE_VERSIONS',
        'VIEW_ANALYTICS',
      ])
    );
  });
}

async function readAdminAuditLogs(token: string): Promise<AuditLogSummary[]> {
  const limit = 100;
  let offset = 0;
  let totalHits: number | null = null;
  const auditLogs: AuditLogSummary[] = [];

  while (totalHits === null || offset < totalHits) {
    const payload = await readGraphql<AdminAuditLogSearchResponse>(
      {
        query: `
          query SmokeAdminAuditLogSearch($limit: Int!, $offset: Int!) {
            adminAuditLogSearch(limit: $limit, offset: $offset) {
              auditLogs {
                action
                actor {
                  username
                }
                moderationAction
                projectAfter {
                  slug
                  status
                }
                projectBefore {
                  slug
                  status
                }
                resource {
                  kind
                  slug
                }
                securityAction
                targetUser {
                  username
                }
                teamMemberAction
                teamMemberAfter {
                  accepted
                  permissions
                  role
                  username
                }
                teamMemberBefore {
                  accepted
                  username
                }
                versionAfter {
                  projectSlug
                  status
                  versionNumber
                }
                versionBefore {
                  projectSlug
                  status
                  versionNumber
                }
              }
              totalHits
            }
          }
        `,
        variables: { limit, offset },
      },
      token,
    );
    assertNoGraphqlErrors(payload, 'GraphQL admin audit log search');

    const page = required(
      payload.data?.adminAuditLogSearch,
      'admin audit log search',
    );
    totalHits = page.totalHits;
    auditLogs.push(...page.auditLogs);
    offset += page.auditLogs.length;

    if (page.auditLogs.length === 0 && offset < totalHits) {
      throw new Error('Audit log search returned an empty partial page');
    }
  }

  if (totalHits < auditLogs.length) {
    throw new Error('Audit log total was lower than returned rows');
  }

  return auditLogs;
}

function assertAuditLogEvent(
  logs: readonly AuditLogSummary[],
  label: string,
  predicate: (log: AuditLogSummary) => boolean,
): void {
  if (!logs.some(predicate)) {
    throw new Error(`Missing ${label}`);
  }
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

async function readGraphql<T>(
  body: unknown,
  token?: string,
  extraHeaders: Record<string, string> = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    ...extraHeaders,
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

function assertGraphqlError(
  payload: { errors?: GraphqlError[] },
  expectedMessage: string,
  label: string,
): void {
  const errors = payload.errors ?? [];
  if (!errors.some((error) => error.message === expectedMessage)) {
    throw new Error(
      `Expected ${label} to fail with "${expectedMessage}", received ${errors
        .map((error) => error.message)
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

function assertProjectMember(
  member: ProjectMemberSummary,
  expected: {
    accepted: boolean;
    owner: boolean;
    permissions: string[];
    role: string;
    username: string;
  },
): void {
  if (
    member.accepted !== expected.accepted ||
    member.owner !== expected.owner ||
    member.role !== expected.role ||
    member.user.username !== expected.username ||
    !stringSetsEqual(member.permissions, expected.permissions)
  ) {
    throw new Error(
      `Project member mismatch: expected ${expected.username} ${expected.role}, received ${member.user.username} ${member.role}`,
    );
  }
}

function assertTeamInvitation(
  invitation: TeamInvitationSummary,
  expected: {
    permissions: string[];
    projectKind: string;
    projectSlug: string;
    projectTitle: string;
    role: string;
  },
): void {
  if (
    invitation.role !== expected.role ||
    invitation.target.name !== expected.projectTitle ||
    invitation.target.projectKind !== expected.projectKind ||
    invitation.target.slug !== expected.projectSlug ||
    invitation.target.type !== 'PROJECT' ||
    !stringSetsEqual(invitation.permissions, expected.permissions)
  ) {
    throw new Error(
      `Team invitation mismatch: expected ${expected.projectSlug} ${expected.role}, received ${invitation.target.slug} ${invitation.role}`,
    );
  }
}

function stringSetsEqual(
  actual: readonly string[],
  expected: readonly string[],
): boolean {
  if (actual.length !== expected.length) return false;

  const actualSet = new Set(actual);
  return expected.every((value) => actualSet.has(value));
}

function assertProjectGalleryImage(
  project: ProjectSummary,
  expected: GalleryImageSummary,
): void {
  const gallery = project.gallery ?? [];
  const image = gallery.find((item) => item.displayUrl === expected.displayUrl);
  if (
    image?.description !== expected.description ||
    image.featured !== expected.featured ||
    image.rawUrl !== expected.rawUrl ||
    image.sortOrder !== expected.sortOrder ||
    image.title !== expected.title
  ) {
    throw new Error(
      `Project gallery mismatch for ${project.slug}: expected ${expected.displayUrl}`,
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
  assertVersionIdentity(version, expected);
  if (
    version.status !== 'APPROVED' ||
    version.files.length !== 1 ||
    !version.files[0]?.primary
  ) {
    throw new Error(
      `Version mismatch: expected ${expected.projectSlug} ${expected.versionNumber}, received ${version.projectSlug} ${version.versionNumber}`,
    );
  }
}

function assertVersionIdentity(
  version: VersionSummary,
  expected: { projectSlug: string; versionNumber: string },
): void {
  if (
    version.projectSlug !== expected.projectSlug ||
    version.versionNumber !== expected.versionNumber
  ) {
    throw new Error(
      `Version identity mismatch: expected ${expected.projectSlug} ${expected.versionNumber}, received ${version.projectSlug} ${version.versionNumber}`,
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

function currentTotpCode(secret: string): string {
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30_000)));
  const digest = createHmac('sha1', base32Decode(secret))
    .update(counterBuffer)
    .digest();
  const offset = byteAt(digest, digest.length - 1) & 0x0f;
  const binary =
    ((byteAt(digest, offset) & 0x7f) << 24) |
    ((byteAt(digest, offset + 1) & 0xff) << 16) |
    ((byteAt(digest, offset + 2) & 0xff) << 8) |
    (byteAt(digest, offset + 3) & 0xff);

  return (binary % 1_000_000).toString().padStart(6, '0');
}

function base32Decode(value: string): Buffer {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let accumulator = 0;
  const bytes: number[] = [];

  for (const character of value.toUpperCase().replace(/=+$/g, '')) {
    const index = alphabet.indexOf(character);
    if (index === -1) continue;
    accumulator = (accumulator << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bytes.push((accumulator >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

function byteAt(buffer: Buffer, index: number): number {
  return buffer[index] ?? 0;
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
