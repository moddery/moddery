import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateDirectThreadInput {
  @Field(() => String)
  body!: string;

  @Field(() => String)
  username!: string;
}

@InputType()
export class CreateDirectThreadMessageInput {
  @Field(() => String)
  body!: string;

  @Field(() => String)
  threadId!: string;
}
