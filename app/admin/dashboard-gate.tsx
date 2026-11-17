import { redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/auth/cookies";
import { AdminDashboard } from "@/components/admin-dashboard";

export async function AdminDashboardGate() {
  if (!(await hasAdminSession())) redirect("/admin/login");
  return <AdminDashboard />;
}
