import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const roots = [
  'apps/api/prisma',
  'apps/api/src',
  'apps/web/src',
  'packages/shared',
  'scripts',
  'README.md',
] as const;
const blockedTerms = [
  ['M', 'o', 'd', 'r', 'i', 'n', 't', 'h'].join(''),
  ['L', 'a', 'b', 'r', 'i', 'n', 't', 'h'].join(''),
];
const ignoredDirectories = new Set(['node_modules', 'dist', '.git']);

interface Finding {
  readonly line: number;
  readonly path: string;
}

const findings: Finding[] = [];

for (const root of roots) {
  await scanPath(root);
}

if (findings.length > 0) {
  for (const finding of findings) {
    console.error(
      `${finding.path}:${finding.line.toString()}: blocked source term`,
    );
  }
  process.exit(1);
}

async function scanPath(path: string): Promise<void> {
  let entries;

  try {
    entries = await readdir(path, { withFileTypes: true });
  } catch {
    await scanFile(path);
    return;
  }

  for (const entry of entries) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;

    const childPath = join(path, entry.name);
    if (entry.isDirectory()) {
      await scanPath(childPath);
      continue;
    }

    if (entry.isFile()) {
      await scanFile(childPath);
    }
  }
}

async function scanFile(path: string): Promise<void> {
  const source = await readFile(path, 'utf8');
  const lines = source.split(/\r?\n/u);

  lines.forEach((line, index) => {
    const lowerLine = line.toLowerCase();
    for (const term of blockedTerms) {
      if (lowerLine.includes(term.toLowerCase())) {
        findings.push({ line: index + 1, path });
      }
    }
  });
}
