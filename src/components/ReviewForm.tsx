'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function ReviewForm({ productId }: { productId: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!session) {
    return <p className="text-sm text-ink/60">Sign in and complete a purchase to leave a review.</p>;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await fetch(`/api/products/${productId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, body }),
    });
    setSubmitting(false);
    if (res.ok) {
      setBody('');
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || 'Could not submit review.');
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 border border-line rounded-md p-4">
      <div>
        <label className="text-sm font-medium block mb-1">Your rating</label>
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="border border-line rounded-sm px-2 py-1.5 bg-card"
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>{n} star{n !== 1 ? 's' : ''}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm font-medium block mb-1">Your review</label>
        <textarea
          required
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          className="w-full border border-line rounded-sm px-3 py-2 bg-card"
          placeholder="What did you like or dislike?"
        />
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="bg-ink text-white px-4 py-2 rounded-sm text-sm font-medium hover:brightness-110 disabled:opacity-50"
      >
        {submitting ? 'Submitting…' : 'Submit review'}
      </button>
    </form>
  );
}
