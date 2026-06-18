import { type AccountRole, type AccountStatus } from '@moddery/shared';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import {
  fetchAdminUserSearch,
  updateUserAccount,
  type AdminUserAccount,
} from '../../../../lib/dashboard.ts';

export interface UpdateUserAccountInput {
  role?: AccountRole;
  status?: AccountStatus;
}

const pageSize = 20;

export function useAdminUsersPanelState() {
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const usersQuery = useQuery({
    queryFn: ({ signal }) =>
      fetchAdminUserSearch(searchQuery, page, pageSize, signal),
    queryKey: ['dashboard', 'admin-users', searchQuery, page],
  });
  const totalHits = usersQuery.data?.totalHits ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalHits / pageSize));
  const users = usersQuery.data?.users ?? [];

  function submitSearch() {
    const normalizedSearch = searchInput.trim();
    setPage(1);
    setSearchQuery(normalizedSearch === '' ? null : normalizedSearch);
  }

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
    page,
    pageSize,
    searchInput,
    setPage,
    setSearchInput,
    submitSearch,
    totalHits,
    totalPages,
    updateAccount,
    users,
    usersQuery,
  };
}
