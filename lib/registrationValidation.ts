export type StudentData = {
  registrationNumber: string;
  fullName?: string;
  class?: string;
  [key: string]: unknown;
};

// NOTE: This is a stub for the Google Sheets connection.
// Replace this with a real Sheets fetch later (without adding new dependencies).
const STUB_STUDENTS: Record<string, StudentData> = {
  // Example only (edit/remove as needed)
  "RATS-001": {
    registrationNumber: "RATS-001",
    fullName: "Test Student",
    class: "SS1",
  },
};

export async function validateRegistrationNumber(
  registrationNumber: string,
): Promise<StudentData | null> {
  const normalized = registrationNumber.trim();
  if (!normalized) return null;

  // TODO: Google Sheets lookup
  return STUB_STUDENTS[normalized] ?? null;
}
