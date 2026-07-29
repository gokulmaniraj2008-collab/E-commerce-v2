import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

const schema = z.object({
  address: z.object({
    fullName: z.string().min(2),
    line1: z.string().min(3),
    line2: z.string().optional(),
    city: z.string().min(2),
    state: z.string().min(2),
    pincode: z.string().min(4),
    phone: z.string().min(8),
  }),
  paymentMethod: z.enum(['COD', 'CARD', 'UPI']).default('COD'),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Please sign in to check out.' }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    include: { product: true },
  });
  if (cartItems.length === 0) {
    return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 });
  }

  for (const item of cartItems) {
    if (!item.product.active || item.product.stock < item.quantity) {
      return NextResponse.json(
        { error: `"${item.product.title}" doesn't have enough stock right now.` },
        { status: 409 }
      );
    }
  }

  const subtotal = cartItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const shippingFee = subtotal > 50000 ? 0 : 4900; // free shipping over ₹500
  const total = subtotal + shippingFee;

  const order = await prisma.$transaction(async (tx) => {
    const address = await tx.address.create({
      data: { ...parsed.data.address, userId: session.user.id },
    });

    const newOrder = await tx.order.create({
      data: {
        userId: session.user.id,
        addressId: address.id,
        subtotal,
        shippingFee,
        total,
        paymentMethod: parsed.data.paymentMethod,
        items: {
          create: cartItems.map((i) => ({
            productId: i.productId,
            sellerId: i.product.sellerId,
            title: i.product.title,
            price: i.product.price,
            quantity: i.quantity,
          })),
        },
        trackingEvents: { create: { status: 'PENDING', note: 'Order placed' } },
      },
      include: { items: true },
    });

    for (const item of cartItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    await tx.cartItem.deleteMany({ where: { userId: session.user.id } });

    return newOrder;
  });

  return NextResponse.json(order, { status: 201 });
}
