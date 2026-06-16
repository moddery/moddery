import { Inject, Injectable } from '@nestjs/common';
import { type ClickHouseClient } from '@clickhouse/client';

import { CLICKHOUSE_CLIENT } from './analytics.constants.js';

@Injectable()
export class AnalyticsService {
  constructor(
    @Inject(CLICKHOUSE_CLIENT) private readonly client: ClickHouseClient,
  ) {}

  async ensureSchema(): Promise<void> {
    await this.client.command({
      query: `
        CREATE TABLE IF NOT EXISTS project_events (
          project_id String,
          version_id Nullable(String),
          event_type LowCardinality(String),
          country_code Nullable(String),
          user_agent Nullable(String),
          occurred_at DateTime64(3)
        )
        ENGINE = MergeTree
        PARTITION BY toYYYYMM(occurred_at)
        ORDER BY (project_id, event_type, occurred_at)
      `,
    });
  }
}
