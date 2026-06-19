import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class CreateDirectThreadInput {
  @Field(() => String)
  @IsString()
  body!: string;

  @Field(() => String)
  @IsString()
  username!: string;
}

@InputType()
export class CreateDirectThreadMessageInput {
  @Field(() => String)
  @IsString()
  body!: string;

  @Field(() => String)
  @IsString()
  threadId!: string;
}
