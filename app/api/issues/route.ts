import { getOrCreateReporterId } from "@/lib/auth/cookies";
import { apiError } from "@/lib/http/api-response";
import { createIssue } from "@/lib/issues/service";
import { supabaseIssueRepository } from "@/lib/issues/supabase-repository";
import { createIssueSchema, normalizeLocation } from "@/lib/validation/issues";

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "Request body must be valid JSON.", code: "validation_error" }, { status: 400 }); }
  const parsed = createIssueSchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error);
  try {
    const reporterId = await getOrCreateReporterId();
    const issue = await createIssue(supabaseIssueRepository, {
      ...parsed.data,
      normalized_location: normalizeLocation(parsed.data.location),
      reporter_id: reporterId,
    });
    return Response.json({ issue: { id: issue.id, title: issue.title, category: issue.category, location: issue.location, status: issue.status, affectedCount: 1, created_at: issue.created_at } }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
