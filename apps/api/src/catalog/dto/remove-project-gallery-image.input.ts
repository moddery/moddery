import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class RemoveProjectGalleryImageInput {
  @Field(() => String)
  imageId!: string;
}
