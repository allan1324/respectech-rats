import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type AppRole = 'student' | 'teacher' | 'admin';

export type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: AppRole;
  status: 'active' | 'inactive' | 'suspended';
};

export async function getCurrentSession() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const session = await getCurrentSession();
  if (!session?.user) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email, role, status')
    .eq('id', session.user.id)
    .maybeSingle();

  if (error) {
    console.error('[auth] failed to load profile', error.message);
    return null;
  }

  return (data as Profile | null) ?? null;
}

export async function requireAuth() {
  const session = await getCurrentSession();
  if (!session?.user) {
    redirect('/login');
  }
  return session;
}

export async function requireRole(allowedRoles: AppRole[]) {
  await requireAuth();
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect('/login?error=profile');
  }

  if (!allowedRoles.includes(profile.role)) {
    redirect(getDefaultRouteForRole(profile.role));
  }

  return profile;
}

export function getDefaultRouteForRole(role: AppRole) {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'teacher':
      return '/teacher/dashboard';
    case 'student':
    default:
      return '/student/dashboard';
  }
}
