import { prisma } from '@/lib/prisma';
import ProductCard from '@/components/ProductCard';
import CategoryFilter from '@/components/CategoryFilter';

export const dynamic = 'force-dynamic';

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string; sort?: string; page?: string };
}) {
  const { q, category, sort } = searchParams;
  const page = Math.max(1, parseInt(searchParams.page || '1'));
  const pageSize = 24;

  const where: any = { active: true };
  if (q) where.title = { contains: q, mode: 'insensitive' };
  if (category) where.category = { slug: category };

  const orderBy =
    sort === 'price_asc' ? { price: 'asc' as const } :
    sort === 'price_desc' ? { price: 'desc' as const } :
    { createdAt: 'desc' as const };

  let categories: any[] = [];
  let items: any[] = [];
  let total = 0;
  try {
    [categories, items, total] = await Promise.all([
      prisma.category.findMany({ orderBy: { name: 'asc' } }),
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { reviews: { select: { rating: true } } },
      }),
      prisma.product.count({ where }),
    ]);
  } catch {
    // No database connected yet — render with empty state instead of crashing.
  }

  const products = items.map((p) => {
    const avg = p.reviews.length ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length : null;
    const { reviews, ...rest } = p;
    return { ...rest, avgRating: avg, reviewCount: p.reviews.length };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid md:grid-cols-[200px_1fr] gap-8">
      <CategoryFilter categories={categories} />

      <div>
        <p className="text-sm text-ink/60 mb-4">
          {q ? `Results for "${q}" — ` : ''}
          {total} product{total !== 1 ? 's' : ''}
        </p>

        {products.length === 0 ? (
          <p className="text-ink/50 text-sm">No products match your filters.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        {total > pageSize && (
          <div className="flex justify-center gap-2 mt-8 text-sm">
            {Array.from({ length: Math.ceil(total / pageSize) }, (_, i) => i + 1).map((p) => (
              <a
                key={p}
                href={`/products?${new URLSearchParams({ ...searchParams, page: String(p) } as any).toString()}`}
                className={`w-8 h-8 flex items-center justify-center rounded-sm border border-line ${
                  p === page ? 'bg-ink text-white' : 'bg-card'
                }`}
              >
                {p}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
                  }
