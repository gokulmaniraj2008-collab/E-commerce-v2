'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatINR } from '@/lib/utils';
import OrderStatusBadge from '@/components/OrderStatusBadge';

type Order = {
  id: string; total: number; status: string; createdAt: string;
  user: { name: string; email: string };
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    fetch('/api/orders').then((r) => (r.ok ? r.json() : [])).then(setOrders);
  }, []);

  if (orders === null) return <p className="text-sm text-ink/50">Loading…</p>;
  if (orders.length === 0) return <p className="text-sm text-ink/50">No orders yet.</p>;

  return (
    <div className="space-y-2">
      {orders.map((o) => (
        <Link key={o.id} href={`/orders/${o.id}`} className="flex items-center justify-between border border-line rounded-md p-3 bg-card text-sm hover:shadow-sm">
          <div>
            <p className="font-medium">#{o.id.slice(-8).toUpperCase()} · {o.user.name}</p>
            <p className="text-ink/50 text-xs">{new Date(o.createdAt).toLocaleDateString('en-IN')}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-medium">{formatINR(o.total)}</span>
            <OrderStatusBadge status={o.status} />
          </div>
        </Link>
      ))}
    </div>
  );
}
