import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateOAuthClientInput {
  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => String, { nullable: true })
  homepageUrl?: string | null;

  @Field(() => String)
  name!: string;

  @Field(() => [String])
  redirectUris!: string[];

  @Field(() => [String], { nullable: true })
  scopes?: string[] | null;
}
