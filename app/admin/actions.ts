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

async function getClassRecord(classSlug: string | null) {
  if (!classSlug) return null;

  const serverSupabase = await createClient();
  const { data } = await serverSupabase
    .from('classes')
    .select('id, slug')
    .eq('slug', classSlug)
    .maybeSingle();

  return data ?? null;
}

async function cleanupRoleRecords(adminSupabase: ReturnType<typeof createAdminClient>, userId: string) {
  const { data: teacher } = await adminSupabase
    .from('teachers')
    .select('id')
    .eq('profile_id', userId)
    .maybeSingle();

  if (teacher?.id) {
    await adminSupabase.from('teacher_class_assignments').delete().eq('teacher_id', teacher.id);
    await adminSupabase.from('teachers').delete().eq('id', teacher.id);
  }

  await adminSupabase.from('students').delete().eq('profile_id', userId);
}

async function ensureTeacherAssignment(adminSupabase: ReturnType<typeof createAdminClient>, userId: string, classId: string) {
  const { data: existingTeacher } = await adminSupabase
    .from('teachers')
    .select('id')
    .eq('profile_id', userId)
    .maybeSingle();

  let teacherId = existingTeacher?.id ?? null;

  if (!teacherId) {
    const { data: teacherRow, error } = await adminSupabase
      .from('teachers')
      .insert({ profile_id: userId })
      .select('id')
      .single();

    if (error || !teacherRow?.id) {
      throw new Error(error?.message ?? 'Failed to create teacher record.');
    }

    teacherId = teacherRow.id;
  }

  await adminSupabase.from('teacher_class_assignments').delete().eq('teacher_id', teacherId);

  const { error: assignmentError } = await adminSupabase.from('teacher_class_assignments').insert({
    teacher_id: teacherId,
    class_id: classId,
  });

  if (assignmentError) {
    throw new Error(assignmentError.message);
  }
}

