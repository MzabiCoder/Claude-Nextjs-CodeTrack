import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { putObject, getPublicUrl } from '@/lib/r2';
import { randomUUID } from 'crypto';
import path from 'path';
import { getUserIsPro } from '@/lib/gates';

const IMAGE_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/svg+xml',
]);
const FILE_TYPES = new Set([
  'application/pdf',
  'text/plain',
  'text/markdown',
  'application/json',
  'application/x-yaml',
  'text/yaml',
  'application/xml',
  'text/xml',
  'text/csv',
  'application/toml',
]);

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const isPro = await getUserIsPro(session.user.id);
  if (!isPro) {
    return NextResponse.json({ error: 'File and image uploads require a Pro subscription.' }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const file = formData.get('file');
  const itemType = formData.get('itemType');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }
  if (itemType !== 'file' && itemType !== 'image') {
    return NextResponse.json({ error: 'Invalid item type' }, { status: 400 });
  }

  const isImage = itemType === 'image';
  const allowedTypes = isImage ? IMAGE_TYPES : FILE_TYPES;
  const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_FILE_SIZE;
  const maxSizeLabel = isImage ? '5 MB' : '10 MB';

  if (!allowedTypes.has(file.type)) {
    return NextResponse.json({ error: `File type not allowed: ${file.type}` }, { status: 400 });
  }
  if (file.size > maxSize) {
    return NextResponse.json(
      { error: `File too large. Max ${maxSizeLabel}.` },
      { status: 400 }
    );
  }

  const ext = path.extname(file.name);
  const folder = isImage ? 'images' : 'files';
  const key = `users/${session.user.id}/${folder}/${randomUUID()}${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  await putObject(key, buffer, file.type);

  return NextResponse.json({
    fileUrl: getPublicUrl(key),
    fileName: file.name,
    fileSize: file.size,
    key,
  });
}
