import { Field, InputType } from '@nestjs/graphql';
import { REPORT_REASONS, type ReportReason } from '@moddery/shared';
import { IsIn, IsString, MinLength } from 'class-validator';

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
  @IsIn(REPORT_REASONS)
  reason!: ReportReason;
}

@InputType()
export class CreateVersionReportInput {
  @Field(() => String)
  @IsString()
  @MinLength(8)
  body!: string;

  @Field(() => String)
  @IsIn(REPORT_REASONS)
  reason!: ReportReason;

  @Field(() => String)
  @IsString()
  versionId!: string;
}

@InputType()
export class CreateUserReportInput {
  @Field(() => String)
  @IsString()
  @MinLength(8)
  body!: string;

  @Field(() => String)
  @IsIn(REPORT_REASONS)
  reason!: ReportReason;

  @Field(() => String)
  @IsString()
  username!: string;
}
