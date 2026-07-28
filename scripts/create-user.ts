import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import bcrypt from 'bcryptjs';

async function main() {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter } as never);
  const hashedPassword = await bcrypt.hash('@5nackattacK', 12);
  const user = await prisma.user.upsert({
    where: { email: 'nfannane8287@gmail.com' },
    update: { password: hashedPassword, emailVerified: new Date() },
    create: {
      email: 'nfannane8287@gmail.com',
      name: 'Nabil',
      password: hashedPassword,
      isPro: false,
      emailVerified: new Date(),
    },
  });
  console.log('Ready:', user.email, '| isPro:', user.isPro);
  await prisma.$disconnect();
}

main().catch(console.error);
