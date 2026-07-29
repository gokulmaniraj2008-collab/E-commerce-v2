'use client';

import { useEffect, useState } from 'react';

type User = { id: string; name: string; email: string; role: string; banned: boolean };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[] | null>(null);

  async function load() {
    const res = await fetch('/api/admin/users');
    setUsers(res.ok ? await res.json() : []);
  }

  useEffect(() => { load(); }, []);

  async function updateUser(id: string, patch: Partial<User>) {
    await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    load();
  }

  if (users === null) return <p className="text-sm text-ink/50">Loading…</p>;

  return (
    <div className="space-y-2">
      {users.map((u) => (
        <div key={u.id} className="flex items-center justify-between border border-line rounded-md p-3 bg-card text-sm">
          <div>
            <p className="font-medium">{u.name}</p>
            <p className="text-ink/50 text-xs">{u.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={u.role}
              onChange={(e) => updateUser(u.id, { role: e.target.value })}
              className="border border-line rounded-sm px-2 py-1 bg-card text-xs"
            >
              <option value="CUSTOMER">Customer</option>
              <option value="SELLER">Seller</option>
              <option value="ADMIN">Admin</option>
            </select>
            <button
              onClick={() => updateUser(u.id, { banned: !u.banned })}
              className={`text-xs px-2 py-1 rounded-sm border ${u.banned ? 'border-accent2 text-accent2' : 'border-danger text-danger'}`}
            >
              {u.banned ? 'Unban' : 'Ban'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
