import { DashboardField } from '../shared.tsx';
import { type ProjectMetadataFieldsProps } from '../ProjectMetadataFields.types.ts';

export function ProjectLinkFields({
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
        label="Source URL"
        value={sourceUrl}
        onChange={onSourceUrlChange}
      />
      <DashboardField
        label="Issues URL"
        value={issuesUrl}
        onChange={onIssuesUrlChange}
      />
      <DashboardField
        label="Wiki URL"
        value={wikiUrl}
        onChange={onWikiUrlChange}
      />
      <DashboardField
        label="Discord URL"
        value={discordUrl}
        onChange={onDiscordUrlChange}
      />
    </div>
  );
}
