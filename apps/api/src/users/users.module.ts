import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { UsersResolver } from './graphql/users.resolver.js';
import { UserAdminService } from './services/user-admin.service.js';
import { UserDirectoryService } from './services/user-directory.service.js';
import { UserFriendshipActionsService } from './services/user-friendship-actions.service.js';
import { UserFriendshipReadsService } from './services/user-friendship-reads.service.js';
import { UserFriendshipsService } from './services/user-friendships.service.js';
import { UsersService } from './services/users.service.js';

@Module({
  exports: [
    UserAdminService,
    UserDirectoryService,
    UserFriendshipsService,
    UsersService,
  ],
  imports: [AuditModule, PrismaModule],
  providers: [
    UserAdminService,
    UserDirectoryService,
    UserFriendshipActionsService,
    UserFriendshipReadsService,
    UserFriendshipsService,
    UsersResolver,
    UsersService,
  ],
})
export class UsersModule {}
