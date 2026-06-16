import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserProfile {
  @Field(() => String, { nullable: true })
  displayName!: string | null;

  @Field(() => String)
  id!: string;

  @Field(() => Boolean)
  isAdmin?: boolean;

  @Field(() => String)
  role!: string;

  @Field(() => String)
  username!: string;
}
