import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatINR } from '@/lib/utils';

export default async function SellerOverviewPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'SELLER') redirect('/login');

  const [productCount, orderItems] = await Promise.all([
    prisma.product.count({ where: { sellerId: session.user.id, active: true } }),
    prisma.orderItem.findMany({ where: { sellerId: session.user.id }, select: { price: true, quantity: true, order: { select: { status: true } } } }),
  ]);

  const revenue = orderItems
    .filter((i) => i.order.status !== 'CANCELLED' && i.order.status !== 'RETURNED')
    .reduce((s, i) => s + i.price * i.quantity, 0);
  const pending = orderItems.filter((i) => i.order.status === 'PENDING' || i.order.status === 'CONFIRMED').length;

  return (
    <div className="grid sm:grid-cols-3 gap-4">
      <div className="border border-line rounded-md p-4 bg-card">
        <p className="text-xs text-ink/50">Active listings</p>
        <p className="font-display text-2xl font-semibold">{productCount}</p>
        <Link href="/seller/products/new" className="text-xs text-accent2 font-medium">+ Add a product</Link>
      </div>
      <div className="border border-line rounded-md p-4 bg-card">
        <p className="text-xs text-ink/50">Total revenue</p>
        <p className="font-display text-2xl font-semibold">{formatINR(revenue)}</p>
      </div>
      <div className="border border-line rounded-md p-4 bg-card">
        <p className="text-xs text-ink/50">Orders awaiting action</p>
        <p className="font-display text-2xl font-semibold">{pending}</p>
        <Link href="/seller/orders" className="text-xs text-accent2 font-medium">View orders</Link>
      </div>
    </div>
  );
}
