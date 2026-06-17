import { Field, ObjectType } from '@nestjs/graphql';

import { CategorySummary } from './category.model.js';
import { LicenseSummary } from './license.model.js';

@ObjectType()
export class PlatformMetadata {
  @Field(() => [CategorySummary])
  categories!: CategorySummary[];

  @Field(() => [String])
  gameVersions!: string[];

  @Field(() => [String])
  loaders!: string[];

  @Field(() => [LicenseSummary])
  licenses!: LicenseSummary[];

  @Field(() => [String])
  projectKinds!: string[];
}
