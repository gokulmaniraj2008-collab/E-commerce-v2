import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session) return null;
  return session.user;
}

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const items = await prisma.cartItem.findMany({
    where: { userId: user.id },
    include: { product: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(items);
}

const addSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(1).default(1),
});

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: 'Please sign in to add items to your cart.' }, { status: 401 });

  const parsed = addSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const product = await prisma.product.findUnique({ where: { id: parsed.data.productId } });
  if (!product || !product.active) return NextResponse.json({ error: 'Product unavailable' }, { status: 404 });

  const item = await prisma.cartItem.upsert({
    where: { userId_productId: { userId: user.id, productId: parsed.data.productId } },
    update: { quantity: { increment: parsed.data.quantity } },
    create: { userId: user.id, productId: parsed.data.productId, quantity: parsed.data.quantity },
  });

  return NextResponse.json(item, { status: 201 });
}
