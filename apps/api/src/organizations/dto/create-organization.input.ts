import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateOrganizationInput {
  @Field(() => String, { nullable: true })
  color?: string | null;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => String)
  name!: string;

  @Field(() => String)
  slug!: string;
}
