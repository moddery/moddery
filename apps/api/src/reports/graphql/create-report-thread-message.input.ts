import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateReportThreadMessageInput {
  @Field(() => String)
  body!: string;

  @Field(() => String)
  reportId!: string;
}
