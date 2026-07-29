'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatINR } from '@/lib/utils';

type CartItem = { id: string; quantity: number; product: { id: string; title: string; price: number } };

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [form, setForm] = useState({
    fullName: '', line1: '', line2: '', city: '', state: '', pincode: '', phone: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'CARD' | 'UPI'>('COD');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/cart').then((r) => (r.ok ? r.json() : [])).then(setItems);
  }, []);

  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const shipping = subtotal > 50000 || subtotal === 0 ? 0 : 4900;
  const total = subtotal + shipping;

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: form, paymentMethod }),
    });
    setSubmitting(false);
    if (res.ok) {
      const order = await res.json();
      router.push(`/orders/${order.id}`);
    } else {
      const data = await res.json();
      setError(data.error || 'Could not place order.');
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-semibold mb-6">Checkout</h1>
      <form onSubmit={placeOrder} className="grid md:grid-cols-[1fr_280px] gap-8">
        <div className="space-y-6">
          <fieldset className="border border-line rounded-md p-4 space-y-3">
            <legend className="text-sm font-medium px-1">Delivery address</legend>
            {[
              ['fullName', 'Full name'], ['line1', 'Address line 1'], ['line2', 'Address line 2 (optional)'],
              ['city', 'City'], ['state', 'State'], ['pincode', 'Pincode'], ['phone', 'Phone number'],
            ].map(([key, label]) => (
              <div key={key}>
                <label className="text-xs text-ink/60 block mb-1">{label}</label>
                <input
                  required={key !== 'line2'}
                  value={(form as any)[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full border border-line rounded-sm px-3 py-2 text-sm bg-card"
                />
              </div>
            ))}
          </fieldset>

          <fieldset className="border border-line rounded-md p-4 space-y-2">
            <legend className="text-sm font-medium px-1">Payment method</legend>
            {(['COD', 'UPI', 'CARD'] as const).map((m) => (
              <label key={m} className="flex items-center gap-2 text-sm">
                <input type="radio" checked={paymentMethod === m} onChange={() => setPaymentMethod(m)} />
                {m === 'COD' ? 'Cash on delivery' : m === 'UPI' ? 'UPI' : 'Credit / Debit card'}
              </label>
            ))}
          </fieldset>

          {error && <p className="text-sm text-danger">{error}</p>}
        </div>

        <div className="border border-line rounded-md p-4 bg-card h-fit space-y-2">
          <h2 className="font-medium mb-2">Order summary</h2>
          <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatINR(subtotal)}</span></div>
          <div className="flex justify-between text-sm">
            <span>Shipping</span><span>{shipping === 0 ? 'Free' : formatINR(shipping)}</span>
          </div>
          <div className="flex justify-between font-semibold border-t border-line pt-2 mt-2">
            <span>Total</span><span>{formatINR(total)}</span>
          </div>
          <button
            type="submit"
            disabled={submitting || items.length === 0}
            className="w-full mt-3 bg-accent text-ink font-medium py-2.5 rounded-sm hover:brightness-95 disabled:opacity-50"
          >
            {submitting ? 'Placing order…' : 'Place order'}
          </button>
        </div>
      </form>
    </div>
  );
}
