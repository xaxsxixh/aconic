import { z } from "zod";
import { readReporterId } from "@/lib/auth/cookies";
import { apiError } from "@/lib/http/api-response";
import { findPotentialMatches } from "@/lib/issues/service";
import { supabaseIssueRepository } from "@/lib/issues/supabase-repository";
import { ISSUE_CATEGORIES } from "@/lib/validation/issues";

const querySchema = z.object({ category: z.enum(ISSUE_CATEGORIES), location: z.string().trim().min(2).max(120) });

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const parsed = querySchema.safeParse({ category: params.get("category"), location: params.get("location") });
  if (!parsed.success) return apiError(parsed.error);
  try {
    const matches = await findPotentialMatches(supabaseIssueRepository, parsed.data, await readReporterId());
    return Response.json({ matches });
  } catch (error) {
    return apiError(error);
  }
}
