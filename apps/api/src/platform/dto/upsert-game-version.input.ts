import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsString } from 'class-validator';

@InputType()
export class UpsertGameVersionInput {
  @Field(() => Boolean)
  @IsBoolean()
  isActive!: boolean;

  @Field(() => String)
  @IsString()
  version!: string;
}
