'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { formatINR, ORDER_STATUS_FLOW } from '@/lib/utils';
import OrderStatusBadge from '@/components/OrderStatusBadge';

type Order = {
  id: string;
  total: number;
  subtotal: number;
  shippingFee: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  items: { id: string; title: string; price: number; quantity: number; sellerId: string }[];
  address: { fullName: string; line1: string; line2?: string; city: string; state: string; pincode: string; phone: string };
  trackingEvents: { id: string; status: string; note?: string; createdAt: string }[];
  user?: { name: string; email: string };
};

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  async function load() {
    const res = await fetch(`/api/orders/${params.id}`);
    if (res.ok) setOrder(await res.json());
    else setError('Order not found or you do not have access to it.');
  }

  useEffect(() => {
    load();
  }, [params.id]);

  async function updateStatus(status: string) {
    setUpdating(true);
    await fetch(`/api/orders/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setUpdating(false);
    load();
  }

  if (error) return <p className="max-w-3xl mx-auto px-4 py-10 text-sm text-danger">{error}</p>;
  if (!order) return <p className="max-w-3xl mx-auto px-4 py-10 text-sm text-ink/50">Loading order…</p>;

  const canManage = session && (session.user.role === 'ADMIN' || session.user.role === 'SELLER');
  const canCancel = session && order.status === 'PENDING' && session.user.role === 'CUSTOMER';
  const nextStatusIndex = ORDER_STATUS_FLOW.indexOf(order.status as any);
  const nextStatus = nextStatusIndex >= 0 && nextStatusIndex < ORDER_STATUS_FLOW.length - 1
    ? ORDER_STATUS_FLOW[nextStatusIndex + 1]
    : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Order #{order.id.slice(-8).toUpperCase()}</h1>
          <p className="text-sm text-ink/50">{new Date(order.createdAt).toLocaleString('en-IN')}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <section className="border border-line rounded-md p-4 bg-card">
        <h2 className="font-medium mb-3">Tracking</h2>
        <ol className="space-y-3">
          {order.trackingEvents.map((e) => (
            <li key={e.id} className="flex gap-3 text-sm">
              <span className="w-2 h-2 mt-1.5 rounded-full bg-accent2 shrink-0" />
              <div>
                <OrderStatusBadge status={e.status} />
                {e.note && <span className="ml-2 text-ink/60">{e.note}</span>}
                <p className="text-xs text-ink/40">{new Date(e.createdAt).toLocaleString('en-IN')}</p>
              </div>
            </li>
          ))}
        </ol>

        {canManage && nextStatus && (
          <button
            onClick={() => updateStatus(nextStatus)}
            disabled={updating}
            className="mt-4 bg-ink text-white text-sm px-4 py-2 rounded-sm hover:brightness-110 disabled:opacity-50"
          >
            {updating ? 'Updating…' : `Mark as ${nextStatus.replace(/_/g, ' ').toLowerCase()}`}
          </button>
        )}
        {canCancel && (
          <button
            onClick={() => updateStatus('CANCELLED')}
            className="mt-4 ml-2 border border-danger text-danger text-sm px-4 py-2 rounded-sm hover:bg-danger/5"
          >
            Cancel order
          </button>
        )}
      </section>

      <section className="border border-line rounded-md p-4 bg-card">
        <h2 className="font-medium mb-3">Items</h2>
        <div className="space-y-2">
          {order.items.map((i) => (
            <div key={i.id} className="flex justify-between text-sm">
              <span>{i.title} × {i.quantity}</span>
              <span>{formatINR(i.price * i.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-line mt-3 pt-3 space-y-1 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatINR(order.subtotal)}</span></div>
          <div className="flex justify-between"><span>Shipping</span><span>{order.shippingFee === 0 ? 'Free' : formatINR(order.shippingFee)}</span></div>
          <div className="flex justify-between font-semibold"><span>Total</span><span>{formatINR(order.total)}</span></div>
          <p className="text-xs text-ink/50 pt-1">Paid via {order.paymentMethod}</p>
        </div>
      </section>

      <section className="border border-line rounded-md p-4 bg-card text-sm">
        <h2 className="font-medium mb-2">Delivery address</h2>
        <p>{order.address.fullName}</p>
        <p>{order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ''}</p>
        <p>{order.address.city}, {order.address.state} {order.address.pincode}</p>
        <p>{order.address.phone}</p>
      </section>
    </div>
  );
}
