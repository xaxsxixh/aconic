"use client";

import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { compareTimestamps, formatIstDateTime, formatIstLongDate, formatIstTime, getIstReportDateDistribution } from "@/lib/dates/ist";
import { ISSUE_CATEGORIES, type IssueStatus } from "@/lib/validation/issues";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { IssueStatusTimeline } from "@/components/ui/issue-status-timeline";

type AdminIssue = { id: string; category: string; location: string; title: string; description: string; status: IssueStatus; created_at: string; updated_at: string; affectedCount: number };
type Metrics = { totalIssues: number; openIssues: number; inProgressIssues: number; fixedIssues: number; totalAffectedStudents: number };
type Filters = { search: string; category: string; status: IssueStatus | ""; sort: "newest" | "oldest" };
type NavigationSection = "overview" | "all" | "received" | "in_progress" | "fixed" | "help";
type IconName = "overview" | "reports" | "received" | "progress" | "fixed" | "people" | "logout" | "menu" | "close" | "refresh" | "search" | "location" | "calendar" | "clock" | "help" | "chevron";

const emptyMetrics: Metrics = { totalIssues: 0, openIssues: 0, inProgressIssues: 0, fixedIssues: 0, totalAffectedStudents: 0 };
const initialFilters: Filters = { search: "", category: "", status: "", sort: "newest" };
const statusNames: Record<IssueStatus, string> = { received: "Received", in_progress: "In progress", fixed: "Fixed" };
const statusColors: Record<IssueStatus, string> = { received: "#64748b", in_progress: "#2563eb", fixed: "#1d4ed8" };

async function parseResponse(response: Response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(data.error || "The request could not be completed."), { status: response.status });
  return data;
}

function dashboardUrl(filters: Filters) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.category) params.set("category", filters.category);
  if (filters.status) params.set("status", filters.status);
  params.set("sort", filters.sort);
  return `/api/admin/issues?${params}`;
}

async function fetchDashboardData(filters: Filters) {
  return parseResponse(await fetch(dashboardUrl(filters), { cache: "no-store" }));
}

function explainLoadError(problem: unknown) {
  const status = (problem as { status?: number }).status;
  return status === 401 ? "Your administrator session has expired. Sign in again to continue." : problem instanceof Error ? problem.message : "Dashboard data could not be loaded.";
}

function nextStatus(status: IssueStatus): { value: IssueStatus; label: string } {
  if (status === "received") return { value: "in_progress", label: "Start work" };
  if (status === "in_progress") return { value: "fixed", label: "Mark fixed" };
  return { value: "in_progress", label: "Reopen issue" };
}

