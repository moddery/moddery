import { DashboardField } from '../shared.tsx';

export function FileScanResultFields({
  details,
  disabled,
  status,
  verdict,
  onDetailsChange,
  onStatusChange,
  onVerdictChange,
}: {
  details: string;
  disabled?: boolean;
  status: string;
  verdict: string;
  onDetailsChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onVerdictChange: (value: string) => void;
}) {
  return (
    <>
      <div className="grid gap-3 md:grid-cols-2">
        <DashboardField
          disabled={disabled}
          label="Status"
          value={status}
          onChange={onStatusChange}
        />
        <DashboardField
          disabled={disabled}
          label="Verdict"
          value={verdict}
          onChange={onVerdictChange}
        />
      </div>
      <label className="grid gap-1 text-sm font-bold text-ink">
        Details JSON
        <textarea
          disabled={disabled}
          value={details}
          onChange={(event) => onDetailsChange(event.target.value)}
          rows={4}
          className="rounded-lg border border-line bg-control px-3 py-2 text-sm font-medium text-ink outline-none transition-colors hover:border-line-strong focus-visible:border-accent focus-visible:bg-control-hover disabled:cursor-not-allowed disabled:opacity-60"
        />
      </label>
    </>
  );
}
