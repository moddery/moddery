import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';

import { AuthModule } from './auth/auth.module.js';
import { AnalyticsModule } from './analytics/analytics.module.js';
import { CatalogModule } from './catalog/catalog.module.js';
import { CollectionsModule } from './collections/collections.module.js';
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
      context: ({ req }: { req: unknown }) => ({ req }),
      driver: ApolloDriver,
      path: '/graphql',
      sortSchema: true,
    }),
    AuthModule,
    AnalyticsModule,
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
})
export class AppModule {}
