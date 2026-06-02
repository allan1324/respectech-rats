import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

type Body = {
  firstName?: unknown;
  lastName?: unknown;
};

type TeacherRecord = {
  firstName: string;
  lastName: string;
  classSlug: string;
};

export async function POST(req: Request) {
  let body: Body;

  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  }

  const firstName = typeof body.firstName === "string" ? body.firstName.trim() : "";
  const lastName = typeof body.lastName === "string" ? body.lastName.trim() : "";

  if (!firstName || !lastName) {
    return NextResponse.json({ success: false, error: "Invalid name" }, { status: 200 });
  }

  const filePath = path.join(process.cwd(), "data", "teachers.json");

  let teachers: TeacherRecord[] = [];
  try {
    const raw = await fs.readFile(filePath, "utf8");
    teachers = JSON.parse(raw) as TeacherRecord[];
  } catch {
    return NextResponse.json({ success: false, error: "Teacher registry unavailable" }, { status: 500 });
  }

  const found = teachers.find(
    (t) => t.firstName === firstName && t.lastName === lastName,
  );

  if (!found) {
    return NextResponse.json({ success: false, error: "Teacher not found" }, { status: 200 });
  }

  return NextResponse.json(
    { success: true, classSlug: found.classSlug },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}
