import { Suspense } from "react";
import { AdminLoginGate } from "@/app/admin/login/login-gate";
import { SiteHeader } from "@/components/site-header";

export default function AdminLoginPage() {
  return <>
    <SiteHeader />
    <main className="mx-auto grid w-full max-w-6xl flex-1 items-start gap-8 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.85fr)] lg:items-center lg:gap-16">
      <div className="max-w-xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent-strong">FixIt operations</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">A clearer view of campus needs.</h1>
        <p className="mt-4 text-sm leading-6 text-muted sm:text-base">Sign in to review student reports, prioritize issues, and keep the campus community informed as work progresses.</p>
        <section aria-labelledby="admin-guide-title" className="surface-panel mt-9 rounded-[var(--radius-card)] border border-border bg-white p-5 sm:p-6">
          <h2 id="admin-guide-title" className="font-semibold text-foreground">Administrator guide</h2>
          <ol className="mt-5 space-y-4">
            <li className="flex gap-3">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent-soft text-xs font-bold text-accent-strong">1</span>
              <p className="pt-1 text-sm leading-5 text-muted"><strong className="font-semibold text-foreground">Review the queue.</strong> Search, filter, and sort reports to find the right work.</p>
            </li>
            <li className="flex gap-3">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent-soft text-xs font-bold text-accent-strong">2</span>
              <p className="pt-1 text-sm leading-5 text-muted"><strong className="font-semibold text-foreground">Understand impact.</strong> Me Too support helps show how many students are affected.</p>
            </li>
            <li className="flex gap-3">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent-soft text-xs font-bold text-accent-strong">3</span>
              <p className="pt-1 text-sm leading-5 text-muted"><strong className="font-semibold text-foreground">Keep statuses current.</strong> Move issues through in progress to fixed; reopen when needed.</p>
            </li>
          </ol>
        </section>
      </div>
      <section className="surface-panel w-full rounded-[var(--radius-card)] border border-border bg-white p-6 sm:p-9">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Administrator sign in</h2>
        <p className="mt-2 text-sm leading-6 text-muted">Use the access code configured for this FixIt deployment to manage campus reports.</p>
        <Suspense fallback={<p className="mt-7 text-sm text-muted">Checking your session…</p>}><AdminLoginGate /></Suspense>
      </section>
    </main>
  </>;
}
