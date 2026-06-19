import { ArgsType, Field, Int } from '@nestjs/graphql';
import { Allow, IsInt, IsOptional, Min } from 'class-validator';

export interface PaginationInput {
  limit?: number | null;
  offset?: number | null;
}

export interface PaginationOptions {
  limit?: number;
  offset?: number;
}

export function paginationOptions({
  limit,
  offset,
}: PaginationInput): PaginationOptions {
  return {
    limit: limit ?? undefined,
    offset: offset ?? undefined,
  };
}

@ArgsType()
export class PaginationArgs implements PaginationInput {
  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  @Min(0)
  limit?: number | null;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  @Min(0)
  offset?: number | null;

  @Allow()
  gameVersion?: string | null;

  @Allow()
  loader?: string | null;

  @Allow()
  ownerUsername?: string | null;

  @Allow()
  projectSlug?: string | null;

  @Allow()
  reportId?: string | null;

  @Allow()
  search?: string | null;

  @Allow()
  slug?: string | null;

  @Allow()
  username?: string | null;
}
