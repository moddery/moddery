import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateOrganizationInput {
  @Field(() => String, { nullable: true })
  color?: string | null;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => String, { nullable: true })
  name?: string | null;

  @Field(() => String)
  organizationId!: string;

  @Field(() => String, { nullable: true })
  slug?: string | null;
}
