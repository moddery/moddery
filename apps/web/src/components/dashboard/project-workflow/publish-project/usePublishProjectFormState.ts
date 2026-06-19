import { useState } from 'react';

import { type CreateProjectInput } from '../../../../lib/dashboard.ts';
import { normalizeCreateProjectInput } from './publish-project-input.ts';

export function usePublishProjectFormState() {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#1d9bf0');
  const [iconUrl, setIconUrl] = useState('');
  const [kind, setKind] = useState<CreateProjectInput['kind']>('MOD');
  const [loaders, setLoaders] = useState<string[]>(['fabric']);
  const [gameVersions, setGameVersions] = useState<string[]>(['1.21.6']);
  const [categories, setCategories] = useState<string[]>(['utility']);

  function changeKind(value: CreateProjectInput['kind']) {
    setKind(value);
    setCategories([]);
  }

  const fields = {
    categories,
    color,
    description,
    gameVersions,
    iconUrl,
    kind,
    loaders,
    slug,
    summary,
    title,
    onCategoriesChange: setCategories,
    onColorChange: setColor,
    onDescriptionChange: setDescription,
    onGameVersionsChange: setGameVersions,
    onIconUrlChange: setIconUrl,
    onKindChange: changeKind,
    onLoadersChange: setLoaders,
    onSlugChange: setSlug,
    onSummaryChange: setSummary,
    onTitleChange: setTitle,
  };

  function buildInput(): CreateProjectInput {
    return normalizeCreateProjectInput({
      categories,
      color,
      description,
      gameVersions,
      iconUrl,
      kind,
      loaders,
      slug,
      summary,
      title,
    });
  }

  function reset() {
    setTitle('');
    setSlug('');
    setSummary('');
    setDescription('');
    setColor('#1d9bf0');
    setIconUrl('');
  }

  return { buildInput, fields, reset };
}
