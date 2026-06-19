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
    primary: boolean;
    url: string;
  }[];
  id: string;
  projectSlug: string;
  status: string;
  versionNumber: string;
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

async function checkCreatorFlow(): Promise<void> {
  const suffix = `${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 8)}`;
  const username = `smoke_${suffix}`;
  const slug = `smoke-${suffix}`;
  const title = `Smoke Project ${suffix}`;

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
      input: {
        email: `${username}@example.test`,
        password: `password-${suffix}`,
        username,
      },
    },
  });
  assertNoGraphqlErrors(registerPayload, 'GraphQL register');

  const auth = required(registerPayload.data?.register, 'register payload');
  if (auth.user.username !== username) {
    throw new Error(
      `Registered username mismatch: expected ${username}, received ${auth.user.username}`,
    );
  }

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

  const versionNumber = `1.0.${suffix}`;
  const versionPayload = await readGraphql<CreateVersionResponse>(
    {
      query: `
        mutation SmokeCreateVersion($input: CreateVersionInput!) {
          createVersion(input: $input) {
            files {
              fileName
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
                  value:
                    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
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
    throw new Error(`GraphQL returned ${response.status.toString()}`);
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
