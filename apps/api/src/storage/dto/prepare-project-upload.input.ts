import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class PrepareProjectUploadInput {
  @Field(() => String, { nullable: true })
  contentType?: string | null;

  @Field(() => String)
  fileName!: string;

  @Field(() => String)
  projectSlug!: string;

  @Field(() => Int)
  sizeBytes!: number;

  @Field(() => String)
  uploadKind!: string;
}
