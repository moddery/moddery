import { Component, type ErrorInfo, type ReactNode } from 'react';

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type AppErrorBoundaryState = {
  error: Error | null;
};

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  override state: AppErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Unhandled app render error', {
      componentStack: info.componentStack,
      message: error.message,
    });
  }

  override render() {
    if (this.state.error === null) {
      return this.props.children;
    }

    return (
      <main className="grid min-h-dvh place-items-center bg-bg px-4">
        <section className="w-full max-w-xl rounded-lg border border-line bg-surface p-6">
          <p className="text-sm font-bold uppercase tracking-wide text-muted">
            Application error
          </p>
          <h1 className="mt-2 font-display text-2xl font-extrabold text-ink">
            Something went wrong.
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            {appErrorMessage(this.state.error)}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-bold text-white transition-colors hover:bg-accent-strong"
          >
            Reload
          </button>
        </section>
      </main>
    );
  }
}

export function appErrorMessage(error: Error): string {
  const message = error.message.trim();

  if (message.length === 0) {
    return 'Reload the app and try again.';
  }

  return message;
}
