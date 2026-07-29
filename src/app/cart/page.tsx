'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatINR } from '@/lib/utils';

type CartItem = {
  id: string;
  quantity: number;
  product: { id: string; title: string; price: number; images: string[]; stock: number };
};

export default function CartPage() {
  const [items, setItems] = useState<CartItem[] | null>(null);

  async function load() {
    const res = await fetch('/api/cart');
    if (res.ok) setItems(await res.json());
    else setItems([]);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateQty(id: string, quantity: number) {
    await fetch(`/api/cart/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    });
    load();
  }

  async function remove(id: string) {
    await fetch(`/api/cart/${id}`, { method: 'DELETE' });
    load();
  }

  if (items === null) return <p className="max-w-4xl mx-auto px-4 py-10 text-sm text-ink/50">Loading cart…</p>;

  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-semibold mb-6">Your cart</h1>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-ink/60 mb-4">Your cart is empty.</p>
          <Link href="/products" className="text-accent2 font-medium">Browse products →</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-[1fr_280px] gap-8">
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 border border-line rounded-md p-3 bg-card">
                <div className="relative w-20 h-20 shrink-0 bg-paper rounded-sm overflow-hidden">
                  {item.product.images[0] && (
                    <Image src={item.product.images[0]} alt={item.product.title} fill className="object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <Link href={`/products/${item.product.id}`} className="font-medium text-sm hover:text-accent2">
                    {item.product.title}
                  </Link>
                  <p className="text-sm text-ink/60 mt-1">{formatINR(item.product.price)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <select
                      value={item.quantity}
                      onChange={(e) => updateQty(item.id, Number(e.target.value))}
                      className="border border-line rounded-sm px-2 py-1 text-sm bg-card"
                    >
                      {Array.from({ length: Math.min(item.product.stock, 10) || 1 }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                    <button onClick={() => remove(item.id)} className="text-xs text-danger hover:underline">
                      Remove
                    </button>
                  </div>
                </div>
                <p className="font-medium text-sm">{formatINR(item.product.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="border border-line rounded-md p-4 bg-card h-fit space-y-3">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span className="font-medium">{formatINR(subtotal)}</span>
            </div>
            <p className="text-xs text-ink/50">Shipping and taxes calculated at checkout.</p>
            <Link
              href="/checkout"
              className="block text-center bg-accent text-ink font-medium py-2.5 rounded-sm hover:brightness-95"
            >
              Proceed to checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