function DashboardIcon({ name, className = "size-4" }: { name: IconName; className?: string }) {
  const paths: Record<IconName, ReactNode> = {
    overview: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></>,
    reports: <><path d="M7 3.75h7l4 4v12.5H7a2 2 0 0 1-2-2v-12.5a2 2 0 0 1 2-2Z" /><path d="M14 3.75v4h4M8.5 12h7m-7 3.5h7" /></>,
    received: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3 2" /></>,
    progress: <><path d="M4 16.5a8.5 8.5 0 1 1 16 0" /><path d="m12 12 4-4M7 19h10" /></>,
    fixed: <><path d="m5 12.5 4.5 4L19 7" /><circle cx="12" cy="12" r="9" /></>,
    people: <><circle cx="9" cy="8" r="3" /><path d="M3.5 19v-1.5A4.5 4.5 0 0 1 8 13h2a4.5 4.5 0 0 1 4.5 4.5V19M16 5.5a3 3 0 0 1 0 5.8m2 2.2a4 4 0 0 1 2.5 3.7V19" /></>,
    logout: <><path d="M10 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20H10" /><path d="M14 16.5 18.5 12 14 7.5M18 12H9" /></>,
    menu: <><path d="M4 6.5h16M4 12h16M4 17.5h16" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    refresh: <><path d="M20 7v5h-5M4 17v-5h5" /><path d="M5.5 9a7 7 0 0 1 11.6-2.6L20 9M4 15l2.9 2.6A7 7 0 0 0 18.5 15" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4 4" /></>,
    location: <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2" /></>,
    calendar: <><rect x="4" y="5.5" width="16" height="15" rx="2" /><path d="M8 3.5v4M16 3.5v4M4 10h16" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    help: <><circle cx="12" cy="12" r="9" /><path d="M9.8 9a2.3 2.3 0 1 1 3.8 1.7c-.9.8-1.6 1.1-1.6 2.8m0 3h.01" /></>,
    chevron: <path d="m6 9 6 6 6-6" />,
  };
  return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function OperationsSidebar({
  activeSection,
  metrics,
  loggingOut,
  onNavigate,
  onLogout,
}: {
  activeSection: NavigationSection;
  metrics: Metrics;
  loggingOut: boolean;
  onNavigate: (section: NavigationSection) => void;
  onLogout: () => void;
}) {
  const navigation: { label: string; section: NavigationSection; icon: IconName; count?: number }[] = [
    { label: "Overview", section: "overview", icon: "overview" },
    { label: "All reports", section: "all", icon: "reports", count: metrics.totalIssues },
    { label: "Received", section: "received", icon: "received" },
    { label: "In progress", section: "in_progress", icon: "progress" },
    { label: "Fixed", section: "fixed", icon: "fixed" },
  ];

  return <div className="flex h-full min-h-0 flex-col bg-[#172554] text-slate-300">
    <div className="flex h-[76px] shrink-0 items-center gap-3 border-b border-white/[0.08] px-6">
      <span className="grid size-9 place-items-center rounded-xl bg-accent text-sm font-black text-white shadow-[0_5px_16px_rgba(37,99,235,0.24)]">F</span>
      <div><p className="text-[15px] font-bold tracking-tight text-white">FixIt</p><p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Campus operations</p></div>
    </div>
    <nav aria-label="Operations navigation" className="min-h-0 flex-1 overflow-y-auto px-3 py-6">
      <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Workspace</p>
      <ul className="space-y-1">
        {navigation.map((item) => {
          const active = activeSection === item.section;
          return <li key={item.section}>
            <button type="button" aria-current={active ? "page" : undefined} onClick={() => onNavigate(item.section)} className={`group relative flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-[13px] font-medium transition-colors ${active ? "bg-blue-400/15 text-white" : "text-slate-400 hover:bg-white/[0.06] hover:text-white"}`}>
              <span className={`grid size-5 place-items-center ${active ? "text-blue-300" : "text-slate-500 group-hover:text-slate-300"}`}><DashboardIcon name={item.icon} /></span>
              <span className="flex-1">{item.label}</span>
              {item.count !== undefined && <span className={`text-xs tabular-nums ${active ? "text-blue-200" : "text-slate-500"}`}>{item.count}</span>}
              {active && <span className="absolute ml-[-12px] h-5 w-[2px] rounded-r bg-blue-300" aria-hidden="true" />}
            </button>
          </li>;
        })}
      </ul>

      <div className="mb-2 mt-8 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Support</div>
      <a href="#administrator-guide" onClick={() => onNavigate("help")} className={`group flex min-h-10 items-center gap-3 rounded-lg px-3 text-[13px] font-medium transition-colors ${activeSection === "help" ? "bg-blue-400/15 text-white" : "text-slate-400 hover:bg-white/[0.06] hover:text-white"}`}>
        <span className="grid size-5 place-items-center text-slate-500 group-hover:text-slate-300"><DashboardIcon name="help" /></span>
        How to use
      </a>
    </nav>
    <div className="shrink-0 border-t border-white/[0.08] p-3">
      <div className="mb-2 flex items-center gap-3 rounded-lg px-2 py-3">
        <span className="grid size-9 place-items-center rounded-full border border-white/10 bg-white/[0.08] text-xs font-bold text-blue-200">AD</span>
        <span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-white">Administrator</span><span className="mt-0.5 block text-[10px] text-slate-500">Operations access</span></span>
      </div>
      <button type="button" disabled={loggingOut} onClick={onLogout} className="flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-xs font-medium text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white disabled:opacity-50">
        <DashboardIcon name="logout" />{loggingOut ? "Signing out…" : "Sign out"}
      </button>
    </div>
  </div>;
}

function AnalyticsPanel({ issues, referenceTimestamp }: { issues: AdminIssue[]; referenceTimestamp: string | null }) {
  const statusBreakdown = (["received", "in_progress", "fixed"] as const).map((status) => ({
    status,
    count: issues.filter((issue) => issue.status === status).length,
  }));
  const total = issues.length;
  let cursor = 0;
  const conicSegments = statusBreakdown.map(({ status, count }, index) => {
    const start = cursor;
    cursor += total ? (count / total) * 100 : 0;
    const end = index === statusBreakdown.length - 1 ? 100 : cursor;
    return `${statusColors[status]} ${start}% ${end}%`;
  }).join(", ");
  const categoryCounts = Object.entries(issues.reduce<Record<string, number>>((counts, issue) => {
    counts[issue.category] = (counts[issue.category] ?? 0) + 1;
    return counts;
  }, {})).sort(([, a], [, b]) => b - a);
  const maxCategoryCount = categoryCounts[0]?.[1] ?? 0;
  const affectedByCategory = Object.entries(issues.reduce<Record<string, number>>((counts, issue) => {
    counts[issue.category] = (counts[issue.category] ?? 0) + issue.affectedCount;
    return counts;
  }, {})).sort(([, a], [, b]) => b - a);
  const maxAffectedCount = affectedByCategory[0]?.[1] ?? 0;
  const recentDistribution = referenceTimestamp
    ? getIstReportDateDistribution(issues.map((issue) => issue.created_at), referenceTimestamp)
    : [];
  const maxRecentCount = Math.max(...recentDistribution.map((period) => period.count), 0);
  const recentIssues = [...issues].sort((a, b) => compareTimestamps(a.created_at, b.created_at, "newest")).slice(0, 4);

  return <section aria-label="Report analytics" className="mb-8 grid gap-4 xl:grid-cols-2">
    <Card className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div><h2 className="text-sm font-semibold text-foreground">Reports by status</h2><p className="mt-1 text-xs text-muted">Distribution in the current report list</p></div>
        <span className="rounded-md border border-border px-2 py-1 text-[10px] font-semibold text-muted">{total} {total === 1 ? "report" : "reports"}</span>
      </div>
      {total ? <div className="mt-5 flex flex-wrap items-center gap-6 sm:gap-9">
        <div role="img" aria-label={`Current report list: ${statusBreakdown.map(({ status, count }) => `${count} ${statusNames[status].toLowerCase()}`).join(", ")}`} className="chart-enter relative grid size-32 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(${conicSegments})` }}>
          <div className="grid size-[86px] place-items-center rounded-full bg-white text-center shadow-inner"><div><p className="text-2xl font-bold tracking-tight text-foreground">{total}</p><p className="text-[9px] font-semibold uppercase tracking-wider text-muted">Reports</p></div></div>
        </div>
        <ul className="min-w-[155px] flex-1 space-y-3">
          {statusBreakdown.map(({ status, count }) => <li key={status} className="flex items-center justify-between gap-4 text-xs">
            <span className="flex items-center gap-2 text-muted"><span className="size-2 rounded-full" style={{ backgroundColor: statusColors[status] }} />{statusNames[status]}</span>
            <span className="font-semibold tabular-nums text-foreground">{count}<span className="ml-2 font-normal text-muted">{total ? Math.round((count / total) * 100) : 0}%</span></span>
          </li>)}
        </ul>
      </div> : <p className="mt-6 rounded-xl border border-dashed border-border bg-background px-4 py-6 text-center text-xs text-muted">Status distribution will appear when reports are available.</p>}
    </Card>

    <Card className="p-5 sm:p-6">
      <div><h2 className="text-sm font-semibold text-foreground">Reports by category</h2><p className="mt-1 text-xs text-muted">Categories represented in the current report list</p></div>
      {categoryCounts.length ? <ul className="mt-5 space-y-4">
        {categoryCounts.map(([category, count]) => <li key={category} className="grid grid-cols-[minmax(0,1fr)_2.5rem] items-center gap-x-4 gap-y-2 text-xs">
          <span className="truncate font-medium text-slate-600" title={category}>{category}</span>
          <span className="text-right font-semibold tabular-nums text-foreground">{count}</span>
          <div title={`${count} reports in ${category}`} className="col-span-2 h-1.5 overflow-hidden rounded-full bg-background"><div className="chart-bar h-full rounded-full bg-accent" style={{ width: `${(count / maxCategoryCount) * 100}%` }} /></div>
        </li>)}
      </ul> : <p className="mt-6 rounded-xl border border-dashed border-border bg-background px-4 py-6 text-center text-xs text-muted">Category distribution will appear when reports are available.</p>}
    </Card>

    <Card className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div><h2 className="text-sm font-semibold text-foreground">Students affected</h2><p className="mt-1 text-xs text-muted">People connected to reports by category</p></div>
        <span className="rounded-md border border-border bg-background px-2 py-1 text-[10px] font-semibold tabular-nums text-accent-strong">{issues.reduce((sum, issue) => sum + issue.affectedCount, 0)} total</span>
      </div>
      {affectedByCategory.length ? <ul className="mt-5 space-y-4">
        {affectedByCategory.map(([category, count]) => <li key={category} className="grid grid-cols-[minmax(0,1fr)_2.5rem] items-center gap-x-4 gap-y-2 text-xs">
          <span className="truncate font-medium text-slate-600" title={category}>{category}</span>
          <span className="text-right font-semibold tabular-nums text-foreground">{count}</span>
          <div title={`${count} students affected in ${category}`} className="col-span-2 h-1.5 overflow-hidden rounded-full bg-background"><div className="chart-bar h-full rounded-full bg-accent" style={{ width: `${(count / maxAffectedCount) * 100}%` }} /></div>
        </li>)}
      </ul> : <p className="mt-6 rounded-xl border border-dashed border-border bg-background px-4 py-6 text-center text-xs text-muted">Impact totals will appear when reports are available.</p>}
    </Card>

    <Card className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div><h2 className="text-sm font-semibold text-foreground">Recent report distribution</h2><p className="mt-1 text-xs text-muted">Calendar dates in the current report list (IST)</p></div>
        <DashboardIcon name="clock" className="size-4 text-accent" />
      </div>
      {issues.length && referenceTimestamp ? <ul className="mt-5 space-y-4">
        {recentDistribution.map((period) => <li key={period.label} className="grid grid-cols-[5.5rem_minmax(0,1fr)_2rem] items-center gap-3 text-xs">
          <span className="text-muted">{period.label}</span>
          <div role="img" aria-label={`${period.count} reports ${period.label.toLowerCase()}`} className="h-2 overflow-hidden rounded-full bg-background"><div className="chart-bar h-full rounded-full bg-accent" style={{ width: `${maxRecentCount ? (period.count / maxRecentCount) * 100 : 0}%` }} /></div>
          <span className="text-right font-semibold tabular-nums text-foreground">{period.count}</span>
        </li>)}
      </ul> : <p className="mt-6 rounded-xl border border-dashed border-border bg-background px-4 py-6 text-center text-xs text-muted">{issues.length ? "Calculating report date distribution…" : "Date distribution will appear when reports are available."}</p>}
    </Card>

    <Card className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div><h2 className="text-sm font-semibold text-foreground">Recent activity</h2><p className="mt-1 text-xs text-muted">Latest reports in the current view</p></div>
        <span className="rounded-md border border-border bg-background px-2 py-1 text-[10px] font-semibold text-muted">{recentIssues.length} {recentIssues.length === 1 ? "report" : "reports"}</span>
      </div>
      {recentIssues.length ? <ul className="mt-3 space-y-2">
        {recentIssues.map((issue) => <li key={issue.id} className="flex items-center justify-between gap-3 rounded-lg border border-[#e1e9f4] bg-white px-3 py-2.5 transition-colors hover:border-blue-200 hover:bg-blue-50/30">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-foreground">{issue.title}</p>
            <p className="mt-1 truncate text-[10px] text-muted">{issue.category} · {formatIstDateTime(issue.created_at)}</p>
          </div>
          <span className="shrink-0 rounded-full bg-accent-soft px-2 py-1 text-[10px] font-semibold text-accent-strong">{issue.affectedCount} {issue.affectedCount === 1 ? "student" : "students"}</span>
        </li>)}
      </ul> : <p className="mt-6 rounded-xl border border-dashed border-border bg-background px-4 py-6 text-center text-xs text-muted">New reports will appear here.</p>}
    </Card>
  </section>;
}

function MetricCard({ label, value, note, icon, index, loading }: { label: string; value: number; note: string; icon: IconName; index: number; loading: boolean }) {
  return <Card className="metric-enter relative overflow-hidden p-4 sm:p-5" style={{ animationDelay: `${index * 55}ms` }}>
    <div className="flex items-start justify-between gap-2">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600"><DashboardIcon name={icon} className="size-[17px]" /></span>
    </div>
    {loading ? <div className="skeleton mt-2 h-8 w-20 rounded-md" aria-label="Loading metric" /> : <p className="mt-2 text-[1.8rem] font-semibold leading-none tracking-[-0.04em] tabular-nums text-foreground" aria-live="polite">{value.toLocaleString()}</p>}
    <p className="mt-2 text-[10px] leading-4 text-slate-500">{note}</p>
  </Card>;
}

function StatusAction({ issue, disabled, onClick, compact = false }: { issue: AdminIssue; disabled: boolean; onClick: () => void; compact?: boolean }) {
  const next = nextStatus(issue.status);
  return <Button variant={issue.status === "fixed" ? "secondary" : "primary"} disabled={disabled} onClick={onClick} className={`${compact ? "min-h-9 px-3 text-xs" : "min-h-10"} w-full whitespace-nowrap sm:w-auto`}>
    {disabled ? "Saving…" : next.label}
  </Button>;
}

function IssueDetailsDialog({ issue, updating, onClose, onUpdate }: { issue: AdminIssue; updating: boolean; onClose: () => void; onUpdate: () => void }) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return <div className="fixed inset-0 z-[70] flex items-end justify-center bg-[#111827]/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section role="dialog" aria-modal="true" aria-labelledby="issue-detail-title" className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border border-slate-200 bg-white p-5 shadow-[0_24px_80px_rgba(16,24,40,0.24)] sm:max-w-2xl sm:rounded-2xl sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-blue-600">Issue details</p><h2 id="issue-detail-title" className="mt-2 break-words text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{issue.title}</h2></div>
        <button type="button" autoFocus aria-label="Close issue details" onClick={onClose} className="grid size-9 shrink-0 place-items-center rounded-lg border border-border text-muted transition-colors hover:bg-slate-50 hover:text-foreground"><DashboardIcon name="close" /></button>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2"><StatusBadge status={issue.status} /><span className="rounded-full border border-border bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">{issue.category}</span></div>
      <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-slate-600">{issue.description || "No additional description was provided."}</p>
      <dl className="mt-6 grid grid-cols-2 gap-3 border-y border-border py-5 sm:grid-cols-3">
        <div><dt className="text-[10px] font-semibold uppercase tracking-wider text-muted">Location</dt><dd className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground"><DashboardIcon name="location" className="size-3.5 shrink-0 text-muted" />{issue.location}</dd></div>
        <div><dt className="text-[10px] font-semibold uppercase tracking-wider text-muted">Students affected</dt><dd className="mt-1.5 text-sm font-semibold tabular-nums text-foreground">{issue.affectedCount}</dd></div>
        <div className="col-span-2 sm:col-span-1"><dt className="text-[10px] font-semibold uppercase tracking-wider text-muted">Reported</dt><dd className="mt-1.5 text-sm font-medium text-foreground">{formatIstDateTime(issue.created_at)}</dd></div>
      </dl>
      <div className="mt-6"><p className="mb-4 text-xs font-semibold text-slate-600">Resolution progress</p><IssueStatusTimeline status={issue.status} /></div>
      <div className="mt-7 flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose}>Close details</Button>
        <StatusAction issue={issue} disabled={updating} onClick={onUpdate} />
      </div>
    </section>
  </div>;
}

