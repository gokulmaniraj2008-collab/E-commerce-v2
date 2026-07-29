'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Category = { id: string; name: string };

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    title: '', description: '', price: '', mrp: '', stock: '', brand: '', categoryId: '', imageUrl: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/categories').then((r) => r.json()).then(setCategories);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title,
        description: form.description,
        price: Math.round(parseFloat(form.price) * 100),
        mrp: Math.round(parseFloat(form.mrp) * 100),
        stock: parseInt(form.stock),
        brand: form.brand || undefined,
        categoryId: form.categoryId,
        images: [form.imageUrl],
      }),
    });
    setSubmitting(false);
    if (res.ok) router.push('/seller/products');
    else {
      const data = await res.json();
      setError(data.error?.formErrors?.[0] || 'Could not create listing. Check the fields.');
    }
  }

  return (
    <div>
      <h2 className="font-medium mb-4">List a new product</h2>
      <form onSubmit={submit} className="max-w-lg space-y-4">
        <div>
          <label className="text-xs text-ink/60 block mb-1">Title</label>
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full border border-line rounded-sm px-3 py-2 text-sm bg-card" />
        </div>
        <div>
          <label className="text-xs text-ink/60 block mb-1">Description</label>
          <textarea required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border border-line rounded-sm px-3 py-2 text-sm bg-card" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-ink/60 block mb-1">Price (₹)</label>
            <input required type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full border border-line rounded-sm px-3 py-2 text-sm bg-card" />
          </div>
          <div>
            <label className="text-xs text-ink/60 block mb-1">MRP (₹)</label>
            <input required type="number" step="0.01" value={form.mrp} onChange={(e) => setForm({ ...form, mrp: e.target.value })}
              className="w-full border border-line rounded-sm px-3 py-2 text-sm bg-card" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-ink/60 block mb-1">Stock quantity</label>
            <input required type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="w-full border border-line rounded-sm px-3 py-2 text-sm bg-card" />
          </div>
          <div>
            <label className="text-xs text-ink/60 block mb-1">Brand (optional)</label>
            <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })}
              className="w-full border border-line rounded-sm px-3 py-2 text-sm bg-card" />
          </div>
        </div>
        <div>
          <label className="text-xs text-ink/60 block mb-1">Category</label>
          <select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className="w-full border border-line rounded-sm px-3 py-2 text-sm bg-card">
            <option value="">Select a category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-ink/60 block mb-1">Image URL</label>
          <input required type="url" placeholder="https://…" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            className="w-full border border-line rounded-sm px-3 py-2 text-sm bg-card" />
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <button type="submit" disabled={submitting}
          className="bg-accent text-ink font-medium px-5 py-2.5 rounded-sm hover:brightness-95 disabled:opacity-50">
          {submitting ? 'Publishing…' : 'Publish listing'}
        </button>
      </form>
    </div>
  );
}
