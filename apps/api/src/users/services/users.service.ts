import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service.js';
import { type UpdateViewerProfileInput } from '../dto/update-viewer-profile.input.js';
import {
  userProfileRowToContract,
  userProfileSelect,
} from './user-read-model.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      select: userProfileSelect({
        includePrivateAccountFields: true,
        includePrivateCollections: true,
        includePrivateProjects: true,
      }),
      where: { id },
    });

    return user === null
      ? null
      : userProfileRowToContract(user, { includePrivateAccountFields: true });
  }

  async findByUsername(username: string) {
    const user = await this.prisma.user.findFirst({
      select: userProfileSelect({
        includePrivateAccountFields: false,
        includePrivateCollections: false,
        includePrivateProjects: false,
      }),
      where: { username: { equals: username, mode: 'insensitive' } },
    });

    return user === null
      ? null
      : userProfileRowToContract(user, { includePrivateAccountFields: false });
  }

  async updateViewerProfile(id: string, input: UpdateViewerProfileInput) {
    const nextEmail =
      input.email === undefined
        ? undefined
        : (nullableTrim(input.email)?.toLowerCase() ?? null);
    const existing =
      nextEmail === undefined
        ? null
        : await this.prisma.user.findUnique({
            select: { email: true },
            where: { id },
          });

    await this.prisma.user.update({
      data: {
        avatarUrl:
          input.avatarUrl === undefined
            ? undefined
            : nullableTrim(input.avatarUrl),
        bio: input.bio === undefined ? undefined : nullableTrim(input.bio),
        displayName:
          input.displayName === undefined
            ? undefined
            : nullableTrim(input.displayName),
        email: nextEmail,
        emailVerifiedAt:
          nextEmail === undefined || existing?.email === nextEmail
            ? undefined
            : null,
        newsletterOptIn: input.newsletterOptIn ?? undefined,
      },
      where: { id },
    });

    return this.findById(id);
  }
}

function nullableTrim(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed === '' ? null : trimmed;
}
