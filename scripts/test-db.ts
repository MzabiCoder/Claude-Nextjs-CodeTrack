import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Testing database connection...\n");

  const itemTypes = await prisma.itemType.findMany({
    orderBy: { name: "asc" },
  });

  console.log(`Found ${itemTypes.length} system item types:`);
  for (const type of itemTypes) {
    console.log(`  - ${type.name} (${type.color}) [isSystem: ${type.isSystem}]`);
  }

  const counts = {
    users: await prisma.user.count(),
    items: await prisma.item.count(),
    collections: await prisma.collection.count(),
  };

  console.log("\nTable row counts:");
  for (const [table, count] of Object.entries(counts)) {
    console.log(`  - ${table}: ${count}`);
  }

  console.log("\nDatabase connection OK.");
}

main()
  .catch((e) => {
    console.error("Database test failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
