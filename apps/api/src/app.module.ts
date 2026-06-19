import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { ThrottlerModule } from '@nestjs/throttler';

import { AuthModule } from './auth/auth.module.js';
import { AnalyticsModule } from './analytics/analytics.module.js';
import { AuditModule } from './audit/audit.module.js';
import { CatalogModule } from './catalog/catalog.module.js';
import { CollectionsModule } from './collections/collections.module.js';
import { RequestLoggingInterceptor } from './common/logging/request-logging.interceptor.js';
import { GqlThrottlerGuard } from './common/throttling/gql-throttler.guard.js';
import { validateEnvironment } from './config/env.validation.js';
import { DeveloperModule } from './developer/developer.module.js';
import { HealthModule } from './health/health.module.js';
import { MailModule } from './mail/mail.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { OrganizationsModule } from './organizations/organizations.module.js';
import { PlatformModule } from './platform/platform.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { RedisModule } from './redis/redis.module.js';
import { ReportsModule } from './reports/reports.module.js';
import { SearchModule } from './search/search.module.js';
import { StorageModule } from './storage/storage.module.js';
import { TeamsModule } from './teams/teams.module.js';
import { UsersModule } from './users/users.module.js';
import { VersionsModule } from './versions/versions.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      load: [validateEnvironment],
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      autoSchemaFile: true,
      context: ({ req, res }: { req: unknown; res: unknown }) => ({
        req,
        res,
      }),
      driver: ApolloDriver,
      path: '/graphql',
      sortSchema: true,
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          limit: config.getOrThrow<number>('app.rateLimitRequests'),
          ttl: config.getOrThrow<number>('app.rateLimitTtlSeconds') * 1000,
        },
      ],
    }),
    AuthModule,
    AnalyticsModule,
    AuditModule,
    CatalogModule,
    CollectionsModule,
    DeveloperModule,
    HealthModule,
    MailModule,
    NotificationsModule,
    OrganizationsModule,
    PlatformModule,
    PrismaModule,
    RedisModule,
    ReportsModule,
    SearchModule,
    StorageModule,
    TeamsModule,
    UsersModule,
    VersionsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: GqlThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestLoggingInterceptor,
    },
  ],
})
export class AppModule {}
