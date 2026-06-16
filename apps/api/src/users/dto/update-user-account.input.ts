import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateUserAccountInput {
  @Field(() => String)
  userId!: string;

  @Field(() => String, { nullable: true })
  role?: string | null;

  @Field(() => String, { nullable: true })
  status?: string | null;
}
