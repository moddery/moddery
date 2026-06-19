import { describe, expect, test } from 'bun:test';
import { validate } from 'class-validator';

import { PaginationArgs, paginationOptions } from './pagination.js';

describe('PaginationArgs', () => {
  test('allows pagination args with sibling named GraphQL args', async () => {
    const args = Object.assign(new PaginationArgs(), {
      limit: 10,
      offset: 20,
      slug: 'core-team',
    });

    const errors = await validate(args, {
      forbidNonWhitelisted: true,
      whitelist: true,
    });

    expect(errors).toHaveLength(0);
  });

  test('rejects negative pagination args', async () => {
    const args = Object.assign(new PaginationArgs(), {
      limit: -1,
      offset: 0,
    });

    const errors = await validate(args, {
      forbidNonWhitelisted: true,
      whitelist: true,
    });

    expect(errors).toHaveLength(1);
    expect(errors[0]?.property).toBe('limit');
  });
});

describe(paginationOptions.name, () => {
  test('normalizes null pagination values to undefined options', () => {
    expect(paginationOptions({ limit: null, offset: null })).toEqual({
      limit: undefined,
      offset: undefined,
    });
  });
});
