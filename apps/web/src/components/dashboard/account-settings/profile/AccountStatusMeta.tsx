import { type DashboardData } from '../../../../lib/dashboard.ts';

export function AccountStatusMeta({ dashboard }: { dashboard: DashboardData }) {
  return (
    <div className="flex flex-wrap gap-2 text-xs font-semibold text-muted">
      <span>
        Email{' '}
        {dashboard.emailVerifiedAt
          ? `verified ${new Date(dashboard.emailVerifiedAt).toLocaleDateString(
              'en-US',
            )}`
          : 'not verified'}
      </span>
      <span>·</span>
      <span>
        Two-factor authentication{' '}
        {dashboard.twoFactorEnabled ? 'enabled' : 'disabled'}
      </span>
    </div>
  );
}
