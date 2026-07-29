const STYLES: Record<string, string> = {
  PENDING: 'bg-ink/10 text-ink',
  CONFIRMED: 'bg-accent/15 text-accent',
  SHIPPED: 'bg-accent/15 text-accent',
  OUT_FOR_DELIVERY: 'bg-accent/20 text-accent',
  DELIVERED: 'bg-accent2/15 text-accent2',
  CANCELLED: 'bg-danger/15 text-danger',
  RETURNED: 'bg-danger/15 text-danger',
};

const LABELS: Record<string, string> = {
  PENDING: 'Order placed',
  CONFIRMED: 'Confirmed',
  SHIPPED: 'Shipped',
  OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  RETURNED: 'Returned',
};

export default function OrderStatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block px-2 py-1 rounded-sm text-xs font-medium ${STYLES[status] || 'bg-ink/10'}`}>
      {LABELS[status] || status}
    </span>
  );
}
