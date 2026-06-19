import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class CreateReportThreadMessageInput {
  @Field(() => String)
  @IsString()
  body!: string;

  @Field(() => String)
  @IsString()
  reportId!: string;
}
