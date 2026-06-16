import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class RecordDownloadInput {
  @Field(() => String)
  fileId!: string;
}
