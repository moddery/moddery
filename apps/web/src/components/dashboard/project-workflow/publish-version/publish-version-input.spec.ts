import { describe, expect, test } from 'bun:test';

import { type CreateVersionInput } from '../../../../lib/dashboard.ts';
import { assertCreateVersionInput } from './publish-version-input.ts';

describe(assertCreateVersionInput.name, () => {
  test('accepts complete external file metadata', () => {
    expect(() => {
      assertCreateVersionInput(baseInput());
    }).not.toThrow();
  });

  test('requires an external file URL before submitting', () => {
    const input = baseInput();
    const [file] = input.files;
    if (file === undefined) throw new Error('Missing test file');
    input.files[0] = { ...file, url: '' };

    expect(() => {
      assertCreateVersionInput(input);
    }).toThrow('Version file URL is required');
  });

  test('requires a positive file size before submitting', () => {
    const input = baseInput();
    const [file] = input.files;
    if (file === undefined) throw new Error('Missing test file');
    input.files[0] = { ...file, sizeBytes: 0 };

    expect(() => {
      assertCreateVersionInput(input);
    }).toThrow('Version file size must be a positive integer');
  });

  test('requires a primary file before submitting', () => {
    const input = baseInput();
    const [file] = input.files;
    if (file === undefined) throw new Error('Missing test file');
    input.files[0] = { ...file, primary: false };

    expect(() => {
      assertCreateVersionInput(input);
    }).toThrow('A primary version file is required');
  });

  test('rejects oversized file lists before submitting', () => {
    const input = baseInput();
    const [file] = input.files;
    if (file === undefined) throw new Error('Missing test file');
    input.files = Array.from({ length: 9 }, (_, index) => ({
      ...file,
      fileName: `example-${index.toString()}.jar`,
    }));

    expect(() => {
      assertCreateVersionInput(input);
    }).toThrow('A version can include at most 8 files');
  });

  test('rejects oversized file hash lists before submitting', () => {
    const input = baseInput();
    const [file] = input.files;
    if (file === undefined) throw new Error('Missing test file');
    input.files[0] = {
      ...file,
      hashes: Array.from({ length: 9 }, (_, index) => ({
        algorithm: 'SHA256',
        value: index.toString().padStart(64, 'a'),
      })),
    };

    expect(() => {
      assertCreateVersionInput(input);
    }).toThrow('A version file can include at most 8 hashes');
  });
});

function baseInput(): CreateVersionInput {
  return {
    changelog: null,
    channel: 'RELEASE',
    files: [
      {
        fileName: 'example.jar',
        hashes: [
          {
            algorithm: 'SHA256',
            value:
              'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
          },
        ],
        primary: true,
        sizeBytes: 128,
        url: 'https://cdn.example.test/example.jar',
      },
    ],
    gameVersions: ['1.21.6'],
    loaders: ['fabric'],
    name: 'Example',
    projectSlug: 'example',
    versionNumber: '1.0.0',
  };
}
