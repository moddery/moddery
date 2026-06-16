import { Inject, Injectable } from '@nestjs/common';
import { Client } from '@opensearch-project/opensearch';

import { SEARCH_CLIENT } from './search.constants.js';
import { type SearchProjectDocument } from './dto/search-project.document.js';

const PROJECTS_INDEX = 'projects';

@Injectable()
export class SearchService {
  constructor(@Inject(SEARCH_CLIENT) private readonly client: Client) {}

  async configureProjectIndex(): Promise<void> {
    const exists = await this.client.indices.exists({ index: PROJECTS_INDEX });

    if (exists.body) {
      return;
    }

    await this.client.indices.create({
      body: {
        mappings: {
          properties: {
            categories: { type: 'keyword' },
            description: { type: 'text' },
            downloads: { type: 'integer' },
            kind: { type: 'keyword' },
            loaders: { type: 'keyword' },
            slug: { type: 'keyword' },
            summary: { type: 'text' },
            title: { type: 'text' },
          },
        },
      },
      index: PROJECTS_INDEX,
    });
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

  async searchProjects(query: string) {
    return this.client.search({
      body: {
        query: {
          multi_match: {
            fields: ['title^3', 'summary^2', 'description'],
            query,
          },
        },
      },
      index: PROJECTS_INDEX,
    });
  }
}
