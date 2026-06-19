import { Field, Int, ObjectType } from '@nestjs/graphql';
import { type ProjectKind, type ProjectStatus } from '@moddery/shared';

@ObjectType()
export class ProjectGalleryImage {
  @Field(() => Date)
  createdAt!: Date;

  @Field(() => String, { nullable: true })
  description!: string | null;

  @Field(() => String)
  displayUrl!: string;

  @Field(() => Boolean)
  featured!: boolean;

  @Field(() => String)
  id!: string;

  @Field(() => String)
  rawUrl!: string;

  @Field(() => Int)
  sortOrder!: number;

  @Field(() => String, { nullable: true })
  title!: string | null;
}

@ObjectType()
export class ProjectLicense {
  @Field(() => String)
  id!: string;

  @Field(() => String)
  name!: string;

  @Field(() => String, { nullable: true })
  url!: string | null;
}

@ObjectType()
export class ProjectLink {
  @Field(() => String)
  kind!: string;

  @Field(() => String, { nullable: true })
  label!: string | null;

  @Field(() => String)
  url!: string;
}

@ObjectType()
export class ProjectOwner {
  @Field(() => String, { nullable: true })
  avatarUrl!: string | null;

  @Field(() => String, { nullable: true })
  displayName!: string | null;

  @Field(() => String)
  id!: string;

  @Field(() => String)
  username!: string;
}

@ObjectType()
export class ProjectOrganization {
  @Field(() => String, { nullable: true })
  color!: string | null;

  @Field(() => String, { nullable: true })
  iconUrl!: string | null;

  @Field(() => String)
  id!: string;

  @Field(() => String)
  name!: string;

  @Field(() => String)
  slug!: string;
}

@ObjectType()
export class ProjectModerationLock {
  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  expiresAt!: Date;

  @Field(() => String)
  id!: string;

  @Field(() => ProjectOwner)
  moderator!: ProjectOwner;
}

@ObjectType()
export class ProjectViewerCapabilities {
  @Field(() => Boolean)
  manageDetails!: boolean;

  @Field(() => Boolean)
  manageMembers!: boolean;

  @Field(() => Boolean)
  manageVersions!: boolean;

  @Field(() => Boolean)
  viewAnalytics!: boolean;
}

@ObjectType()
export class ProjectSummary {
  @Field(() => String)
  body!: string;

  @Field(() => String, { nullable: true })
  color!: string | null;

  @Field(() => [String])
  categories!: string[];

  @Field(() => Int)
  downloads!: number;

  @Field(() => Int)
  followers!: number;

  @Field(() => String, { nullable: true })
  discordUrl!: string | null;

  @Field(() => [String])
  gameVersions!: string[];

  @Field(() => String)
  id!: string;

  @Field(() => ProjectOwner, { nullable: true })
  owner?: ProjectOwner | null;

  @Field(() => ProjectOrganization, { nullable: true })
  organization?: ProjectOrganization | null;

  @Field(() => ProjectModerationLock, { nullable: true })
  moderationLock?: ProjectModerationLock | null;

  @Field(() => Date, { nullable: true })
  approvedAt!: Date | null;

  @Field(() => Date, { nullable: true })
  archivedAt!: Date | null;

  @Field(() => Date, { nullable: true })
  publishedAt!: Date | null;

  @Field(() => Date, { nullable: true })
  queuedAt!: Date | null;

  @Field(() => String, { nullable: true })
  requestedStatus!: ProjectStatus | null;

  @Field(() => String, { nullable: true })
  iconUrl!: string | null;

  @Field(() => String, { nullable: true })
  issuesUrl!: string | null;

  @Field(() => String)
  kind!: ProjectKind;

  @Field(() => ProjectLicense)
  license!: ProjectLicense;

  @Field(() => [ProjectLink])
  links!: ProjectLink[];

  @Field(() => [String])
  loaders!: string[];

  @Field(() => [ProjectGalleryImage])
  gallery!: ProjectGalleryImage[];

  @Field(() => String)
  slug!: string;

  @Field(() => String, { nullable: true })
  sourceUrl!: string | null;

  @Field(() => String)
  status!: ProjectStatus;

  @Field(() => String)
  summary!: string;

  @Field(() => String)
  title!: string;

  @Field(() => Date)
  updatedAt!: Date;

  @Field(() => ProjectViewerCapabilities, { nullable: true })
  viewerCapabilities?: ProjectViewerCapabilities | null;

  @Field(() => String, { nullable: true })
  wikiUrl!: string | null;
}

@ObjectType()
export class ProjectSearchResult {
  @Field(() => [ProjectSummary])
  projects!: ProjectSummary[];

  @Field(() => Int)
  totalHits!: number;
}

@ObjectType()
export class ProjectMemberUser {
  @Field(() => String, { nullable: true })
  avatarUrl!: string | null;

  @Field(() => String, { nullable: true })
  displayName!: string | null;

  @Field(() => String)
  id!: string;

  @Field(() => String)
  username!: string;
}

@ObjectType()
export class ProjectMemberSummary {
  @Field(() => Boolean)
  accepted!: boolean;

  @Field(() => Boolean)
  owner!: boolean;

  @Field(() => [String])
  permissions!: string[];

  @Field(() => String)
  role!: string;

  @Field(() => Int)
  sortOrder!: number;

  @Field(() => ProjectMemberUser)
  user!: ProjectMemberUser;
}

@ObjectType()
export class ProjectMemberSearchResult {
  @Field(() => [ProjectMemberSummary])
  members!: ProjectMemberSummary[];

  @Field(() => Int)
  totalHits!: number;
}

@ObjectType()
export class ProjectFollowState {
  @Field(() => Boolean)
  following!: boolean;

  @Field(() => Int)
  followers!: number;

  @Field(() => String)
  projectSlug!: string;
}
