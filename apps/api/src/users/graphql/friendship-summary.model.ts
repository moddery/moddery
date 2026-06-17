import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class FriendshipUser {
  @Field(() => String, { nullable: true })
  avatarUrl!: string | null;

  @Field(() => String, { nullable: true })
  displayName!: string | null;

  @Field(() => String)
  id!: string;

  @Field(() => String)
  username!: string;
}

@ObjectType()
export class FriendshipSummary {
  @Field(() => Date, { nullable: true })
  acceptedAt!: Date | null;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => String)
  direction!: string;

  @Field(() => String)
  id!: string;

  @Field(() => String)
  state!: string;

  @Field(() => FriendshipUser)
  user!: FriendshipUser;
}
