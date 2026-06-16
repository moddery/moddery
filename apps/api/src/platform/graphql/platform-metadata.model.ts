import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PlatformMetadata {
  @Field(() => [String])
  gameVersions!: string[];

  @Field(() => [String])
  loaders!: string[];

  @Field(() => [String])
  projectKinds!: string[];
}
