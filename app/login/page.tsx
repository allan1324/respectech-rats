import { login } from './actions';

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function SubmitButton() {
  return (
    <button
      type="submit"
      className="w-full relative overflow-hidden py-4 rounded-xl bg-white text-zinc-900 font-semibold text-sm hover:bg-zinc-100 transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Sign In
    </button>
  );
}

function getErrorMessage(error: string | null) {
  switch (error) {
    case 'missing-fields':
      return 'Enter your email and password.';
    case 'invalid-credentials':
      return 'Invalid email or password.';
    case 'profile':
      return 'Your account exists, but no RATS profile was found. Ask an admin to finish setup.';
    case 'session':
      return 'Login succeeded, but the session could not be loaded.';
    default:
      return '';
  }
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const errorParam = params?.error;
  const error = getErrorMessage(typeof errorParam === 'string' ? errorParam : null);

  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-indigo-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-purple-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto">
        <div className="grid md:grid-cols-5 gap-0 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
          <div className="hidden md:flex col-span-2 relative bg-gradient-to-br from-indigo-600 to-purple-800 p-10 flex-col justify-between overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJWMTZoMnYxOHptLTYgMGgtMlYxNmgydjE4em0tNiAwaC0yVjE2aDJ2MTh6Ii8+PC9nPjwvZz48L3N2Zz4=')]"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-white tracking-tight">Respectech</span>
              </div>
              <p className="text-white/80 text-sm leading-relaxed max-w-xs">
                RATS is Respectech’s academic and training portal for students, instructors, and administrators.
              </p>
            </div>

            <div className="relative z-10 mt-auto">
              <blockquote className="text-white/90 border-l-2 border-white/30 pl-4 italic text-sm">
                &ldquo;Now the portal is backed by a real database instead of vibes and localStorage.&rdquo;
              </blockquote>
              <p className="mt-2 text-white/60 text-xs font-medium pl-4">— Internal rebuild notes</p>
            </div>
          </div>

          <div className="col-span-5 md:col-span-3 relative bg-zinc-900/80 backdrop-blur-xl p-8 sm:p-10 md:p-12 flex flex-col justify-center">
            <div className="md:hidden flex items-center gap-3 mb-8">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-lg font-bold text-white">Respectech</span>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-1">Welcome back</h2>
              <p className="text-zinc-400 text-sm">Sign in with your assigned email and password.</p>
            </div>

            <form action={login} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm text-zinc-300">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-4 bg-zinc-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm text-zinc-300">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  className="w-full px-4 py-4 bg-zinc-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
              </div>

              {error ? (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 rounded-lg text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{error}</span>
                </div>
              ) : null}

              <SubmitButton />
            </form>

            <p className="text-center text-xs text-zinc-500 mt-8">
              If your account has not been provisioned yet, contact the administrator.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
