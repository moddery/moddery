import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DownloadRecord {
  @Field(() => String)
  fileId!: string;

  @Field(() => Int)
  projectDownloads!: number;

  @Field(() => String)
  projectId!: string;

  @Field(() => Int)
  versionDownloads!: number;

  @Field(() => String)
  versionId!: string;
}
