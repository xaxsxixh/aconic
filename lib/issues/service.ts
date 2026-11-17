import { ISSUE_STATUSES, isAllowedStatusTransition, normalizeLocation, type IssueStatus } from "@/lib/validation/issues";
import { compareTimestamps } from "@/lib/dates/ist";
import type { IssueActivity, IssueRecord, IssueRepository, NewIssue } from "./types";
import { IssueServiceError } from "./types";

export async function findPotentialMatches(
  repository: IssueRepository,
  input: { category: string; location: string },
  reporterId: string | null,
) {
  const normalizedLocation = normalizeLocation(input.location);
  const records = await repository.findPotential(input.category, normalizedLocation);
  const candidates = records
    .filter((issue) => ISSUE_STATUSES.slice(0, 2).includes(issue.status) &&
      issue.category === input.category && issue.normalized_location === normalizedLocation)
    .slice(0, 8);
  return Promise.all(candidates.map(async (issue) => ({
      id: issue.id,
      category: issue.category,
      location: issue.location,
      title: issue.title,
      status: issue.status,
      affectedCount: 1 + issue.support_count,
      isOwnIssue: reporterId !== null && issue.reporter_id === reporterId,
      supportedByMe: reporterId ? await repository.hasSupport(issue.id, reporterId) : false,
    })));
}

export async function createIssue(repository: IssueRepository, issue: NewIssue) {
  return repository.createIssue(issue);
}

export async function supportIssue(repository: IssueRepository, issueId: string, reporterId: string) {
  const issue = await repository.getIssue(issueId);
  if (!issue) throw new IssueServiceError("not_found", "This issue could not be found.");
  if (issue.reporter_id === reporterId) throw new IssueServiceError("own_issue", "You are already counted on the issue you reported.");
  if (issue.status === "fixed") throw new IssueServiceError("resolved", "This issue is fixed and no longer open for support.");
  if (await repository.hasSupport(issueId, reporterId)) {
    throw new IssueServiceError("already_supported", "You have already supported this issue.");
  }
  await repository.insertSupport(issueId, reporterId);
  const updated = await repository.getIssue(issueId);
  return { issueId, affectedCount: updated ? 1 + updated.support_count : 2 + issue.support_count };
}

export async function getActivity(repository: IssueRepository, reporterId: string): Promise<IssueActivity[]> {
  const [created, supported] = await Promise.all([
    repository.listCreated(reporterId),
    repository.listSupported(reporterId),
  ]);
  return [
    ...created.map((issue) => ({ kind: "created" as const, issue })),
    ...supported.map((issue) => ({ kind: "supported" as const, issue })),
  ].sort((a, b) => compareTimestamps(a.issue.created_at, b.issue.created_at, "newest"));
}

export function affectedCount(issue: Pick<IssueRecord, "support_count">): number {
  return 1 + issue.support_count;
}

export type AdminIssueFilters = { search: string; category?: string; status?: IssueStatus; sort: "newest" | "oldest" };

export function getDashboardMetrics(issues: IssueRecord[]) {
  return {
    totalIssues: issues.length,
    openIssues: issues.filter((issue) => issue.status === "received" || issue.status === "in_progress").length,
    inProgressIssues: issues.filter((issue) => issue.status === "in_progress").length,
    fixedIssues: issues.filter((issue) => issue.status === "fixed").length,
    totalAffectedStudents: issues.reduce((sum, issue) => sum + affectedCount(issue), 0),
  };
}

export async function getAdminDashboard(repository: IssueRepository, filters: AdminIssueFilters) {
  const allIssues = await repository.listAll();
  const search = filters.search.toLocaleLowerCase("en");
  const issues = allIssues
    .filter((issue) => !filters.category || issue.category === filters.category)
    .filter((issue) => !filters.status || issue.status === filters.status)
    .filter((issue) => !search || `${issue.title} ${issue.location}`.toLocaleLowerCase("en").includes(search))
    .sort((a, b) => compareTimestamps(a.created_at, b.created_at, filters.sort));
  return { metrics: getDashboardMetrics(allIssues), issues };
}

export async function changeIssueStatus(repository: IssueRepository, id: string, nextStatus: IssueStatus) {
  const current = await repository.getIssue(id);
  if (!current) throw new IssueServiceError("not_found", "This issue could not be found.");
  if (!isAllowedStatusTransition(current.status, nextStatus)) {
    const labels: Record<IssueStatus, string> = { received: "Received", in_progress: "In progress", fixed: "Fixed" };
    throw new IssueServiceError("invalid_transition", `That status change from ${labels[current.status]} to ${labels[nextStatus]} is not allowed.`);
  }
  const updated = await repository.updateStatus(id, current.status, nextStatus);
  if (updated) return updated;
  const latest = await repository.getIssue(id);
  if (!latest) throw new IssueServiceError("not_found", "This issue could not be found.");
  throw new IssueServiceError("invalid_transition", "This issue changed while you were viewing it. Refresh and try again.");
}
