'use client';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-zinc-900 text-zinc-100">

      {/* Sidebar */}
      <aside className="w-64 bg-zinc-950 border-r border-zinc-800 p-6">
        <h1 className="text-xl font-bold mb-8">
          Respectech
        </h1>

        <nav className="space-y-4">
          <a
            href="/student/dashboard"
            className="block w-full text-left px-3 py-2 rounded hover:bg-zinc-800"
          >
            Dashboard
          </a>

          <a
            href="/student/tests"
            className="block w-full text-left px-3 py-2 rounded hover:bg-zinc-800"
          >
            Tests
          </a>

          <a
            href="/student/assignments"
            className="block w-full text-left px-3 py-2 rounded hover:bg-zinc-800"
          >
            Assignments
          </a>

          <a
            href="/student/results"
            className="block w-full text-left px-3 py-2 rounded hover:bg-zinc-800"
          >
            Results
          </a>
        </nav>
      </aside>

      {/* Page content */}
      <main className="flex-1 p-8">
        {children}
      </main>

    </div>
  );
}
