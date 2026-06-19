import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class RemoveProjectGalleryImageInput {
  @Field(() => String)
  @IsString()
  imageId!: string;
}
