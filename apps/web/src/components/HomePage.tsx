import { ModderyMark } from './icons.tsx';
import { AuthControls } from './AuthControls.tsx';

export function HomePage({ onDiscover }: { onDiscover: () => void }) {
  return (
    <div className="min-h-dvh bg-bg">
      <header className="sticky top-0 z-30 border-b border-line bg-bg pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-14 w-full max-w-[1280px] items-center gap-4 px-4 sm:px-6">
          <a href="/" className="flex shrink-0 items-center gap-2.5">
            <ModderyMark className="size-8 text-accent-icon" />
            <span className="font-display text-xl font-extrabold lowercase text-ink">
              moddery
            </span>
          </a>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onDiscover}
              className="inline-flex h-9 items-center rounded-lg bg-accent px-3 text-sm font-bold text-white transition-colors hover:bg-accent-strong"
            >
              Explore
            </button>
            <AuthControls />
          </div>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100dvh-3.5rem)] w-full max-w-[1280px] flex-col justify-center px-4 pb-24 sm:px-6">
        <h1 className="max-w-3xl font-display text-4xl font-extrabold leading-tight text-ink sm:text-5xl">
          An open home for{' '}
          <span className="text-accent-icon">Minecraft projects</span>.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-muted">
          Publish, discover, and preserve mods, plugins, and packs — fast,
          independent, and built to stay open.
        </p>
        <div className="mt-7">
          <button
            type="button"
            onClick={onDiscover}
            className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-bold text-white transition-colors hover:bg-accent-strong"
          >
            Explore projects
          </button>
        </div>
      </main>
    </div>
  );
}
