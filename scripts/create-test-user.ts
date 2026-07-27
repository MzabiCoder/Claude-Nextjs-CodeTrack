import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import bcrypt from 'bcryptjs';

async function main() {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter } as never);
  const hashedPassword = await bcrypt.hash('testpass123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'test@devstash.io' },
    update: { password: hashedPassword, emailVerified: new Date(), isPro: false },
    create: {
      email: 'test@devstash.io',
      name: 'Test User',
      password: hashedPassword,
      isPro: false,
      emailVerified: new Date(),
    },
  });
  console.log('Created:', user.email, '| isPro:', user.isPro);
  await prisma.$disconnect();
}

main().catch(console.error);
