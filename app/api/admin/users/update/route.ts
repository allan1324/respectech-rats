import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import type { AppRole } from '@/lib/auth';

const VALID_ROLES: AppRole[] = ['student', 'teacher', 'admin'];
const VALID_STATUS = ['active', 'inactive', 'suspended'] as const;
type AppStatus = (typeof VALID_STATUS)[number];

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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userId = String(body.user_id ?? '').trim();
    const role = String(body.role ?? '').trim() as AppRole;
    const status = String(body.status ?? '').trim() as AppStatus;
    const classSlugRaw = String(body.class_slug ?? '').trim();
    const registrationNumberRaw = String(body.registration_number ?? '').trim();
    const classSlug = classSlugRaw || null;
    const registrationNumber = registrationNumberRaw || null;

    console.log('[api.admin.users.update] request', { userId, role, status, classSlug, hasRegistrationNumber: Boolean(registrationNumber) });

    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Missing user id.' }, { status: 400 });
    }

    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json({ ok: false, error: 'Invalid role selected.' }, { status: 400 });
    }

    if (!VALID_STATUS.includes(status)) {
      return NextResponse.json({ ok: false, error: 'Invalid status selected.' }, { status: 400 });
    }

    if ((role === 'student' || role === 'teacher') && !classSlug) {
      return NextResponse.json({ ok: false, error: 'Class is required for student and teacher accounts.' }, { status: 400 });
    }

    if (role === 'student' && !registrationNumber) {
      return NextResponse.json({ ok: false, error: 'Registration number is required for students.' }, { status: 400 });
    }

    const adminSupabase = createAdminClient();
    const serverSupabase = await createClient();
    const classRecord = await getClassRecord(classSlug);

    if (classSlug && !classRecord?.id) {
      return NextResponse.json({ ok: false, error: 'Selected class could not be found.' }, { status: 400 });
    }

    const { data: existingProfile, error: existingProfileError } = await serverSupabase
      .from('profiles')
      .select('id, role, status')
      .eq('id', userId)
      .maybeSingle();

    if (existingProfileError || !existingProfile?.id) {
      return NextResponse.json({ ok: false, error: existingProfileError?.message ?? 'Target profile could not be found.' }, { status: 404 });
    }

    await cleanupRoleRecords(adminSupabase, userId);
    console.log('[api.admin.users.update] cleaned old role records', { userId });

    if (role === 'student' && classRecord?.id && registrationNumber) {
      await ensureStudentAssignment(adminSupabase, userId, classRecord.id, registrationNumber);
      console.log('[api.admin.users.update] ensured student assignment', { userId, classId: classRecord.id });
    }

    if (role === 'teacher' && classRecord?.id) {
      await ensureTeacherAssignment(adminSupabase, userId, classRecord.id);
      console.log('[api.admin.users.update] ensured teacher assignment', { userId, classId: classRecord.id });
    }

    const { error: profileError, data: updatedProfiles } = await adminSupabase
      .from('profiles')
      .update({ role, status })
      .eq('id', userId)
      .select('id, role, status');

    console.log('[api.admin.users.update] profile update response', { userId, profileError: profileError?.message ?? null, updatedProfiles });

    if (profileError) {
      return NextResponse.json({ ok: false, error: profileError.message }, { status: 500 });
    }

    const { data: verifiedProfile, error: verifiedProfileError } = await serverSupabase
      .from('profiles')
      .select('id, role, status')
      .eq('id', userId)
      .maybeSingle();

    console.log('[api.admin.users.update] verified profile', { userId, verifiedProfileError: verifiedProfileError?.message ?? null, verifiedProfile });

    if (verifiedProfileError || !verifiedProfile?.id) {
      return NextResponse.json({ ok: false, error: verifiedProfileError?.message ?? 'Updated profile could not be verified.' }, { status: 500 });
    }

    if (verifiedProfile.role !== role || verifiedProfile.status !== status) {
      return NextResponse.json({ ok: false, error: 'Profile update did not persist the new role/status.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, success: `Updated user to ${role} (${status}).` });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update user.';
    console.error('[api.admin.users.update] failed', { message });
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
