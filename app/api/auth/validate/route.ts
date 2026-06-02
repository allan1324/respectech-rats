import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

type ValidateRequestBody = {
  registrationNumber?: unknown;
};

type StudentRecord = {
  firstName: string;
  lastName: string;
  registrationNumber: string;
  email: string;
  phone: string;
  classSlug: string;
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

  if (!registrationNumber.trim()) {
    return NextResponse.json(
      { success: false, error: "Invalid registration number" },
      { status: 200 },
    );
  }

  const filePath = path.join(process.cwd(), "data", "students.json");

  let students: StudentRecord[] = [];
  try {
    const raw = await fs.readFile(filePath, "utf8");
    students = JSON.parse(raw) as StudentRecord[];
  } catch {
    return NextResponse.json(
      { success: false, error: "Student registry unavailable" },
      { status: 500 },
    );
  }

  const found = students.find(
    (s) => s.registrationNumber.trim() === registrationNumber.trim(),
  );

  if (!found) {
    return NextResponse.json(
      { success: false, error: "Invalid registration number" },
      { status: 200 },
    );
  }

  return NextResponse.json(
    {
      success: true,
      studentData: {
        registrationNumber: found.registrationNumber,
        fullName: `${found.firstName} ${found.lastName}`,
        email: found.email,
        phone: found.phone,
        classSlug: found.classSlug,
      },
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
