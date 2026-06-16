import { Field, Int, ObjectType } from '@nestjs/graphql';

import { ProjectSummary } from '../../catalog/graphql/project-summary.model.js';

@ObjectType()
export class OrganizationOwner {
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
export class OrganizationSummary {
  @Field(() => String, { nullable: true })
  color!: string | null;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => String, { nullable: true })
  description!: string | null;

  @Field(() => String, { nullable: true })
  iconUrl!: string | null;

  @Field(() => String)
  id!: string;

  @Field(() => Int)
  memberCount!: number;

  @Field(() => String)
  name!: string;

  @Field(() => OrganizationOwner)
  owner!: OrganizationOwner;

  @Field(() => Int)
  projectCount!: number;

  @Field(() => [ProjectSummary])
  projects!: ProjectSummary[];

  @Field(() => String)
  slug!: string;

  @Field(() => Date)
  updatedAt!: Date;
}
