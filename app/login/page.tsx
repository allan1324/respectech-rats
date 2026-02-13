'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type ValidateResponse =
  | { success: true; studentData: Record<string, unknown> }
  | { success: false; error: string };

export default function LoginPage() {
  const [regNumber, setRegNumber] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const value = regNumber.trim();

    const teacherPattern = /^TCH\/[A-Z0-9]+$/;

    // Teacher logic remains unchanged for now.
    if (teacherPattern.test(value)) {
      router.push('/teacher/dashboard');
      return;
    }

    if (!value) {
      setError('Please enter your registration number.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationNumber: value }),
      });

      const data = (await res.json()) as ValidateResponse;

      if (data.success) {
        router.push('/student/dashboard');
        return;
      }

      setError(
        data.error ||
          'Invalid registration number. Please report to your course supervisor for clarification.'
      );
    } catch {
      setError('Something went wrong. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-lg">
        
        <h1 className="text-2xl font-bold mb-2">
          Respectech
        </h1>
        <p className="text-zinc-400 text-sm mb-8">
          Digital Skills Learning Portal
        </p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm mb-2 text-zinc-300">
              Registration Number
            </label>
            <input
              type="text"
              value={regNumber}
              onChange={(e) => setRegNumber(e.target.value)}
              placeholder="e.g. RC/CH5/DA/0019"
              className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-lg bg-white text-black font-medium hover:bg-zinc-200 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-xs text-zinc-500 mt-8 text-center">
          Authorized students and instructors only
        </p>
      </div>
    </div>
  );
}

