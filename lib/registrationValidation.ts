import { google } from "googleapis";

export type StudentData = {
  registrationNumber: string;
  fullName: string;
  email: string;
  course: string;
};

function getRequiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

/**
 * Validates a registration number against Google Sheets.
 *
 * Env vars required:
 * - GOOGLE_APPLICATION_CREDENTIALS: path to a service account JSON file
 * - GOOGLE_SHEET_ID: spreadsheet id
 *
 * Matching rule:
 * - Exact match against Column C (index 2) value.
 *
 * Returned fields:
 * - { registrationNumber, fullName, email, course }
 */
export async function validateRegistrationNumber(
  registrationNumber: string,
): Promise<StudentData | null> {
  const normalized = registrationNumber.trim();
  if (!normalized) return null;

  const spreadsheetId = getRequiredEnv("GOOGLE_SHEET_ID");
  const keyFile = getRequiredEnv("GOOGLE_APPLICATION_CREDENTIALS");

  const auth = new google.auth.GoogleAuth({
    keyFile,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  // Read the whole first sheet (tab) as values.
  // You can narrow this later once the exact tab name / columns are fixed.
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "A:Z",
  });

  const values = res.data.values ?? [];

  for (const row of values) {
    // Expect at minimum: A=Full Name, B=Email, C=Course code (used as reg match)
    const fullName = (row?.[0] ?? "").toString().trim();
    const email = (row?.[1] ?? "").toString().trim();
    const courseCode = (row?.[2] ?? "").toString().trim();

    // Skip empty rows / header rows.
    if (!courseCode || courseCode.toLowerCase() === "course" || courseCode.toLowerCase() === "course code") {
      continue;
    }

    if (courseCode === normalized) {
      return {
        registrationNumber: normalized,
        fullName,
        email,
        course: courseCode,
      };
    }
  }

  return null;
}
