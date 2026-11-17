import { getOrCreateReporterId } from "@/lib/auth/cookies";
import { apiError } from "@/lib/http/api-response";
import { supportIssue } from "@/lib/issues/service";
import { supabaseIssueRepository } from "@/lib/issues/supabase-repository";
import { supportSchema } from "@/lib/validation/issues";

export async function POST(_request: Request, context: RouteContext<"/api/issues/[id]/support">) {
  const { id } = await context.params;
  const parsed = supportSchema.safeParse({ issueId: id });
  if (!parsed.success) return apiError(parsed.error);
  try {
    const reporterId = await getOrCreateReporterId();
    const result = await supportIssue(supabaseIssueRepository, parsed.data.issueId, reporterId);
    return Response.json(result);
  } catch (error) {
    return apiError(error);
  }
}
