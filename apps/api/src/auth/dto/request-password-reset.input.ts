import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class RequestPasswordResetInput {
  @Field(() => String)
  @IsString()
  identifier!: string;
}
