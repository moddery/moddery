import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';

import { PrismaModule } from '../prisma/prisma.module.js';
import { UsersModule } from '../users/users.module.js';
import { AuthResolver } from './graphql/auth.resolver.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { AuthService } from './services/auth.service.js';
import { AuthTokenService } from './services/auth-token.service.js';

@Module({
  exports: [AuthTokenService],
  imports: [JwtModule, PrismaModule, UsersModule],
  providers: [
    AuthResolver,
    AuthService,
    AuthTokenService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AuthModule {}
