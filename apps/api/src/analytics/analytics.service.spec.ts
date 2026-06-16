import { describe, expect, test } from 'bun:test';

import { AnalyticsService } from './analytics.service.js';

describe(AnalyticsService.name, () => {
  test('creates analytics table when ensuring schema', async () => {
    const commands: string[] = [];
    const service = new AnalyticsService({
      command: ({ query }: { query: string }) => {
        commands.push(query);
        return Promise.resolve();
      },
    } as never);

    await service.ensureSchema();

    expect(commands[0]).toContain('CREATE TABLE IF NOT EXISTS project_events');
  });
});
