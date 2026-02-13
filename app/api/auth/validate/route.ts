import { NextResponse } from "next/server";

import {
  validateRegistrationNumber,
  type StudentData,
} from "@/lib/registrationValidation";

type ValidateRequestBody = {
  registrationNumber?: unknown;
};

export async function POST(req: Request) {
  let body: ValidateRequestBody;

  try {
    body = (await req.json()) as ValidateRequestBody;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid registration number" },
      { status: 400 },
    );
  }

  const registrationNumber =
    typeof body.registrationNumber === "string" ? body.registrationNumber : "";

  const studentData: StudentData | null = await validateRegistrationNumber(
    registrationNumber,
  );

  if (!studentData) {
    return NextResponse.json(
      { success: false, error: "Invalid registration number" },
      { status: 200 },
    );
  }

  return NextResponse.json(
    { success: true, studentData },
    {
      status: 200,
      headers: {
        // Prevent caching of validation responses
        "Cache-Control": "no-store",
      },
    },
  );
}
