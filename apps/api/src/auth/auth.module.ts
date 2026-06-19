import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';

import { AuditModule } from '../audit/audit.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { MailModule } from '../mail/mail.module.js';
import { UsersModule } from '../users/users.module.js';
import { AuthResolver } from './graphql/auth.resolver.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { ApiTokensService } from './services/api-tokens.service.js';
import { AuthService } from './services/auth.service.js';
import { AuthTokenService } from './services/auth-token.service.js';

@Module({
  exports: [AuthTokenService],
  imports: [AuditModule, JwtModule, MailModule, PrismaModule, UsersModule],
  providers: [
    AuthResolver,
    ApiTokensService,
    AuthService,
    AuthTokenService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AuthModule {}
