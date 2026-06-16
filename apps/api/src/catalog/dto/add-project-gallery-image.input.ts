import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class AddProjectGalleryImageInput {
  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => String)
  displayUrl!: string;

  @Field(() => Boolean, { defaultValue: false })
  featured!: boolean;

  @Field(() => String)
  projectSlug!: string;

  @Field(() => String)
  rawUrl!: string;

  @Field(() => Int, { nullable: true })
  sortOrder?: number | null;

  @Field(() => String, { nullable: true })
  title?: string | null;
}
