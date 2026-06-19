import { Injectable } from '@nestjs/common';

import { AnalyticsService } from '../analytics/analytics.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { RedisService } from '../redis/redis.service.js';
import { SearchService } from '../search/search.service.js';

export type HealthCheckName = 'analytics' | 'database' | 'redis' | 'search';

export interface HealthCheckResult {
  readonly durationMs: number;
  readonly name: HealthCheckName;
  readonly status: 'down' | 'up';
}

export interface ReadinessResult {
  readonly checks: readonly HealthCheckResult[];
  readonly status: 'not_ready' | 'ready';
}

@Injectable()
export class HealthService {
  constructor(
    private readonly analytics: AnalyticsService,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly search: SearchService,
  ) {}

  async readiness(): Promise<ReadinessResult> {
    const checks = await Promise.all([
      this.check('database', () => this.prisma.$queryRaw`SELECT 1`),
      this.check('redis', () => this.redis.ping()),
      this.check('search', () => this.search.ping()),
      this.check('analytics', () => this.analytics.ping()),
    ]);

    return {
      checks,
      status: checks.every((check) => check.status === 'up')
        ? 'ready'
        : 'not_ready',
    };
  }

  private async check(
    name: HealthCheckName,
    probe: () => Promise<unknown>,
  ): Promise<HealthCheckResult> {
    const startedAt = performance.now();

    try {
      await probe();
      return { durationMs: elapsedMs(startedAt), name, status: 'up' };
    } catch {
      return { durationMs: elapsedMs(startedAt), name, status: 'down' };
    }
  }
}

function elapsedMs(startedAt: number): number {
  return Math.max(0, Math.round(performance.now() - startedAt));
}
