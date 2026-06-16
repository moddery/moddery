import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class RemoveProjectFromOrganizationInput {
  @Field(() => String)
  organizationId!: string;

  @Field(() => String)
  projectSlug!: string;
}
