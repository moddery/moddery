import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateApiTokenInput {
  @Field(() => Int, { nullable: true })
  expiresInDays?: number | null;

  @Field(() => String)
  name!: string;

  @Field(() => [String], { nullable: true })
  scopes?: string[] | null;
}
