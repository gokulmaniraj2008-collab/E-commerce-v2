import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import SettingsForm from '@/components/SettingsForm';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const roleLabel =
    session.user.role.charAt(0) + session.user.role.slice(1).toLowerCase();

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-semibold mb-1">Account settings</h1>
      <p className="text-sm text-ink/60 mb-6">
        Signed in as {session.user.email} · {roleLabel}
      </p>
      <SettingsForm name={session.user.name} />
    </div>
  );
}
