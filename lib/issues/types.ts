import type { IssueStatus } from "@/lib/validation/issues";

export type IssueRecord = {
  id: string;
  category: string;
  location: string;
  normalized_location: string;
  title: string;
  description: string;
  status: IssueStatus;
  reporter_id: string;
  created_at: string;
  updated_at: string;
  support_count: number;
};

export type NewIssue = Pick<IssueRecord, "category" | "location" | "normalized_location" | "title" | "description" | "reporter_id">;

export type IssueRepository = {
  findPotential(category: string, normalizedLocation: string): Promise<IssueRecord[]>;
  createIssue(issue: NewIssue): Promise<IssueRecord>;
  getIssue(id: string): Promise<IssueRecord | null>;
  hasSupport(issueId: string, reporterId: string): Promise<boolean>;
  insertSupport(issueId: string, reporterId: string): Promise<void>;
  listCreated(reporterId: string): Promise<IssueRecord[]>;
  listSupported(reporterId: string): Promise<IssueRecord[]>;
  listAll(): Promise<IssueRecord[]>;
  updateStatus(id: string, expectedStatus: IssueStatus, nextStatus: IssueStatus): Promise<IssueRecord | null>;
};

export type IssueActivity = { kind: "created" | "supported"; issue: IssueRecord };

export class IssueServiceError extends Error {
  constructor(readonly code: "not_found" | "already_supported" | "own_issue" | "resolved" | "invalid_transition", message: string) {
    super(message);
    this.name = "IssueServiceError";
  }
}
