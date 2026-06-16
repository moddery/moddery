import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ProjectViewRecord {
  @Field(() => String)
  projectId!: string;

  @Field(() => String)
  projectSlug!: string;
}
