import { Field, ObjectType } from '@nestjs/graphql';

import { CategorySummary } from './category.model.js';

@ObjectType()
export class PlatformMetadata {
  @Field(() => [CategorySummary])
  categories!: CategorySummary[];

  @Field(() => [String])
  gameVersions!: string[];

  @Field(() => [String])
  loaders!: string[];

  @Field(() => [String])
  projectKinds!: string[];
}
