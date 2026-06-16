import { Field, InputType } from '@nestjs/graphql';
import { type ReportReason } from '@moddery/shared';
import { IsIn, IsString, MinLength } from 'class-validator';

const reportReasons = [
  'SPAM',
  'MALWARE',
  'COPYRIGHT',
  'IMPERSONATION',
  'HATEFUL_OR_ABUSIVE',
  'BROKEN_OR_MISLEADING',
  'OTHER',
] as const satisfies readonly ReportReason[];

@InputType()
export class CreateProjectReportInput {
  @Field(() => String)
  @IsString()
  @MinLength(8)
  body!: string;

  @Field(() => String)
  @IsString()
  projectSlug!: string;

  @Field(() => String)
  @IsIn(reportReasons)
  reason!: ReportReason;
}

@InputType()
export class CreateVersionReportInput {
  @Field(() => String)
  @IsString()
  @MinLength(8)
  body!: string;

  @Field(() => String)
  @IsIn(reportReasons)
  reason!: ReportReason;

  @Field(() => String)
  @IsString()
  versionId!: string;
}
