'use client';

import { useEffect, useState } from 'react';
import { formatINR } from '@/lib/utils';

type Product = { id: string; title: string; price: number; active: boolean; seller?: { name: string } };

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[] | null>(null);

  async function load() {
    const res = await fetch('/api/products?page=1');
    if (res.ok) {
      const data = await res.json();
      setProducts(data.products);
    }
  }

  useEffect(() => { load(); }, []);

  async function remove(id: string) {
    if (!confirm('Remove this listing from the marketplace?')) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    load();
  }

  if (products === null) return <p className="text-sm text-ink/50">Loading…</p>;

  return (
    <div className="space-y-2">
      {products.length === 0 ? (
        <p className="text-sm text-ink/50">No products listed.</p>
      ) : (
        products.map((p) => (
          <div key={p.id} className="flex items-center justify-between border border-line rounded-md p-3 bg-card text-sm">
            <div>
              <p className="font-medium">{p.title}</p>
              <p className="text-ink/50">{formatINR(p.price)}</p>
            </div>
            <button onClick={() => remove(p.id)} className="text-xs text-danger border border-danger/40 px-2 py-1 rounded-sm hover:bg-danger/5">
              Remove listing
            </button>
          </div>
        ))
      )}
    </div>
  );
}
