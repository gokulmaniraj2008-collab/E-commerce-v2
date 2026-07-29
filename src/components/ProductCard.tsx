import Link from 'next/link';
import Image from 'next/image';
import StarRating from './StarRating';
import { formatINR, discountPercent } from '@/lib/utils';

type Props = {
  product: {
    id: string;
    title: string;
    price: number;
    mrp: number;
    images: string[];
    avgRating?: number | null;
    reviewCount?: number;
  };
};

export default function ProductCard({ product }: Props) {
  const off = discountPercent(product.price, product.mrp);
  return (
    <Link
      href={`/products/${product.id}`}
      className="group block rounded-md border border-line bg-card overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-square bg-paper">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, 220px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink/30 text-xs">No image</div>
        )}
      </div>
      <div className="p-3 space-y-1">
        <h3 className="text-sm font-medium text-ink line-clamp-2 leading-snug">{product.title}</h3>
        <StarRating rating={product.avgRating ?? null} count={product.reviewCount} />
        <div className="flex items-baseline gap-2">
          <span className="font-display font-semibold text-ink">{formatINR(product.price)}</span>
          {off > 0 && (
            <>
              <span className="text-xs text-ink/40 line-through">{formatINR(product.mrp)}</span>
              <span className="text-xs text-accent2 font-medium">{off}% off</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
