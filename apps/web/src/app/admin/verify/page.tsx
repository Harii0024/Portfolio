import { Suspense } from "react";
import { MagicLinkVerifyClient } from "@/components/admin/MagicLinkVerifyClient";

export default function AdminVerifyPage() {
  return (
    <main className="min-h-screen bg-zinc-950 px-6">
      <Suspense
        fallback={
          <p className="mx-auto mt-24 max-w-md text-zinc-400">Loading…</p>
        }
      >
        <MagicLinkVerifyClient />
      </Suspense>
    </main>
  );
}
