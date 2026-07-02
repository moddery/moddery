import { type FormEvent, useState } from 'react';

import {
  recordFileScan,
  scanVersionFile,
  type DashboardProject,
} from '../../../lib/dashboard.ts';
import { CollapsiblePanel } from '../../ui/dashboard/index.ts';
import { FileScanResultFields } from './file-scan/FileScanResultFields.tsx';
import { FileScanSelectedFileSummary } from './file-scan/FileScanSelectedFileSummary.tsx';
import { FileScanSelectors } from './file-scan/FileScanSelectors.tsx';
import { useFileScanFormState } from './file-scan/useFileScanFormState.ts';
import { nullableText } from './shared.tsx';

export function FileScanForm({ projects }: { projects: DashboardProject[] }) {
  const form = useFileScanFormState(projects);
  const [busyAction, setBusyAction] = useState<'manual' | 'scan' | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const busy = busyAction !== null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (form.selectedFile === undefined) return;

    setBusyAction('manual');
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
      setBusyAction(null);
    }
  }

  async function runScanner() {
    if (form.selectedFile === undefined) return;

    setBusyAction('scan');
    setMessage(null);
    try {
      const version = await scanVersionFile(form.selectedFile.id);
      await form.versionsQuery.refetch();
      setMessage(`ClamAV scan recorded for ${version.name}.`);
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : 'Scan failed');
    } finally {
      setBusyAction(null);
    }
  }

  if (projects.length === 0) return null;

  return (
    <CollapsiblePanel
      title="Record file scan"
      description="Attach a moderation scan result to a version file."
    >
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
            {fileScanSubmitLabel(busyAction === 'manual')}
          </button>
          <button
            type="button"
            disabled={busy || form.selectedFile === undefined}
            onClick={() => void runScanner()}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-line px-3 text-sm font-bold text-ink transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            {fileScanRunLabel(busyAction === 'scan')}
          </button>
          {message && (
            <span className="text-sm font-semibold text-muted">{message}</span>
          )}
        </div>
      </form>
    </CollapsiblePanel>
  );
}

export function fileScanSubmitLabel(busy: boolean) {
  return busy ? 'Recording...' : 'Record scan';
}

export function fileScanRunLabel(busy: boolean) {
  return busy ? 'Scanning...' : 'Run ClamAV scan';
}
