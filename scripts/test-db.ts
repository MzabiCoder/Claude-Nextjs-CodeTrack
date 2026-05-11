import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("=== Database Verification ===\n");

  // System item types
  const itemTypes = await prisma.itemType.findMany({
    where: { isSystem: true, userId: null },
    orderBy: { name: "asc" },
  });
  console.log(`System item types (${itemTypes.length}):`);
  for (const t of itemTypes) {
    console.log(`  ${t.color}  ${t.name.padEnd(10)} icon: ${t.icon}`);
  }

  // Demo user
  console.log("\nDemo user:");
  const user = await prisma.user.findUnique({
    where: { email: "demo@devstash.io" },
    select: { id: true, email: true, name: true, isPro: true, emailVerified: true },
  });
  if (!user) {
    console.log("  ✗ Not found — run `npx prisma db seed`");
  } else {
    console.log(`  email:         ${user.email}`);
    console.log(`  name:          ${user.name}`);
    console.log(`  isPro:         ${user.isPro}`);
    console.log(`  emailVerified: ${user.emailVerified?.toISOString() ?? "null"}`);
  }

  // Collections with item counts
  console.log("\nCollections:");
  const collections = await prisma.collection.findMany({
    include: {
      items: { include: { item: { include: { itemType: true } } } },
    },
    orderBy: { name: "asc" },
  });
  for (const col of collections) {
    console.log(`\n  ${col.name} — ${col.description}`);
    for (const ic of col.items) {
      const { item } = ic;
      const preview =
        item.contentType === "URL"
          ? item.url ?? ""
          : (item.content ?? "").split("\n")[0].slice(0, 60);
      console.log(`    [${item.itemType.name.padEnd(8)}] ${item.title}`);
      console.log(`               ${preview}`);
    }
  }

  // Totals
  const [users, items, itemCollections] = await Promise.all([
    prisma.user.count(),
    prisma.item.count(),
    prisma.itemCollection.count(),
  ]);
  console.log("\n--- Totals ---");
  console.log(`  users:           ${users}`);
  console.log(`  item types:      ${itemTypes.length}`);
  console.log(`  collections:     ${collections.length}`);
  console.log(`  items:           ${items}`);
  console.log(`  item-collection: ${itemCollections} assignments`);

  console.log("\nDatabase OK.");
}

main()
  .catch((e) => {
    console.error("Database test failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
