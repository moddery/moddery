import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class UpdateCollectionProjectInput {
  @Field(() => String)
  collectionId!: string;

  @Field(() => String)
  projectSlug!: string;

  @Field(() => Int)
  sortOrder!: number;
}
