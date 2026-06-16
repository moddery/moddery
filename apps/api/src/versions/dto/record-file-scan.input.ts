import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class RecordFileScanInput {
  @Field(() => String)
  fileId!: string;

  @Field(() => String)
  status!: string;

  @Field(() => String, { nullable: true })
  verdict?: string | null;

  @Field(() => String, { nullable: true })
  details?: string | null;
}
