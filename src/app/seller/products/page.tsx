'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { formatINR } from '@/lib/utils';

type Product = { id: string; title: string; price: number; stock: number; active: boolean; images: string[] };

export default function SellerProductsPage() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[] | null>(null);

  async function load() {
    if (!session) return;
    const res = await fetch(`/api/products?sellerId=${session.user.id}`);
    if (res.ok) {
      const data = await res.json();
      setProducts(data.products);
    }
  }

  useEffect(() => {
    load();
  }, [session]);

  async function toggleActive(p: Product) {
    if (p.active) {
      await fetch(`/api/products/${p.id}`, { method: 'DELETE' });
    } else {
      await fetch(`/api/products/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...p, active: true }),
      });
    }
    load();
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-medium">Your listings</h2>
        <Link href="/seller/products/new" className="bg-accent text-ink text-sm px-3 py-1.5 rounded-sm font-medium hover:brightness-95">
          + Add product
        </Link>
      </div>

      {products === null ? (
        <p className="text-sm text-ink/50">Loading…</p>
      ) : products.length === 0 ? (
        <p className="text-sm text-ink/50">You haven't listed any products yet.</p>
      ) : (
        <div className="space-y-2">
          {products.map((p) => (
            <div key={p.id} className="flex items-center justify-between border border-line rounded-md p-3 bg-card text-sm">
              <div>
                <p className="font-medium">{p.title}</p>
                <p className="text-ink/50">{formatINR(p.price)} · {p.stock} in stock</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={p.active ? 'text-accent2' : 'text-ink/40'}>{p.active ? 'Active' : 'Hidden'}</span>
                <button onClick={() => toggleActive(p)} className="text-xs border border-line px-2 py-1 rounded-sm hover:bg-paper">
                  {p.active ? 'Deactivate' : 'Reactivate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
