import { Suspense } from "react";
import { AdminDashboardGate } from "@/app/admin/dashboard-gate";

export default function AdminPage() {
  return <Suspense fallback={<main className="min-h-screen bg-background p-8 text-sm text-muted">Checking administrator access…</main>}><AdminDashboardGate /></Suspense>;
}
