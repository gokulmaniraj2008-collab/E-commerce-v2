'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'CUSTOMER' as 'CUSTOMER' | 'SELLER' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error?.formErrors?.[0] || data.error || 'Could not create account.');
      setLoading(false);
      return;
    }
    const signInRes = await signIn('credentials', { email: form.email, password: form.password, redirect: false });
    setLoading(false);
    if (signInRes?.ok) router.push(form.role === 'SELLER' ? '/seller' : '/');
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="font-display text-2xl font-semibold mb-6">Create your account</h1>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="text-xs text-ink/60 block mb-1">Full name</label>
          <input
            required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-line rounded-sm px-3 py-2 text-sm bg-card"
          />
        </div>
        <div>
          <label className="text-xs text-ink/60 block mb-1">Email</label>
          <input
            required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border border-line rounded-sm px-3 py-2 text-sm bg-card"
          />
        </div>
        <div>
          <label className="text-xs text-ink/60 block mb-1">Password</label>
          <input
            required type="password" minLength={6} value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full border border-line rounded-sm px-3 py-2 text-sm bg-card"
          />
        </div>
        <div>
          <label className="text-xs text-ink/60 block mb-1">Account type</label>
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-1.5">
              <input type="radio" checked={form.role === 'CUSTOMER'} onChange={() => setForm({ ...form, role: 'CUSTOMER' })} />
              Shopper
            </label>
            <label className="flex items-center gap-1.5">
              <input type="radio" checked={form.role === 'SELLER'} onChange={() => setForm({ ...form, role: 'SELLER' })} />
              Seller
            </label>
          </div>
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <button
          type="submit" disabled={loading}
          className="w-full bg-accent text-ink font-medium py-2.5 rounded-sm hover:brightness-95 disabled:opacity-50"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="text-sm text-ink/60 mt-4">
        Already have an account? <Link href="/login" className="text-accent2 font-medium">Sign in</Link>
      </p>
    </div>
  );
}
