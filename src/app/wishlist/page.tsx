'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatINR } from '@/lib/utils';

type Item = { id: string; product: { id: string; title: string; price: number; images: string[] } };

export default function WishlistPage() {
  const [items, setItems] = useState<Item[] | null>(null);

  async function load() {
    const res = await fetch('/api/wishlist');
    setItems(res.ok ? await res.json() : []);
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(productId: string) {
    await fetch(`/api/wishlist/${productId}`, { method: 'DELETE' });
    load();
  }

  async function addToCart(productId: string) {
    await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity: 1 }),
    });
  }

  if (items === null) return <p className="max-w-5xl mx-auto px-4 py-10 text-sm text-ink/50">Loading wishlist…</p>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-semibold mb-6">Your wishlist</h1>
      {items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-ink/60 mb-4">Nothing saved yet.</p>
          <Link href="/products" className="text-accent2 font-medium">Browse products →</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {items.map((i) => (
            <div key={i.id} className="border border-line rounded-md bg-card overflow-hidden">
              <Link href={`/products/${i.product.id}`} className="relative block aspect-square bg-paper">
                {i.product.images[0] && (
                  <Image src={i.product.images[0]} alt={i.product.title} fill className="object-cover" />
                )}
              </Link>
              <div className="p-3 space-y-2">
                <p className="text-sm font-medium line-clamp-2">{i.product.title}</p>
                <p className="text-sm">{formatINR(i.product.price)}</p>
                <div className="flex gap-2 text-xs">
                  <button
                    onClick={() => addToCart(i.product.id)}
                    className="flex-1 bg-accent text-ink py-1.5 rounded-sm font-medium hover:brightness-95"
                  >
                    Add to cart
                  </button>
                  <button
                    onClick={() => remove(i.product.id)}
                    className="border border-line px-2 rounded-sm hover:bg-paper"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
