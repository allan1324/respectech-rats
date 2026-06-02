import { requireRole } from '@/lib/auth';

export default async function AdminPage() {
  const profile = await requireRole(['admin']);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-zinc-400 mb-8">
          Welcome, {profile.first_name}. This is the initial admin entry point for the RATS rebuild.
        </p>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xl font-semibold mb-3">Next build steps</h2>
          <ul className="list-disc list-inside text-zinc-300 space-y-2">
            <li>Create admin user management tools</li>
            <li>Provision student and teacher accounts</li>
            <li>Replace remaining prototype data flows</li>
            <li>Connect assignments and submissions to Supabase</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
