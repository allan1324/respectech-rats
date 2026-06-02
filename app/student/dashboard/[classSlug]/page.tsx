'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { getClassBySlug } from '../../../../lib/classes';
import type { Assignment, ClassSlug, Submission } from '../../../../lib/types';

const ASSIGNMENTS_KEY = 'respectech_assignments_v1';
const SUBMISSIONS_KEY = 'respectech_submissions_v1';

function loadAssignments(): Assignment[] {
  try {
    const raw = localStorage.getItem(ASSIGNMENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as Assignment[];
  } catch {
    return [];
  }
}

function loadSubmissions(): Submission[] {
  try {
    const raw = localStorage.getItem(SUBMISSIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as Submission[];
  } catch {
    return [];
  }
}

function saveSubmissions(items: Submission[]) {
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(items));
}

export default function StudentClassDashboardPage() {
  const params = useParams<{ classSlug: string }>();
  const classSlugParam = params?.classSlug ?? '';

  const classInfo = useMemo(() => getClassBySlug(classSlugParam), [classSlugParam]);

  // Once we have a valid class, use its typed slug everywhere.
  const classSlug = (classInfo?.slug ?? '') as ClassSlug;

  const assignments = useMemo(
    () => loadAssignments().filter((a) => a.classSlug === classSlug),
    [classSlug]
  );

  const [studentName, setStudentName] = useState('');
  const [draftByCreatedAt, setDraftByCreatedAt] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<string>('');

  const submissions = useMemo(
    () => loadSubmissions().filter((s) => s.classSlug === classSlug),
    [classSlug]
  );

  function handleSubmit(assignmentCreatedAt: string) {
    setStatus('');
    const name = studentName.trim();
    const answer = (draftByCreatedAt[assignmentCreatedAt] ?? '').trim();

    if (!name) {
      setStatus('Please enter your name before submitting.');
      return;
    }

    if (!answer) {
      setStatus('Please write an answer before submitting.');
      return;
    }

    const item: Submission = {
      classSlug,
      assignmentCreatedAt,
      studentName: name,
      answer,
      submittedAt: new Date().toISOString(),
    };

    const existing = loadSubmissions();
    saveSubmissions([item, ...existing]);

    setDraftByCreatedAt((prev) => ({ ...prev, [assignmentCreatedAt]: '' }));
    setStatus('Submitted.');
  }

  if (!classInfo) {
    return (
      <div>
        <h2 className="text-2xl font-semibold">Student Dashboard</h2>
        <p className="text-zinc-400 mt-2">Unknown class: {classSlugParam}</p>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-8">
        <h2 className="text-3xl font-semibold">{classInfo.name}</h2>
        <p className="text-zinc-400 mt-1">Assignments and submissions</p>
      </header>

      <section className="bg-zinc-800 border border-zinc-700 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Student</h3>
        <label className="block text-sm mb-2 text-zinc-300">Your name</label>
        <input
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          className="w-full max-w-md px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white"
          placeholder="e.g. John Smith"
        />
        {status ? <p className="text-sm text-zinc-200 mt-3">{status}</p> : null}
      </section>

      <section className="bg-zinc-800 border border-zinc-700 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold mb-6">Assignments</h3>

        {assignments.length === 0 ? (
          <p className="text-zinc-400">No assignments for this class yet.</p>
        ) : (
          <div className="space-y-5">
            {assignments.map((a) => (
              <div key={a.createdAt} className="bg-zinc-900 border border-zinc-700 rounded-lg p-4">
                <div className="flex items-center justify-between gap-4">
                  <h4 className="font-semibold">{a.title}</h4>
                  <span className="text-xs text-zinc-400">{new Date(a.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-zinc-300 mt-2 whitespace-pre-wrap">{a.description}</p>

                <label className="block text-sm mt-4 mb-2 text-zinc-300">Your submission</label>
                <textarea
                  value={draftByCreatedAt[a.createdAt] ?? ''}
                  onChange={(e) =>
                    setDraftByCreatedAt((prev) => ({ ...prev, [a.createdAt]: e.target.value }))
                  }
                  className="w-full min-h-[140px] px-4 py-3 rounded-lg bg-zinc-950 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white"
                  placeholder="Write your answer here..."
                />

                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleSubmit(a.createdAt)}
                    className="py-2.5 px-5 rounded-lg bg-white text-black font-medium hover:bg-zinc-200 transition"
                  >
                    Submit
                  </button>
                  <details className="py-2">
                    <summary className="cursor-pointer text-sm text-zinc-200">View model answer</summary>
                    <pre className="mt-2 text-sm bg-black/30 p-3 rounded whitespace-pre-wrap">{a.modelAnswer}</pre>
                  </details>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-2">My Submissions</h3>
        <p className="text-zinc-400 text-sm mb-6">(Mock results view)</p>

        {submissions.length === 0 ? (
          <p className="text-zinc-400">No submissions yet.</p>
        ) : (
          <div className="space-y-4">
            {submissions.map((s) => (
              <div key={s.submittedAt} className="bg-zinc-900 border border-zinc-700 rounded-lg p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold">{s.studentName}</div>
                    <div className="text-xs text-zinc-400">Submitted: {new Date(s.submittedAt).toLocaleString()}</div>
                  </div>
                  <div className="text-xs text-zinc-300">Status: Submitted</div>
                </div>
                <pre className="mt-3 text-sm bg-black/30 p-3 rounded whitespace-pre-wrap">{s.answer}</pre>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
