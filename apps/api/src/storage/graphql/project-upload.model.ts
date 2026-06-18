import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ProjectUploadTarget {
  @Field(() => String)
  bucket!: string;

  @Field(() => Date)
  expiresAt!: Date;

  @Field(() => String)
  key!: string;

  @Field(() => String)
  method!: string;

  @Field(() => String)
  objectUrl!: string;

  @Field(() => String)
  uploadUrl!: string;
}
