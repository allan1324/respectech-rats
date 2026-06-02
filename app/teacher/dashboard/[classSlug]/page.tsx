'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { getClassBySlug } from '../../../../lib/classes';
import type { Assignment, ClassSlug } from '../../../../lib/types';

const ASSIGNMENTS_KEY = 'respectech_assignments_v1';

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

function saveAssignments(items: Assignment[]) {
  localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(items));
}

export default function TeacherClassDashboardPage() {
  const params = useParams<{ classSlug: string }>();
  const classSlugParam = params?.classSlug ?? '';

  const classInfo = useMemo(() => getClassBySlug(classSlugParam), [classSlugParam]);
  const classSlug = (classInfo?.slug ?? '') as ClassSlug;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [modelAnswer, setModelAnswer] = useState('');
  const [status, setStatus] = useState<string>('');

  const myAssignments = useMemo(() => {
    if (!classSlug) return [] as Assignment[];
    return loadAssignments().filter((a) => a.classSlug === classSlug);
  }, [classSlug]);

  function handleCreateAssignment(e: React.FormEvent) {
    e.preventDefault();
    setStatus('');

    const t = title.trim();
    const d = description.trim();
    const m = modelAnswer.trim();

    if (!t || !d || !m) {
      setStatus('Please fill title, description, and model answer.');
      return;
    }

    const now = new Date().toISOString();
    const assignment: Assignment = {
      classSlug,
      title: t,
      description: d,
      modelAnswer: m,
      createdAt: now,
    };

    const existing = loadAssignments();
    saveAssignments([assignment, ...existing]);

    setTitle('');
    setDescription('');
    setModelAnswer('');
    setStatus('Assignment saved.');
  }

  if (!classInfo) {
    return (
      <div>
        <h2 className="text-3xl font-semibold">Teacher Dashboard</h2>
        <p className="text-zinc-400 mt-2">Unknown class: {classSlugParam}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <header className="mb-8">
        <h2 className="text-3xl font-semibold">Teacher Dashboard</h2>
        <p className="text-zinc-400 mt-1">Class: {classInfo.name}</p>
      </header>

      <section className="bg-zinc-800 border border-zinc-700 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Create Assignment</h3>

        <form onSubmit={handleCreateAssignment} className="space-y-4">
          <div>
            <label className="block text-sm mb-2 text-zinc-300">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white"
              placeholder="e.g. Build a simple calculator"
            />
          </div>

          <div>
            <label className="block text-sm mb-2 text-zinc-300">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-[120px] px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white"
              placeholder="Explain the assignment requirements..."
            />
          </div>

          <div>
            <label className="block text-sm mb-2 text-zinc-300">Model answer</label>
            <textarea
              value={modelAnswer}
              onChange={(e) => setModelAnswer(e.target.value)}
              className="w-full min-h-[140px] px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white"
              placeholder="Provide a reference / example solution..."
            />
          </div>

          {status ? <p className="text-sm text-zinc-200">{status}</p> : null}

          <button
            type="submit"
            className="py-3 px-6 rounded-lg bg-white text-black font-medium hover:bg-zinc-200 transition"
          >
            Save Assignment
          </button>
        </form>
      </section>

      <section className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-2">Assignments — {classInfo.name}</h3>
        <p className="text-zinc-400 text-sm mb-6">
          Stored as: {'{ classSlug, title, description, modelAnswer, createdAt }'}
        </p>

        {myAssignments.length === 0 ? (
          <p className="text-zinc-400">No assignments yet for this class.</p>
        ) : (
          <div className="space-y-4">
            {myAssignments.map((a) => (
              <div key={a.createdAt} className="bg-zinc-900 border border-zinc-700 rounded-lg p-4">
                <div className="flex items-center justify-between gap-4">
                  <h4 className="font-semibold">{a.title}</h4>
                  <span className="text-xs text-zinc-400">{new Date(a.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-zinc-300 mt-2 whitespace-pre-wrap">{a.description}</p>
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm text-zinc-200">View model answer</summary>
                  <pre className="mt-2 text-sm bg-black/30 p-3 rounded whitespace-pre-wrap">{a.modelAnswer}</pre>
                </details>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
