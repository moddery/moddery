import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service.js';
import { type AddProjectToCollectionInput } from '../dto/add-project-to-collection.input.js';
import { type CreateCollectionInput } from '../dto/create-collection.input.js';
import { type RemoveProjectFromCollectionInput } from '../dto/remove-project-from-collection.input.js';
import { type UpdateCollectionProjectInput } from '../dto/update-collection-project.input.js';
import { type UpdateCollectionInput } from '../dto/update-collection.input.js';
import {
  collectionRowToContract,
  collectionSelect,
} from './collection-contracts.js';

@Injectable()
export class CollectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async addProjectToCollection(
    input: AddProjectToCollectionInput,
    userId: string,
  ) {
    const collectionId = requiredText(
      input.collectionId,
      'Collection is required',
    );
    const projectSlug = requiredText(input.projectSlug, 'Project is required');
    const collection = await this.prisma.collection.findFirst({
      select: { id: true },
      where: {
        id: collectionId,
        ownerId: userId,
      },
    });

    if (collection === null) {
      throw new NotFoundException('Collection not found');
    }

    const project = await this.prisma.project.findFirst({
      select: { id: true },
      where: { slug: projectSlug, status: 'APPROVED' },
    });

    if (project === null) {
      throw new NotFoundException('Project not found');
    }

    const projectCount = await this.prisma.collectionProject.count({
      where: { collectionId: collection.id },
    });

    await this.prisma.collectionProject.upsert({
      create: {
        addedById: userId,
        collectionId: collection.id,
        projectId: project.id,
        sortOrder: projectCount,
      },
      update: {},
      where: {
        collectionId_projectId: {
          collectionId: collection.id,
          projectId: project.id,
        },
      },
    });

    return this.findCollectionForOwner(collection.id, userId);
  }

  async createCollection(input: CreateCollectionInput, ownerId: string) {
    const normalized = normalizeCreateCollectionInput(input);
    const color = input.color?.trim() ?? '';
    const description = input.description?.trim() ?? '';
    const iconUrl = input.iconUrl?.trim() ?? '';
    const collection = await this.prisma.collection.create({
      data: {
        color: color.length === 0 ? null : color,
        description: description.length === 0 ? null : description,
        iconUrl: iconUrl.length === 0 ? null : iconUrl,
        name: normalized.name,
        ownerId,
        slug: normalized.slug,
        visibility: input.visibility,
      },
      select: collectionSelect(6),
    });

    return collectionRowToContract(collection);
  }

  async deleteCollection(
    collectionId: string,
    ownerId: string,
  ): Promise<boolean> {
    const id = requiredText(collectionId, 'Collection is required');
    const collection = await this.prisma.collection.findFirst({
      select: { id: true },
      where: {
        id,
        ownerId,
      },
    });

    if (collection === null) {
      throw new NotFoundException('Collection not found');
    }

    await this.prisma.collection.delete({
      where: { id: collection.id },
    });

    return true;
  }

  async removeProjectFromCollection(
    input: RemoveProjectFromCollectionInput,
    ownerId: string,
  ) {
    const collectionId = requiredText(
      input.collectionId,
      'Collection is required',
    );
    const projectSlug = requiredText(input.projectSlug, 'Project is required');
    const collection = await this.prisma.collection.findFirst({
      select: { id: true },
      where: {
        id: collectionId,
        ownerId,
      },
    });

    if (collection === null) {
      throw new NotFoundException('Collection not found');
    }

    const item = await this.prisma.collectionProject.findFirst({
      select: {
        collectionId: true,
        projectId: true,
      },
      where: {
        collectionId: collection.id,
        project: { slug: projectSlug },
      },
    });

    if (item === null) {
      throw new NotFoundException('Collection item not found');
    }

    await this.prisma.collectionProject.delete({
      where: {
        collectionId_projectId: {
          collectionId: item.collectionId,
          projectId: item.projectId,
        },
      },
    });

    return this.findCollectionForOwner(collection.id, ownerId);
  }

  async updateCollection(input: UpdateCollectionInput, ownerId: string) {
    validateCollectionId(input.collectionId);
    const normalized = normalizeUpdateCollectionInput(input);
    const collection = await this.prisma.collection.findFirst({
      select: { id: true },
      where: {
        id: input.collectionId,
        ownerId,
      },
    });

    if (collection === null) {
      throw new NotFoundException('Collection not found');
    }

    await this.prisma.collection.update({
      data: {
        color:
          input.color === undefined ? undefined : nullableTrim(input.color),
        description:
          input.description === undefined
            ? undefined
            : nullableTrim(input.description),
        iconUrl:
          input.iconUrl === undefined ? undefined : nullableTrim(input.iconUrl),
        name: normalized.name,
        slug: normalized.slug,
        visibility: input.visibility ?? undefined,
      },
      where: { id: collection.id },
    });

    return this.findCollectionForOwner(collection.id, ownerId);
  }

  async updateCollectionProject(
    input: UpdateCollectionProjectInput,
    ownerId: string,
  ) {
    const collectionId = requiredText(
      input.collectionId,
      'Collection is required',
    );
    const projectSlug = requiredText(input.projectSlug, 'Project is required');
    const collection = await this.prisma.collection.findFirst({
      select: { id: true },
      where: {
        id: collectionId,
        ownerId,
      },
    });

    if (collection === null) {
      throw new NotFoundException('Collection not found');
    }

    const item = await this.prisma.collectionProject.findFirst({
      select: {
        collectionId: true,
        projectId: true,
      },
      where: {
        collectionId: collection.id,
        project: { slug: projectSlug },
      },
    });

    if (item === null) {
      throw new NotFoundException('Collection item not found');
    }

    await this.prisma.collectionProject.update({
      data: { sortOrder: input.sortOrder },
      where: {
        collectionId_projectId: {
          collectionId: item.collectionId,
          projectId: item.projectId,
        },
      },
    });

    return this.findCollectionForOwner(collection.id, ownerId);
  }

  private async findCollectionForOwner(collectionId: string, ownerId: string) {
    const collection = await this.prisma.collection.findFirst({
      select: collectionSelect(6),
      where: {
        id: collectionId,
        ownerId,
      },
    });

    if (collection === null) {
      throw new NotFoundException('Collection not found');
    }

    return collectionRowToContract(collection);
  }
}

