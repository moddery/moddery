import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TeamInvitationTarget {
  @Field(() => String)
  id!: string;

  @Field(() => String)
  name!: string;

  @Field(() => String)
  slug!: string;

  @Field(() => String)
  type!: string;
}

@ObjectType()
export class TeamInvitationSummary {
  @Field(() => Date)
  createdAt!: Date;

  @Field(() => String)
  id!: string;

  @Field(() => [String])
  permissions!: string[];

  @Field(() => String)
  role!: string;

  @Field(() => TeamInvitationTarget)
  target!: TeamInvitationTarget;
}
