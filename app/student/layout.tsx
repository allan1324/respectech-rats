'use client';

import Link from 'next/link';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-zinc-900 text-zinc-100">
      <aside className="w-64 bg-zinc-950 border-r border-zinc-800 p-6">
        <h1 className="text-xl font-bold mb-2">Respectech</h1>
        <p className="text-xs text-zinc-500 mb-8">RATS Student Portal</p>

        <nav className="space-y-4">
          <Link
            href="/student/dashboard"
            className="block w-full text-left px-3 py-2 rounded hover:bg-zinc-800"
          >
            Dashboard
          </Link>

          <Link
            href="/student/tests"
            className="block w-full text-left px-3 py-2 rounded hover:bg-zinc-800"
          >
            Tests
          </Link>

          <Link
            href="/student/assignments"
            className="block w-full text-left px-3 py-2 rounded hover:bg-zinc-800"
          >
            Assignments
          </Link>

          <Link
            href="/student/results"
            className="block w-full text-left px-3 py-2 rounded hover:bg-zinc-800"
          >
            Results
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
