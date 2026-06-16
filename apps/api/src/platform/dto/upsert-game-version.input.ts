import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpsertGameVersionInput {
  @Field(() => Boolean)
  isActive!: boolean;

  @Field(() => String)
  version!: string;
}
