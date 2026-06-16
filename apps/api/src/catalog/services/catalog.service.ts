import { Injectable } from '@nestjs/common';
import { type ProjectSummaryContract } from '@moddery/shared';

import { type CatalogQueryInput } from '../dto/catalog-query.input.js';

const catalogSeed = [
  {
    downloads: 128_430,
    id: 'project_sodium_plus',
    kind: 'MOD',
    slug: 'sodium-plus',
    status: 'APPROVED',
    summary: 'A fast rendering optimization mod scaffold entry.',
    title: 'Sodium Plus',
    updatedAt: '2026-06-15T12:00:00.000Z',
  },
  {
    downloads: 42_100,
    id: 'project_vanilla_tuned',
    kind: 'MODPACK',
    slug: 'vanilla-tuned',
    status: 'APPROVED',
    summary: 'A lightweight performance-first modpack scaffold entry.',
    title: 'Vanilla Tuned',
    updatedAt: '2026-06-12T12:00:00.000Z',
  },
] as const satisfies readonly ProjectSummaryContract[];

@Injectable()
export class CatalogService {
  findProjects(query: CatalogQueryInput = {}): ProjectSummaryContract[] {
    const search = query.search?.trim().toLowerCase();

    if (search === undefined || search.length === 0) {
      return [...catalogSeed];
    }

    return catalogSeed.filter(
      (project) =>
        project.title.toLowerCase().includes(search) ||
        project.summary.toLowerCase().includes(search) ||
        project.slug.includes(search),
    );
  }

  findProjectBySlug(slug: string): ProjectSummaryContract | undefined {
    return catalogSeed.find((project) => project.slug === slug);
  }
}
