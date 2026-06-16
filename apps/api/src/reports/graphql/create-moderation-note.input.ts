import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateProjectModerationNoteInput {
  @Field(() => String)
  body!: string;

  @Field(() => String)
  projectSlug!: string;
}

@InputType()
export class CreateUserModerationNoteInput {
  @Field(() => String)
  body!: string;

  @Field(() => String)
  username!: string;
}
