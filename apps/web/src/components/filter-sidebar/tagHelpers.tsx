import { type ReactNode } from 'react';

import { categoryLabel, loaderLabel } from '../Chips.tsx';
import { LoaderGlyph, categoryIcon } from '../icons.tsx';
import { type TagFacetOption } from './types.ts';

export function tagKey(tag: TagFacetOption): string {
  return `${tag.kind}:${tag.value}`;
}

export function tagLabel(tag: TagFacetOption): string {
  if (tag.label) return tag.label;
  if (tag.kind === 'category') return categoryLabel(tag.value);
  if (tag.kind === 'loader') return loaderLabel(tag.value);
  return tag.value;
}

export function tagIcon(tag: TagFacetOption): ReactNode {
  if (tag.kind === 'category') {
    const Icon = categoryIcon(tag.value);
    return <Icon className="size-4 text-accent-icon" />;
  }

  if (tag.kind === 'loader') {
    return <LoaderGlyph className="size-4 text-accent-icon" />;
  }

  return undefined;
}