function nullableTrim(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed === '' ? null : trimmed;
}

function requiredText(value: string, message: string): string {
  const text = value.trim();
  if (text.length === 0) {
    throw new BadRequestException(message);
  }

  return text;
}

function normalizeCreateCollectionInput(input: CreateCollectionInput): {
  name: string;
  slug: string;
} {
  const name = requiredCollectionName(input.name);
  const slug = normalizeCollectionSlug(input.slug);

  if (slug.length < 3) {
    throw new BadRequestException(
      'Collection slug must be at least 3 characters',
    );
  }

  return { name, slug };
}

function normalizeUpdateCollectionInput(input: UpdateCollectionInput): {
  name?: string;
  slug?: string;
} {
  const name =
    input.name === undefined || input.name === null
      ? undefined
      : requiredCollectionName(input.name);
  const slug =
    input.slug === undefined || input.slug === null
      ? undefined
      : normalizeCollectionSlug(input.slug);

  if (slug !== undefined && slug.length < 3) {
    throw new BadRequestException(
      'Collection slug must be at least 3 characters',
    );
  }

  return { name, slug };
}

function requiredCollectionName(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new BadRequestException('Collection name is required');
  }
  return trimmed;
}

function normalizeCollectionSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

function validateCollectionId(value: string): void {
  if (value.trim().length === 0) {
    throw new BadRequestException('Collection is required');
  }
}
