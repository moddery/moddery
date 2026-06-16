import { Field, Int, ObjectType } from '@nestjs/graphql';

import { ProjectSummary } from '../../catalog/graphql/project-summary.model.js';

@ObjectType()
export class CollectionOwner {
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
export class CollectionSummary {
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

  @Field(() => String)
  name!: string;

  @Field(() => CollectionOwner)
  owner!: CollectionOwner;

  @Field(() => Int)
  projectCount!: number;

  @Field(() => [ProjectSummary])
  projects!: ProjectSummary[];

  @Field(() => String)
  slug!: string;

  @Field(() => Date)
  updatedAt!: Date;

  @Field(() => String)
  visibility!: string;
}
