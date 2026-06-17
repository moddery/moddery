import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class VersionAuthorSummary {
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
export class VersionDependencyProjectSummary {
  @Field(() => String)
  id!: string;

  @Field(() => String)
  kind!: string;

  @Field(() => String)
  slug!: string;

  @Field(() => String)
  title!: string;
}

@ObjectType()
export class VersionDependencyVersionSummary {
  @Field(() => String)
  id!: string;

  @Field(() => String)
  versionNumber!: string;
}

@ObjectType()
export class VersionDependencySummary {
  @Field(() => String)
  dependencyKind!: string;

  @Field(() => String, { nullable: true })
  externalFileName!: string | null;

  @Field(() => String)
  id!: string;

  @Field(() => VersionDependencyProjectSummary, { nullable: true })
  targetProject!: VersionDependencyProjectSummary | null;

  @Field(() => VersionDependencyVersionSummary, { nullable: true })
  targetVersion!: VersionDependencyVersionSummary | null;
}

@ObjectType()
export class VersionFileHashSummary {
  @Field(() => String)
  algorithm!: string;

  @Field(() => String)
  value!: string;
}

@ObjectType()
export class VersionFileScanSummary {
  @Field(() => Date)
  createdAt!: Date;

  @Field(() => String, { nullable: true })
  details!: string | null;

  @Field(() => String)
  id!: string;

  @Field(() => String)
  status!: string;

  @Field(() => String, { nullable: true })
  verdict!: string | null;
}

@ObjectType()
export class VersionFileSummary {
  @Field(() => String)
  fileName!: string;

  @Field(() => [VersionFileHashSummary])
  hashes!: VersionFileHashSummary[];

  @Field(() => String)
  id!: string;

  @Field(() => String)
  kind!: string;

  @Field(() => Boolean)
  primary!: boolean;

  @Field(() => String)
  sizeBytes!: string;

  @Field(() => [VersionFileScanSummary])
  scans!: VersionFileScanSummary[];

  @Field(() => String)
  url!: string;
}

@ObjectType()
export class VersionSummary {
  @Field(() => VersionAuthorSummary, { nullable: true })
  author!: VersionAuthorSummary | null;

  @Field(() => String, { nullable: true })
  changelog!: string | null;

  @Field(() => String)
  channel!: string;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date, { nullable: true })
  datePublished!: Date | null;

  @Field(() => Int)
  downloads!: number;

  @Field(() => [VersionDependencySummary])
  dependencies!: VersionDependencySummary[];

  @Field(() => [VersionFileSummary])
  files!: VersionFileSummary[];

  @Field(() => Boolean)
  featured!: boolean;

  @Field(() => [String])
  gameVersions!: string[];

  @Field(() => String)
  id!: string;

  @Field(() => [String])
  loaders!: string[];

  @Field(() => String)
  name!: string;

  @Field(() => String)
  projectSlug!: string;

  @Field(() => String, { nullable: true })
  requestedStatus!: string | null;

  @Field(() => Int)
  sortOrder!: number;

  @Field(() => String)
  status!: string;

  @Field(() => Date)
  updatedAt!: Date;

  @Field(() => String)
  versionNumber!: string;
}

@ObjectType()
export class VersionSearchResult {
  @Field(() => Int)
  totalHits!: number;

  @Field(() => [VersionSummary])
  versions!: VersionSummary[];
}
