import { ArgsType, Field, Int } from '@nestjs/graphql';

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
  limit?: number | null;

  @Field(() => Int, { nullable: true })
  offset?: number | null;
}
