import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET /api/products?q=&category=&minPrice=&maxPrice=&sort=&sellerId=&page=
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || undefined;
  const category = searchParams.get('category') || undefined;
  const sellerId = searchParams.get('sellerId') || undefined;
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const sort = searchParams.get('sort') || 'newest';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const pageSize = 24;

  const where: any = {};
  // A seller viewing their own listings (via their dashboard) can see inactive ones too.
  const session = await getServerSession(authOptions);
  const viewingOwnListings = sellerId && session && (session.user.id === sellerId || session.user.role === 'ADMIN');
  if (!viewingOwnListings) where.active = true;

  if (q) where.title = { contains: q, mode: 'insensitive' };
  if (category) where.category = { slug: category };
  if (sellerId) where.sellerId = sellerId;
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseInt(minPrice);
    if (maxPrice) where.price.lte = parseInt(maxPrice);
  }

  const orderBy =
    sort === 'price_asc' ? { price: 'asc' as const } :
    sort === 'price_desc' ? { price: 'desc' as const } :
    { createdAt: 'desc' as const };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        category: true,
        reviews: { select: { rating: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  const withRatings = products.map((p) => {
    const avg = p.reviews.length
      ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length
      : null;
    const { reviews, ...rest } = p;
    return { ...rest, avgRating: avg, reviewCount: p.reviews.length };
  });

  return NextResponse.json({ products: withRatings, total, page, pageSize });
}

const createSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  price: z.number().int().positive(),
  mrp: z.number().int().positive(),
  stock: z.number().int().min(0),
  images: z.array(z.string()).min(1),
  brand: z.string().optional(),
  categoryId: z.string(),
});

// POST /api/products - seller or admin creates a listing
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== 'SELLER' && session.user.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Only sellers can list products.' }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: { ...parsed.data, sellerId: session.user.id },
  });

  return NextResponse.json(product, { status: 201 });
}
