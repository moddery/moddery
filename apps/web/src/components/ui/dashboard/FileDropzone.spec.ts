import { describe, expect, test } from 'bun:test';

import { formatFileSize, isFileAccepted } from './FileDropzone.tsx';

describe(formatFileSize.name, () => {
  test('formats bytes, kilobytes, and megabytes', () => {
    expect(formatFileSize(0)).toBe('0 B');
    expect(formatFileSize(512)).toBe('512 B');
    expect(formatFileSize(2048)).toBe('2 KB');
    expect(formatFileSize(1_572_864)).toBe('1.5 MB');
  });

  test('guards against invalid sizes', () => {
    expect(formatFileSize(-10)).toBe('0 B');
    expect(formatFileSize(Number.NaN)).toBe('0 B');
  });
});

describe(isFileAccepted.name, () => {
  function fileLike(name: string, type: string): File {
    return { name, type } as File;
  }

  test('accepts everything when no filter is set', () => {
    expect(isFileAccepted(fileLike('a.bin', ''), undefined)).toBe(true);
  });

  test('matches wildcard mime patterns', () => {
    expect(isFileAccepted(fileLike('a.png', 'image/png'), 'image/*')).toBe(
      true,
    );
    expect(isFileAccepted(fileLike('a.txt', 'text/plain'), 'image/*')).toBe(
      false,
    );
  });

  test('matches extension patterns case-insensitively', () => {
    expect(isFileAccepted(fileLike('mod.JAR', ''), '.jar,.zip')).toBe(true);
    expect(isFileAccepted(fileLike('mod.exe', ''), '.jar,.zip')).toBe(false);
  });

  test('matches exact mime types', () => {
    expect(
      isFileAccepted(fileLike('a.zip', 'application/zip'), 'application/zip'),
    ).toBe(true);
  });
});
