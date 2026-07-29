import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// [id] here is the productId for convenience on the client
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await prisma.wishlistItem.deleteMany({
    where: { userId: session.user.id, productId: params.id },
  });
  return NextResponse.json({ ok: true });
}
