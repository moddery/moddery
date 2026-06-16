import { Field, InputType } from '@nestjs/graphql';
import { type ReportState } from '@moddery/shared';

@InputType()
export class UpdateReportStateInput {
  @Field(() => String)
  id!: string;

  @Field(() => String)
  state!: ReportState;
}
