'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatINR } from '@/lib/utils';
import OrderStatusBadge from '@/components/OrderStatusBadge';

type Order = {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  items: { title: string; quantity: number }[];
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    fetch('/api/orders').then((r) => (r.ok ? r.json() : [])).then(setOrders);
  }, []);

  if (orders === null) return <p className="max-w-4xl mx-auto px-4 py-10 text-sm text-ink/50">Loading orders…</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-semibold mb-6">Your orders</h1>
      {orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-ink/60 mb-4">You haven't placed any orders yet.</p>
          <Link href="/products" className="text-accent2 font-medium">Start shopping →</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <Link
              key={o.id}
              href={`/orders/${o.id}`}
              className="block border border-line rounded-md p-4 bg-card hover:shadow-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-xs text-ink/50">Order #{o.id.slice(-8).toUpperCase()}</p>
                  <p className="text-xs text-ink/50">{new Date(o.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
                <OrderStatusBadge status={o.status} />
              </div>
              <p className="text-sm text-ink/70">
                {o.items.map((i) => i.title).join(', ').slice(0, 90)}
                {o.items.map((i) => i.title).join(', ').length > 90 ? '…' : ''}
              </p>
              <p className="font-medium mt-1">{formatINR(o.total)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
