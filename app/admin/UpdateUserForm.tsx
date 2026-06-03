'use client';

import { useMemo, useState } from 'react';

type ClassOption = {
  id: string;
  name: string;
  slug: string;
};

type UpdateUserFormProps = {
  userId: string;
  initialRole: 'student' | 'teacher' | 'admin';
  initialStatus: 'active' | 'inactive' | 'suspended';
  initialClassSlug: string;
  initialRegistrationNumber: string;
  classOptions: ClassOption[];
};

export function UpdateUserForm({
  userId,
  initialRole,
  initialStatus,
  initialClassSlug,
  initialRegistrationNumber,
  classOptions,
}: UpdateUserFormProps) {
  const [role, setRole] = useState(initialRole);
  const [status, setStatus] = useState(initialStatus);
  const [classSlug, setClassSlug] = useState(initialClassSlug);
  const [registrationNumber, setRegistrationNumber] = useState(initialRegistrationNumber);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const requiresClass = role === 'student' || role === 'teacher';
  const requiresRegistration = role === 'student';

  const helperText = useMemo(() => {
    if (role === 'student') return 'Registration number is required for student accounts.';
    if (role === 'teacher') return 'Teachers need a class assignment.';
    return 'Admins do not need a class or registration number.';
  }, [role]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (requiresClass && !classSlug) {
      setError('Please select a class for teacher and student accounts.');
      return;
    }

    if (requiresRegistration && !registrationNumber.trim()) {
      setError('Registration number is required for student accounts.');
      return;
    }

    setSubmitting(true);

    const payload = new URLSearchParams();
    payload.set('user_id', userId);
    payload.set('role', role);
    payload.set('status', status);
    payload.set('class_slug', classSlug);
    payload.set('registration_number', registrationNumber);

    try {
      const response = await fetch('/api/admin/users/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        body: payload.toString(),
      });

      const result = (await response.json()) as { ok?: boolean; error?: string; success?: string };

      if (!response.ok || !result.ok) {
        setError(result.error ?? 'Failed to update user.');
        setSubmitting(false);
        return;
      }

      const message = result.success ?? 'User updated successfully.';
      setSuccess(message);
      setSubmitting(false);
      window.setTimeout(() => {
        window.location.reload();
      }, 700);
    } catch {
      setError('Something went wrong while updating the user.');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <input type="hidden" name="user_id" value={userId} />

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs uppercase tracking-wide text-zinc-400">Role</label>
          <select
            name="role"
            value={role}
            onChange={(event) => setRole(event.target.value as 'student' | 'teacher' | 'admin')}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-xs uppercase tracking-wide text-zinc-400">Status</label>
          <select
            name="status"
            value={status}
            onChange={(event) => setStatus(event.target.value as 'active' | 'inactive' | 'suspended')}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs uppercase tracking-wide text-zinc-400">Class</label>
          <select
            name="class_slug"
            value={classSlug}
            onChange={(event) => setClassSlug(event.target.value)}
            className={`w-full rounded-xl border bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 ${error && requiresClass && !classSlug ? 'border-red-500' : 'border-zinc-700'}`}
          >
            <option value="">No class</option>
            {classOptions.map((classItem) => (
              <option key={`${userId}-${classItem.slug}`} value={classItem.slug}>{classItem.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-xs uppercase tracking-wide text-zinc-400">Registration number</label>
          <input
            name="registration_number"
            value={registrationNumber}
            onChange={(event) => setRegistrationNumber(event.target.value)}
            className={`w-full rounded-xl border bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 ${error && requiresRegistration && !registrationNumber.trim() ? 'border-red-500' : 'border-zinc-700'}`}
            placeholder={requiresRegistration ? 'Required for students' : 'Only used for students'}
          />
        </div>
      </div>

      <p className="text-xs text-zinc-500">{helperText}</p>

      {error ? (
        <div className="rounded-xl border border-red-700/40 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-xl border border-emerald-700/40 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-300">
          {success}
        </div>
      ) : null}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}
