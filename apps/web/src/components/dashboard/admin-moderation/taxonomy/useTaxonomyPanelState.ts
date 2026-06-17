import { useQuery } from '@tanstack/react-query';
import { type ProjectKind } from '@moddery/shared';
import { useState } from 'react';

import {
  fetchCategoryTaxonomy,
  fetchGameVersionTaxonomy,
  fetchLicenseTaxonomy,
  upsertCategory,
  upsertGameVersion,
  upsertLicense,
  type CategoryTaxonomy,
  type LicenseTaxonomy,
} from '../../../../lib/dashboard.ts';
import { nullableText } from '../shared.tsx';

interface PreventableSubmitEvent {
  preventDefault: () => void;
}

export function useTaxonomyPanelState() {
  const [categorySlug, setCategorySlug] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [categoryKind, setCategoryKind] = useState<ProjectKind | ''>('');
  const [gameVersion, setGameVersion] = useState('');
  const [gameVersionActive, setGameVersionActive] = useState(true);
  const [licenseKey, setLicenseKey] = useState('');
  const [licenseName, setLicenseName] = useState('');
  const [licenseUrl, setLicenseUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const categoriesQuery = useQuery({
    queryFn: ({ signal }) => fetchCategoryTaxonomy(signal),
    queryKey: ['dashboard', 'taxonomy-categories'],
  });
  const gameVersionsQuery = useQuery({
    queryFn: ({ signal }) => fetchGameVersionTaxonomy(signal),
    queryKey: ['dashboard', 'taxonomy-game-versions'],
  });
  const licensesQuery = useQuery({
    queryFn: ({ signal }) => fetchLicenseTaxonomy(signal),
    queryKey: ['dashboard', 'taxonomy-licenses'],
  });

  function fillCategory(category: CategoryTaxonomy) {
    setCategorySlug(category.slug);
    setCategoryName(category.name);
    setCategoryDescription(category.description ?? '');
    setCategoryKind(category.projectKind ?? '');
    setMessage(null);
  }

  function fillLicense(license: LicenseTaxonomy) {
    setLicenseKey(license.key);
    setLicenseName(license.name);
    setLicenseUrl(license.url ?? '');
    setMessage(null);
  }

  async function submitCategory(event: PreventableSubmitEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);

    try {
      const category = await upsertCategory({
        description: nullableText(categoryDescription),
        name: categoryName,
        projectKind: categoryKind === '' ? null : categoryKind,
        slug: categorySlug,
      });
      await categoriesQuery.refetch();
      setMessage(`Saved category ${category.slug}.`);
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : 'Category failed');
    } finally {
      setBusy(false);
    }
  }

  async function submitGameVersion(event: PreventableSubmitEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);

    try {
      const saved = await upsertGameVersion({
        isActive: gameVersionActive,
        version: gameVersion,
      });
      await gameVersionsQuery.refetch();
      setMessage(`Saved game version ${saved.version}.`);
    } catch (caught) {
      setMessage(
        caught instanceof Error ? caught.message : 'Game version failed',
      );
    } finally {
      setBusy(false);
    }
  }

  async function submitLicense(event: PreventableSubmitEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);

    try {
      const saved = await upsertLicense({
        key: licenseKey,
        name: licenseName,
        url: nullableText(licenseUrl),
      });
      await licensesQuery.refetch();
      setMessage(`Saved license ${saved.key}.`);
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : 'License failed');
    } finally {
      setBusy(false);
    }
  }

  return {
    busy,
    categories: categoriesQuery.data ?? [],
    categoryDescription,
    categoryKind,
    categoryName,
    categorySlug,
    fillCategory,
    fillLicense,
    gameVersion,
    gameVersionActive,
    gameVersions: gameVersionsQuery.data ?? [],
    licenseKey,
    licenseName,
    licenseUrl,
    licenses: licensesQuery.data ?? [],
    message,
    setCategoryDescription,
    setCategoryKind,
    setCategoryName,
    setCategorySlug,
    setGameVersion,
    setGameVersionActive,
    setLicenseKey,
    setLicenseName,
    setLicenseUrl,
    submitCategory,
    submitGameVersion,
    submitLicense,
  };
}
