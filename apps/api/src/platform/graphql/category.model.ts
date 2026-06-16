import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CategorySummary {
  @Field(() => String, { nullable: true })
  description!: string | null;

  @Field(() => String)
  name!: string;

  @Field(() => String, { nullable: true })
  projectKind!: string | null;

  @Field(() => String)
  slug!: string;
}
