import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export default async function TeacherDashboardIndex() {
  const profile = await requireRole(['teacher', 'admin']);

  if (profile.role === 'admin') {
    redirect('/admin');
  }

  const supabase = await createClient();
  const { data: teacher } = await supabase
    .from('teachers')
    .select('id')
    .eq('profile_id', profile.id)
    .maybeSingle();

  if (!teacher?.id) {
    return (
      <div>
        <h2 className="text-3xl font-semibold">Teacher Dashboard</h2>
        <p className="text-zinc-400 mt-2">
          Your profile is missing a linked teacher record.
        </p>
      </div>
    );
  }

  const { data: assignment } = await supabase
    .from('teacher_class_assignments')
    .select('classes(slug)')
    .eq('teacher_id', teacher.id)
    .limit(1)
    .maybeSingle();

  const slug = assignment?.classes && !Array.isArray(assignment.classes) ? assignment.classes.slug : null;

  if (!slug) {
    return (
      <div>
        <h2 className="text-3xl font-semibold">Teacher Dashboard</h2>
        <p className="text-zinc-400 mt-2">
          No class has been assigned to your teacher account yet.
        </p>
      </div>
    );
  }

  redirect(`/teacher/dashboard/${slug}`);
}
