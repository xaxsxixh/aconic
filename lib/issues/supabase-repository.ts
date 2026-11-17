import "server-only";
import { getSupabaseAdmin } from "@/lib/db/supabase-admin";
import type { IssueRecord, IssueRepository, NewIssue } from "./types";
import type { IssueStatus } from "@/lib/validation/issues";
import { IssueServiceError } from "./types";

const ISSUE_FIELDS = "id,category,location,normalized_location,title,description,status,reporter_id,created_at,updated_at,issue_supports(count)";

type JoinedIssue = Omit<IssueRecord, "support_count"> & { issue_supports: { count: number }[] };

function hydrate(row: JoinedIssue): IssueRecord {
  return { ...row, support_count: row.issue_supports?.[0]?.count ?? 0 };
}

function throwDatabaseError(error: { code?: string; message?: string }): never {
  if (error.code === "23505") throw new IssueServiceError("already_supported", "You have already supported this issue.");
  if (error.code === "23514" && error.message?.includes("Original reporter")) {
    throw new IssueServiceError("own_issue", "You are already counted on the issue you reported.");
  }
  if (error.code === "23514") throw new IssueServiceError("resolved", "This issue is fixed and no longer open for support.");
  throw new Error("The database request could not be completed.");
}

export const supabaseIssueRepository: IssueRepository = {
  async findPotential(category, normalizedLocation) {
    const { data, error } = await getSupabaseAdmin().from("issues").select(ISSUE_FIELDS)
      .eq("category", category).eq("normalized_location", normalizedLocation)
      .in("status", ["received", "in_progress"]).order("created_at", { ascending: false }).limit(8);
    if (error) throwDatabaseError(error);
    return (data ?? []).map((row) => hydrate(row as unknown as JoinedIssue));
  },
  async createIssue(issue: NewIssue) {
    const { data, error } = await getSupabaseAdmin().from("issues").insert(issue).select(ISSUE_FIELDS).single();
    if (error) throwDatabaseError(error);
    return hydrate(data as unknown as JoinedIssue);
  },
  async getIssue(id) {
    const { data, error } = await getSupabaseAdmin().from("issues").select(ISSUE_FIELDS).eq("id", id).maybeSingle();
    if (error) throwDatabaseError(error);
    return data ? hydrate(data as unknown as JoinedIssue) : null;
  },
  async hasSupport(issueId, reporterId) {
    const { data, error } = await getSupabaseAdmin().from("issue_supports").select("id")
      .eq("issue_id", issueId).eq("reporter_id", reporterId).maybeSingle();
    if (error) throwDatabaseError(error);
    return Boolean(data);
  },
  async insertSupport(issueId, reporterId) {
    const { error } = await getSupabaseAdmin().from("issue_supports").insert({ issue_id: issueId, reporter_id: reporterId });
    if (error) throwDatabaseError(error);
  },
  async listCreated(reporterId) {
    const { data, error } = await getSupabaseAdmin().from("issues").select(ISSUE_FIELDS)
      .eq("reporter_id", reporterId).order("created_at", { ascending: false });
    if (error) throwDatabaseError(error);
    return (data ?? []).map((row) => hydrate(row as unknown as JoinedIssue));
  },
  async listSupported(reporterId) {
    const { data, error } = await getSupabaseAdmin().from("issue_supports").select("issue_id,issues(" + ISSUE_FIELDS + ")")
      .eq("reporter_id", reporterId).order("created_at", { ascending: false });
    if (error) throwDatabaseError(error);
    const rows = (data ?? []) as unknown as { issues: JoinedIssue | JoinedIssue[] | null }[];
    return rows.flatMap((row) => {
      const issue = Array.isArray(row.issues) ? row.issues[0] : row.issues;
      return issue ? [hydrate(issue)] : [];
    });
  },
  async listAll() {
    const pageSize = 500;
    const issues: IssueRecord[] = [];
    for (let offset = 0; ; offset += pageSize) {
      const { data, error } = await getSupabaseAdmin().from("issues").select(ISSUE_FIELDS)
        .order("created_at", { ascending: false }).order("id", { ascending: false })
        .range(offset, offset + pageSize - 1);
      if (error) throwDatabaseError(error);
      const page = (data ?? []).map((row) => hydrate(row as unknown as JoinedIssue));
      issues.push(...page);
      if (page.length < pageSize) return issues;
    }
  },
  async updateStatus(id: string, expectedStatus: IssueStatus, nextStatus: IssueStatus) {
    const { data, error } = await getSupabaseAdmin().from("issues").update({ status: nextStatus })
      .eq("id", id).eq("status", expectedStatus).select(ISSUE_FIELDS).maybeSingle();
    if (error) throwDatabaseError(error);
    return data ? hydrate(data as unknown as JoinedIssue) : null;
  },
};
