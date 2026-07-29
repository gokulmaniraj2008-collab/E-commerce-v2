'use client';

import { useRouter, useSearchParams } from 'next/navigation';

type Category = { id: string; name: string; slug: string };

export default function CategoryFilter({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get('category');

  function setParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/products?${params.toString()}`);
  }

  return (
    <aside className="space-y-6 text-sm">
      <div>
        <h3 className="font-medium mb-2">Category</h3>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => setParam('category', null)}
              className={`hover:text-accent2 ${!active ? 'text-accent2 font-medium' : 'text-ink/70'}`}
            >
              All categories
            </button>
          </li>
          {categories.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => setParam('category', c.slug)}
                className={`hover:text-accent2 ${active === c.slug ? 'text-accent2 font-medium' : 'text-ink/70'}`}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-medium mb-2">Sort by</h3>
        <select
          defaultValue={searchParams.get('sort') || 'newest'}
          onChange={(e) => setParam('sort', e.target.value)}
          className="w-full border border-line rounded-sm px-2 py-1.5 bg-card"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>
    </aside>
  );
}
