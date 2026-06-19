import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class RemoveProjectTeamMemberInput {
  @Field(() => String)
  @IsString()
  projectSlug!: string;

  @Field(() => String)
  @IsString()
  username!: string;
}
