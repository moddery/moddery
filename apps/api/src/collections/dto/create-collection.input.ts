import { Field, InputType } from '@nestjs/graphql';
import {
  COLLECTION_VISIBILITIES,
  type CollectionVisibility,
} from '@moddery/shared';
import { IsIn, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateCollectionInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  color?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  iconUrl?: string | null;

  @Field(() => String)
  @IsString()
  name!: string;

  @Field(() => String)
  @IsString()
  slug!: string;

  @Field(() => String, { defaultValue: 'PRIVATE' })
  @IsIn(COLLECTION_VISIBILITIES)
  visibility!: CollectionVisibility;
}
