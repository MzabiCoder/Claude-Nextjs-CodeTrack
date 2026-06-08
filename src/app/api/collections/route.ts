import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const description =
    typeof body.description === 'string' ? body.description.trim() || null : null;

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const collection = await prisma.collection.create({
    data: {
      userId: session.user.id,
      name,
      description,
    },
    select: {
      id: true,
      name: true,
      description: true,
      isFavorite: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(collection, { status: 201 });
}
