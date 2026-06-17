import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class LicenseSummary {
  @Field(() => String)
  key!: string;

  @Field(() => String)
  name!: string;

  @Field(() => String, { nullable: true })
  url!: string | null;
}
