import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiError } from "../lib/http/api-response";
import { changeIssueStatus, createIssue, findPotentialMatches, getActivity, getAdminDashboard, supportIssue } from "../lib/issues/service";
import { IssueServiceError, type IssueRecord, type IssueRepository, type NewIssue } from "../lib/issues/types";
import { verifyAdminAccessCode } from "../lib/auth/admin-code-check";
import { withAdminAuthorization } from "../lib/auth/admin-guard";
import { createAdminSessionToken, verifyAdminSessionToken } from "../lib/auth/session-token";

const reporter = "11111111-1111-4111-8111-111111111111";
const otherReporter = "22222222-2222-4222-8222-222222222222";

function makeIssue(overrides: Partial<IssueRecord> = {}): IssueRecord {
  return {
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", category: "Electrical", location: "Block A",
    normalized_location: "block a", title: "Lights are out", description: "",
    status: "received", reporter_id: otherReporter, created_at: "2026-11-17T10:00:00.000Z",
    updated_at: "2026-11-17T10:00:00.000Z", support_count: 0, ...overrides,
  };
}

class MemoryRepository implements IssueRepository {
  issues = new Map<string, IssueRecord>();
  supports = new Set<string>();
  async findPotential(category: string, normalizedLocation: string) {
    return [...this.issues.values()].filter((issue) => issue.category === category && issue.normalized_location === normalizedLocation);
  }
  async createIssue(input: NewIssue) {
    const issue = makeIssue({ ...input, id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", created_at: new Date().toISOString() });
    this.issues.set(issue.id, issue);
    return issue;
  }
  async getIssue(id: string) { return this.issues.get(id) ?? null; }
  async hasSupport(issueId: string, reporterId: string) { return this.supports.has(`${issueId}:${reporterId}`); }
  async insertSupport(issueId: string, reporterId: string) {
    const key = `${issueId}:${reporterId}`;
    if (this.supports.has(key)) throw new IssueServiceError("already_supported", "You have already supported this issue.");
    this.supports.add(key);
    const issue = this.issues.get(issueId);
    if (issue) this.issues.set(issueId, { ...issue, support_count: issue.support_count + 1 });
  }
  async listCreated(reporterId: string) { return [...this.issues.values()].filter((issue) => issue.reporter_id === reporterId); }
  async listSupported(reporterId: string) {
    return [...this.issues.values()].filter((issue) => this.supports.has(`${issue.id}:${reporterId}`));
  }
  async listAll() { return [...this.issues.values()]; }
  async updateStatus(id: string, expectedStatus: IssueRecord["status"], nextStatus: IssueRecord["status"]): Promise<IssueRecord | null> {
    const issue = this.issues.get(id);
    if (!issue || issue.status !== expectedStatus) return null;
    const updated = { ...issue, status: nextStatus, updated_at: new Date().toISOString() };
    this.issues.set(id, updated);
    return updated;
  }
}

describe("student issue services", () => {
  let repository: MemoryRepository;
  beforeEach(() => { repository = new MemoryRepository(); });

  it("creates and persists a new issue through the repository", async () => {
    const issue = await createIssue(repository, {
      category: "Electrical", location: "Block A", normalized_location: "block a",
      title: "Lights are out", description: "Hallway", reporter_id: reporter,
    });
    expect(await repository.getIssue(issue.id)).toMatchObject({ title: "Lights are out", reporter_id: reporter });
  });

  it("matches only same-category, normalized-location, unresolved candidates and marks own reports", async () => {
    repository.issues.set("open", makeIssue({ id: "open", reporter_id: reporter, support_count: 2 }));
    repository.issues.set("fixed", makeIssue({ id: "fixed", status: "fixed" }));
    repository.issues.set("other-location", makeIssue({ id: "other-location", normalized_location: "block b" }));
    const results = await findPotentialMatches(repository, { category: "Electrical", location: " BLOCK   A " }, reporter);
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ id: "open", isOwnIssue: true, affectedCount: 3, supportedByMe: false });
  });

  it("marks a potential match that the current reporter already supported", async () => {
    repository.issues.set("open", makeIssue({ id: "open" }));
    repository.supports.add(`open:${reporter}`);
    await expect(findPotentialMatches(repository, { category: "Electrical", location: "Block A" }, reporter))
      .resolves.toEqual([expect.objectContaining({ id: "open", supportedByMe: true })]);
  });

  it("adds support once and returns the updated affected count", async () => {
    repository.issues.set("issue", makeIssue({ id: "issue" }));
    await expect(supportIssue(repository, "issue", reporter)).resolves.toMatchObject({ affectedCount: 2 });
    await expect(supportIssue(repository, "issue", reporter)).rejects.toMatchObject({ code: "already_supported" });
  });

  it("prevents original reporters from adding support to their own issue", async () => {
    repository.issues.set("issue", makeIssue({ id: "issue", reporter_id: reporter }));
    await expect(supportIssue(repository, "issue", reporter)).rejects.toMatchObject({ code: "own_issue" });
    expect(repository.supports.size).toBe(0);
  });

  it("rejects support for fixed issues and missing issues", async () => {
    repository.issues.set("fixed", makeIssue({ id: "fixed", status: "fixed" }));
    await expect(supportIssue(repository, "fixed", reporter)).rejects.toMatchObject({ code: "resolved" });
    await expect(supportIssue(repository, "missing", reporter)).rejects.toMatchObject({ code: "not_found" });
  });

  it("retrieves created and supported activity distinctly", async () => {
    repository.issues.set("mine", makeIssue({ id: "mine", reporter_id: reporter }));
    repository.issues.set("theirs", makeIssue({ id: "theirs", reporter_id: otherReporter, created_at: "2026-11-16T10:00:00.000Z" }));
    repository.supports.add(`theirs:${reporter}`);
    await expect(getActivity(repository, reporter)).resolves.toEqual([
      expect.objectContaining({ kind: "created", issue: expect.objectContaining({ id: "mine" }) }),
      expect.objectContaining({ kind: "supported", issue: expect.objectContaining({ id: "theirs" }) }),
    ]);
  });

  it("returns useful client errors without exposing internal failures", async () => {
    const conflict = apiError(new IssueServiceError("already_supported", "Already supported."));
    expect(conflict.status).toBe(409);
    expect(await conflict.json()).toMatchObject({ code: "already_supported" });
    const internal = apiError(new Error("database password=secret"));
    expect(internal.status).toBe(500);
    expect(await internal.json()).toMatchObject({ error: "Something went wrong. Please try again." });
  });

  it("accepts the configured admin code and rejects an incorrect one", () => {
    expect(verifyAdminAccessCode("campus-admin-code", "campus-admin-code")).toBe(true);
    expect(verifyAdminAccessCode("wrong-code", "campus-admin-code")).toBe(false);
    expect(verifyAdminAccessCode("anything", "")).toBe(false);
  });

  it("issues signed admin sessions that expire and reject tampering", () => {
    const now = Date.UTC(2026, 10, 18, 9);
    const token = createAdminSessionToken("a-test-only-signing-secret-with-enough-bytes", now);
    expect(verifyAdminSessionToken(token, "a-test-only-signing-secret-with-enough-bytes", now)).toBe(true);
    expect(verifyAdminSessionToken(`${token}x`, "a-test-only-signing-secret-with-enough-bytes", now)).toBe(false);
    expect(verifyAdminSessionToken(token, "a-different-test-signing-secret-with-enough-bytes", now)).toBe(false);
    expect(verifyAdminSessionToken(token, "a-test-only-signing-secret-with-enough-bytes", now + 8 * 60 * 60 * 1000)).toBe(false);
  });

  it("denies unauthenticated admin API work before running the handler", async () => {
    const action = vi.fn(async () => Response.json({ secretDashboard: true }));
    const response = await withAdminAuthorization(async () => false, action);
    expect(response.status).toBe(401);
    expect(action).not.toHaveBeenCalled();
  });

  it("applies valid transitions and allows fixed issues to be reopened", async () => {
    repository.issues.set("received", makeIssue({ id: "received" }));
    await expect(changeIssueStatus(repository, "received", "fixed")).rejects.toMatchObject({ code: "invalid_transition" });
    await expect(changeIssueStatus(repository, "received", "in_progress")).resolves.toMatchObject({ status: "in_progress" });
    await expect(changeIssueStatus(repository, "received", "fixed")).resolves.toMatchObject({ status: "fixed" });
    await expect(changeIssueStatus(repository, "received", "in_progress")).resolves.toMatchObject({ status: "in_progress" });
  });

  it("calculates dashboard metrics from issue and support records and filters/sorts reports", async () => {
    repository.issues.set("new", makeIssue({ id: "new", created_at: "2026-11-17T12:00:00.000Z", support_count: 2 }));
    repository.issues.set("older", makeIssue({ id: "older", created_at: "2026-11-15T12:00:00.000Z" }));
    repository.issues.set("old", makeIssue({ id: "old", status: "fixed", category: "Cleaning", location: "Hostel", title: "Hall needs cleaning", created_at: "2026-11-16T12:00:00.000Z", support_count: 1 }));
    const result = await getAdminDashboard(repository, { search: "block", sort: "oldest" });
    expect(result.metrics).toEqual({ totalIssues: 3, openIssues: 2, inProgressIssues: 0, fixedIssues: 1, totalAffectedStudents: 6 });
    expect(result.issues.map((issue) => issue.id)).toEqual(["older", "new"]);
    expect((await getAdminDashboard(repository, { search: "", category: "Cleaning", status: "fixed", sort: "newest" })).issues)
      .toHaveLength(1);
  });

  it("sorts report timestamps by their actual instants when offsets differ", async () => {
    repository.issues.set("earlier", makeIssue({ id: "earlier", created_at: "2026-11-17T10:00:00+05:30" }));
    repository.issues.set("later", makeIssue({ id: "later", created_at: "2026-11-17T04:45:00Z" }));
    expect((await getAdminDashboard(repository, { search: "", sort: "oldest" })).issues.map(({ id }) => id))
      .toEqual(["earlier", "later"]);
    expect((await getAdminDashboard(repository, { search: "", sort: "newest" })).issues.map(({ id }) => id))
      .toEqual(["later", "earlier"]);
  });

  it("returns useful zero metrics and an empty issue list for a new dashboard", async () => {
    await expect(getAdminDashboard(repository, { search: "", sort: "newest" })).resolves.toEqual({
      metrics: { totalIssues: 0, openIssues: 0, inProgressIssues: 0, fixedIssues: 0, totalAffectedStudents: 0 },
      issues: [],
    });
  });
});
