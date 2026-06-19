import { Field, InputType } from '@nestjs/graphql';
import { IsString, Matches } from 'class-validator';

@InputType()
export class VerifyTwoFactorInput {
  @Field(() => String)
  @IsString()
  @Matches(/^[0-9]{6}$/)
  code!: string;
}
