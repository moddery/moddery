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
export class ProjectAuditSnapshot {
  @Field(() => String)
  id!: string;

  @Field(() => String, { nullable: true })
  projectKind!: string | null;

  @Field(() => String, { nullable: true })
  requestedStatus!: string | null;

  @Field(() => String)
  slug!: string;

  @Field(() => String)
  status!: string;

  @Field(() => String)
  title!: string;
}

@ObjectType()
export class AuditResourceSnapshot {
  @Field(() => String)
  id!: string;

  @Field(() => String)
  kind!: string;

  @Field(() => String)
  name!: string;

  @Field(() => String, { nullable: true })
  projectKind!: string | null;

  @Field(() => String)
  slug!: string;
}

@ObjectType()
export class ReportAuditSnapshot {
  @Field(() => String)
  id!: string;

  @Field(() => String)
  reason!: string;

  @Field(() => String)
  state!: string;

  @Field(() => String, { nullable: true })
  targetId!: string | null;

  @Field(() => String)
  targetKind!: string;

  @Field(() => String)
  targetLabel!: string;
}

@ObjectType()
export class VersionAuditSnapshot {
  @Field(() => String)
  id!: string;

  @Field(() => String)
  name!: string;

  @Field(() => String)
  projectSlug!: string;

  @Field(() => String, { nullable: true })
  requestedStatus!: string | null;

  @Field(() => String)
  status!: string;

  @Field(() => String)
  versionNumber!: string;
}

@ObjectType()
export class TeamMemberAuditSnapshot {
  @Field(() => Boolean)
  accepted!: boolean;

  @Field(() => Boolean)
  owner!: boolean;

  @Field(() => [String])
  permissions!: string[];

  @Field(() => String)
  role!: string;

  @Field(() => String)
  username!: string;
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

  @Field(() => String, { nullable: true })
  moderationAction!: string | null;

  @Field(() => ProjectAuditSnapshot, { nullable: true })
  projectAfter!: ProjectAuditSnapshot | null;

  @Field(() => ProjectAuditSnapshot, { nullable: true })
  projectBefore!: ProjectAuditSnapshot | null;

  @Field(() => String, { nullable: true })
  reason!: string | null;

  @Field(() => ReportAuditSnapshot, { nullable: true })
  reportAfter!: ReportAuditSnapshot | null;

  @Field(() => ReportAuditSnapshot, { nullable: true })
  reportBefore!: ReportAuditSnapshot | null;

  @Field(() => AuditResourceSnapshot, { nullable: true })
  resource!: AuditResourceSnapshot | null;

  @Field(() => String, { nullable: true })
  securityAction!: string | null;

  @Field(() => AuditUserSummary, { nullable: true })
  targetUser!: AuditUserSummary | null;

  @Field(() => String, { nullable: true })
  targetUserId!: string | null;

  @Field(() => String, { nullable: true })
  teamMemberAction!: string | null;

  @Field(() => TeamMemberAuditSnapshot, { nullable: true })
  teamMemberAfter!: TeamMemberAuditSnapshot | null;

  @Field(() => TeamMemberAuditSnapshot, { nullable: true })
  teamMemberBefore!: TeamMemberAuditSnapshot | null;

  @Field(() => VersionAuditSnapshot, { nullable: true })
  versionAfter!: VersionAuditSnapshot | null;

  @Field(() => VersionAuditSnapshot, { nullable: true })
  versionBefore!: VersionAuditSnapshot | null;
}

@ObjectType()
export class AuditLogSearchResult {
  @Field(() => [AuditLogSummary])
  auditLogs!: AuditLogSummary[];

  @Field(() => Int)
  totalHits!: number;
}
