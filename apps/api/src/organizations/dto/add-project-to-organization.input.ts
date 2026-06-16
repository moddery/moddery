import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class AddProjectToOrganizationInput {
  @Field(() => String)
  organizationId!: string;

  @Field(() => String)
  projectSlug!: string;
}
