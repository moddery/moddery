import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsString, Min } from 'class-validator';

@InputType()
export class UpdateCollectionProjectInput {
  @Field(() => String)
  @IsString()
  collectionId!: string;

  @Field(() => String)
  @IsString()
  projectSlug!: string;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  sortOrder!: number;
}
