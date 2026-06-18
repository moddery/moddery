import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class ReportModerationNotesService {
  constructor(private readonly prisma: PrismaService) {}

  async findProjectModerationNotes(
    projectSlug: string,
    {
      limit = 25,
      offset = 0,
    }: {
      limit?: number;
      offset?: number;
    } = {},
  ) {
    const project = await this.prisma.project.findUnique({
      select: { id: true },
      where: { slug: projectSlug },
    });

    if (project === null) {
      throw new NotFoundException('Project not found');
    }

    const where = { projectId: project.id };
    const skip = clampInteger(offset, 0, 10_000);
    const take = clampInteger(limit, 1, 100);
    const [totalHits, notes] = await Promise.all([
      this.prisma.moderationNote.count({ where }),
      this.prisma.moderationNote.findMany({
        orderBy: [{ createdAt: 'desc' }],
        select: moderationNoteSelect(),
        skip,
        take,
        where,
      }),
    ]);

    return {
      notes,
      totalHits,
    };
  }

  async findProjectModerationNoteList(projectSlug: string) {
    const result = await this.findProjectModerationNotes(projectSlug);

    return result.notes;
  }

  async findUserModerationNotes(
    username: string,
    {
      limit = 25,
      offset = 0,
    }: {
      limit?: number;
      offset?: number;
    } = {},
  ) {
    const user = await this.prisma.user.findFirst({
      select: { id: true },
      where: { username: { equals: username, mode: 'insensitive' } },
    });

    if (user === null) {
      throw new NotFoundException('User not found');
    }

    const where = { userId: user.id };
    const skip = clampInteger(offset, 0, 10_000);
    const take = clampInteger(limit, 1, 100);
    const [totalHits, notes] = await Promise.all([
      this.prisma.moderationNote.count({ where }),
      this.prisma.moderationNote.findMany({
        orderBy: [{ createdAt: 'desc' }],
        select: moderationNoteSelect(),
        skip,
        take,
        where,
      }),
    ]);

    return {
      notes,
      totalHits,
    };
  }

  async findUserModerationNoteList(username: string) {
    const result = await this.findUserModerationNotes(username);

    return result.notes;
  }

  async createProjectModerationNote({
    authorId,
    body,
    projectSlug,
  }: {
    authorId: string;
    body: string;
    projectSlug: string;
  }) {
    const text = requiredBody(body);
    const project = await this.prisma.project.findUnique({
      select: { id: true },
      where: { slug: projectSlug },
    });

    if (project === null) {
      throw new NotFoundException('Project not found');
    }

    return this.prisma.moderationNote.create({
      data: {
        authorId,
        body: text,
        projectId: project.id,
      },
      select: moderationNoteSelect(),
    });
  }

  async createUserModerationNote({
    authorId,
    body,
    username,
  }: {
    authorId: string;
    body: string;
    username: string;
  }) {
    const text = requiredBody(body);
    const user = await this.prisma.user.findFirst({
      select: { id: true },
      where: { username: { equals: username, mode: 'insensitive' } },
    });

    if (user === null) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.moderationNote.create({
      data: {
        authorId,
        body: text,
        userId: user.id,
      },
      select: moderationNoteSelect(),
    });
  }
}

function clampInteger(value: number, min: number, max: number): number {
  if (!Number.isInteger(value)) return min;

  return Math.min(max, Math.max(min, value));
}

function moderationNoteSelect() {
  return {
    author: {
      select: {
        displayName: true,
        id: true,
        username: true,
      },
    },
    body: true,
    createdAt: true,
    id: true,
    projectId: true,
    updatedAt: true,
    userId: true,
  };
}

function requiredBody(body: string): string {
  const text = body.trim();
  if (text.length === 0) {
    throw new BadRequestException('Note body is required');
  }

  return text;
}
