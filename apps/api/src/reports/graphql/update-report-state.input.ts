import { Field, InputType } from '@nestjs/graphql';
import { REPORT_STATES, type ReportState } from '@moddery/shared';
import { IsIn, IsString } from 'class-validator';

@InputType()
export class UpdateReportStateInput {
  @Field(() => String)
  @IsString()
  id!: string;

  @Field(() => String)
  @IsIn(REPORT_STATES)
  state!: ReportState;
}
