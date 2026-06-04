import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const item = await prisma.item.findFirst({
    where: { id, userId: session.user.id },
    select: { fileUrl: true, fileName: true },
  });

  if (!item?.fileUrl) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const upstream = await fetch(item.fileUrl);
  if (!upstream.ok) {
    return NextResponse.json({ error: 'Failed to fetch file' }, { status: 502 });
  }

  const contentType = upstream.headers.get('Content-Type') ?? 'application/octet-stream';
  const fileName = encodeURIComponent(item.fileName ?? 'download');

  return new NextResponse(upstream.body, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${fileName}"`,
    },
  });
}
