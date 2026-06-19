import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class RecordDownloadInput {
  @Field(() => String)
  @IsString()
  fileId!: string;
}
