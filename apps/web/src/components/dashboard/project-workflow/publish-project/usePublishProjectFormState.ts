import { useState } from 'react';

import { type CreateProjectInput } from '../../../../lib/dashboard.ts';
import { splitList } from '../shared.tsx';

export function usePublishProjectFormState() {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [kind, setKind] = useState<CreateProjectInput['kind']>('MOD');
  const [loaders, setLoaders] = useState('fabric');
  const [gameVersions, setGameVersions] = useState('1.21.6');
  const [categories, setCategories] = useState('utility');

  const fields = {
    categories,
    description,
    gameVersions,
    kind,
    loaders,
    slug,
    summary,
    title,
    onCategoriesChange: setCategories,
    onDescriptionChange: setDescription,
    onGameVersionsChange: setGameVersions,
    onKindChange: setKind,
    onLoadersChange: setLoaders,
    onSlugChange: setSlug,
    onSummaryChange: setSummary,
    onTitleChange: setTitle,
  };

  function buildInput(): CreateProjectInput {
    return {
      categories: splitList(categories),
      description,
      gameVersions: splitList(gameVersions),
      kind,
      loaders: splitList(loaders),
      slug,
      summary,
      title,
    };
  }

  function reset() {
    setTitle('');
    setSlug('');
    setSummary('');
    setDescription('');
  }

  return { buildInput, fields, reset };
}
