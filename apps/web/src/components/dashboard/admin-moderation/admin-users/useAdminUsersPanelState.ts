import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import {
  fetchAdminUsers,
  updateUserAccount,
  type AdminUserAccount,
} from '../../../../lib/dashboard.ts';

export interface UpdateUserAccountInput {
  role?: string;
  status?: string;
}

export function useAdminUsersPanelState() {
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const usersQuery = useQuery({
    queryFn: ({ signal }) => fetchAdminUsers(signal),
    queryKey: ['dashboard', 'admin-users'],
  });
  const users = usersQuery.data ?? [];

  async function updateAccount(
    user: AdminUserAccount,
    input: UpdateUserAccountInput,
  ) {
    setBusyUserId(user.id);
    setMessage(null);
    try {
      await updateUserAccount({
        role: input.role ?? null,
        status: input.status ?? null,
        userId: user.id,
      });
      await usersQuery.refetch();
      setMessage(`Updated ${user.username}.`);
    } catch (caught) {
      setMessage(
        caught instanceof Error ? caught.message : 'User update failed.',
      );
    } finally {
      setBusyUserId(null);
    }
  }

  return {
    busyUserId,
    message,
    updateAccount,
    users,
    usersQuery,
  };
}
