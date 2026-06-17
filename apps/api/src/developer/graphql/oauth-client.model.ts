import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class OAuthClientRedirectUriSummary {
  @Field(() => Date)
  createdAt!: Date;

  @Field(() => String)
  id!: string;

  @Field(() => String)
  uri!: string;
}

@ObjectType()
export class OAuthClientSummary {
  @Field(() => String, { nullable: true })
  clientId!: string | null;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => String, { nullable: true })
  description!: string | null;

  @Field(() => String, { nullable: true })
  homepageUrl!: string | null;

  @Field(() => String)
  id!: string;

  @Field(() => String)
  name!: string;

  @Field(() => [OAuthClientRedirectUriSummary])
  redirectUris!: OAuthClientRedirectUriSummary[];

  @Field(() => Date, { nullable: true })
  revokedAt!: Date | null;

  @Field(() => [String])
  scopes!: string[];

  @Field(() => String)
  status!: string;

  @Field(() => Date)
  updatedAt!: Date;
}

@ObjectType()
export class CreatedOAuthClient {
  @Field(() => String)
  clientSecret!: string;

  @Field(() => OAuthClientSummary)
  client!: OAuthClientSummary;
}
