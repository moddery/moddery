import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class CreateProjectModerationNoteInput {
  @Field(() => String)
  @IsString()
  body!: string;

  @Field(() => String)
  @IsString()
  projectSlug!: string;
}

@InputType()
export class CreateUserModerationNoteInput {
  @Field(() => String)
  @IsString()
  body!: string;

  @Field(() => String)
  @IsString()
  username!: string;
}
