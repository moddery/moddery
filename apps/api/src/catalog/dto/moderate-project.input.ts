import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ModerateProjectInput {
  @Field(() => String)
  action!: string;

  @Field(() => String)
  projectSlug!: string;

  @Field(() => String, { nullable: true })
  reason?: string | null;
}
