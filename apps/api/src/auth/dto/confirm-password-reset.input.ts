import { Field, InputType } from '@nestjs/graphql';
import { IsString, MinLength } from 'class-validator';

@InputType()
export class ConfirmPasswordResetInput {
  @Field(() => String)
  @IsString()
  @MinLength(12)
  newPassword!: string;

  @Field(() => String)
  @IsString()
  token!: string;
}
