import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class GameVersionSummary {
  @Field(() => Boolean)
  isActive!: boolean;

  @Field(() => String)
  version!: string;
}
