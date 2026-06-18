import { Inject, Injectable, type OnModuleInit } from '@nestjs/common';
import { Client } from '@opensearch-project/opensearch';

import { SEARCH_CLIENT } from './search.constants.js';
import { type SearchProjectDocument } from './dto/search-project.document.js';

const PROJECTS_INDEX = 'projects';

export interface SearchProjectsParams {
  readonly limit?: number;
  readonly offset?: number;
  readonly search?: string;
  readonly sort?: string;
  readonly tags?: readonly string[];
}

export interface SearchProjectsResult {
  readonly ids: readonly string[];
  readonly total: number;
}

@Injectable()
export class SearchService implements OnModuleInit {
  constructor(@Inject(SEARCH_CLIENT) private readonly client: Client) {}

  async onModuleInit(): Promise<void> {
    await this.configureProjectIndex();
  }

  async configureProjectIndex(): Promise<void> {
    const exists = await this.client.indices.exists({ index: PROJECTS_INDEX });

    if (exists.body) {
      await this.client.indices.putMapping({
        body: projectIndexMapping() as never,
        index: PROJECTS_INDEX,
      });
      return;
    }

    await this.client.indices.create({
      body: {
        mappings: projectIndexMapping() as never,
      },
      index: PROJECTS_INDEX,
    });
  }

  async ping(): Promise<void> {
    await this.client.ping();
  }

  async indexProjects(
    projects: readonly SearchProjectDocument[],
  ): Promise<void> {
    if (projects.length === 0) {
      return;
    }

    await this.client.helpers.bulk({
      datasource: [...projects],
      onDocument: (document) => ({
        index: { _id: document.id, _index: PROJECTS_INDEX },
      }),
    });
  }

  async searchProjects({
    limit = 100,
    offset = 0,
    search,
    sort,
    tags = [],
  }: SearchProjectsParams): Promise<SearchProjectsResult> {
    const response = await this.client.search({
      body: {
        _source: false,
        query: {
          bool: {
            filter: tags.map((tag) => ({ term: { tags: tag } })),
            must: [
              search === undefined || search.trim().length === 0
                ? { match_all: {} }
                : {
                    multi_match: {
                      fields: ['title^3', 'summary^2', 'description'],
                      query: search.trim(),
                    },
                  },
            ],
          },
        },
        from: offset,
        size: limit,
        sort: sortForProjects(sort),
      },
      index: PROJECTS_INDEX,
    });

    const body = response.body as {
      hits: {
        hits: { _id?: string }[];
        total?: number | { value?: number };
      };
    };

    return {
      ids: body.hits.hits.flatMap((hit) =>
        hit._id === undefined ? [] : [hit._id],
      ),
      total: searchTotal(body.hits.total),
    };
  }
}

function searchTotal(total: number | { value?: number } | undefined): number {
  if (typeof total === 'number') return total;

  return total?.value ?? 0;
}

function projectIndexMapping() {
  return {
    properties: {
      categories: { type: 'keyword' },
      color: { type: 'keyword', index: false },
      description: { type: 'text' },
      downloads: { type: 'integer' },
      followers: { type: 'integer' },
      gameVersions: { type: 'keyword' },
      iconUrl: { type: 'keyword', index: false },
      kind: { type: 'keyword' },
      loaders: { type: 'keyword' },
      slug: { type: 'keyword' },
      summary: { type: 'text' },
      tags: { type: 'keyword' },
      title: { type: 'text' },
      titleSort: { type: 'keyword' },
      updatedAt: { type: 'date' },
    },
  };
}

function sortForProjects(sort: string | undefined) {
  if (sort === 'downloads') return [{ downloads: { order: 'desc' as const } }];
  if (sort === 'name') return [{ titleSort: { order: 'asc' as const } }];
  if (sort === 'updated' || sort === 'newest') {
    return [{ updatedAt: { order: 'desc' as const } }];
  }

  return ['_score', { updatedAt: { order: 'desc' as const } }];
}
