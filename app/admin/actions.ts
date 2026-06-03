'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireRole, type AppRole } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

const VALID_ROLES: AppRole[] = ['student', 'teacher', 'admin'];
const VALID_STATUS = ['active', 'inactive', 'suspended'] as const;
type AppStatus = (typeof VALID_STATUS)[number];

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim();
}

function getOptionalString(formData: FormData, key: string) {
  const value = getString(formData, key);
  return value || null;
}

function buildError(message: string) {
  return `/admin?error=${encodeURIComponent(message)}`;
}

function buildSuccess(message: string) {
  return `/admin?success=${encodeURIComponent(message)}`;
}

export async function createUser(formData: FormData) {
  await requireRole(['admin']);

  const firstName = getString(formData, 'first_name');
  const lastName = getString(formData, 'last_name');
  const email = getString(formData, 'email').toLowerCase();
  const password = getString(formData, 'password');
  const role = getString(formData, 'role') as AppRole;
  const status = getString(formData, 'status') as AppStatus;
  const classSlug = getOptionalString(formData, 'class_slug');
  const registrationNumber = getOptionalString(formData, 'registration_number');

  if (!firstName || !lastName || !email || !password) {
    redirect(buildError('Fill all required fields.'));
  }

  if (!VALID_ROLES.includes(role)) {
    redirect(buildError('Invalid role selected.'));
  }

  if (!VALID_STATUS.includes(status)) {
    redirect(buildError('Invalid status selected.'));
  }

  if ((role === 'student' || role === 'teacher') && !classSlug) {
    redirect(buildError('Select a class for student and teacher users.'));
  }

  if (role === 'student' && !registrationNumber) {
    redirect(buildError('Registration number is required for students.'));
  }

  const adminSupabase = createAdminClient();
  const serverSupabase = await createClient();

  const { data: existingProfile } = await serverSupabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (existingProfile?.id) {
    redirect(buildError('A profile with that email already exists.'));
  }

  const { data: classRecord, error: classError } = classSlug
    ? await serverSupabase
        .from('classes')
        .select('id, slug')
        .eq('slug', classSlug)
        .maybeSingle()
    : { data: null, error: null };

  if (classSlug && (classError || !classRecord?.id)) {
    redirect(buildError('Selected class could not be found.'));
  }

  const { data: authUserData, error: authError } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      first_name: firstName,
      last_name: lastName,
      role,
    },
  });

  if (authError || !authUserData.user) {
    redirect(buildError(authError?.message ?? 'Failed to create auth user.'));
  }

  const userId = authUserData.user.id;

  const { error: profileError } = await adminSupabase.from('profiles').insert({
    id: userId,
    first_name: firstName,
    last_name: lastName,
    email,
    role,
    status,
  });

  if (profileError) {
    await adminSupabase.auth.admin.deleteUser(userId);
    redirect(buildError(profileError.message));
  }

  if (role === 'student' && classRecord?.id) {
    const { error: studentError } = await adminSupabase.from('students').insert({
      profile_id: userId,
      class_id: classRecord.id,
      registration_number: registrationNumber,
    });

    if (studentError) {
      await adminSupabase.from('profiles').delete().eq('id', userId);
      await adminSupabase.auth.admin.deleteUser(userId);
      redirect(buildError(studentError.message));
    }
  }

  if (role === 'teacher' && classRecord?.id) {
    const { data: teacherRow, error: teacherError } = await adminSupabase
      .from('teachers')
      .insert({ profile_id: userId })
      .select('id')
      .single();

    if (teacherError || !teacherRow?.id) {
      await adminSupabase.from('profiles').delete().eq('id', userId);
      await adminSupabase.auth.admin.deleteUser(userId);
      redirect(buildError(teacherError?.message ?? 'Failed to create teacher record.'));
    }

    const { error: assignmentError } = await adminSupabase.from('teacher_class_assignments').insert({
      teacher_id: teacherRow.id,
      class_id: classRecord.id,
    });

    if (assignmentError) {
      await adminSupabase.from('teachers').delete().eq('id', teacherRow.id);
      await adminSupabase.from('profiles').delete().eq('id', userId);
      await adminSupabase.auth.admin.deleteUser(userId);
      redirect(buildError(assignmentError.message));
    }
  }

  revalidatePath('/admin');
  redirect(buildSuccess(`Created ${role} user for ${email}.`));
}
