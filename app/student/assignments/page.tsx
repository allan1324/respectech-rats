'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CLASSES } from '../../../lib/classes';

export default function AssignmentsIndex() {
  const router = useRouter();

  useEffect(() => {
    const first = CLASSES[0];
    if (first) {
      router.replace(`/student/dashboard/${first.slug}`);
    }
  }, [router]);

  return null;
}
