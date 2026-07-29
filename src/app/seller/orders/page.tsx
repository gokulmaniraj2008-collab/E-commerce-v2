'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatINR, ORDER_STATUS_FLOW } from '@/lib/utils';
import OrderStatusBadge from '@/components/OrderStatusBadge';

type Order = {
  id: string;
  status: string;
  createdAt: string;
  user: { name: string; email: string };
  items: { title: string; quantity: number; price: number }[];
};

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);

  async function load() {
    const res = await fetch('/api/orders');
    setOrders(res.ok ? await res.json() : []);
  }

  useEffect(() => { load(); }, []);

  async function advance(id: string, status: string) {
    await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    load();
  }

  if (orders === null) return <p className="text-sm text-ink/50">Loading…</p>;
  if (orders.length === 0) return <p className="text-sm text-ink/50">No orders yet.</p>;

  return (
    <div className="space-y-3">
      {orders.map((o) => {
        const idx = ORDER_STATUS_FLOW.indexOf(o.status as any);
        const next = idx >= 0 && idx < ORDER_STATUS_FLOW.length - 1 ? ORDER_STATUS_FLOW[idx + 1] : null;
        const itemTotal = o.items.reduce((s, i) => s + i.price * i.quantity, 0);
        return (
          <div key={o.id} className="border border-line rounded-md p-3 bg-card text-sm">
            <div className="flex justify-between items-start">
              <div>
                <Link href={`/orders/${o.id}`} className="font-medium hover:text-accent2">
                  #{o.id.slice(-8).toUpperCase()}
                </Link>
                <p className="text-ink/50 text-xs">{o.user.name} · {new Date(o.createdAt).toLocaleDateString('en-IN')}</p>
              </div>
              <OrderStatusBadge status={o.status} />
            </div>
            <p className="text-ink/70 mt-1">
              {o.items.map((i) => `${i.title} ×${i.quantity}`).join(', ')} — {formatINR(itemTotal)}
            </p>
            {next && (
              <button
                onClick={() => advance(o.id, next)}
                className="mt-2 text-xs bg-ink text-white px-3 py-1.5 rounded-sm hover:brightness-110"
              >
                Mark as {next.replace(/_/g, ' ').toLowerCase()}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