export function AdminDashboard() {
  const [issues, setIssues] = useState<AdminIssue[]>([]);
  const [metrics, setMetrics] = useState<Metrics>(emptyMetrics);
  const [draft, setDraft] = useState<Filters>(initialFilters);
  const [applied, setApplied] = useState<Filters>(initialFilters);
  const [activeSection, setActiveSection] = useState<NavigationSection>("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<AdminIssue | null>(null);
  const [currentDate, setCurrentDate] = useState("");
  const [lastRefreshed, setLastRefreshed] = useState("");
  const [referenceTimestamp, setReferenceTimestamp] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCurrentDate(formatIstLongDate(new Date().toISOString()));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!mobileNavOpen) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileNavOpen(false);
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [mobileNavOpen]);

  const load = useCallback(async (filters: Filters, showLoading: boolean) => {
    if (showLoading) setLoading(true);
    setError("");
    try {
      const data = await fetchDashboardData(filters);
      setIssues(data.issues as AdminIssue[]);
      setMetrics(data.metrics as Metrics);
      const refreshedAt = new Date().toISOString();
      setReferenceTimestamp(refreshedAt);
      setCurrentDate(formatIstLongDate(refreshedAt));
      setLastRefreshed(formatIstTime(refreshedAt));
    } catch (problem) {
      setError(explainLoadError(problem));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    let active = true;
    void fetchDashboardData(initialFilters)
      .then((data) => {
        if (active) {
          setIssues(data.issues as AdminIssue[]);
          setMetrics(data.metrics as Metrics);
          const refreshedAt = new Date().toISOString();
          setReferenceTimestamp(refreshedAt);
          setCurrentDate(formatIstLongDate(refreshedAt));
          setLastRefreshed(formatIstTime(refreshedAt));
        }
      })
      .catch((problem: unknown) => { if (active) setError(explainLoadError(problem)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const navigateTo = useCallback((section: NavigationSection) => {
    setActiveSection(section);
    setMobileNavOpen(false);
    if (section === "help") {
      document.getElementById("administrator-guide")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    const status: Filters["status"] = section === "received" || section === "in_progress" || section === "fixed" ? section : "";
    const next: Filters = { ...initialFilters, status };
    setDraft(next);
    setApplied(next);
    setNotice("");
    void load(next, true);
    if (section === "all") document.getElementById("reports")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [load]);

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = { ...draft, search: draft.search.trim() };
    setActiveSection(next.status || "all");
    setApplied(next);
    setNotice("");
    void load(next, true);
  }

  async function updateStatus(issue: AdminIssue) {
    const next = nextStatus(issue.status);
    setUpdatingId(issue.id);
    setError("");
    setNotice("");
    try {
      const data = await parseResponse(await fetch(`/api/admin/issues/${issue.id}/status`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: next.value }),
      }));
      setSelectedIssue((current) => current?.id === issue.id ? data.issue as AdminIssue : current);
      setNotice(`“${issue.title}” is now ${next.value === "in_progress" ? "In progress" : "Fixed"}.`);
      await load(applied, false);
    } catch (problem) {
      setError(explainLoadError(problem));
    } finally { setUpdatingId(null); }
  }

  async function logout() {
    setLoggingOut(true);
    try {
      await parseResponse(await fetch("/api/admin/logout", { method: "POST" }));
      window.location.replace("/admin/login");
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "You could not be signed out.");
      setLoggingOut(false);
    }
  }

  const metricsList = [
    { label: "Total reports", value: metrics.totalIssues, note: "Across all campus issues", icon: "reports" as const },
    { label: "Open reports", value: metrics.openIssues, note: "Received or in progress", icon: "received" as const },
    { label: "In progress", value: metrics.inProgressIssues, note: "Currently being addressed", icon: "progress" as const },
    { label: "Fixed", value: metrics.fixedIssues, note: "Marked as resolved", icon: "fixed" as const },
    { label: "Students affected", value: metrics.totalAffectedStudents, note: "Reporters and supporters", icon: "people" as const },
  ];
  const hasFilters = Boolean(applied.search || applied.category || applied.status);

  return <div className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[252px_minmax(0,1fr)]">
    <aside className="sticky top-0 hidden h-screen lg:block"><OperationsSidebar activeSection={activeSection} metrics={metrics} loggingOut={loggingOut} onNavigate={navigateTo} onLogout={() => void logout()} /></aside>

    {mobileNavOpen && <div className="fixed inset-0 z-[60] lg:hidden">
      <button type="button" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} className="absolute inset-0 size-full cursor-default bg-[#111827]/45 backdrop-blur-[2px]" />
      <aside role="dialog" aria-modal="true" aria-label="Operations navigation" className="relative h-full w-[min(82vw,292px)] shadow-2xl"><OperationsSidebar activeSection={activeSection} metrics={metrics} loggingOut={loggingOut} onNavigate={navigateTo} onLogout={() => void logout()} /></aside>
    </div>}

    <div className="min-w-0">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="flex h-[68px] items-center justify-between gap-3 px-4 sm:px-7 lg:px-9">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" aria-label="Open navigation" aria-expanded={mobileNavOpen} onClick={() => setMobileNavOpen(true)} className="grid size-9 shrink-0 place-items-center rounded-lg border border-border text-slate-600 transition-colors hover:bg-slate-50 lg:hidden"><DashboardIcon name="menu" /></button>
            <Link href="/" className="flex items-center gap-2 lg:hidden"><span className="grid size-8 place-items-center rounded-lg bg-[#172554] text-xs font-black text-white">F</span><span className="text-sm font-bold text-foreground">FixIt</span></Link>
            <div className="hidden min-w-0 items-center gap-2 text-xs text-slate-400 sm:flex"><span>Operations</span><span aria-hidden="true">/</span><span className="truncate font-medium text-slate-600">Overview</span></div>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <span className="hidden text-xs text-slate-500 md:inline">{lastRefreshed ? `Updated ${lastRefreshed}` : "Live data"}</span>
            <Button variant="secondary" onClick={() => void load(applied, true)} disabled={loading} className="min-h-9 gap-2 px-3 text-xs">
              <DashboardIcon name="refresh" className={`size-3.5 ${loading ? "animate-spin" : ""}`} /> <span className="hidden sm:inline">{loading ? "Refreshing…" : "Refresh"}</span>
            </Button>
            <Button variant="secondary" onClick={() => void logout()} disabled={loggingOut} className="min-h-9 gap-1.5 px-2.5 text-[11px] sm:gap-2 sm:px-3 sm:text-xs">
              <DashboardIcon name="logout" className="size-3.5" />{loggingOut ? "Signing out…" : "Sign out"}
            </Button>
            <span className="hidden h-7 w-px bg-slate-200 sm:block" aria-hidden="true" />
            <span className="hidden items-center gap-2.5 sm:flex"><span className="grid size-8 place-items-center rounded-full bg-blue-50 text-[10px] font-bold text-blue-700">AD</span><span className="text-xs font-semibold text-slate-700">Administrator</span></span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-4 pb-14 pt-7 sm:px-7 sm:pt-9 lg:px-9">
        <section className="mb-6 flex flex-col justify-between gap-4 sm:mb-7 sm:flex-row sm:items-end">
          <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-600">Campus service desk</p><h1 className="mt-2 text-[1.75rem] font-semibold leading-tight tracking-[-0.045em] text-foreground sm:text-3xl">Campus Operations</h1><p className="mt-2 text-sm text-slate-500">A live view of student reports and campus service progress.</p></div>
          <div className="flex items-center gap-2 text-xs text-slate-500"><DashboardIcon name="calendar" className="size-4 text-slate-400" />{currentDate || "Today"}</div>
        </section>

        {error && <div className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-border bg-accent-soft px-4 py-3 text-sm text-accent-strong" role="alert"><p>{error}</p>{error.includes("session has expired") && <Link href="/admin/login" className="shrink-0 font-semibold underline underline-offset-2">Sign in</Link>}</div>}

        <section aria-label="Campus issue metrics" className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          {metricsList.map((metric, index) => <MetricCard key={metric.label} {...metric} index={index} loading={loading && issues.length === 0} />)}
        </section>

        <AnalyticsPanel issues={issues} referenceTimestamp={referenceTimestamp} />

        <section id="reports" aria-labelledby="reports-title" className="scroll-mt-24">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-blue-600">Work queue</p><h2 id="reports-title" className="mt-1.5 text-lg font-semibold tracking-tight text-[#172033]">All reports</h2></div>
            <p className="text-xs text-slate-500">{loading ? "Updating reports…" : `${issues.length} ${issues.length === 1 ? "report" : "reports"} shown`}</p>
          </div>

          <Card className="mb-4 p-4 sm:p-5">
            <form onSubmit={applyFilters} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(190px,1.5fr)_repeat(3,minmax(130px,1fr))_auto] xl:items-end">
              <div className="relative">
                <label htmlFor="search-issues" className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Search reports</label>
                <DashboardIcon name="search" className="pointer-events-none absolute bottom-3 left-3 size-4 text-slate-400" />
                <input id="search-issues" type="search" value={draft.search} onChange={(event) => setDraft({ ...draft, search: event.target.value })} placeholder="Title or location" maxLength={120} className="min-h-10 w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-slate-400 focus:border-blue-400" />
              </div>
              <div><label htmlFor="filter-category" className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Category</label><select id="filter-category" value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-foreground focus:border-blue-400"><option value="">All categories</option>{ISSUE_CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></div>
              <div><label htmlFor="filter-status" className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</label><select id="filter-status" value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as Filters["status"] })} className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-foreground focus:border-blue-400"><option value="">All statuses</option><option value="received">Received</option><option value="in_progress">In progress</option><option value="fixed">Fixed</option></select></div>
              <div><label htmlFor="sort-issues" className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Reported date</label><select id="sort-issues" value={draft.sort} onChange={(event) => setDraft({ ...draft, sort: event.target.value as Filters["sort"] })} className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-foreground focus:border-blue-400"><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></div>
              <Button type="submit" disabled={loading} className="min-h-10 rounded-lg px-4 text-xs">{loading ? "Loading…" : "Apply filters"}</Button>
            </form>
            {hasFilters && <button type="button" onClick={() => { setDraft(initialFilters); setApplied(initialFilters); setActiveSection("all"); void load(initialFilters, true); }} className="mt-3 rounded text-[11px] font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4 transition-colors hover:text-blue-900">Clear all filters</button>}
          </Card>

          {loading && issues.length === 0 ? <Card className="space-y-4 p-5" aria-live="polite"><div className="skeleton h-4 w-44 rounded" /><div className="skeleton h-12 rounded-lg" /><div className="skeleton h-12 rounded-lg" /></Card>
            : !loading && !error && issues.length === 0 ? <Card className="p-8 text-center sm:p-12"><span className="mx-auto grid size-11 place-items-center rounded-xl bg-blue-50 text-blue-600"><DashboardIcon name={hasFilters ? "search" : "reports"} /></span><h3 className="mt-4 font-semibold text-foreground">{metrics.totalIssues === 0 ? "No reports yet" : "No reports match these filters"}</h3><p className="mt-2 text-sm text-muted">{metrics.totalIssues === 0 ? "New student reports will appear here." : "Adjust your search or filters to see other reports."}</p>{hasFilters && <Button variant="secondary" className="mt-4" onClick={() => { setDraft(initialFilters); setApplied(initialFilters); setActiveSection("all"); void load(initialFilters, true); }}>Clear filters</Button>}</Card>
            : <ReportsList issues={issues} updatingId={updatingId} onOpen={setSelectedIssue} onUpdate={(issue) => void updateStatus(issue)} />}
        </section>

        <section id="administrator-guide" aria-labelledby="guide-title" className="scroll-mt-24 mt-10 border-t border-slate-200 pt-8">
          <div className="mb-5 flex items-end justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-blue-600">Quick reference</p><h2 id="guide-title" className="mt-1.5 text-lg font-semibold tracking-tight text-foreground">How to use FixIt</h2></div><p className="hidden text-xs text-slate-500 sm:block">A simple path from report to resolution</p></div>
          <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { number: "01", title: "Review reports", description: "Search and filter the queue to find a report and understand its location and details." },
              { number: "02", title: "Understand impact", description: "Use the affected-student count to see how many people are connected to the report." },
              { number: "03", title: "Start work", description: "Move a received report to In progress when the campus team begins addressing it." },
              { number: "04", title: "Close or reopen", description: "Mark completed work Fixed. Reopen a fixed report if it needs attention again." },
            ].map((step) => <li key={step.number} className="admin-guide-step rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2.5"><span className="grid size-7 place-items-center rounded-lg bg-blue-50 text-[10px] font-bold text-blue-700">{step.number}</span><h3 className="text-xs font-semibold text-foreground">{step.title}</h3></div>
              <p className="mt-3 text-xs leading-5 text-slate-500">{step.description}</p>
            </li>)}
          </ol>
        </section>
      </main>
    </div>

    {notice && <div className="toast-enter fixed bottom-4 right-4 z-[80] flex max-w-[calc(100vw-2rem)] items-start gap-3 rounded-xl border border-blue-200 bg-white px-4 py-3 shadow-[0_12px_36px_rgba(16,24,40,0.16)] sm:bottom-6 sm:right-6" role="status">
      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-700" aria-hidden="true">✓</span><p className="text-xs font-medium leading-5 text-slate-700">{notice}</p><button type="button" aria-label="Dismiss notification" onClick={() => setNotice("")} className="ml-1 grid size-5 shrink-0 place-items-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700"><DashboardIcon name="close" className="size-3.5" /></button>
    </div>}

    {selectedIssue && <IssueDetailsDialog issue={selectedIssue} updating={updatingId === selectedIssue.id} onClose={() => setSelectedIssue(null)} onUpdate={() => void updateStatus(selectedIssue)} />}
  </div>;
}

