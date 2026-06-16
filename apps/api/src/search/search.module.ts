import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@opensearch-project/opensearch';

import { SEARCH_CLIENT } from './search.constants.js';
import { SearchService } from './search.service.js';

@Module({
  exports: [SearchService],
  providers: [
    {
      provide: SEARCH_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService): Client => {
        const username = config.get<string>('search.username');
        const password = config.get<string>('search.password');

        return new Client({
          auth:
            username === undefined || password === undefined
              ? undefined
              : { password, username },
          node: config.getOrThrow<string>('search.node'),
        });
      },
    },
    SearchService,
  ],
})
export class SearchModule {}
