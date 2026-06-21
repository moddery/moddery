import { useEffect, useState } from 'react';

import {
  confirmEmailVerification,
  requestEmailVerification,
  updateViewerProfile,
  uploadOwnerImage,
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
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [email, setEmail] = useState(dashboard.email ?? '');
  const [newsletterOptIn, setNewsletterOptIn] = useState(
    dashboard.newsletterOptIn,
  );
  const [busy, setBusy] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');
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

    try {
      let nextAvatarUrl = avatarUrl;
      if (avatarFile !== null) {
        const target = await uploadOwnerImage({
          file: avatarFile,
          ownerId: dashboard.id,
          ownerType: 'user',
          uploadKind: 'avatar',
        });
        nextAvatarUrl = target.objectUrl;
        setAvatarUrl(nextAvatarUrl);
        setAvatarFile(null);
      }

      const input: UpdateViewerProfileInput = {
        avatarUrl: nextAvatarUrl,
        bio,
        displayName,
        email,
        newsletterOptIn,
      };

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

  async function sendVerification() {
    setBusy(true);
    setMessage(null);

    try {
      await requestEmailVerification();
      setMessage('Verification email sent.');
    } catch (caught) {
      setMessage(
        caught instanceof Error
          ? caught.message
          : 'Email verification request failed.',
      );
    } finally {
      setBusy(false);
    }
  }

  async function confirmVerification() {
    setBusy(true);
    setMessage(null);

    try {
      await confirmEmailVerification(verificationToken);
      setVerificationToken('');
      await onUpdated();
      setMessage('Email verified.');
    } catch (caught) {
      setMessage(
        caught instanceof Error ? caught.message : 'Email verification failed.',
      );
    } finally {
      setBusy(false);
    }
  }

  return {
    avatarFile,
    avatarUrl,
    bio,
    busy,
    displayName,
    email,
    message,
    newsletterOptIn,
    sendVerification,
    confirmVerification,
    setAvatarFile,
    setAvatarUrl,
    setBio,
    setDisplayName,
    setEmail,
    setNewsletterOptIn,
    setVerificationToken,
    submit,
    verificationToken,
  };
}
