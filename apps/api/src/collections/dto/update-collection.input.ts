import { Field, InputType } from '@nestjs/graphql';
import { type CollectionVisibility } from '@moddery/shared';

@InputType()
export class UpdateCollectionInput {
  @Field(() => String, { nullable: true })
  color?: string | null;

  @Field(() => String)
  collectionId!: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => String, { nullable: true })
  name?: string | null;

  @Field(() => String, { nullable: true })
  slug?: string | null;

  @Field(() => String, { nullable: true })
  visibility?: CollectionVisibility | null;
}
