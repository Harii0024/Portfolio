import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const jar = await cookies();
  const cookieHeader = jar
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  if (cookieHeader) {
    const base =
      process.env.BACKEND_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000";
    const me = await fetch(`${base}/api/auth/me`, {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    }).catch(() => null);
    if (me?.ok) {
      redirect("/admin/dashboard");
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6">
      <AdminLoginForm />
    </main>
  );
}
