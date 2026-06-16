import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { type ClickHouseClient } from '@clickhouse/client';

import { PrismaService } from '../prisma/prisma.service.js';
import { CLICKHOUSE_CLIENT } from './analytics.constants.js';

@Injectable()
export class AnalyticsService {
  constructor(
    @Inject(CLICKHOUSE_CLIENT) private readonly client: ClickHouseClient,
    private readonly prisma: PrismaService,
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
    const [
      totalViews,
      viewsLast30Days,
      downloadsLast30Days,
      viewDays,
      downloadDays,
    ] = await Promise.all([
      this.prisma.projectViewEvent.count({
        where: { projectId: project.id },
      }),
      this.prisma.projectViewEvent.count({
        where: {
          createdAt: { gte: since },
          projectId: project.id,
        },
      }),
      this.prisma.downloadEvent.count({
        where: {
          createdAt: { gte: since },
          projectId: project.id,
        },
      }),
      this.prisma.projectViewEvent.findMany({
        orderBy: { createdAt: 'asc' },
        select: { createdAt: true },
        where: {
          createdAt: { gte: since },
          projectId: project.id,
        },
      }),
      this.prisma.downloadEvent.findMany({
        orderBy: { createdAt: 'asc' },
        select: { createdAt: true },
        where: {
          createdAt: { gte: since },
          projectId: project.id,
        },
      }),
    ]);

    return {
      days: buildDailyBuckets({ downloadDays, since, viewDays }),
      downloadsLast30Days,
      projectSlug: project.slug,
      totalDownloads: project.downloads,
      totalViews,
      viewsLast30Days,
    };
  }

  async recordProjectView(projectSlug: string) {
    const project = await this.prisma.project.findUnique({
      select: {
        id: true,
        slug: true,
      },
      where: { slug: projectSlug },
    });

    if (project === null) {
      throw new NotFoundException('Project not found');
    }

    await this.prisma.projectViewEvent.create({
      data: {
        projectId: project.id,
      },
    });

    return {
      projectId: project.id,
      projectSlug: project.slug,
    };
  }

  async recordDownload(fileId: string) {
    const file = await this.prisma.versionFile.findUnique({
      select: {
        id: true,
        version: {
          select: {
            id: true,
            projectId: true,
          },
        },
      },
      where: { id: fileId },
    });

    if (file === null) {
      throw new NotFoundException('File not found');
    }

    const [project, version] = await this.prisma.$transaction([
      this.prisma.project.update({
        data: { downloads: { increment: 1 } },
        select: { downloads: true, id: true },
        where: { id: file.version.projectId },
      }),
      this.prisma.version.update({
        data: { downloads: { increment: 1 } },
        select: { downloads: true, id: true },
        where: { id: file.version.id },
      }),
      this.prisma.downloadEvent.create({
        data: {
          projectId: file.version.projectId,
          versionId: file.version.id,
        },
      }),
    ]);

    return {
      fileId: file.id,
      projectDownloads: project.downloads,
      projectId: project.id,
      versionDownloads: version.downloads,
      versionId: version.id,
    };
  }
}

function buildDailyBuckets({
  downloadDays,
  since,
  viewDays,
}: {
  downloadDays: { createdAt: Date }[];
  since: Date;
  viewDays: { createdAt: Date }[];
}) {
  const buckets = new Map<
    string,
    {
      date: string;
      downloads: number;
      views: number;
    }
  >();

  for (let offset = 16; offset >= 0; offset -= 1) {
    const date = dateKey(addDays(new Date(), -offset));
    buckets.set(date, { date, downloads: 0, views: 0 });
  }

  for (const view of viewDays) {
    const key = dateKey(view.createdAt);
    const bucket = buckets.get(key);
    if (bucket !== undefined) bucket.views += 1;
  }

  for (const download of downloadDays) {
    const key = dateKey(download.createdAt);
    const bucket = buckets.get(key);
    if (bucket !== undefined) bucket.downloads += 1;
  }

  return [...buckets.values()].filter(
    (bucket) => new Date(`${bucket.date}T00:00:00.000Z`) >= since,
  );
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}
