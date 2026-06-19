import { Field, InputType } from '@nestjs/graphql';
import {
  COLLECTION_VISIBILITIES,
  type CollectionVisibility,
} from '@moddery/shared';
import { IsIn, IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdateCollectionInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  color?: string | null;

  @Field(() => String)
  @IsString()
  collectionId!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  iconUrl?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  name?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  slug?: string | null;

  @Field(() => String, { nullable: true })
  @IsIn(COLLECTION_VISIBILITIES)
  @IsOptional()
  visibility?: CollectionVisibility | null;
}
