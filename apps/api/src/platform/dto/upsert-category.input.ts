import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpsertCategoryInput {
  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => String)
  name!: string;

  @Field(() => String, { nullable: true })
  projectKind?: string | null;

  @Field(() => String)
  slug!: string;
}
