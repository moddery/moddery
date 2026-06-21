import { AccountRole, AccountStatus, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const target = parseTarget(Bun.argv.slice(2));
  const user = await prisma.user.findFirst({
    select: {
      email: true,
      id: true,
      role: true,
      status: true,
      username: true,
    },
    where:
      target.kind === 'email'
        ? { email: { equals: target.value, mode: 'insensitive' } }
        : { username: { equals: target.value, mode: 'insensitive' } },
  });

  if (user === null) {
    throw new Error(`No user found for ${target.kind} ${target.value}`);
  }

  const updated = await prisma.user.update({
    data: {
      role: AccountRole.ADMIN,
      status: AccountStatus.ACTIVE,
    },
    select: {
      email: true,
      id: true,
      role: true,
      status: true,
      username: true,
    },
    where: { id: user.id },
  });

  await prisma.auditLog.create({
    data: {
      action: 'USER_ACCOUNT_UPDATED',
      metadata: {
        after: {
          role: updated.role,
          status: updated.status,
        },
        before: {
          role: user.role,
          status: user.status,
        },
        bootstrap: true,
      },
      targetUserId: updated.id,
    },
  });

  console.log(
    `Promoted ${updated.username} (${updated.email ?? 'no email'}) to ADMIN`,
  );
}

function parseTarget(args: string[]): BootstrapTarget {
  const username = valueAfter(args, '--username');
  const email = valueAfter(args, '--email');

  if (username && email) {
    throw new Error('Pass only one of --username or --email');
  }

  if (username) {
    return { kind: 'username', value: username };
  }

  if (email) {
    return { kind: 'email', value: email };
  }

  throw new Error('Usage: bun run bootstrap:admin -- --username <username>');
}

function valueAfter(args: string[], flag: string): string | null {
  const index = args.indexOf(flag);
  if (index === -1) return null;

  const value = args[index + 1]?.trim();
  if (!value) {
    throw new Error(`${flag} requires a value`);
  }

  return value;
}

interface BootstrapTarget {
  kind: 'email' | 'username';
  value: string;
}

await main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
