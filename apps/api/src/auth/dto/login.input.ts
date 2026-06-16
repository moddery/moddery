import { Field, InputType } from '@nestjs/graphql';
import { IsString, MinLength } from 'class-validator';

@InputType()
export class LoginInput {
  @Field(() => String)
  @IsString()
  identifier!: string;

  @Field(() => String)
  @IsString()
  @MinLength(8)
  password!: string;
}
