import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export default async function StudentDashboardIndex() {
  const profile = await requireRole(['student']);
  const supabase = await createClient();

  const { data: student } = await supabase
    .from('students')
    .select('class_id')
    .eq('profile_id', profile.id)
    .maybeSingle();

  if (!student?.class_id) {
    return (
      <div>
        <h2 className="text-3xl font-semibold">Student Dashboard</h2>
        <p className="text-zinc-400 mt-2">
          Your student account exists, but no class assignment has been linked yet.
        </p>
      </div>
    );
  }

  const { data: classRecord } = await supabase
    .from('classes')
    .select('slug')
    .eq('id', student.class_id)
    .maybeSingle();

  const slug = classRecord?.slug ?? null;

  if (!slug) {
    return (
      <div>
        <h2 className="text-3xl font-semibold">Student Dashboard</h2>
        <p className="text-zinc-400 mt-2">
          Your student account exists, but no class assignment has been linked yet.
        </p>
      </div>
    );
  }

  redirect(`/student/dashboard/${slug}`);
}
