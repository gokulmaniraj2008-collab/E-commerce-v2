import Image from 'next/image';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { formatINR, discountPercent } from '@/lib/utils';
import StarRating from '@/components/StarRating';
import AddToCartButton from '@/components/AddToCartButton';
import ReviewForm from '@/components/ReviewForm';
import ProductCard from '@/components/ProductCard';

export const dynamic = 'force-dynamic';

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  let product: any = null;
  try {
    product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        seller: { select: { name: true } },
        reviews: { include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' } },
      },
    });
  } catch {
    // No database connected yet.
  }
  if (!product || !product.active) notFound();

  const avgRating = product.reviews.length
    ? product.reviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / product.reviews.length
  
    : null;

  let related: any[] = [];
  try {
    related = await prisma.product.findMany({
      where: { categoryId: product.categoryId, id: { not: product.id }, active: true },
      take: 6,
      include: { reviews: { select: { rating: true } } },
    });
  } catch {
    // No database connected yet.
  }
  const relatedWithRating = related.map((p) => {
    const avg = p.reviews.length ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length : null;
    const { reviews, ...rest } = p;
    return { ...rest, avgRating: avg, reviewCount: p.reviews.length };
  });

  const off = discountPercent(product.price, product.mrp);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
      <div className="grid md:grid-cols-2 gap-10">
        <div className="relative aspect-square bg-card border border-line rounded-md overflow-hidden">
          {product.images[0] ? (
            <Image src={product.images[0]} alt={product.title} fill className="object-cover" priority />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-ink/30">No image</div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs text-ink/50 uppercase tracking-wide">{product.category.name}</p>
            <h1 className="font-display text-2xl font-semibold mt-1">{product.title}</h1>
            <p className="text-sm text-ink/60 mt-1">Sold by {product.seller.name}</p>
          </div>

          <StarRating rating={avgRating} count={product.reviews.length} />

          <div className="flex items-baseline gap-3">
            <span className="font-display text-3xl font-bold">{formatINR(product.price)}</span>
            {off > 0 && (
              <>
                <span className="text-ink/40 line-through">{formatINR(product.mrp)}</span>
                <span className="text-accent2 font-medium">{off}% off</span>
              </>
            )}
          </div>

          <p className="text-sm text-ink/50">
            {product.stock > 0 ? `${product.stock} in stock` : 'Currently out of stock'}
          </p>

          <AddToCartButton productId={product.id} stock={product.stock} />

          <div className="pt-4 border-t border-line">
            <h2 className="font-medium mb-2">About this item</h2>
            <p className="text-sm text-ink/70 whitespace-pre-line">{product.description}</p>
          </div>
        </div>
      </div>

      <section>
        <h2 className="font-display text-xl font-semibold mb-4">
          Ratings &amp; reviews {product.reviews.length > 0 && `(${product.reviews.length})`}
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            {product.reviews.length === 0 ? (
              <p className="text-sm text-ink/50">No reviews yet — be the first to share your experience.</p>
            ) : (
              product.reviews.map((r) => (
                <div key={r.id} className="border-b border-line pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <StarRating rating={r.rating} />
                    <span className="text-sm font-medium">{r.user.name}</span>
                  </div>
                  {r.title && <p className="text-sm font-medium">{r.title}</p>}
                  <p className="text-sm text-ink/70">{r.body}</p>
                </div>
              ))
            )}
          </div>
          <ReviewForm productId={product.id} />
        </div>
      </section>

      {relatedWithRating.length > 0 && (
        <section>
          <h2 className="font-display text-xl font-semibold mb-4">You may also like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {relatedWithRating.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
