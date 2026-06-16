import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.user.findUnique({
      select: {
        displayName: true,
        id: true,
        role: true,
        username: true,
      },
      where: { id },
    });
  }

  findByUsername(username: string) {
    return this.prisma.user.findFirst({
      select: {
        displayName: true,
        id: true,
        role: true,
        username: true,
      },
      where: { username: { equals: username, mode: 'insensitive' } },
    });
  }
}
