/**
 * Generates a random test user for DevCodeCave and inserts it into the database.
 *
 * Usage:
 *   npx tsx scripts/create-random-user.ts
 *   npx tsx scripts/create-random-user.ts --pro
 *   npx tsx scripts/create-random-user.ts --email=me@example.com --password=Secret123!
 *   npx tsx scripts/create-random-user.ts --count=3
 *   npx tsx scripts/create-random-user.ts --dry-run      (print credentials only, no DB write)
 *
 * The user is created with `emailVerified` already set so you can sign in
 * immediately without going through the email verification flow.
 */
import 'dotenv/config';
import { randomInt, randomUUID } from 'node:crypto';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import bcrypt from 'bcryptjs';

const FIRST_NAMES = [
  'Ada', 'Linus', 'Grace', 'Dennis', 'Barbara', 'Ken', 'Margaret', 'Alan',
  'Radia', 'Guido', 'Katherine', 'Bjarne', 'Hedy', 'Tim', 'Anita', 'James',
];

const LAST_NAMES = [
  'Lovelace', 'Torvalds', 'Hopper', 'Ritchie', 'Liskov', 'Thompson', 'Hamilton',
  'Turing', 'Perlman', 'Rossum', 'Johnson', 'Stroustrup', 'Lamarr', 'Berners',
];

/** Cryptographically random element from a list. */
function pick<T>(list: readonly T[]): T {
  return list[randomInt(list.length)];
}

/**
 * Builds a password that satisfies common strength rules:
 * upper + lower + digit + symbol, 16 chars.
 */
function generatePassword(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const symbols = '!@#$%^&*?';
  const all = upper + lower + digits + symbols;

  const chars = [pick(upper), pick(lower), pick(digits), pick(symbols)];
  while (chars.length < 16) chars.push(pick(all));

  // Fisher-Yates shuffle so the guaranteed characters aren't always first.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

interface GeneratedUser {
  name: string;
  email: string;
  password: string;
}

function generateUser(): GeneratedUser {
  const first = pick(FIRST_NAMES);
  const last = pick(LAST_NAMES);
  // Short uuid fragment keeps the email unique across repeated runs.
  const suffix = randomUUID().slice(0, 6);

  return {
    name: `${first} ${last}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}.${suffix}@devcodecave.test`,
    password: generatePassword(),
  };
}

function getFlag(name: string): string | undefined {
  const match = process.argv.find(a => a.startsWith(`--${name}=`));
  return match?.split('=').slice(1).join('=');
}

function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

async function main() {
  const isPro = hasFlag('pro');
  const dryRun = hasFlag('dry-run');
  const count = Math.max(1, Number(getFlag('count') ?? 1));
  const emailOverride = getFlag('email');
  const passwordOverride = getFlag('password');

  const users: GeneratedUser[] = Array.from({ length: count }, () => {
    const user = generateUser();
    if (emailOverride) user.email = emailOverride;
    if (passwordOverride) user.password = passwordOverride;
    return user;
  });

  if (dryRun) {
    print(users, isPro, true);
    return;
  }

  if (!process.env.DATABASE_URL) {
    console.error('\n✖ DATABASE_URL is not set. Add it to .env (see .env.example),');
    console.error('  or re-run with --dry-run to just generate credentials.\n');
    process.exitCode = 1;
    return;
  }

  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter } as never);

  try {
    // Item types are shared/system-level (userId: null) and come from the seed.
    const systemTypes = await prisma.itemType.count({ where: { userId: null } });
    if (systemTypes === 0) {
      console.warn('\n⚠  No system item types found — run `npx tsx prisma/seed.ts` so the sidebar populates.');
    }

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 12);
      await prisma.user.upsert({
        where: { email: user.email },
        update: {
          password: hashedPassword,
          name: user.name,
          isPro,
          emailVerified: new Date(),
        },
        create: {
          email: user.email,
          name: user.name,
          password: hashedPassword,
          isPro,
          emailVerified: new Date(),
        },
      });
    }

    print(users, isPro, false);
  } finally {
    await prisma.$disconnect();
  }
}

function print(users: GeneratedUser[], isPro: boolean, dryRun: boolean) {
  console.log(`\n${dryRun ? '🧪 Generated (not saved)' : '✅ Created'} ${users.length} test user${users.length > 1 ? 's' : ''} — plan: ${isPro ? 'PRO' : 'FREE'}\n`);
  for (const u of users) {
    console.log('  ──────────────────────────────────────────────');
    console.log(`  Name     : ${u.name}`);
    console.log(`  Email    : ${u.email}`);
    console.log(`  Password : ${u.password}`);
  }
  console.log('  ──────────────────────────────────────────────');
  console.log('\n  Sign in at http://localhost:3000/sign-in\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
