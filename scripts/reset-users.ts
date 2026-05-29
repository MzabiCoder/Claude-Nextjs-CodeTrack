/**
 * Deletes all users and their content except demo@devstash.io.
 *
 * Dry-run by default — pass --execute to actually delete.
 *
 *   npx tsx scripts/reset-users.ts
 *   npx tsx scripts/reset-users.ts --execute
 */

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const DEMO_EMAIL = "demo@devstash.io";
const execute = process.argv.includes("--execute");

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const demo = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL },
    select: { id: true },
  });

  if (!demo) {
    console.error(`Demo user (${DEMO_EMAIL}) not found — aborting.`);
    process.exit(1);
  }

  const demoId = demo.id;

  // Count what will be deleted
  const [users, items, collections, customTypes, accounts, sessions, tokens, tags] =
    await Promise.all([
      prisma.user.count({ where: { id: { not: demoId } } }),
      prisma.item.count({ where: { userId: { not: demoId } } }),
      prisma.collection.count({ where: { userId: { not: demoId } } }),
      prisma.itemType.count({ where: { userId: { not: demoId }, isSystem: false } }),
      prisma.account.count({ where: { userId: { not: demoId } } }),
      prisma.session.count({ where: { userId: { not: demoId } } }),
      prisma.verificationToken.count({ where: { identifier: { not: DEMO_EMAIL } } }),
      prisma.tag.count({ where: { items: { none: {} } } }),
    ]);

  console.log("\nWill delete:");
  console.log(`  ${users} user(s)           (keeping ${DEMO_EMAIL})`);
  console.log(`  ${items} item(s)`);
  console.log(`  ${collections} collection(s)`);
  console.log(`  ${customTypes} custom item type(s)`);
  console.log(`  ${accounts} OAuth account(s)`);
  console.log(`  ${sessions} session(s)`);
  console.log(`  ${tokens} verification token(s)`);
  console.log(`  ${tags} orphaned tag(s)\n`);

  if (!execute) {
    console.log("Dry run — no changes made. Pass --execute to delete.\n");
    return;
  }

  console.log("Deleting...");

  // 1. Items first — cascades item_collections; must come before itemTypes
  //    because Item → ItemType has no ON DELETE CASCADE
  const deletedItems = await prisma.item.deleteMany({
    where: { userId: { not: demoId } },
  });

  // 2. Collections — any remaining item_collections cascade automatically
  const deletedCollections = await prisma.collection.deleteMany({
    where: { userId: { not: demoId } },
  });

  // 3. Custom item types belonging to deleted users (system types have userId = null)
  const deletedTypes = await prisma.itemType.deleteMany({
    where: { userId: { not: demoId, not: null } },
  });

  // 4. OAuth accounts and sessions
  const deletedAccounts = await prisma.account.deleteMany({
    where: { userId: { not: demoId } },
  });
  const deletedSessions = await prisma.session.deleteMany({
    where: { userId: { not: demoId } },
  });

  // 5. Verification tokens for non-demo emails
  const deletedTokens = await prisma.verificationToken.deleteMany({
    where: { identifier: { not: DEMO_EMAIL } },
  });

  // 6. Users
  const deletedUsers = await prisma.user.deleteMany({
    where: { id: { not: demoId } },
  });

  // 7. Orphaned tags (no items reference them)
  const deletedTags = await prisma.tag.deleteMany({
    where: { items: { none: {} } },
  });

  console.log("\nDeleted:");
  console.log(`  ${deletedUsers.count} user(s)`);
  console.log(`  ${deletedItems.count} item(s)`);
  console.log(`  ${deletedCollections.count} collection(s)`);
  console.log(`  ${deletedTypes.count} custom item type(s)`);
  console.log(`  ${deletedAccounts.count} OAuth account(s)`);
  console.log(`  ${deletedSessions.count} session(s)`);
  console.log(`  ${deletedTokens.count} verification token(s)`);
  console.log(`  ${deletedTags.count} orphaned tag(s)`);
  console.log("\nDone.\n");
}

main()
  .catch((e) => {
    console.error("Script failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
