import { useQuery } from '@tanstack/react-query';
import { useState, type FormEvent, type ReactNode } from 'react';
import { type ReportReason } from '@moddery/shared';
import {
  BookMarked,
  Download,
  Flag,
  Heart,
  Package,
  UserRound,
} from 'lucide-react';

import { timeAgo } from '../lib/format.ts';
import {
  createUserReport,
  fetchUserProfile,
  userProjectToMod,
  type PublicUserProfile,
  type UserCollectionPreview,
} from '../lib/users.ts';
import { hasAuthToken } from '../lib/catalog.ts';
import type { Mod } from '../types.ts';
import { EmptyState } from './EmptyState.tsx';
import {
  canUseModerationNotes,
  createUserModerationNote,
  fetchModerationViewer,
  fetchUserModerationNotes,
} from '../lib/moderation.ts';
import { ModCard } from './ModCard.tsx';
import { ModerationNotesPanel } from './ModerationNotesPanel.tsx';

const reportReasons: Array<{ label: string; value: ReportReason }> = [
  { label: 'Broken or misleading', value: 'BROKEN_OR_MISLEADING' },
  { label: 'Malware', value: 'MALWARE' },
  { label: 'Copyright', value: 'COPYRIGHT' },
  { label: 'Spam', value: 'SPAM' },
  { label: 'Impersonation', value: 'IMPERSONATION' },
  { label: 'Hateful or abusive', value: 'HATEFUL_OR_ABUSIVE' },
  { label: 'Other', value: 'OTHER' },
];

