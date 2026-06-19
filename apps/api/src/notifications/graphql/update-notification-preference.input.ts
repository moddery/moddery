import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsString } from 'class-validator';

@InputType()
export class UpdateNotificationPreferenceInput {
  @Field(() => String)
  @IsString()
  channel!: string;

  @Field(() => Boolean)
  @IsBoolean()
  enabled!: boolean;

  @Field(() => String)
  @IsString()
  type!: string;
}
