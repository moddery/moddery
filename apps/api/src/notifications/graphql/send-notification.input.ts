import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

@InputType()
export class SendNotificationInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  actionUrl?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  body?: string | null;

  @Field(() => String)
  @IsString()
  title!: string;

  @Field(() => String)
  @IsString()
  type!: string;

  @Field(() => String)
  @IsString()
  username!: string;
}
