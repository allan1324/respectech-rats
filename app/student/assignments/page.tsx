'use client';

export default function StudentAssignments() {
  return (
    <>
      <header className="mb-8">
        <h2 className="text-3xl font-semibold">
          Assignments
        </h2>
        <p className="text-zinc-400 mt-1">
          Submit assignments based on your course requirements
        </p>
      </header>

      <div className="space-y-4">
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">
              Data Analysis – Assignment 1
            </h3>
            <p className="text-sm text-zinc-400">
              Type: Spreadsheet link
            </p>
            <p className="text-xs text-zinc-500">
              Due: 15 March 2026
            </p>
          </div>

          <button className="px-4 py-2 rounded bg-white text-black hover:bg-zinc-200">
            Submit
          </button>
        </div>

        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">
              UI/UX Design – Assignment 1
            </h3>
            <p className="text-sm text-zinc-400">
              Type: Image upload
            </p>
            <p className="text-xs text-zinc-500">
              Submitted
            </p>
          </div>

          <span className="text-sm text-zinc-400">
            Awaiting review
          </span>
        </div>
      </div>
    </>
  );
}
