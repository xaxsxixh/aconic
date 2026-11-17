import { readReporterId } from "@/lib/auth/cookies";
import { apiError } from "@/lib/http/api-response";
import { getActivity } from "@/lib/issues/service";
import { supabaseIssueRepository } from "@/lib/issues/supabase-repository";

export async function GET() {
  try {
    const reporterId = await readReporterId();
    if (!reporterId) return Response.json({ activity: [] });
    const activity = await getActivity(supabaseIssueRepository, reporterId);
    return Response.json({ activity: activity.map(({ kind, issue }) => ({
      kind,
      id: issue.id,
      category: issue.category,
      location: issue.location,
      title: issue.title,
      description: issue.description,
      status: issue.status,
      affectedCount: 1 + issue.support_count,
      created_at: issue.created_at,
    })) });
  } catch (error) {
    return apiError(error);
  }
}
