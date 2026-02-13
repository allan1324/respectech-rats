'use client';

export default function StudentDashboard() {
  return (
    <>
      <header className="mb-8">
        <h2 className="text-3xl font-semibold">
          Student Dashboard
        </h2>
        <p className="text-zinc-400 mt-1">
          Welcome to your Respectech learning portal
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">
            Active Tests
          </h3>
          <p className="text-zinc-400 text-sm">
            Tests will appear here when activated by your instructor.
          </p>
        </div>

        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">
            Assignments
          </h3>
          <p className="text-zinc-400 text-sm">
            Track and submit your assignments.
          </p>
        </div>

        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">
            Results
          </h3>
          <p className="text-zinc-400 text-sm">
            View graded tests and feedback.
          </p>
        </div>
      </div>
    </>
  );
}
