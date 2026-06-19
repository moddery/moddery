import { DashboardField } from '../shared.tsx';
import { type ProjectMetadataFieldsProps } from '../ProjectMetadataFields.types.ts';

export function ProjectLinkFields({
  disabled,
  discordUrl,
  issuesUrl,
  onDiscordUrlChange,
  onIssuesUrlChange,
  onSourceUrlChange,
  onWikiUrlChange,
  sourceUrl,
  wikiUrl,
}: Pick<
  ProjectMetadataFieldsProps,
  | 'discordUrl'
  | 'disabled'
  | 'issuesUrl'
  | 'onDiscordUrlChange'
  | 'onIssuesUrlChange'
  | 'onSourceUrlChange'
  | 'onWikiUrlChange'
  | 'sourceUrl'
  | 'wikiUrl'
>) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <DashboardField
        disabled={disabled}
        label="Source URL"
        value={sourceUrl}
        onChange={onSourceUrlChange}
      />
      <DashboardField
        disabled={disabled}
        label="Issues URL"
        value={issuesUrl}
        onChange={onIssuesUrlChange}
      />
      <DashboardField
        disabled={disabled}
        label="Wiki URL"
        value={wikiUrl}
        onChange={onWikiUrlChange}
      />
      <DashboardField
        disabled={disabled}
        label="Discord URL"
        value={discordUrl}
        onChange={onDiscordUrlChange}
      />
    </div>
  );
}
