export default function StarRating({ rating, count }: { rating: number | null; count?: number }) {
  if (rating === null) {
    return <span className="text-xs text-ink/40">No ratings yet</span>;
  }
  const full = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-1 text-sm">
      <span className="text-accent tracking-tight" aria-hidden>
        {'★'.repeat(full)}
        <span className="text-ink/20">{'★'.repeat(5 - full)}</span>
      </span>
      <span className="text-ink/60">
        {rating.toFixed(1)}
        {typeof count === 'number' ? ` (${count})` : ''}
      </span>
    </span>
  );
}
