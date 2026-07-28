import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

async function main() {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter } as never);
  const user = await prisma.user.findUnique({
    where: { email: 'nfannane8287@gmail.com' },
    select: { id: true, email: true, emailVerified: true, isPro: true, password: true, accounts: { select: { provider: true } } },
  });
  if (!user) {
    console.log('User NOT FOUND');
  } else {
    console.log({
      email: user.email,
      emailVerified: user.emailVerified,
      isPro: user.isPro,
      hasPassword: !!user.password,
      oauthProviders: user.accounts.map(a => a.provider),
    });
  }
  await prisma.$disconnect();
}

main().catch(console.error);
