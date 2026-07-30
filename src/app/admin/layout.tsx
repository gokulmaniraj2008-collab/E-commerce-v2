import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-semibold mb-1">Admin console</h1>
      <p className="text-sm text-ink/60 mb-6">Platform-wide oversight of products, orders, and users.</p>
      <nav className="flex gap-4 border-b border-line mb-6 text-sm">
        <Link href="/admin" className="pb-2 hover:text-accent2">Overview</Link>
        <Link href="/admin/products" className="pb-2 hover:text-accent2">Products</Link>
        <Link href="/admin/orders" className="pb-2 hover:text-accent2">Orders</Link>
        <Link href="/admin/users" className="pb-2 hover:text-accent2">Users</Link>
        <Link href="/settings" className="pb-2 hover:text-accent2">Settings</Link>
      </nav>
      {children}
    </div>
  );
}
