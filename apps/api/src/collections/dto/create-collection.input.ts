import { Field, InputType } from '@nestjs/graphql';
import { type CollectionVisibility } from '@moddery/shared';

@InputType()
export class CreateCollectionInput {
  @Field(() => String, { nullable: true })
  color?: string | null;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => String)
  name!: string;

  @Field(() => String)
  slug!: string;

  @Field(() => String, { defaultValue: 'PRIVATE' })
  visibility!: CollectionVisibility;
}
