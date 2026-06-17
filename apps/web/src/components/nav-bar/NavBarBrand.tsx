import { ModderyMark } from '../icons.tsx';

export function NavBarBrand({ onHome }: { onHome: () => void }) {
  return (
    <a
      href="/"
      onClick={(event) => {
        event.preventDefault();
        onHome();
      }}
      className="flex shrink-0 items-center gap-2.5"
    >
      <ModderyMark className="size-8 text-accent-icon" />
      <span className="font-display text-xl font-extrabold lowercase text-ink">
        moddery
      </span>
    </a>
  );
}
