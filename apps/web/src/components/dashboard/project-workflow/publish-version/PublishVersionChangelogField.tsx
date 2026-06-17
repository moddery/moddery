import { type PublishVersionFieldsProps } from './PublishVersionFields.types.ts';

type ChangelogFieldProps = Pick<
  PublishVersionFieldsProps,
  'changelog' | 'onChangelogChange'
>;

export function PublishVersionChangelogField({
  changelog,
  onChangelogChange,
}: ChangelogFieldProps) {
  return (
    <label className="grid gap-1 text-sm font-bold text-ink">
      Changelog
      <textarea
        value={changelog}
        onChange={(event) => onChangelogChange(event.target.value)}
        className="min-h-24 rounded-lg border border-line bg-control px-3 py-2 text-sm font-medium text-ink outline-none transition-colors placeholder:text-faint hover:border-line-strong focus-visible:border-accent focus-visible:bg-control-hover"
      />
    </label>
  );
}
