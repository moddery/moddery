import { Field, Int, ObjectType } from '@nestjs/graphql';

import { CollectionSummary } from '../../collections/graphql/collection-summary.model.js';
import { ProjectSummary } from '../../catalog/graphql/project-summary.model.js';

@ObjectType()
export class UserProfile {
  @Field(() => String, { nullable: true })
  avatarUrl!: string | null;

  @Field(() => String, { nullable: true })
  bio!: string | null;

  @Field(() => Int)
  collectionCount!: number;

  @Field(() => [CollectionSummary])
  collections!: CollectionSummary[];

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => String, { nullable: true })
  displayName!: string | null;

  @Field(() => String, { nullable: true })
  email!: string | null;

  @Field(() => Date, { nullable: true })
  emailVerifiedAt!: Date | null;

  @Field(() => String)
  id!: string;

  @Field(() => Boolean)
  isAdmin?: boolean;

  @Field(() => String)
  role!: string;

  @Field(() => String)
  status!: string;

  @Field(() => Boolean)
  newsletterOptIn!: boolean;

  @Field(() => Int)
  followedProjectCount!: number;

  @Field(() => Int)
  friendCount!: number;

  @Field(() => Int)
  projectCount!: number;

  @Field(() => [ProjectSummary])
  projects!: ProjectSummary[];

  @Field(() => String)
  username!: string;

  @Field(() => Boolean)
  twoFactorEnabled!: boolean;
}

@ObjectType()
export class UserSearchResult {
  @Field(() => [UserProfile])
  users!: UserProfile[];

  @Field(() => Int)
  totalHits!: number;
}

@ObjectType()
export class UserProjectSearchResult {
  @Field(() => [ProjectSummary])
  projects!: ProjectSummary[];

  @Field(() => Int)
  totalHits!: number;
}

@ObjectType()
export class UserCollectionSearchResult {
  @Field(() => [CollectionSummary])
  collections!: CollectionSummary[];

  @Field(() => Int)
  totalHits!: number;
}