function ReportsList({ issues, updatingId, onOpen, onUpdate }: { issues: AdminIssue[]; updatingId: string | null; onOpen: (issue: AdminIssue) => void; onUpdate: (issue: AdminIssue) => void }) {
  return <>
    <div className="surface-panel hidden overflow-hidden rounded-xl border border-slate-200 bg-white lg:block">
      <table className="w-full border-collapse text-left">
        <thead className="bg-slate-50/90">
          <tr className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <th scope="col" className="px-5 py-3">Report</th><th scope="col" className="px-4 py-3">Status</th><th scope="col" className="px-4 py-3">Impact</th><th scope="col" className="px-4 py-3">Reported</th><th scope="col" className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {issues.map((issue) => <tr key={issue.id} className="report-row transition-colors hover:bg-blue-50/30">
            <td className="max-w-[390px] px-5 py-4">
              <button type="button" onClick={() => onOpen(issue)} className="block max-w-full text-left text-sm font-semibold text-slate-800 transition-colors hover:text-blue-700">{issue.title}</button>
              <span className="mt-1.5 flex min-w-0 items-center gap-1.5 truncate text-[11px] text-slate-500">{issue.category}<span aria-hidden="true">·</span><DashboardIcon name="location" className="size-3 shrink-0" />{issue.location}</span>
            </td>
            <td className="whitespace-nowrap px-4 py-4"><StatusBadge status={issue.status} /></td>
            <td className="whitespace-nowrap px-4 py-4"><span className="text-sm font-semibold tabular-nums text-slate-800">{issue.affectedCount}</span><span className="ml-1 text-[10px] text-slate-500">{issue.affectedCount === 1 ? "student" : "students"}</span></td>
            <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-500">{formatIstDateTime(issue.created_at)}</td>
            <td className="whitespace-nowrap px-4 py-4 text-right"><StatusAction issue={issue} compact disabled={updatingId !== null} onClick={() => onUpdate(issue)} /></td>
          </tr>)}
        </tbody>
      </table>
    </div>

    <div className="space-y-3 lg:hidden">
      {issues.map((issue) => <article key={issue.id} className="surface-card rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3"><button type="button" onClick={() => onOpen(issue)} className="text-left text-sm font-semibold leading-5 text-slate-800 hover:text-blue-700">{issue.title}</button><StatusBadge status={issue.status} /></div>
        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">{issue.category}<span aria-hidden="true">·</span><DashboardIcon name="location" className="size-3 shrink-0" />{issue.location}</p>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-3 text-[11px] text-slate-500"><span><strong className="font-semibold text-slate-800">{issue.affectedCount}</strong> {issue.affectedCount === 1 ? "student affected" : "students affected"}</span><time dateTime={issue.created_at}>{formatIstDateTime(issue.created_at)}</time></div>
        <div className="mt-3 flex items-center justify-between gap-3"><button type="button" onClick={() => onOpen(issue)} className="text-xs font-semibold text-blue-700 hover:text-blue-900">View details</button><StatusAction issue={issue} compact disabled={updatingId !== null} onClick={() => onUpdate(issue)} /></div>
      </article>)}
    </div>
  </>;
}
