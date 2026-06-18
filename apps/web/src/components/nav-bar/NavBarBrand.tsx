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
      <img src="/favicon.svg" alt="Moddery logo" className="size-8" />
      <span className="font-display text-xl font-extrabold lowercase text-ink">
        moddery
      </span>
    </a>
  );
}
