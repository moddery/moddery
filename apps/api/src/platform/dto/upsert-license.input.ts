import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpsertLicenseInput {
  @Field(() => String)
  key!: string;

  @Field(() => String)
  name!: string;

  @Field(() => String, { nullable: true })
  url?: string | null;
}
