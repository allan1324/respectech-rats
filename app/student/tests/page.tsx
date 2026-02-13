'use client';

export default function StudentTests() {
  return (
    <>
      <header className="mb-8">
        <h2 className="text-3xl font-semibold">
          Tests
        </h2>
        <p className="text-zinc-400 mt-1">
          Tests are only available when activated by your instructor
        </p>
      </header>

      <div className="space-y-4">
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">
              Data Analysis – Week 1 Test
            </h3>
            <p className="text-sm text-zinc-400">
              Duration: 60 minutes
            </p>
            <p className="text-xs text-zinc-500">
              Status: Locked
            </p>
          </div>

          <button
            disabled
            className="px-4 py-2 rounded bg-zinc-700 text-zinc-400 cursor-not-allowed"
          >
            Locked
          </button>
        </div>

        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">
              UI/UX Design – Mid Test
            </h3>
            <p className="text-sm text-zinc-400">
              Duration: 60 minutes
            </p>
            <p className="text-xs text-zinc-500">
              Status: Active
            </p>
          </div>

          <button className="px-4 py-2 rounded bg-white text-black hover:bg-zinc-200">
            Start Test
          </button>
        </div>
      </div>
    </>
  );
}
