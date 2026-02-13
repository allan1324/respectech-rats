'use client';

export default function TeacherDashboard() {
  return (
    <div className="min-h-screen flex bg-zinc-900 text-zinc-100">

      {/* Sidebar */}
      <aside className="w-64 bg-zinc-950 border-r border-zinc-800 p-6">
        <h1 className="text-xl font-bold mb-8">
          Respectech
        </h1>

        <nav className="space-y-4">
          <div className="text-sm text-zinc-400 uppercase tracking-wide">
            Teacher Menu
          </div>

          <button className="block w-full text-left px-3 py-2 rounded bg-zinc-800">
            Dashboard
          </button>

          <button className="block w-full text-left px-3 py-2 rounded hover:bg-zinc-800">
            Create Test
          </button>

          <button className="block w-full text-left px-3 py-2 rounded hover:bg-zinc-800">
            Assignments
          </button>

          <button className="block w-full text-left px-3 py-2 rounded hover:bg-zinc-800">
            Review Submissions
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 bg-zinc-900">
        <header className="mb-8">
          <h2 className="text-3xl font-semibold">
            Teacher Dashboard
          </h2>
          <p className="text-zinc-400 mt-1">
            Manage tests, assignments, and student submissions
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          
          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">
              Create Tests
            </h3>
            <p className="text-zinc-400 text-sm">
              Set up tests and control when students can access them.
            </p>
          </div>

          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">
              Assignments
            </h3>
            <p className="text-zinc-400 text-sm">
              Create assignments and provide reference examples.
            </p>
          </div>

          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">
              Review & Grade
            </h3>
            <p className="text-zinc-400 text-sm">
              Review submissions and trigger automated grading.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}
