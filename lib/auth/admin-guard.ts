export async function withAdminAuthorization(
  isAuthenticated: () => Promise<boolean>,
  action: () => Promise<Response>,
): Promise<Response> {
  try {
    if (!(await isAuthenticated())) {
      return Response.json({ error: "Administrator sign-in is required.", code: "unauthorized" }, { status: 401 });
    }
  } catch {
    return Response.json({ error: "Administrator access is temporarily unavailable.", code: "auth_unavailable" }, { status: 503 });
  }
  return action();
}