export function UserProfilePage({
  username,
  onOpenProject,
}: {
  username: string;
  onOpenProject: (mod: Mod) => void;
}) {
  const profileQuery = useQuery({
    queryFn: ({ signal }) => fetchUserProfile(username, signal),
    queryKey: ['users', username],
  });

  if (profileQuery.isLoading) {
    return <UserProfileSkeleton />;
  }

  if (!profileQuery.data) {
    return (
      <main className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-5 sm:px-6">
        <EmptyState onClear={() => window.history.back()} itemLabel="users" />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-5 sm:px-6">
      <ProfileHeader profile={profileQuery.data} />
      <UserModerationNotes username={profileQuery.data.username} />

      <section className="mt-8">
        <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
          <h2 className="font-display text-xl font-extrabold text-ink">
            Projects
          </h2>
          <span className="text-sm font-semibold text-muted">
            {profileQuery.data.projectCount.toLocaleString('en-US')} total
          </span>
        </div>

        {profileQuery.data.projects.length === 0 ? (
          <p className="py-8 text-sm text-muted">No public projects yet.</p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
            {profileQuery.data.projects.map((project) => {
              const mod = userProjectToMod(project);
              return (
                <ModCard
                  key={project.slug}
                  mod={mod}
                  layout="list"
                  onOpen={onOpenProject}
                />
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
          <h2 className="font-display text-xl font-extrabold text-ink">
            Collections
          </h2>
          <span className="text-sm font-semibold text-muted">
            {profileQuery.data.collectionCount.toLocaleString('en-US')} total
          </span>
        </div>

        {profileQuery.data.collections.length === 0 ? (
          <p className="py-8 text-sm text-muted">No public collections yet.</p>
        ) : (
          <div className="mt-4 grid gap-5">
            {profileQuery.data.collections.map((collection) => (
              <CollectionPreview
                key={collection.id}
                collection={collection}
                onOpenProject={onOpenProject}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function ProfileHeader({ profile }: { profile: PublicUserProfile }) {
  const name = profile.displayName ?? profile.username;
  const [reportOpen, setReportOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>('IMPERSONATION');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasAuthToken()) {
      setMessage('Sign in to report a user.');
      return;
    }

    setBusy(true);
    setMessage(null);

    try {
      await createUserReport({
        body,
        reason,
        username: profile.username,
      });
      setBody('');
      setMessage('Report submitted.');
      setReportOpen(false);
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : 'Report failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <header className="border-b border-line pb-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-xl border border-line bg-surface-2 text-muted">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <UserRound className="size-8" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate font-display text-3xl font-extrabold text-ink">
              {name}
            </h1>
            {profile.isAdmin && (
              <span className="rounded-md bg-accent-soft px-2 py-1 text-xs font-bold uppercase text-accent">
                Admin
              </span>
            )}
            <button
              type="button"
              onClick={() => setReportOpen((current) => !current)}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-control px-2.5 text-xs font-bold text-ink transition-colors hover:bg-control-hover"
            >
              <Flag className="size-3.5 text-accent-icon" />
              Report
            </button>
          </div>
          <p className="mt-1 text-sm font-semibold text-muted">
            @{profile.username} · joined {timeAgo(profile.createdAt)}
          </p>
          {profile.bio && (
            <p className="mt-3 max-w-3xl text-sm leading-6 text-ink">
              {profile.bio}
            </p>
          )}
          {reportOpen && (
            <form
              onSubmit={(event) => void submitReport(event)}
              className="mt-4 max-w-3xl rounded-lg border border-line bg-surface-2 p-3"
            >
              <div className="grid gap-3 sm:grid-cols-[180px_minmax(0,1fr)_auto] sm:items-end">
                <label className="block text-xs font-bold uppercase text-muted">
                  Reason
                  <select
                    value={reason}
                    onChange={(event) =>
                      setReason(event.target.value as ReportReason)
                    }
                    className="mt-1 h-9 w-full rounded-md border border-line bg-control px-2 text-sm normal-case text-ink outline-none focus-visible:border-accent"
                  >
                    {reportReasons.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-xs font-bold uppercase text-muted">
                  Details
                  <input
                    required
                    minLength={8}
                    value={body}
                    onChange={(event) => setBody(event.target.value)}
                    className="mt-1 h-9 w-full rounded-md border border-line bg-control px-2 text-sm normal-case text-ink outline-none placeholder:text-faint focus-visible:border-accent"
                    placeholder="What should moderators know?"
                  />
                </label>
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-accent px-3 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Submit report
                </button>
              </div>
            </form>
          )}
          {message && (
            <p className="mt-2 text-xs font-semibold text-muted">{message}</p>
          )}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <ProfileStat
          icon={<Package className="size-4" />}
          label="Projects"
          value={profile.projectCount}
        />
        <ProfileStat
          icon={<BookMarked className="size-4" />}
          label="Collections"
          value={profile.collectionCount}
        />
        <ProfileStat
          icon={<Heart className="size-4" />}
          label="Following"
          value={profile.followedProjectCount}
        />
        <ProfileStat
          icon={<Download className="size-4" />}
          label="Downloads"
          value={profile.projects.reduce(
            (total, project) => total + project.downloads,
            0,
          )}
        />
      </div>
    </header>
  );
}

function ProfileStat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-3">
      <div className="flex items-center gap-2 text-muted">
        {icon}
        <span className="text-xs font-bold uppercase">{label}</span>
      </div>
      <div className="mt-1 text-lg font-extrabold text-ink tabular-nums">
        {value.toLocaleString('en-US')}
      </div>
    </div>
  );
}

function UserModerationNotes({ username }: { username: string }) {
  const viewerQuery = useQuery({
    enabled: hasAuthToken(),
    queryFn: ({ signal }) => fetchModerationViewer(signal),
    queryKey: ['moderation', 'viewer'],
    retry: false,
  });
  const enabled = canUseModerationNotes(viewerQuery.data);
  const notesQuery = useQuery({
    enabled,
    queryFn: ({ signal }) => fetchUserModerationNotes(username, signal),
    queryKey: ['moderation', 'user-notes', username],
  });

  if (!enabled) return null;

  return (
    <ModerationNotesPanel
      error={
        notesQuery.error instanceof Error ? notesQuery.error.message : null
      }
      loading={notesQuery.isLoading}
      notes={notesQuery.data}
      onCreate={async (body) => {
        await createUserModerationNote({ body, username });
        await notesQuery.refetch();
      }}
    />
  );
}

function CollectionPreview({
  collection,
  onOpenProject,
}: {
  collection: UserCollectionPreview;
  onOpenProject: (mod: Mod) => void;
}) {
  return (
    <section className="border-b border-line pb-5">
      <div className="flex flex-wrap items-center gap-2">
        <span
          aria-hidden="true"
          className="size-3 rounded-full"
          style={{ backgroundColor: collection.color ?? '#1d9bf0' }}
        />
        <h3 className="font-display text-lg font-extrabold text-ink">
          {collection.name}
        </h3>
        <span className="text-sm font-semibold text-muted">
          {collection.projectCount.toLocaleString('en-US')} projects · updated{' '}
          {timeAgo(collection.updatedAt)}
        </span>
      </div>
      {collection.description && (
        <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">
          {collection.description}
        </p>
      )}
      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
        {collection.projects.map((project) => {
          const mod = userProjectToMod(project);
          return (
            <ModCard
              key={project.slug}
              mod={mod}
              layout="list"
              onOpen={onOpenProject}
            />
          );
        })}
      </div>
    </section>
  );
}

function UserProfileSkeleton() {
  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-5 sm:px-6">
      <div className="border-b border-line pb-6">
        <div className="flex gap-5">
          <div className="size-20 animate-pulse rounded-xl bg-surface-2" />
          <div className="flex-1">
            <div className="h-8 w-56 animate-pulse rounded bg-surface-2" />
            <div className="mt-3 h-4 w-40 animate-pulse rounded bg-surface-2" />
            <div className="mt-4 h-4 w-full max-w-2xl animate-pulse rounded bg-surface-2" />
          </div>
        </div>
      </div>
      <div className="mt-8 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="h-28 animate-pulse rounded bg-surface-2" />
        <div className="h-28 animate-pulse rounded bg-surface-2" />
      </div>
    </main>
  );
}
