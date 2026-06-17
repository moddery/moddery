import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ApiTokenSummary {
  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date, { nullable: true })
  expiresAt!: Date | null;

  @Field(() => String)
  id!: string;

  @Field(() => Date, { nullable: true })
  lastUsedAt!: Date | null;

  @Field(() => String)
  name!: string;

  @Field(() => Date, { nullable: true })
  revokedAt!: Date | null;

  @Field(() => [String])
  scopes!: string[];
}

@ObjectType()
export class ApiTokenSearchResult {
  @Field(() => [ApiTokenSummary])
  tokens!: ApiTokenSummary[];

  @Field(() => Int)
  totalHits!: number;
}

@ObjectType()
export class CreatedApiToken {
  @Field(() => String)
  token!: string;

  @Field(() => ApiTokenSummary)
  tokenSummary!: ApiTokenSummary;
}
