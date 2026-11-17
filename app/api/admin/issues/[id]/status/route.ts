import { hasAdminSession } from "@/lib/auth/cookies";
import { withAdminAuthorization } from "@/lib/auth/admin-guard";
import { apiError } from "@/lib/http/api-response";
import { changeIssueStatus } from "@/lib/issues/service";
import { supabaseIssueRepository } from "@/lib/issues/supabase-repository";
import { statusUpdateSchema, supportSchema } from "@/lib/validation/issues";

export async function PATCH(request: Request, context: RouteContext<"/api/admin/issues/[id]/status">) {
  return withAdminAuthorization(hasAdminSession, async () => {
    const { id } = await context.params;
    const validId = supportSchema.shape.issueId.safeParse(id);
    if (!validId.success) return apiError(validId.error);
    let body: unknown;
    try { body = await request.json(); } catch {
      return Response.json({ error: "Request body must be valid JSON.", code: "validation_error" }, { status: 400 });
    }
    const parsed = statusUpdateSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error);
    try {
      const issue = await changeIssueStatus(supabaseIssueRepository, validId.data, parsed.data.status);
      return Response.json({ issue: {
        id: issue.id, category: issue.category, location: issue.location, title: issue.title,
        description: issue.description, status: issue.status, created_at: issue.created_at,
        updated_at: issue.updated_at, affectedCount: 1 + issue.support_count,
      } });
    } catch (error) {
      return apiError(error);
    }
  });
}
