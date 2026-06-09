import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: collectionId, itemId } = await params;

  const collection = await prisma.collection.findFirst({
    where: { id: collectionId, userId: session.user.id },
    select: { id: true },
  });
  if (!collection) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await prisma.itemCollection.deleteMany({
    where: { collectionId, itemId },
  });

  return new NextResponse(null, { status: 204 });
}
