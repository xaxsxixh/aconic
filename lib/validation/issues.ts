import { z } from "zod";

export const ISSUE_CATEGORIES = [
  "Wi-Fi / Internet",
  "Electrical",
  "Water / Plumbing",
  "Cleaning",
  "Classroom / Lab Equipment",
  "Other",
] as const;

export const ISSUE_STATUSES = ["received", "in_progress", "fixed"] as const;
export type IssueStatus = (typeof ISSUE_STATUSES)[number];

export const createIssueSchema = z.object({
  category: z.enum(ISSUE_CATEGORIES),
  location: z.string().trim().min(2).max(120),
  title: z.string().trim().min(5).max(120),
  description: z.string().trim().max(2000).default(""),
}).strict();

export const supportSchema = z.object({ issueId: z.uuid() }).strict();
export const statusUpdateSchema = z.object({ status: z.enum(ISSUE_STATUSES) }).strict();
export const adminLoginSchema = z.object({ accessCode: z.string().min(1).max(256) }).strict();
export const adminIssueQuerySchema = z.object({
  search: z.string().trim().max(120).default(""),
  category: z.enum(ISSUE_CATEGORIES).optional(),
  status: z.enum(ISSUE_STATUSES).optional(),
  sort: z.enum(["newest", "oldest"]).default("newest"),
}).strict();

export function normalizeLocation(location: string): string {
  return location.normalize("NFKC").trim().toLocaleLowerCase("en").replace(/\s+/g, " ");
}

export function isAllowedStatusTransition(from: IssueStatus, to: IssueStatus): boolean {
  return (from === "received" && to === "in_progress") ||
    (from === "in_progress" && to === "fixed") ||
    (from === "fixed" && to === "in_progress");
}
