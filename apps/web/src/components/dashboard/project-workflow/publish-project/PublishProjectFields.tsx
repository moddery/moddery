import { type PublishProjectFieldsProps } from './PublishProjectFields.types.ts';
import { PublishProjectIdentityFields } from './PublishProjectIdentityFields.tsx';
import { PublishProjectTaxonomyFields } from './PublishProjectTaxonomyFields.tsx';

export function PublishProjectFields(props: PublishProjectFieldsProps) {
  return (
    <>
      <PublishProjectIdentityFields
        color={props.color}
        description={props.description}
        slug={props.slug}
        summary={props.summary}
        title={props.title}
        onColorChange={props.onColorChange}
        onDescriptionChange={props.onDescriptionChange}
        onSlugChange={props.onSlugChange}
        onSummaryChange={props.onSummaryChange}
        onTitleChange={props.onTitleChange}
      />
      <PublishProjectTaxonomyFields
        categories={props.categories}
        gameVersions={props.gameVersions}
        kind={props.kind}
        loaders={props.loaders}
        onCategoriesChange={props.onCategoriesChange}
        onGameVersionsChange={props.onGameVersionsChange}
        onKindChange={props.onKindChange}
        onLoadersChange={props.onLoadersChange}
      />
    </>
  );
}
