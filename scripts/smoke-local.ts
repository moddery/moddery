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

interface ProjectSearchResponse {
  data?: {
    projectSearch?: {
      projects: {
        kind: string;
        slug: string;
        title: string;
      }[];
      totalHits: number;
    };
  };
  errors?: { message: string }[];
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

async function projectSearch(query: {
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

async function readGraphql<T>(body: unknown): Promise<T> {
  const response = await fetch(`${apiUrl}/graphql`, {
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(`GraphQL returned ${response.status.toString()}`);
  }

  return (await response.json()) as T;
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
