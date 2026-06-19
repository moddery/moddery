import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

@InputType()
export class RecordFileScanInput {
  @Field(() => String)
  @IsString()
  fileId!: string;

  @Field(() => String)
  @IsString()
  status!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  verdict?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  details?: string | null;
}
