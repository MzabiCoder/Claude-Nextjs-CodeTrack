import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

async function main() {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter } as never);
  const user = await prisma.user.update({
    where: { email: 'nfannane8287@gmail.com' },
    data: { isPro: true },
    select: { email: true, isPro: true },
  });
  console.log('Updated:', user);
  await prisma.$disconnect();
}

main().catch(console.error);
