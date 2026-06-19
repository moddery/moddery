import { useQuery } from '@tanstack/react-query';
import { Activity } from 'lucide-react';

import {
  fetchReadiness,
  type HealthCheckResult,
  type ReadinessResult,
} from '../../../lib/health.ts';
import { ReportActionButton } from './shared.tsx';

export function InfrastructureStatusPanel() {
  const readinessQuery = useQuery({
    queryFn: ({ signal }) => fetchReadiness(signal),
    queryKey: ['dashboard', 'infrastructure-readiness'],
    refetchInterval: 30_000,
  });
  const readiness = readinessQuery.data;

  return (
    <section className="mt-8 rounded-xl border border-line bg-surface p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold text-ink">
            Infrastructure
          </h2>
          <p className="mt-1 text-sm text-muted">
            Runtime status for core services.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Activity className="size-5 text-accent-icon" />
          <ReportActionButton
            disabled={readinessQuery.isFetching}
            onClick={() => void readinessQuery.refetch()}
          >
            Refresh
          </ReportActionButton>
        </div>
      </div>

      {readinessQuery.isLoading ? (
        <p className="mt-4 text-sm font-semibold text-muted">
          Loading service status...
        </p>
      ) : readinessQuery.error ? (
        <p className="mt-4 rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
          {readinessQuery.error instanceof Error
            ? readinessQuery.error.message
            : 'Service status failed to load'}
        </p>
      ) : readiness === undefined ? (
        <p className="mt-4 rounded-lg bg-accent-soft px-3 py-2 text-sm font-bold text-ink">
          Service status did not return from the API.
        </p>
      ) : (
        <InfrastructureStatusGrid readiness={readiness} />
      )}
    </section>
  );
}

function InfrastructureStatusGrid({
  readiness,
}: {
  readiness: ReadinessResult;
}) {
  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {serviceOrder.map((service) => {
        const check = readiness.checks.find((item) => item.name === service);

        return (
          <ServiceStatusCard
            key={service}
            check={check ?? { durationMs: null, name: service, status: 'down' }}
          />
        );
      })}
    </div>
  );
}

function ServiceStatusCard({ check }: { check: HealthCheckResult }) {
  const up = check.status === 'up';

  return (
    <div className="rounded-lg border border-line bg-surface-2 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="font-display text-base font-extrabold text-ink">
          {serviceLabels[check.name]}
        </p>
        <div className="flex items-center gap-2">
          {check.durationMs !== null && (
            <span className="text-xs font-bold text-muted tabular-nums">
              {check.durationMs.toLocaleString('en-US')} ms
            </span>
          )}
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
      </div>
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
