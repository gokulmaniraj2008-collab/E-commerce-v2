import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (session.user.role === 'ADMIN') {
    const orders = await prisma.order.findMany({
      include: { items: true, user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(orders);
  }

  if (session.user.role === 'SELLER') {
    const orders = await prisma.order.findMany({
      where: { items: { some: { sellerId: session.user.id } } },
      include: {
        items: { where: { sellerId: session.user.id } },
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(orders);
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { items: true, address: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(orders);
}
