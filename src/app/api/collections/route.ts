import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getUserIsPro, getUserCollectionCount, FREE_COLLECTION_LIMIT } from '@/lib/gates';

export async function GET(_req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const collections = await prisma.collection.findMany({
    where: { userId: session.user.id },
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  });

  return NextResponse.json(collections);
}

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

  const isPro = await getUserIsPro(session.user.id);
  if (!isPro) {
    const count = await getUserCollectionCount(session.user.id);
    if (count >= FREE_COLLECTION_LIMIT) {
      return NextResponse.json(
        { error: `Free plan is limited to ${FREE_COLLECTION_LIMIT} collections. Upgrade to Pro for unlimited collections.` },
        { status: 403 }
      );
    }
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
