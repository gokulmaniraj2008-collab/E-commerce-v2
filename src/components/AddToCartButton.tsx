'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function AddToCartButton({ productId, stock }: { productId: string; stock: number }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [wishLoading, setWishLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function addToCart() {
    if (!session) return router.push('/login');
    setLoading(true);
    setMessage(null);
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity: 1 }),
    });
    setLoading(false);
    if (res.ok) setMessage('Added to cart.');
    else setMessage('Could not add to cart.');
  }

  async function addToWishlist() {
    if (!session) return router.push('/login');
    setWishLoading(true);
    await fetch('/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    });
    setWishLoading(false);
    setMessage('Saved to wishlist.');
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-3">
        <button
          onClick={addToCart}
          disabled={loading || stock === 0}
          className="flex-1 bg-accent text-ink font-medium py-3 rounded-sm hover:brightness-95 disabled:opacity-50"
        >
          {stock === 0 ? 'Out of stock' : loading ? 'Adding…' : 'Add to cart'}
        </button>
        <button
          onClick={addToWishlist}
          disabled={wishLoading}
          className="px-4 border border-line rounded-sm hover:bg-paper"
        >
          ♥ Save
        </button>
      </div>
      {message && <p className="text-xs text-accent2">{message}</p>}
    </div>
  );
}
