import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import ProductCard from '@/components/ProductCard';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let categories: any[] = [];
  let latest: any[] = [];
  try {
    [categories, latest] = await Promise.all([
      prisma.category.findMany({ take: 8, orderBy: { name: 'asc' } }),
      prisma.product.findMany({
        where: { active: true },
        take: 12,
        orderBy: { createdAt: 'desc' },
        include: { reviews: { select: { rating: true } } },
      }),
    ]);
  } catch {
    // No database connected yet — render with empty state instead of crashing.
  }

  const products = latest.map((p) => {
    const avg = p.reviews.length ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length : null;
    const { reviews, ...rest } = p;
    return { ...rest, avgRating: avg, reviewCount: p.reviews.length };
  });

  return (
    <div>
      <section className="bg-ink text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <p className="text-accent font-medium mb-2 tracking-wide uppercase text-xs">Every category, one cart</p>
            <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-4">
              Shop it. Sell it. Track it — all in one marketplace.
            </h1>
            <p className="text-white/70 mb-6 max-w-md">
              Browse thousands of listings from independent sellers across India, with order tracking,
              reviews, and wishlists built in.
            </p>
            <Link
              href="/products"
              className="inline-block bg-accent text-ink px-6 py-3 rounded-sm font-medium hover:brightness-95"
            >
              Start shopping
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {categories.slice(0, 4).map((c) => (
              <Link
                key={c.id}
                href={`/products?category=${c.slug}`}
                className="bg-white/5 border border-white/10 rounded-md p-4 hover:bg-white/10 transition-colors"
              >
                <span className="font-medium">{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold">Newly listed</h2>
          <Link href="/products" className="text-sm text-accent2 font-medium">
            View all →
          </Link>
        </div>
        {products.length === 0 ? (
          <p className="text-ink/50 text-sm">
            No products listed yet. Run the seed script or sign in as a seller to add your first listing.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
