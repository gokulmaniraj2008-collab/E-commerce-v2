import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/recommendations?productId=X  -> "customers also bought" + same-category picks
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId');
  if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 });

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Orders that included this product
  const coOrders = await prisma.orderItem.findMany({
    where: { productId },
    select: { orderId: true },
  });
  const orderIds = coOrders.map((o) => o.orderId);

  const alsoBought = orderIds.length
    ? await prisma.orderItem.findMany({
        where: { orderId: { in: orderIds }, productId: { not: productId } },
        select: { productId: true },
        distinct: ['productId'],
        take: 8,
      })
    : [];

  const alsoBoughtIds = alsoBought.map((i) => i.productId);

  const [alsoBoughtProducts, sameCategory] = await Promise.all([
    prisma.product.findMany({ where: { id: { in: alsoBoughtIds }, active: true } }),
    prisma.product.findMany({
      where: { categoryId: product.categoryId, id: { not: productId }, active: true },
      take: 8,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return NextResponse.json({ alsoBought: alsoBoughtProducts, related: sameCategory });
}
