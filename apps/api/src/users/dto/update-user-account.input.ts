import { Field, InputType } from '@nestjs/graphql';
import { ACCOUNT_ROLES, ACCOUNT_STATUSES } from '@moddery/shared';
import { IsIn, IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdateUserAccountInput {
  @Field(() => String)
  @IsString()
  userId!: string;

  @Field(() => String, { nullable: true })
  @IsIn(ACCOUNT_ROLES)
  @IsOptional()
  role?: string | null;

  @Field(() => String, { nullable: true })
  @IsIn(ACCOUNT_STATUSES)
  @IsOptional()
  status?: string | null;
}
