import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class RecordProjectViewInput {
  @Field(() => String)
  projectSlug!: string;
}
