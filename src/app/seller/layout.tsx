import Link from 'next/link';

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-semibold mb-1">Seller hub</h1>
      <p className="text-sm text-ink/60 mb-6">Manage your listings and fulfil orders.</p>
      <nav className="flex gap-4 border-b border-line mb-6 text-sm">
        <Link href="/seller" className="pb-2 hover:text-accent2">Overview</Link>
        <Link href="/seller/products" className="pb-2 hover:text-accent2">Products</Link>
        <Link href="/seller/orders" className="pb-2 hover:text-accent2">Orders</Link>
      </nav>
      {children}
    </div>
  );
}
