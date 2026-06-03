import { requireRole } from '@/lib/auth';
import { CLASSES } from '@/lib/classes';
import { createClient } from '@/lib/supabase/server';
import { createUser } from './actions';

type AdminPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type AdminUserRow = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
};

function getParamValue(value: string | string[] | undefined) {
  return typeof value === 'string' ? value : '';
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const profile = await requireRole(['admin']);
  const params = searchParams ? await searchParams : undefined;
  const success = getParamValue(params?.success);
  const error = getParamValue(params?.error);

  const supabase = await createClient();

  const [{ data: users }, { data: classRows }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, first_name, last_name, email, role, status')
      .order('first_name', { ascending: true }),
    supabase.from('classes').select('id, name, slug').order('name', { ascending: true }),
  ]);

  const safeUsers = (users ?? []) as AdminUserRow[];
  const safeClasses = (classRows ?? []).filter(Boolean) as { id: string; name: string; slug: string }[];
  const classOptions = safeClasses.length > 0 ? safeClasses : CLASSES.map((item) => ({ id: item.slug, name: item.name, slug: item.slug }));

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-zinc-400">
            Welcome, {profile.first_name}. Manage user provisioning here instead of praying at localStorage.
          </p>
        </div>

        {success ? (
          <div className="rounded-xl border border-emerald-700/40 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-300">
            {success}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-xl border border-red-700/40 bg-red-950/40 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-[420px,1fr]">
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Create user</h2>
              <p className="mt-2 text-sm text-zinc-400">
                Provision an auth account, create the profile, and link role-specific records in one go.
              </p>
            </div>

            <form action={createUser} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="first_name" className="mb-2 block text-sm text-zinc-300">First name</label>
                  <input id="first_name" name="first_name" required className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label htmlFor="last_name" className="mb-2 block text-sm text-zinc-300">Last name</label>
                  <input id="last_name" name="last_name" required className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500" />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm text-zinc-300">Email</label>
                <input id="email" name="email" type="email" required className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500" />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm text-zinc-300">Temporary password</label>
                <input id="password" name="password" type="password" required minLength={8} className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="role" className="mb-2 block text-sm text-zinc-300">Role</label>
                  <select id="role" name="role" defaultValue="student" className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500">
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="status" className="mb-2 block text-sm text-zinc-300">Status</label>
                  <select id="status" name="status" defaultValue="active" className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="class_slug" className="mb-2 block text-sm text-zinc-300">Class</label>
                <select id="class_slug" name="class_slug" defaultValue="" className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500">
                  <option value="">No class</option>
                  {classOptions.map((classItem) => (
                    <option key={classItem.slug} value={classItem.slug}>{classItem.name}</option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-zinc-500">Required for student and teacher accounts.</p>
              </div>

              <div>
                <label htmlFor="registration_number" className="mb-2 block text-sm text-zinc-300">Registration number</label>
                <input id="registration_number" name="registration_number" className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500" />
                <p className="mt-2 text-xs text-zinc-500">Required for students. Ignored for other roles.</p>
              </div>

              <button type="submit" className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-200">
                Create user
              </button>
            </form>
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Users</h2>
                <p className="mt-2 text-sm text-zinc-400">
                  Current provisioned profiles in the system.
                </p>
              </div>
              <div className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400">
                {safeUsers.length} total
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-left text-zinc-400">
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {safeUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
                        No profiles found yet.
                      </td>
                    </tr>
                  ) : (
                    safeUsers.map((user) => (
                      <tr key={user.id} className="border-b border-zinc-800/70 last:border-b-0">
                        <td className="px-4 py-4 text-white">{user.first_name} {user.last_name}</td>
                        <td className="px-4 py-4 text-zinc-300">{user.email}</td>
                        <td className="px-4 py-4">
                          <span className="rounded-full border border-indigo-700/40 bg-indigo-950/40 px-2.5 py-1 text-xs text-indigo-300">
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="rounded-full border border-zinc-700 px-2.5 py-1 text-xs text-zinc-300">
                            {user.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
