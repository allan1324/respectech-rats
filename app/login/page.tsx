'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type ValidateResponse =
  | { success: true; studentData: { classSlug: string } }
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
        const slug = data.studentData?.classSlug;
        if (typeof slug === 'string' && slug.length > 0) {
          router.push(`/student/dashboard/${slug}`);
          return;
        }
        setError('Login succeeded but class assignment is missing.');
        return;
      }

      setError(
        data.error ||
        'Invalid registration number. Please report to your course supervisor.'
      );
    } catch {
      setError('Something went wrong. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 overflow-hidden relative">

      {/* Abstract Background Shapes for depth */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-indigo-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-purple-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto">
        <div className="grid md:grid-cols-5 gap-0 rounded-3xl overflow-hidden shadow-2xl border border-white/10">

          {/* --- LEFT SIDE: BRANDED VISUAL AREA --- */}
          {/* Hidden on small screens, takes up 2/5 of space on desktop */}
          <div className="hidden md:flex col-span-2 relative bg-gradient-to-br from-indigo-600 to-purple-800 p-10 flex-col justify-between overflow-hidden">
            {/* Decorative Pattern Overlay */}
            <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJWMTZoMnYxOHptLTYgMGgtMlYxNmgydjE4em0tNiAwaC0yVjE2aDJ2MTh6Ii8+PC9nPjwvZz48L3N2Zz4=')]" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  {/* Lightning Bolt Logo */}
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-white tracking-tight">Respectech</span>
              </div>
              <p className="text-white/80 text-sm leading-relaxed max-w-xs">
                Empowering the next generation of digital creators through practical skills and innovation.
              </p>
            </div>

            <div className="relative z-10 mt-auto">
              <blockquote className="text-white/90 border-l-2 border-white/30 pl-4 italic text-sm">
                &ldquo;The portal has transformed how I learn. The interface is intuitive and the resources are top-notch.&rdquo;
              </blockquote>
              <p className="mt-2 text-white/60 text-xs font-medium pl-4">— Senior Student</p>
            </div>
          </div>

          {/* --- RIGHT SIDE: LOGIN FORM --- */}
          {/* Takes up full width on mobile, 3/5 on desktop */}
          <div className="col-span-5 md:col-span-3 relative bg-zinc-900/80 backdrop-blur-xl p-8 sm:p-10 md:p-12 flex flex-col justify-center">

            {/* Mobile Logo (Only visible on small screens) */}
            <div className="md:hidden flex items-center gap-3 mb-8">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-lg font-bold text-white">Respectech</span>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-1">
                Welcome back
              </h2>
              <p className="text-zinc-400 text-sm">
                Enter your credentials to access your portal.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Floating Label Input Field */}
              <div className="relative group">
                <input
                  type="text"
                  id="regNum"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  placeholder=" " // Required for floating label to work
                  className="peer w-full px-4 py-4 pt-5 bg-zinc-800/50 border border-white/10 rounded-xl text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300"
                  autoComplete="off"
                />
                <label
                  htmlFor="regNum"
                  className="absolute left-4 top-4 text-zinc-500 text-sm transition-all duration-300 pointer-events-none
                             peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-zinc-500
                             peer-focus:top-1 peer-focus:text-xs peer-focus:text-indigo-400
                             peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs"
                >
                  Registration Number
                </label>

                {/* Decorative Corner for input */}
                <div className="absolute bottom-0 right-0 w-2 h-2 bg-indigo-500 rounded-tl-lg group-focus:w-4 group-focus:h-4 transition-all duration-300" />
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 rounded-lg text-sm animate-pulse">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {/* Modern Pill Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full relative overflow-hidden py-4 rounded-xl bg-white text-zinc-900 font-semibold text-sm
                           hover:bg-zinc-100 transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99]
                           disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <span className={isLoading ? 'opacity-0' : 'opacity-100 transition-opacity group-hover:tracking-wider'}>
                  Sign In
                </span>

                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 text-zinc-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
              </button>
            </form>

            <p className="text-center text-xs text-zinc-500 mt-8">
              Need help? Contact your course supervisor
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}