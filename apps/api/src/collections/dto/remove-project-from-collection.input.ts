import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class RemoveProjectFromCollectionInput {
  @Field(() => String)
  @IsString()
  collectionId!: string;

  @Field(() => String)
  @IsString()
  projectSlug!: string;
}
