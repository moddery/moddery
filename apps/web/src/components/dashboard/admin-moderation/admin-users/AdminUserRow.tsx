import { ACCOUNT_ROLES, ACCOUNT_STATUSES } from '@moddery/shared';
import { UserRound } from 'lucide-react';
import { type ReactNode } from 'react';

import { userPath } from '../../../../app/routing.ts';
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
  const displayName = user.displayName ?? user.username;

  return (
    <article className="rounded-lg border border-line bg-raised p-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt=""
              className="size-10 shrink-0 rounded-lg bg-surface-2 object-cover"
            />
          ) : (
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-surface-2 text-accent-icon">
              <UserRound className="size-5" />
            </span>
          )}
          <div className="min-w-0">
            <a
              href={adminUserHref(user)}
              className="block truncate font-display text-base font-extrabold text-ink transition-colors hover:text-accent"
            >
              {displayName}
            </a>
            <p className="mt-1 truncate text-xs font-semibold text-muted">
              @{user.username}
              {user.email ? ` · ${user.email}` : ''}
              {self ? ' · you' : ''}
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold text-muted">
          {timeAgo(user.createdAt)}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <AccountBadge tone={statusBadgeTone(user.status)}>
          {user.status.toLowerCase()}
        </AccountBadge>
        <AccountBadge tone={user.role === 'ADMIN' ? 'accent' : 'muted'}>
          {user.role.toLowerCase()}
        </AccountBadge>
        <AccountBadge tone={user.emailVerifiedAt ? 'muted' : 'warning'}>
          {user.emailVerifiedAt ? 'email verified' : 'email unverified'}
        </AccountBadge>
        <AccountBadge>
          2FA {user.twoFactorEnabled ? 'enabled' : 'disabled'}
        </AccountBadge>
        {user.projectCount > 0 && (
          <AccountBadge>
            {user.projectCount.toLocaleString('en-US')} projects
          </AccountBadge>
        )}
        {user.collectionCount > 0 && (
          <AccountBadge>
            {user.collectionCount.toLocaleString('en-US')} collections
          </AccountBadge>
        )}
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

export function adminUserHref(user: Pick<AdminUserAccount, 'username'>) {
  return userPath(user.username);
}

export function statusBadgeTone(status: string): AccountBadgeTone {
  if (status === 'SUSPENDED') return 'warning';
  if (status === 'DELETED') return 'danger';
  return 'muted';
}

type AccountBadgeTone = 'muted' | 'accent' | 'warning' | 'danger';

const BADGE_TONE_CLASSES: Record<AccountBadgeTone, string> = {
  accent: 'bg-accent-soft text-accent',
  danger: 'bg-danger/10 text-danger',
  muted: 'bg-surface-2 text-muted',
  warning: 'bg-warning/10 text-warning',
};

function AccountBadge({
  children,
  tone = 'muted',
}: {
  children: ReactNode;
  tone?: AccountBadgeTone;
}) {
  return (
    <span
      className={`rounded-md px-2 py-1 text-xs font-bold ${BADGE_TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}
