import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      seller: { select: { id: true, name: true } },
      reviews: { include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' } },
    },
  });
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  const avgRating = product.reviews.length
    ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
    : null;

  return NextResponse.json({ ...product, avgRating });
}

async function assertOwner(id: string) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return { error: NextResponse.json({ error: 'Not found' }, { status: 404 }) };

  if (session.user.role !== 'ADMIN' && product.sellerId !== session.user.id) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  return { session, product };
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const check = await assertOwner(params.id);
  if (check.error) return check.error;

  const body = await req.json();
  const updated = await prisma.product.update({
    where: { id: params.id },
    data: {
      title: body.title,
      description: body.description,
      price: body.price,
      mrp: body.mrp,
      stock: body.stock,
      images: body.images,
      brand: body.brand,
      categoryId: body.categoryId,
      active: body.active,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const check = await assertOwner(params.id);
  if (check.error) return check.error;

  await prisma.product.update({ where: { id: params.id }, data: { active: false } });
  return NextResponse.json({ ok: true });
}
