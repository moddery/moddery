import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module.js';
import { UsersResolver } from './graphql/users.resolver.js';
import { UserAdminService } from './services/user-admin.service.js';
import { UserDirectoryService } from './services/user-directory.service.js';
import { UserFriendshipsService } from './services/user-friendships.service.js';
import { UsersService } from './services/users.service.js';

@Module({
  exports: [
    UserAdminService,
    UserDirectoryService,
    UserFriendshipsService,
    UsersService,
  ],
  imports: [PrismaModule],
  providers: [
    UserAdminService,
    UserDirectoryService,
    UserFriendshipsService,
    UsersResolver,
    UsersService,
  ],
})
export class UsersModule {}
