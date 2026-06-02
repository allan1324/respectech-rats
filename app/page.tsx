import { redirect } from 'next/navigation';
import { getCurrentProfile, getDefaultRouteForRole } from '@/lib/auth';

export default async function Page() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect('/login');
  }

  redirect(getDefaultRouteForRole(profile.role));
}
