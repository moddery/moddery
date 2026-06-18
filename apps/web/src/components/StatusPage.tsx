import { useQuery } from '@tanstack/react-query';
import { Activity, RefreshCw } from 'lucide-react';

import {
  fetchReadiness,
  type HealthCheckResult,
  type ReadinessResult,
} from '../lib/health.ts';

export function StatusPage() {
  const readinessQuery = useQuery({
    queryFn: ({ signal }) => fetchReadiness(signal),
    queryKey: ['status', 'readiness'],
    refetchInterval: 30_000,
  });
  const checkedAt = readinessQuery.dataUpdatedAt
    ? new Date(readinessQuery.dataUpdatedAt)
    : null;

  return (
    <main className="mx-auto w-full max-w-[960px] px-4 pb-24 pt-5 sm:px-6">
      <header className="border-b border-line pb-5 sm:flex sm:items-end sm:justify-between sm:gap-6">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-ink">
            Status
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Runtime health for the services powering search, analytics, cache,
            and application data.
          </p>
        </div>
        <button
          type="button"
          disabled={readinessQuery.isFetching}
          onClick={() => void readinessQuery.refetch()}
          className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-control px-3 text-sm font-bold text-ink transition-colors hover:border-line-strong disabled:cursor-wait disabled:text-muted sm:mt-0"
        >
          <RefreshCw
            className={
              readinessQuery.isFetching ? 'size-4 animate-spin' : 'size-4'
            }
          />
          Refresh
        </button>
      </header>

      <section className="mt-6 rounded-xl border border-line bg-surface p-4 shadow-sm">
        {readinessQuery.isLoading ? (
          <p className="text-sm font-semibold text-muted">
            Loading service status...
          </p>
        ) : readinessQuery.error ? (
          <p className="rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
            {readinessQuery.error instanceof Error
              ? readinessQuery.error.message
              : 'Service status failed to load'}
          </p>
        ) : readinessQuery.data === undefined ? (
          <p className="rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
            Service status did not return from the API.
          </p>
        ) : (
          <StatusSummary readiness={readinessQuery.data} />
        )}

        {checkedAt && (
          <p className="mt-4 text-xs font-semibold text-muted">
            Last checked {checkedAt.toLocaleTimeString('en-US')}
          </p>
        )}
      </section>
    </main>
  );
}

function StatusSummary({ readiness }: { readiness: ReadinessResult }) {
  const ready = readiness.status === 'ready';

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-accent-soft text-accent">
            <Activity className="size-5" />
          </span>
          <div>
            <h2 className="font-display text-xl font-extrabold text-ink">
              {ready ? 'All systems operational' : 'Service degradation'}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {ready
                ? 'Every dependency is responding.'
                : 'One or more dependencies are not ready.'}
            </p>
          </div>
        </div>
        <span
          className={
            ready
              ? 'rounded-md bg-accent-soft px-2 py-1 text-xs font-bold uppercase text-accent'
              : 'rounded-md bg-control px-2 py-1 text-xs font-bold uppercase text-muted'
          }
        >
          {readiness.status.replace('_', ' ')}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {serviceOrder.map((service) => {
          const check = readiness.checks.find((item) => item.name === service);

          return (
            <ServiceStatusRow
              key={service}
              check={check ?? { name: service, status: 'down' }}
            />
          );
        })}
      </div>
    </>
  );
}

function ServiceStatusRow({ check }: { check: HealthCheckResult }) {
  const up = check.status === 'up';

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface-2 p-3">
      <div>
        <p className="font-display text-base font-extrabold text-ink">
          {serviceLabels[check.name]}
        </p>
        <p className="mt-1 text-xs font-semibold text-muted">
          {serviceDescriptions[check.name]}
        </p>
      </div>
      <span
        className={
          up
            ? 'rounded-md bg-accent-soft px-2 py-1 text-xs font-bold uppercase text-accent'
            : 'rounded-md bg-control px-2 py-1 text-xs font-bold uppercase text-muted'
        }
      >
        {check.status}
      </span>
    </div>
  );
}

const serviceOrder: HealthCheckResult['name'][] = [
  'database',
  'redis',
  'search',
  'analytics',
];

const serviceLabels: Record<HealthCheckResult['name'], string> = {
  analytics: 'ClickHouse',
  database: 'Postgres',
  redis: 'Redis',
  search: 'OpenSearch',
};

const serviceDescriptions: Record<HealthCheckResult['name'], string> = {
  analytics: 'Event analytics store',
  database: 'Transactional data store',
  redis: 'Cache and ephemeral state',
  search: 'Project search index',
};
