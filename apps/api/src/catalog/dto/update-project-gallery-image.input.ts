import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class UpdateProjectGalleryImageInput {
  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => String)
  displayUrl!: string;

  @Field(() => Boolean)
  featured!: boolean;

  @Field(() => String)
  imageId!: string;

  @Field(() => String)
  rawUrl!: string;

  @Field(() => Int)
  sortOrder!: number;

  @Field(() => String, { nullable: true })
  title?: string | null;
}
