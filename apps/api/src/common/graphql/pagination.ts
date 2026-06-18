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
