import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatINR } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminOverviewPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') redirect('/login');

  let userCount = 0, sellerCount = 0, productCount = 0, orders: any[] = [];
  try {
    [userCount, sellerCount, productCount, orders] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'SELLER' } }),
      prisma.product.count({ where: { active: true } }),
      prisma.order.findMany({ select: { total: true, status: true } }),
    ]);
  } catch {
    // No database connected yet.
  }

  const revenue = orders
    .filter((o) => o.status !== 'CANCELLED' && o.status !== 'RETURNED')
    .reduce((s, o) => s + o.total, 0);

  const stats = [
    { label: 'Total users', value: userCount },
    { label: 'Sellers', value: sellerCount },
    { label: 'Active listings', value: productCount },
    { label: 'Orders placed', value: orders.length },
    { label: 'Gross revenue', value: formatINR(revenue) },
  ];

  return (
    <div className="grid sm:grid-cols-3 md:grid-cols-5 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="border border-line rounded-md p-4 bg-card">
          <p className="text-xs text-ink/50">{s.label}</p>
          <p className="font-display text-xl font-semibold">{s.value}</p>
        </div>
      ))}
    </div>
  );
}
