import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { compare, hash } from 'bcryptjs';

import { PrismaService } from '../../prisma/prisma.service.js';
import { type LoginInput } from '../dto/login.input.js';
import { type RegisterInput } from '../dto/register.input.js';
import {
  AuthTokenService,
  type AuthenticatedUser,
} from './auth-token.service.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly authTokenService: AuthTokenService,
    private readonly prisma: PrismaService,
  ) {}

  async login(input: LoginInput) {
    const identifier = input.identifier.trim();
    const user = await this.prisma.user.findFirst({
      include: { passwordCredential: true },
      where: {
        OR: [
          { username: { equals: identifier, mode: 'insensitive' } },
          { email: { equals: identifier, mode: 'insensitive' } },
        ],
      },
    });

    if (
      user?.passwordCredential === undefined ||
      user.passwordCredential === null
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await compare(
      input.password,
      user.passwordCredential.passwordHash,
    );

    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.createAuthPayload({
      id: user.id,
      role: user.role,
      username: user.username,
    });
  }

  async register(input: RegisterInput) {
    const username = input.username.trim();
    const email = input.email.trim().toLowerCase();
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: { equals: username, mode: 'insensitive' } },
          { email },
        ],
      },
    });

    if (existing !== null) {
      throw new ConflictException('Username or email is already in use');
    }

    const passwordHash = await hash(input.password, 12);
    const user = await this.prisma.user.create({
      data: {
        displayName: input.displayName?.trim(),
        email,
        passwordCredential: {
          create: { passwordHash },
        },
        username,
      },
    });

    return this.createAuthPayload({
      id: user.id,
      role: user.role,
      username: user.username,
    });
  }

  private async createAuthPayload(user: AuthenticatedUser) {
    return {
      accessToken: await this.authTokenService.signAccessToken(user),
      expiresIn: this.authTokenService.accessTokenTtlSeconds(),
      tokenType: 'Bearer' as const,
      user: {
        ...user,
        displayName: null,
        isAdmin: user.role === 'ADMIN',
      },
    };
  }
}
