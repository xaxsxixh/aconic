import { hasAdminSession } from "@/lib/auth/cookies";
import { withAdminAuthorization } from "@/lib/auth/admin-guard";
import { apiError } from "@/lib/http/api-response";
import { getAdminDashboard } from "@/lib/issues/service";
import { supabaseIssueRepository } from "@/lib/issues/supabase-repository";
import { adminIssueQuerySchema } from "@/lib/validation/issues";

function toPublicIssue(issue: Awaited<ReturnType<typeof getAdminDashboard>>["issues"][number]) {
  return {
    id: issue.id,
    category: issue.category,
    location: issue.location,
    title: issue.title,
    description: issue.description,
    status: issue.status,
    created_at: issue.created_at,
    updated_at: issue.updated_at,
    affectedCount: 1 + issue.support_count,
  };
}

export async function GET(request: Request) {
  return withAdminAuthorization(hasAdminSession, async () => {
    const params = new URL(request.url).searchParams;
    const parsed = adminIssueQuerySchema.safeParse({
      search: params.get("search") ?? "",
      category: params.get("category") || undefined,
      status: params.get("status") || undefined,
      sort: params.get("sort") ?? "newest",
    });
    if (!parsed.success) return apiError(parsed.error);
    try {
      const dashboard = await getAdminDashboard(supabaseIssueRepository, parsed.data);
      return Response.json({ metrics: dashboard.metrics, issues: dashboard.issues.map(toPublicIssue) });
    } catch (error) {
      return apiError(error);
    }
  });
}
