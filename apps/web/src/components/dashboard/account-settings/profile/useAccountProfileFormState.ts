import { useEffect, useState } from 'react';

import {
  updateViewerProfile,
  type DashboardData,
  type UpdateViewerProfileInput,
} from '../../../../lib/dashboard.ts';

export function useAccountProfileFormState({
  dashboard,
  onUpdated,
}: {
  dashboard: DashboardData;
  onUpdated: () => Promise<void>;
}) {
  const [displayName, setDisplayName] = useState(dashboard.displayName ?? '');
  const [bio, setBio] = useState(dashboard.bio ?? '');
  const [avatarUrl, setAvatarUrl] = useState(dashboard.avatarUrl ?? '');
  const [email, setEmail] = useState(dashboard.email ?? '');
  const [newsletterOptIn, setNewsletterOptIn] = useState(
    dashboard.newsletterOptIn,
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setDisplayName(dashboard.displayName ?? '');
    setBio(dashboard.bio ?? '');
    setAvatarUrl(dashboard.avatarUrl ?? '');
    setEmail(dashboard.email ?? '');
    setNewsletterOptIn(dashboard.newsletterOptIn);
  }, [
    dashboard.avatarUrl,
    dashboard.bio,
    dashboard.displayName,
    dashboard.email,
    dashboard.newsletterOptIn,
  ]);

  async function submit(event: { preventDefault: () => void }) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);

    const input: UpdateViewerProfileInput = {
      avatarUrl,
      bio,
      displayName,
      email,
      newsletterOptIn,
    };

    try {
      await updateViewerProfile(input);
      await onUpdated();
      setMessage('Profile updated.');
    } catch (caught) {
      setMessage(
        caught instanceof Error ? caught.message : 'Profile update failed.',
      );
    } finally {
      setBusy(false);
    }
  }

  return {
    avatarUrl,
    bio,
    busy,
    displayName,
    email,
    message,
    newsletterOptIn,
    setAvatarUrl,
    setBio,
    setDisplayName,
    setEmail,
    setNewsletterOptIn,
    submit,
  };
}
