import { redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/auth/cookies";
import { AdminLoginForm } from "@/components/admin-login-form";

export async function AdminLoginGate() {
  if (await hasAdminSession()) redirect("/admin");
  return <AdminLoginForm />;
}
