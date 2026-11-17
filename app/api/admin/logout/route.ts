import { clearAdminSession, hasAdminSession } from "@/lib/auth/cookies";
import { withAdminAuthorization } from "@/lib/auth/admin-guard";

export async function POST() {
  return withAdminAuthorization(hasAdminSession, async () => {
    await clearAdminSession();
    return Response.json({ authenticated: false }, { headers: { "Cache-Control": "no-store" } });
  });
}
