'use client';

export default function StudentResults() {
  return (
    <>
      <header className="mb-8">
        <h2 className="text-3xl font-semibold">
          Results
        </h2>
        <p className="text-zinc-400 mt-1">
          View your test scores and system feedback
        </p>
      </header>

      <div className="space-y-4">

        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold">
            Data Analysis – Week 1 Test
          </h3>

          <div className="mt-2 flex items-center gap-4">
            <span className="text-2xl font-bold">
              78%
            </span>
            <span className="text-sm text-zinc-400">
              Good conceptual understanding
            </span>
          </div>

          <p className="text-xs text-zinc-500 mt-2">
            Graded automatically by Respectech RATS
          </p>
        </div>

        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold">
            UI/UX Design – Assignment 1
          </h3>

          <div className="mt-2 flex items-center gap-4">
            <span className="text-2xl font-bold">
              92%
            </span>
            <span className="text-sm text-zinc-400">
              Strong layout and visual hierarchy
            </span>
          </div>

          <p className="text-xs text-zinc-500 mt-2">
            Reviewed with AI-assisted evaluation
          </p>
        </div>

      </div>
    </>
  );
}
