import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

const schema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  body: z.string().min(3),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Please sign in to leave a review.' }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  // Verify the user actually purchased this product (delivered order)
  const purchased = await prisma.orderItem.findFirst({
    where: {
      productId: params.id,
      order: { userId: session.user.id, status: 'DELIVERED' },
    },
  });
  if (!purchased) {
    return NextResponse.json(
      { error: 'You can review a product only after it has been delivered to you.' },
      { status: 403 }
    );
  }

  const review = await prisma.review.upsert({
    where: { productId_userId: { productId: params.id, userId: session.user.id } },
    update: parsed.data,
    create: { ...parsed.data, productId: params.id, userId: session.user.id },
  });

  return NextResponse.json(review, { status: 201 });
}
