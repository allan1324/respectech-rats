import type { ReactNode } from "react";

export default function TeacherLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100">
      <main className="p-8">{children}</main>
    </div>
  );
}
