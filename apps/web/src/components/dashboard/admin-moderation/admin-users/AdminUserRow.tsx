import { ACCOUNT_ROLES, ACCOUNT_STATUSES } from '@moddery/shared';

import { type AdminUserAccount } from '../../../../lib/dashboard.ts';
import { timeAgo } from '../../../../lib/format.ts';
import { ReportActionButton } from '../shared.tsx';
import { type UpdateUserAccountInput } from './useAdminUsersPanelState.ts';

interface AdminUserRowProps {
  busy: boolean;
  onUpdate: (
    user: AdminUserAccount,
    input: UpdateUserAccountInput,
  ) => Promise<void>;
  self: boolean;
  user: AdminUserAccount;
}

export function AdminUserRow({
  busy,
  onUpdate,
  self,
  user,
}: AdminUserRowProps) {
  return (
    <article className="rounded-lg border border-line bg-raised p-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-base font-extrabold text-ink">
            {user.displayName ?? user.username}
          </p>
          <p className="mt-1 text-xs font-semibold text-muted">
            @{user.username} · {user.role} · {user.status}
            {self ? ' · you' : ''}
          </p>
        </div>
        <span className="text-xs font-semibold text-muted">
          {timeAgo(user.createdAt)}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {ACCOUNT_ROLES.map((role) => (
          <ReportActionButton
            key={role}
            disabled={busy || user.role === role || (self && role !== 'ADMIN')}
            tone={user.role === role ? 'strong' : 'default'}
            onClick={() => void onUpdate(user, { role })}
          >
            {role.toLowerCase()}
          </ReportActionButton>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {ACCOUNT_STATUSES.map((status) => (
          <ReportActionButton
            key={status}
            disabled={
              busy || user.status === status || (self && status !== 'ACTIVE')
            }
            tone={user.status === status ? 'strong' : 'default'}
            onClick={() => void onUpdate(user, { status })}
          >
            {status.toLowerCase()}
          </ReportActionButton>
        ))}
      </div>
    </article>
  );
}
