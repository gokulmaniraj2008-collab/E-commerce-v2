import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { ORDER_STATUS_FLOW } from '@/lib/utils';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      items: true,
      address: true,
      trackingEvents: { orderBy: { createdAt: 'asc' } },
      user: { select: { name: true, email: true } },
    },
  });
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  const isOwner = order.userId === session.user.id;
  const isSellerOfItem = order.items.some((i) => i.sellerId === session.user.id);
  const isAdmin = session.user.role === 'ADMIN';
  if (!isOwner && !isSellerOfItem && !isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json(order);
}

// Seller (of at least one item) or admin can advance order status
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { status, note } = await req.json();
  if (!ORDER_STATUS_FLOW.includes(status) && status !== 'CANCELLED' && status !== 'RETURNED') {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id: params.id }, include: { items: true } });
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  const isSellerOfItem = order.items.some((i) => i.sellerId === session.user.id);
  const isAdmin = session.user.role === 'ADMIN';
  const isOwnerCancelling = order.userId === session.user.id && status === 'CANCELLED';
  if (!isSellerOfItem && !isAdmin && !isOwnerCancelling) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const updated = await prisma.order.update({
    where: { id: params.id },
    data: {
      status,
      trackingEvents: { create: { status, note } },
    },
  });

  return NextResponse.json(updated);
}
