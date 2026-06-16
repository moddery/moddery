import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class AddProjectToCollectionInput {
  @Field(() => String)
  collectionId!: string;

  @Field(() => String)
  projectSlug!: string;
}
