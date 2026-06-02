import { redirect } from "next/navigation";

export default function Page() {
  // Production-safe server-side redirect (Next.js App Router).
  redirect("/login");
}
