import { ForbiddenException } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';

import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { type AuthenticatedUser } from '../../auth/services/auth-token.service.js';
import {
  PaginationArgs,
  paginationOptions,
} from '../../common/graphql/pagination.js';
import { AuditService } from '../audit.service.js';
import { AuditLogSearchResult, AuditLogSummary } from './audit-log.model.js';

@Resolver(() => AuditLogSummary)
export class AuditResolver {
  constructor(private readonly auditService: AuditService) {}

  @Query(() => AuditLogSearchResult)
  adminAuditLogSearch(
    @CurrentUser() user: AuthenticatedUser,
    @Args() pagination?: PaginationArgs,
  ): Promise<AuditLogSearchResult> {
    assertAdmin(user);
    return this.auditService.findAdminAuditLogs(
      paginationOptions(pagination ?? {}),
    );
  }
}

function assertAdmin(user: AuthenticatedUser): void {
  if (user.role === 'ADMIN') {
    return;
  }

  throw new ForbiddenException('Admin access required');
}
