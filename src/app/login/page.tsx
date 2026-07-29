'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (res?.ok) router.push('/');
    else setError('Incorrect email or password.');
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="font-display text-2xl font-semibold mb-6">Sign in</h1>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="text-xs text-ink/60 block mb-1">Email</label>
          <input
            required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-line rounded-sm px-3 py-2 text-sm bg-card"
          />
        </div>
        <div>
          <label className="text-xs text-ink/60 block mb-1">Password</label>
          <input
            required type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-line rounded-sm px-3 py-2 text-sm bg-card"
          />
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <button
          type="submit" disabled={loading}
          className="w-full bg-accent text-ink font-medium py-2.5 rounded-sm hover:brightness-95 disabled:opacity-50"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="text-sm text-ink/60 mt-4">
        New here? <Link href="/register" className="text-accent2 font-medium">Create an account</Link>
      </p>
    </div>
  );
}
