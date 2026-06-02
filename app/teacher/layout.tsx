import type { ReactNode } from 'react';
import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { signOut } from '@/app/login/actions';

export default async function TeacherLayout({
  children,
}: {
  children: ReactNode;
}) {
  const profile = await requireRole(['teacher', 'admin']);

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 flex">
      <aside className="w-64 bg-zinc-950 border-r border-zinc-800 p-6 flex flex-col">
        <div>
          <h1 className="text-xl font-bold mb-2">Respectech</h1>
          <p className="text-xs text-zinc-500 mb-2">RATS Teacher Portal</p>
          <p className="text-sm text-zinc-300 mb-8">{profile.first_name} {profile.last_name}</p>

          <nav className="space-y-4">
            <Link
              href="/teacher/dashboard"
              className="block w-full text-left px-3 py-2 rounded hover:bg-zinc-800"
            >
              Dashboard
            </Link>
          </nav>
        </div>

        <form action={signOut} className="mt-auto pt-8">
          <button
            type="submit"
            className="w-full rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
          >
            Sign out
          </button>
        </form>
      </aside>

      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
