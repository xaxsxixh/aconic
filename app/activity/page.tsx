import { ActivityList } from "@/components/activity-list";
import { SiteHeader } from "@/components/site-header";

export default function ActivityPage() {
  return <>
    <SiteHeader active="activity" />
    <main className="mx-auto w-full max-w-6xl flex-1 px-5 pb-16 pt-9 sm:px-8 sm:pt-14">
      <div className="mb-8 flex flex-col justify-between gap-5 border-b border-border pb-7 sm:mb-9 sm:flex-row sm:items-end">
        <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-accent-strong">Your FixIt history</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-foreground sm:text-4xl">My activity</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted">Follow issues you’ve reported and see where your support has made a difference.</p></div>
        <p className="flex items-center gap-2 text-xs leading-5 text-muted sm:max-w-[220px] sm:justify-end sm:text-right"><span className="grid size-7 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent"><svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg></span>Private to this browser</p>
      </div>
      <ActivityList />
    </main>
    <footer className="border-t border-border bg-white"><div className="mx-auto max-w-6xl px-5 py-5 text-xs text-muted sm:px-8">Your anonymous activity is linked to this browser’s cookie.</div></footer>
  </>;
}
