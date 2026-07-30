'use client';

import { useState } from 'react';

export default function SettingsForm({ name: initialName }: { name: string }) {
  const [name, setName] = useState(initialName);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword && newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    setSubmitting(true);
    const res = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        ...(newPassword ? { currentPassword, newPassword } : {}),
      }),
    });
    setSubmitting(false);

    if (res.ok) {
      setSuccess('Settings updated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      const data = await res.json();
      setError(typeof data.error === 'string' ? data.error : 'Could not update settings.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <fieldset className="border border-line rounded-md p-4 space-y-3">
        <legend className="text-sm font-medium px-1">Profile</legend>
        <div>
          <label className="text-xs text-ink/60 block mb-1">Name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-line rounded-sm px-3 py-2 text-sm bg-card"
          />
        </div>
      </fieldset>

      <fieldset className="border border-line rounded-md p-4 space-y-3">
        <legend className="text-sm font-medium px-1">Change password</legend>
        <div>
          <label className="text-xs text-ink/60 block mb-1">Current password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full border border-line rounded-sm px-3 py-2 text-sm bg-card"
          />
        </div>
        <div>
          <label className="text-xs text-ink/60 block mb-1">New password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border border-line rounded-sm px-3 py-2 text-sm bg-card"
          />
        </div>
        <div>
          <label className="text-xs text-ink/60 block mb-1">Confirm new password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-line rounded-sm px-3 py-2 text-sm bg-card"
          />
        </div>
        <p className="text-xs text-ink/50">Leave blank to keep your current password.</p>
      </fieldset>

      {error && <p className="text-sm text-danger">{error}</p>}
      {success && <p className="text-sm text-accent2">{success}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="bg-accent text-ink px-4 py-2 rounded-sm font-medium text-sm hover:brightness-95 disabled:opacity-50"
      >
        {submitting ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  );
        }
