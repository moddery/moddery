import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class AddProjectToOrganizationInput {
  @Field(() => String)
  @IsString()
  organizationId!: string;

  @Field(() => String)
  @IsString()
  projectSlug!: string;
}
