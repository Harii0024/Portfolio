import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { apiFetch } from "@/lib/api/client";
import type { PortfolioPayload } from "@/lib/portfolio/types";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function loadDashboard(cookieHeader: string) {
  const base =
    process.env.BACKEND_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000";

  const meRes = await fetch(`${base}/api/auth/me`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  });
  if (!meRes.ok) return null;

  const me = (await meRes.json()) as { email: string };
  const payload = await apiFetch<PortfolioPayload>("/api/portfolio", {
    server: true,
  });

  return { email: me.email, payload };
}

export default async function AdminDashboardPage() {
  const jar = await cookies();
  const cookieHeader = jar
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const data = await loadDashboard(cookieHeader).catch(() => null);
  if (!data) {
    redirect("/admin");
  }

  return <AdminDashboard initial={data.payload} email={data.email} />;
}
