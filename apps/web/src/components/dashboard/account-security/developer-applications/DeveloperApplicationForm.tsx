import { DashboardField } from '../shared.tsx';
import { type DeveloperApplicationsState } from './useDeveloperApplicationsState.ts';

export function DeveloperApplicationForm({
  state,
}: {
  state: DeveloperApplicationsState;
}) {
  return (
    <form onSubmit={state.submit} className="mt-4 grid gap-3 lg:grid-cols-2">
      <DashboardField
        required
        label="Application name"
        value={state.name}
        onChange={state.setName}
      />
      <DashboardField
        label="Homepage URL"
        placeholder="https://example.com"
        value={state.homepageUrl}
        onChange={state.setHomepageUrl}
      />
      <DashboardField
        label="Scopes"
        value={state.scopes}
        onChange={state.setScopes}
      />
      <DashboardField
        required
        label="Redirect URIs"
        value={state.redirectUris}
        onChange={state.setRedirectUris}
      />
      <label className="grid gap-1 text-sm font-bold text-ink lg:col-span-2">
        Description
        <textarea
          value={state.description}
          rows={3}
          onChange={(event) => state.setDescription(event.target.value)}
          className="rounded-lg border border-line bg-control px-3 py-2 text-sm font-medium text-ink outline-none transition-colors placeholder:text-faint hover:border-line-strong focus-visible:border-accent focus-visible:bg-control-hover"
        />
      </label>
      <div className="flex flex-wrap items-center gap-3 lg:col-span-2">
        <button
          disabled={state.busy}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-extrabold text-accent-ink transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
        >
          Create application
        </button>
        {state.message && (
          <span className="text-sm font-semibold text-muted">
            {state.message}
          </span>
        )}
      </div>
    </form>
  );
}
