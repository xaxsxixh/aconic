import { createAdminSession } from "@/lib/auth/cookies";
import { verifyAdminAccessCode } from "@/lib/auth/admin-code-check";
import { apiError } from "@/lib/http/api-response";
import { adminLoginSchema } from "@/lib/validation/issues";

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch {
    return Response.json({ error: "Enter the administrator access code.", code: "validation_error" }, { status: 400 });
  }
  const parsed = adminLoginSchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error);
  const configuredCode = process.env.ADMIN_ACCESS_CODE;
  if (!configuredCode) {
    return Response.json({ error: "Administrator sign-in is not configured yet.", code: "service_unavailable" }, { status: 503 });
  }
  if (!verifyAdminAccessCode(parsed.data.accessCode, configuredCode)) {
    return Response.json({ error: "That access code is not correct.", code: "invalid_credentials" }, { status: 401 });
  }
  try {
    await createAdminSession();
    return Response.json({ authenticated: true });
  } catch (error) {
    return apiError(error);
  }
}
