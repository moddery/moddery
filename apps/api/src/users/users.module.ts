import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module.js';
import { UsersResolver } from './graphql/users.resolver.js';
import { UsersService } from './services/users.service.js';

@Module({
  exports: [UsersService],
  imports: [PrismaModule],
  providers: [UsersResolver, UsersService],
})
export class UsersModule {}
