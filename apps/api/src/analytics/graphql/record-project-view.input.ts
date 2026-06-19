import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class RecordProjectViewInput {
  @Field(() => String)
  @IsString()
  projectSlug!: string;
}
