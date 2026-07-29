'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [q, setQ] = useState('');

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(q ? `/products?q=${encodeURIComponent(q)}` : '/products');
  }

  return (
    <header className="bg-ink text-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link href="/" className="font-display font-bold text-xl tracking-tight shrink-0">
          Bazario
        </Link>

        <form onSubmit={handleSearch} className="flex-1 flex max-w-2xl">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            type="text"
            placeholder="Search products, brands and categories"
            className="w-full px-3 py-2 rounded-l-sm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            type="submit"
            className="bg-accent px-4 rounded-r-sm text-ink font-medium text-sm hover:brightness-95"
          >
            Search
          </button>
        </form>

        <nav className="flex items-center gap-4 text-sm shrink-0">
          {session ? (
            <>
              {session.user.role === 'ADMIN' && (
                <Link href="/admin" className="hover:text-accent">Admin</Link>
              )}
              {session.user.role === 'SELLER' && (
                <Link href="/seller" className="hover:text-accent">Seller hub</Link>
              )}
              <Link href="/wishlist" className="hover:text-accent">Wishlist</Link>
              <Link href="/orders" className="hover:text-accent">Orders</Link>
              <Link href="/cart" className="hover:text-accent">Cart</Link>
              <button onClick={() => signOut({ callbackUrl: '/' })} className="hover:text-accent">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-accent">Sign in</Link>
              <Link
                href="/register"
                className="bg-accent text-ink px-3 py-1.5 rounded-sm font-medium hover:brightness-95"
              >
                Create account
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
