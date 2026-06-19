import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SessionSummary {
  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  expiresAt!: Date;

  @Field(() => String)
  id!: string;

  @Field(() => Boolean)
  isCurrent!: boolean;

  @Field(() => Date)
  lastUsedAt!: Date;

  @Field(() => Date, { nullable: true })
  revokedAt!: Date | null;

  @Field(() => String, { nullable: true })
  userAgent!: string | null;
}

@ObjectType()
export class SessionSearchResult {
  @Field(() => [SessionSummary])
  sessions!: SessionSummary[];

  @Field(() => Int)
  totalHits!: number;
}
