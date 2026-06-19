import {
  Inject,
  Injectable,
  NotFoundException,
  type OnModuleInit,
} from '@nestjs/common';
import { type ClickHouseClient } from '@clickhouse/client';

import { projectBySlugCacheKey } from '../catalog/services/project-read-model.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { RedisService } from '../redis/redis.service.js';
import { SearchService } from '../search/search.service.js';
import { CLICKHOUSE_CLIENT } from './analytics.constants.js';

@Injectable()
export class AnalyticsService implements OnModuleInit {
  constructor(
    @Inject(CLICKHOUSE_CLIENT) private readonly client: ClickHouseClient,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly search: SearchService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.ensureSchema();
  }

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

  async ping(): Promise<void> {
    const result = await this.client.query({
      format: 'JSONEachRow',
      query: 'SELECT 1 AS ok',
    });
    await result.json();
  }

  async projectAnalytics(projectSlug: string) {
    const project = await this.prisma.project.findUnique({
      select: {
        downloads: true,
        id: true,
        slug: true,
      },
      where: { slug: projectSlug },
    });

    if (project === null) {
      return null;
    }

    const since = startOfUtcDay(addDays(new Date(), -29));
    const [totalRows, dailyRows] = await Promise.all([
      this.analyticsRows<AnalyticsTotalRow>({
        query: `
          SELECT event_type, count() AS events
          FROM project_events
          WHERE project_id = {projectId:String}
          GROUP BY event_type
        `,
        query_params: { projectId: project.id },
      }),
      this.analyticsRows<AnalyticsDailyRow>({
        query: `
          SELECT
            event_type,
            toString(toDate(occurred_at)) AS date,
            count() AS events
          FROM project_events
          WHERE project_id = {projectId:String}
            AND occurred_at >= {since:DateTime64(3)}
          GROUP BY event_type, date
          ORDER BY date ASC
        `,
        query_params: {
          projectId: project.id,
          since: clickHouseDateTime(since),
        },
      }),
    ]);

    const totals = summarizeTotalRows(totalRows);
    const days = buildDailyBuckets({ dailyRows, since });

    return {
      days,
      downloadsLast30Days: sumEvents(dailyRows, 'download'),
      projectSlug: project.slug,
      totalDownloads: project.downloads,
      totalViews: totals.views,
      viewsLast30Days: sumEvents(dailyRows, 'view'),
    };
  }

  async recordProjectView(projectSlug: string) {
    const project = await this.prisma.project.findUnique({
      select: {
        id: true,
        slug: true,
      },
      where: { slug: projectSlug, status: 'APPROVED' },
    });

    if (project === null) {
      throw new NotFoundException('Project not found');
    }

    await this.prisma.projectViewEvent.create({
      data: {
        projectId: project.id,
      },
    });
    await this.recordAnalyticsEvent({
      eventType: 'view',
      projectId: project.id,
      versionId: null,
    });

    return {
      projectId: project.id,
      projectSlug: project.slug,
    };
  }

  async recordDownload(fileId: string) {
    const result = await this.prepareFileDownload(fileId);

    return result.record;
  }

  async prepareFileDownload(fileId: string) {
    const file = await this.prisma.versionFile.findUnique({
      select: {
        id: true,
        url: true,
        version: {
          select: {
            id: true,
            project: {
              select: {
                id: true,
                status: true,
              },
            },
            status: true,
          },
        },
      },
      where: { id: fileId },
    });

    if (
      file?.version.status !== 'APPROVED' ||
      file.version.project.status !== 'APPROVED'
    ) {
      throw new NotFoundException('File not found');
    }

    const [project, version] = await this.prisma.$transaction([
      this.prisma.project.update({
        data: { downloads: { increment: 1 } },
        select: { downloads: true, id: true, slug: true },
        where: { id: file.version.project.id },
      }),
      this.prisma.version.update({
        data: { downloads: { increment: 1 } },
        select: { downloads: true, id: true },
        where: { id: file.version.id },
      }),
      this.prisma.downloadEvent.create({
        data: {
          projectId: file.version.project.id,
          versionId: file.version.id,
        },
      }),
    ]);
    await this.recordAnalyticsEvent({
      eventType: 'download',
      projectId: file.version.project.id,
      versionId: file.version.id,
    });
    await Promise.all([
      this.redis.delete(projectBySlugCacheKey(project.slug)),
      this.search.updateProjectDownloads(project.id, project.downloads),
    ]);

    return {
      record: {
        fileId: file.id,
        projectDownloads: project.downloads,
        projectId: project.id,
        versionDownloads: version.downloads,
        versionId: version.id,
      },
      url: file.url,
    };
  }

  private async analyticsRows<T>(input: {
    query: string;
    query_params: Record<string, string>;
  }): Promise<T[]> {
    const result = await this.client.query({
      format: 'JSONEachRow',
      query: input.query,
      query_params: input.query_params,
    });

    return result.json<T>();
  }

  private async recordAnalyticsEvent({
    eventType,
    projectId,
    versionId,
  }: {
    eventType: AnalyticsEventType;
    projectId: string;
    versionId: string | null;
  }): Promise<void> {
    await this.client.insert({
      format: 'JSONEachRow',
      table: 'project_events',
      values: [
        {
          country_code: null,
          event_type: eventType,
          occurred_at: clickHouseDateTime(new Date()),
          project_id: projectId,
          user_agent: null,
          version_id: versionId,
        },
      ],
    });
  }
}

function buildDailyBuckets({
  dailyRows,
  since,
}: {
  dailyRows: AnalyticsDailyRow[];
  since: Date;
}) {
  const buckets = new Map<
    string,
    {
      date: string;
      downloads: number;
      views: number;
    }
  >();

  for (let offset = 29; offset >= 0; offset -= 1) {
    const date = dateKey(addDays(new Date(), -offset));
    buckets.set(date, { date, downloads: 0, views: 0 });
  }

  for (const row of dailyRows) {
    const key = row.date;
    const bucket = buckets.get(key);
    if (bucket === undefined) continue;
    if (row.event_type === 'view') bucket.views += parseEventCount(row.events);
    if (row.event_type === 'download') {
      bucket.downloads += parseEventCount(row.events);
    }
  }

  return [...buckets.values()].filter(
    (bucket) => new Date(`${bucket.date}T00:00:00.000Z`) >= since,
  );
}

function parseEventCount(value: number | string): number {
  return typeof value === 'number' ? value : Number.parseInt(value, 10);
}

function sumEvents(
  rows: readonly { event_type: AnalyticsEventType; events: number | string }[],
  eventType: AnalyticsEventType,
) {
  return rows
    .filter((row) => row.event_type === eventType)
    .reduce((total, row) => total + parseEventCount(row.events), 0);
}

function summarizeTotalRows(rows: AnalyticsTotalRow[]) {
  return {
    downloads: sumEvents(rows, 'download'),
    views: sumEvents(rows, 'view'),
  };
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function clickHouseDateTime(date: Date): string {
  return date.toISOString().replace('T', ' ').replace('Z', '');
}

function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

type AnalyticsEventType = 'download' | 'view';

interface AnalyticsDailyRow {
  readonly date: string;
  readonly event_type: AnalyticsEventType;
  readonly events: number | string;
}

interface AnalyticsTotalRow {
  readonly event_type: AnalyticsEventType;
  readonly events: number | string;
}
