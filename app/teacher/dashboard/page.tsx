'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type TeacherValidateResponse =
  | { success: true; classSlug: string }
  | { success: false; error: string };

export default function TeacherDashboardIndex() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const fn = firstName.trim();
    const ln = lastName.trim();

    if (!fn || !ln) {
      setError('Please enter first and last name.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/teacher/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: fn, lastName: ln }),
      });

      const data = (await res.json()) as TeacherValidateResponse;

      if (data.success) {
        router.push(`/teacher/dashboard/${data.classSlug}`);
        return;
      }

      setError(data.error || 'Teacher not found.');
    } catch {
      setError('Something went wrong. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-lg">
        <h1 className="text-2xl font-bold mb-2">Teacher Login</h1>
        <p className="text-zinc-400 text-sm mb-8">Respectech Instructor Portal</p>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm mb-2 text-zinc-300">First name</label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white"
              placeholder="e.g. Janice"
            />
          </div>
          <div>
            <label className="block text-sm mb-2 text-zinc-300">Last name</label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white"
              placeholder="e.g. SoftwareProgramming"
            />
          </div>

          {error ? <p className="text-red-500 text-sm">{error}</p> : null}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-lg bg-white text-black font-medium hover:bg-zinc-200 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
