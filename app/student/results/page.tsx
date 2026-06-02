'use client';

export default function ResultsPage() {
  return (
    <>
      <header className="mb-8">
        <h2 className="text-3xl font-semibold">Results</h2>
        <p className="text-zinc-400 mt-1">Results will appear after grading.</p>
      </header>

      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
        <p className="text-zinc-400">
          This is a placeholder. In Phase 2, we can connect grading to submissions.
        </p>
      </div>
    </>
  );
}