async function ensureStudentAssignment(
  adminSupabase: ReturnType<typeof createAdminClient>,
  userId: string,
  classId: string,
  registrationNumber: string,
) {
  const { data: existingStudent } = await adminSupabase
    .from('students')
    .select('profile_id')
    .eq('profile_id', userId)
    .maybeSingle();

  if (existingStudent?.profile_id) {
    const { error } = await adminSupabase
      .from('students')
      .update({ class_id: classId, registration_number: registrationNumber })
      .eq('profile_id', userId);

    if (error) {
      throw new Error(error.message);
    }

    return;
  }

  const { error } = await adminSupabase.from('students').insert({
    profile_id: userId,
    class_id: classId,
    registration_number: registrationNumber,
  });

  if (error) {
    throw new Error(error.message);
  }
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

  const classRecord = await getClassRecord(classSlug);

  if (classSlug && !classRecord?.id) {
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

  try {
    if (role === 'student' && classRecord?.id && registrationNumber) {
      await ensureStudentAssignment(adminSupabase, userId, classRecord.id, registrationNumber);
    }

    if (role === 'teacher' && classRecord?.id) {
      await ensureTeacherAssignment(adminSupabase, userId, classRecord.id);
    }
  } catch (error) {
    await cleanupRoleRecords(adminSupabase, userId);
    await adminSupabase.from('profiles').delete().eq('id', userId);
    await adminSupabase.auth.admin.deleteUser(userId);
    redirect(buildError(error instanceof Error ? error.message : 'Failed to finish account setup.'));
  }

  revalidatePath('/admin');
  redirect(buildSuccess(`Created ${role} user for ${email}.`));
}

export async function updateUser(formData: FormData) {
  await requireRole(['admin']);

  const intent = getString(formData, 'intent');
  if (intent !== 'update-user') {
    redirect(buildError('Update form submission was not received correctly.'));
  }

  const userId = getString(formData, 'user_id');
  const role = getString(formData, 'role') as AppRole;
  const status = getString(formData, 'status') as AppStatus;
  const classSlug = getOptionalString(formData, 'class_slug');
  const registrationNumber = getOptionalString(formData, 'registration_number');

  if (!userId) {
    redirect(buildError('Missing user id.'));
  }

  if (!VALID_ROLES.includes(role)) {
    redirect(buildError('Invalid role selected.'));
  }

  if (!VALID_STATUS.includes(status)) {
    redirect(buildError('Invalid status selected.'));
  }

  if ((role === 'student' || role === 'teacher') && !classSlug) {
    redirect(buildError('Class is required for student and teacher accounts.'));
  }

  if (role === 'student' && !registrationNumber) {
    redirect(buildError('Registration number is required for students.'));
  }

  const adminSupabase = createAdminClient();
  const serverSupabase = await createClient();
  const classRecord = await getClassRecord(classSlug);

  if (classSlug && !classRecord?.id) {
    redirect(buildError('Selected class could not be found.'));
  }

  const { data: existingProfile, error: existingProfileError } = await serverSupabase
    .from('profiles')
    .select('id, email, role, status')
    .eq('id', userId)
    .maybeSingle();

  if (existingProfileError || !existingProfile?.id) {
    redirect(buildError(existingProfileError?.message ?? 'Target profile could not be found.'));
  }

  try {
    console.log('[admin.updateUser] starting update', { userId, role, status, classSlug, hasRegistrationNumber: Boolean(registrationNumber) });

    await cleanupRoleRecords(adminSupabase, userId);
    console.log('[admin.updateUser] cleaned old role records', { userId });

    if (role === 'student' && classRecord?.id && registrationNumber) {
      await ensureStudentAssignment(adminSupabase, userId, classRecord.id, registrationNumber);
      console.log('[admin.updateUser] ensured student assignment', { userId, classId: classRecord.id });
    }

    if (role === 'teacher' && classRecord?.id) {
      await ensureTeacherAssignment(adminSupabase, userId, classRecord.id);
      console.log('[admin.updateUser] ensured teacher assignment', { userId, classId: classRecord.id });
    }

    const { error: profileError, data: updatedProfiles } = await adminSupabase
      .from('profiles')
      .update({ role, status })
      .eq('id', userId)
      .select('id, role, status');

    console.log('[admin.updateUser] profile update response', {
      userId,
      profileError: profileError?.message ?? null,
      updatedProfiles,
    });

    if (profileError) {
      throw new Error(profileError.message);
    }

    const { data: verifiedProfile, error: verifiedProfileError } = await serverSupabase
      .from('profiles')
      .select('id, role, status')
      .eq('id', userId)
      .maybeSingle();

    console.log('[admin.updateUser] verified profile', {
      userId,
      verifiedProfileError: verifiedProfileError?.message ?? null,
      verifiedProfile,
    });

    if (verifiedProfileError || !verifiedProfile?.id) {
      throw new Error(verifiedProfileError?.message ?? 'Updated profile could not be verified.');
    }

    if (verifiedProfile.role !== role || verifiedProfile.status !== status) {
      throw new Error('Profile update did not persist the new role/status.');
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update user.';
    console.error('[admin.updateUser] failed', { userId, role, status, classSlug, message });
    redirect(buildError(message));
  }

  revalidatePath('/admin');
  redirect(buildSuccess(`Updated user to ${role} (${status}).`));
}

export async function resetUserPassword(formData: FormData) {
  await requireRole(['admin']);

  const userId = getString(formData, 'user_id');
  const password = getString(formData, 'password');

  if (!userId || !password) {
    redirect(buildError('Missing password reset data.'));
  }

  if (password.length < 8) {
    redirect(buildError('New password must be at least 8 characters.'));
  }

  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase.auth.admin.updateUserById(userId, {
    password,
  });

  if (error) {
    redirect(buildError(error.message));
  }

  revalidatePath('/admin');
  redirect(buildSuccess('Password updated successfully.'));
}
