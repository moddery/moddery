import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AuditUserSummary {
  @Field(() => String, { nullable: true })
  displayName!: string | null;

  @Field(() => String)
  id!: string;

  @Field(() => String)
  username!: string;
}

@ObjectType()
export class UserAccountAuditSnapshot {
  @Field(() => String)
  role!: string;

  @Field(() => String)
  status!: string;
}

@ObjectType()
export class AuditLogSummary {
  @Field(() => String)
  action!: string;

  @Field(() => AuditUserSummary, { nullable: true })
  actor!: AuditUserSummary | null;

  @Field(() => String, { nullable: true })
  actorId!: string | null;

  @Field(() => UserAccountAuditSnapshot, { nullable: true })
  after!: UserAccountAuditSnapshot | null;

  @Field(() => UserAccountAuditSnapshot, { nullable: true })
  before!: UserAccountAuditSnapshot | null;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => String)
  id!: string;

  @Field(() => AuditUserSummary, { nullable: true })
  targetUser!: AuditUserSummary | null;

  @Field(() => String, { nullable: true })
  targetUserId!: string | null;
}

@ObjectType()
export class AuditLogSearchResult {
  @Field(() => [AuditLogSummary])
  auditLogs!: AuditLogSummary[];

  @Field(() => Int)
  totalHits!: number;
}
