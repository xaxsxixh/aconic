"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { IssueStatusTimeline } from "@/components/ui/issue-status-timeline";
import type { IssueStatus } from "@/lib/validation/issues";

type ActivityItem = { kind: "created" | "supported"; id: string; category: string; location: string; title: string; description: string; status: IssueStatus; affectedCount: number; created_at: string };

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
}

export function ActivityList() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const response = await fetch("/api/me", { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Your activity couldn’t be loaded.");
        if (active) setItems(data.activity as ActivityItem[]);
      } catch (problem) {
        if (active) setError(problem instanceof Error ? problem.message : "Your activity couldn’t be loaded.");
      } finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [reloadToken]);

  if (loading) return <div className="space-y-3" aria-live="polite">
    {[0, 1].map((item) => <Card key={item} className="space-y-4 p-5 sm:p-6"><div className="skeleton h-3 w-28 rounded" /><div className="skeleton h-5 w-3/5 rounded" /><div className="skeleton h-12 rounded-lg" /><div className="skeleton h-4 w-2/5 rounded" /></Card>)}
  </div>;
  if (error) return <Card className="border-border p-6 sm:p-8"><p className="text-sm font-semibold text-[#172554]">Activity couldn’t be loaded</p><p role="alert" className="mt-1 text-sm text-muted">{error}</p><Button variant="secondary" className="mt-4" onClick={() => { setLoading(true); setError(""); setReloadToken((token) => token + 1); }}>Try again</Button></Card>;
  if (items.length === 0) return <Card className="overflow-hidden p-0">
    <div className="bg-[linear-gradient(110deg,#eaf2ff,white_68%)] px-6 py-8 text-center sm:px-10 sm:py-12">
      <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-white text-accent shadow-sm"><svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 3.75h7l4 4v12.5H7a2 2 0 0 1-2-2v-12.5a2 2 0 0 1 2-2Z" /><path d="M14 3.75v4h4M8.5 12h7m-7 3.5h7" /></svg></span>
      <h2 className="mt-4 text-lg font-semibold text-foreground">Your campus activity starts here</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">Reports you create or support will appear here with their status and progress. Your history is linked to this browser, not a student account.</p>
      <Link href="/#report" className="mt-5 inline-flex min-h-10 items-center justify-center rounded-lg bg-accent px-4 text-xs font-semibold text-white transition-colors hover:bg-accent-strong">Report an issue</Link>
    </div>
    <div className="border-t border-border bg-white px-5 py-3 text-center text-[11px] leading-5 text-muted">Keep this browser’s cookies to retain access to your anonymous activity.</div>
  </Card>;

  return <div className="space-y-3">
    {items.map((item) => <Card key={`${item.kind}-${item.id}`} className="surface-card overflow-hidden p-0">
      <div className="grid md:grid-cols-[minmax(0,1.3fr)_minmax(230px,0.7fr)]">
        <div className="min-w-0 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${item.kind === "created" ? "bg-accent-soft text-accent-strong" : "bg-background text-[#172554]"}`}>
              <span className={`size-1.5 rounded-full ${item.kind === "created" ? "bg-accent" : "bg-[#172554]"}`} aria-hidden="true" />
              {item.kind === "created" ? "You reported" : "You supported"}
            </span>
            <StatusBadge status={item.status} />
          </div>
          <h2 className="mt-3 break-words text-base font-semibold leading-6 tracking-tight text-foreground sm:text-lg">{item.title}</h2>
          <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted"><span>{item.category}</span><span aria-hidden="true">·</span><span>{item.location}</span></p>
          {item.description && <p className="mt-4 whitespace-pre-wrap border-l-2 border-accent-soft pl-3 text-sm leading-6 text-slate-600">{item.description}</p>}
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5"><span className="font-semibold tabular-nums text-foreground">{item.affectedCount}</span>{item.affectedCount === 1 ? "student affected" : "students affected"}</span>
            <time dateTime={item.created_at}>Reported {formatDate(item.created_at)}</time>
          </div>
        </div>
        <div className="flex flex-col justify-center border-t border-border bg-background px-5 py-5 md:border-l md:border-t-0 sm:px-6">
          <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Issue progress</p>
          <IssueStatusTimeline status={item.status} />
          <p className="mt-5 text-[11px] leading-5 text-slate-500">{item.status === "fixed" ? "This report has been marked fixed by the campus team." : item.status === "in_progress" ? "The campus team is working on this report." : "Your report is in the campus team’s queue."}</p>
        </div>
      </div>
    </Card>)}
    <p className="px-1 pt-2 text-[11px] leading-5 text-muted">Your anonymous activity is attached to this browser. Clearing its cookies removes your access to this history.</p>
  </div>;
}
