import { type FormEvent, useState } from 'react';

import {
  recordFileScan,
  type DashboardProject,
} from '../../../lib/dashboard.ts';
import { FileScanResultFields } from './file-scan/FileScanResultFields.tsx';
import { FileScanSelectedFileSummary } from './file-scan/FileScanSelectedFileSummary.tsx';
import { FileScanSelectors } from './file-scan/FileScanSelectors.tsx';
import { useFileScanFormState } from './file-scan/useFileScanFormState.ts';
import { nullableText } from './shared.tsx';

export function FileScanForm({ projects }: { projects: DashboardProject[] }) {
  const form = useFileScanFormState(projects);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (form.selectedFile === undefined) return;

    setBusy(true);
    setMessage(null);
    try {
      const version = await recordFileScan({
        details: nullableText(form.details),
        fileId: form.selectedFile.id,
        status: form.status,
        verdict: nullableText(form.verdict),
      });
      await form.versionsQuery.refetch();
      setMessage(`Recorded scan for ${version.name}.`);
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : 'Scan failed');
    } finally {
      setBusy(false);
    }
  }

  if (projects.length === 0) return null;

  return (
    <section className="mt-8 border-b border-line pb-8">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-xl font-extrabold text-ink">
          Record file scan
        </h2>
        <p className="text-sm leading-6 text-muted">
          Attach a moderation scan result to a version file.
        </p>
      </div>

      <form
        onSubmit={(event) => void submit(event)}
        className="mt-4 grid gap-3"
      >
        <FileScanSelectors
          disabled={busy}
          fileId={form.fileId}
          files={form.files}
          projectSlug={form.projectSlug}
          projects={projects}
          selectedVersion={form.selectedVersion}
          versions={form.versions}
          versionId={form.versionId}
          onFileChange={form.onFileChange}
          onProjectChange={form.onProjectChange}
          onVersionChange={form.onVersionChange}
        />
        <FileScanSelectedFileSummary file={form.selectedFile} />
        <FileScanResultFields
          details={form.details}
          disabled={busy}
          status={form.status}
          verdict={form.verdict}
          onDetailsChange={form.onDetailsChange}
          onStatusChange={form.onStatusChange}
          onVerdictChange={form.onVerdictChange}
        />
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={busy || form.selectedFile === undefined}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-accent px-3 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            {fileScanSubmitLabel(busy)}
          </button>
          {message && (
            <span className="text-sm font-semibold text-muted">{message}</span>
          )}
        </div>
      </form>
    </section>
  );
}

export function fileScanSubmitLabel(busy: boolean) {
  return busy ? 'Recording...' : 'Record scan';
}
