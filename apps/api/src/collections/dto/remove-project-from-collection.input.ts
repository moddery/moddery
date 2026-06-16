import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class RemoveProjectFromCollectionInput {
  @Field(() => String)
  collectionId!: string;

  @Field(() => String)
  projectSlug!: string;
}
