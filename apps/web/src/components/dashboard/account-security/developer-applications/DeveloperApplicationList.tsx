import { type OAuthClientSummary } from '../../../../lib/dashboard.ts';
import { Pagination } from '../../../Pagination.tsx';
import { DeveloperApplicationRow } from './DeveloperApplicationRow.tsx';

export function DeveloperApplicationList({
  clients,
  isLoading,
  page,
  pageSize,
  revokingClientId,
  revoke,
  setPage,
  totalHits,
}: {
  clients: OAuthClientSummary[];
  isLoading: boolean;
  page: number;
  pageSize: number;
  revokingClientId: string | null;
  revoke: (clientId: string) => void;
  setPage: (page: number) => void;
  totalHits: number;
}) {
  const totalPages = Math.max(1, Math.ceil(totalHits / pageSize));

  if (isLoading) {
    return (
      <div className="mt-4 grid gap-3">
        <p className="text-sm text-muted">Loading applications...</p>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="mt-4 grid gap-3">
        <p className="text-sm text-muted">No applications yet.</p>
      </div>
    );
  }

  return (
    <div className="mt-4 grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-muted">
          {totalHits.toLocaleString('en-US')} applications
        </p>
        {totalPages > 1 && (
          <Pagination page={page} totalPages={totalPages} onPage={setPage} />
        )}
      </div>
      {clients.map((client) => (
        <DeveloperApplicationRow
          key={client.id}
          busy={revokingClientId === client.id}
          client={client}
          revoke={revoke}
        />
      ))}
      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onPage={setPage} />
      )}
    </div>
  );
}
