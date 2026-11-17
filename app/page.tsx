import Link from "next/link";
import { CampusHeroArt } from "@/components/campus-hero-art";
import { IssueCategories } from "@/components/issue-categories";
import { ReportExperience } from "@/components/report-experience";
import { SiteHeader } from "@/components/site-header";
import { SupportContact } from "@/components/support-contact";

const steps = [
  {
    number: "01",
    title: "Report",
    description: "Describe the issue, choose a category, and add a useful campus location.",
    icon: (
      <>
        <path d="M7 3.75h7l4 4v12.5H7a2 2 0 0 1-2-2v-12.5a2 2 0 0 1 2-2Z" />
        <path d="M14 3.75v4h4M8.5 12h7m-7 3.5h7" />
      </>
    ),
  },
  {
    number: "02",
    title: "Connect",
    description: "Check for similar reports and add Me Too when an issue affects you too.",
    icon: (
      <>
        <circle cx="10.5" cy="10.5" r="6.25" />
        <path d="m15 15 4.25 4.25M8 10.5h5m-2.5-2.5v5M3 19.5h5" />
      </>
    ),
  },
  {
    number: "03",
    title: "Track",
    description: "Follow status updates in My Activity until the issue is marked fixed.",
    icon: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7v5l3.5 2M8 2.75h8" />
      </>
    ),
  },
];

const benefits = [
  {
    title: "Easy issue reporting",
    description: "Share what is happening, where it is, and what needs attention.",
    icon: <><path d="M7 3.75h7l4 4v12.5H7a2 2 0 0 1-2-2v-12.5a2 2 0 0 1 2-2Z" /><path d="M14 3.75v4h4M8.5 12h7m-7 3.5h5" /></>,
  },
  {
    title: "Fewer duplicate reports",
    description: "See related open reports before deciding whether to submit a new one.",
    icon: <><circle cx="10.5" cy="10.5" r="6.25" /><path d="m15 15 4.25 4.25M8 10.5h5m-2.5-2.5v5" /></>,
  },
  {
    title: "Shared student support",
    description: "Use Me Too to show when an existing issue affects you as well.",
    icon: <><path d="M16 19.5v-1.25a3.25 3.25 0 0 0-3.25-3.25h-5.5A3.25 3.25 0 0 0 4 18.25v1.25" /><circle cx="10" cy="7.5" r="3.5" /><path d="M17 11a3 3 0 1 0 0-6m1 9h.25a3.25 3.25 0 0 1 3.25 3.25v1.25" /></>,
  },
  {
    title: "Clear status tracking",
    description: "Follow reports as they move from received to in progress to fixed.",
    icon: <><path d="M4 12.5 9 17l11-11" /><path d="M20 12v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h8" /></>,
  },
];

export default function HomePage() {
  return (
    <div className="page-shell flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="hero-section relative mx-auto grid w-full max-w-7xl items-center gap-8 px-5 pb-12 pt-5 sm:gap-10 sm:px-8 sm:pb-16 sm:pt-7 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-start lg:gap-7 lg:pb-16 lg:pt-9">
          <div className="hero-copy max-w-2xl">
            <p className="hero-wordmark mb-1">
              <span className="sr-only">FixIt</span>
              <span aria-hidden="true" className="hero-wordmark-visual">
                <span className="hero-wordmark-fix">
                  <span className="hero-wordmark-letter" style={{ animationDelay: "0ms" }}>F</span>
                  <span className="hero-wordmark-letter" style={{ animationDelay: "70ms" }}>i</span>
                  <span className="hero-wordmark-x">
                    <span className="hero-wordmark-letter" style={{ animationDelay: "140ms" }}>x</span>
                    <svg className="hero-wordmark-check" viewBox="0 0 42 24" fill="none" aria-hidden="true">
                      <defs>
                        <linearGradient id="hero-wordmark-check-gradient" x1="3" y1="20" x2="39" y2="2" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#8ec4e8" />
                          <stop offset="1" stopColor="#2563eb" />
                        </linearGradient>
                      </defs>
                      <path d="M3 5 16 20 39 2" stroke="url(#hero-wordmark-check-gradient)" strokeWidth="6" strokeLinecap="square" strokeLinejoin="miter" />
                    </svg>
                  </span>
                </span>
                <span className="hero-wordmark-hyphen hero-wordmark-letter" style={{ animationDelay: "280ms" }}>-</span>
                <span className="hero-wordmark-it">
                  <span className="hero-wordmark-letter" style={{ animationDelay: "350ms" }}>I</span>
                  <span className="hero-wordmark-letter" style={{ animationDelay: "420ms" }}>t</span>
                </span>
              </span>
            </p>
            <h1 className="max-w-[13ch] text-[2.65rem] font-semibold leading-[1.02] tracking-[-0.055em] text-foreground sm:text-5xl lg:text-[3.75rem]">
              Campus issues, solved.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted sm:mt-5 sm:text-lg sm:leading-8">
              Report campus problems, find related issues, and follow progress with your campus team.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="#report" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(37,99,235,0.22)] transition-colors hover:bg-accent-strong">
                Report an issue
                <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M4 10h12m-5-5 5 5-5 5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </Link>
              <Link href="/activity" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-border bg-white px-5 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-background">
                Track my reports
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-4 text-xs font-medium text-muted sm:text-sm">
              <span className="inline-flex items-center gap-2"><span className="grid size-5 place-items-center rounded-full bg-accent-soft text-accent-strong" aria-hidden="true">✓</span>No account needed</span>
              <span className="inline-flex items-center gap-2"><span className="grid size-5 place-items-center rounded-full bg-accent-soft text-accent-strong" aria-hidden="true">✓</span>Support shared reports</span>
            </div>
          </div>
          <CampusHeroArt />
        </section>

        <IssueCategories />

        <section aria-labelledby="how-to-title" className="border-b border-border bg-background">
          <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16">
            <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent-strong">Simple from start to finish</p>
              <h2 id="how-to-title" className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">How FixIt works</h2>
              <p className="mt-3 text-sm leading-6 text-muted sm:text-base">One clear path to help your campus team understand and address an issue.</p>
            </div>
            <ol className="workflow-steps relative grid gap-4 md:grid-cols-3">
              {steps.map((step) => (
                <li key={step.number} className="step-card rounded-[var(--radius-card)] border border-border bg-white p-5 sm:p-7">
                  <div className="flex items-start justify-between">
                    <span className="step-icon-tile grid size-12 place-items-center rounded-2xl bg-accent-soft text-accent-strong">
                      <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{step.icon}</svg>
                    </span>
                    <span className="text-xs font-bold tracking-[0.16em] text-muted">{step.number}</span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold tracking-tight text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="report" aria-labelledby="report-title" className="scroll-mt-8 mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16">
          <div className="mb-8 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent-strong">Tell us what needs attention</p>
            <h2 id="report-title" className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">Start with the details</h2>
            <p className="mt-3 text-sm leading-6 text-muted sm:text-base">Add the details your campus team needs. We’ll check for similar reports before you submit.</p>
          </div>
          <ReportExperience />
        </section>

        <section aria-labelledby="why-fixit-title" className="border-y border-border bg-white">
          <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16">
            <div className="mb-8 max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent-strong">Built around shared progress</p>
              <h2 id="why-fixit-title" className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">Why use FixIt?</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {benefits.map((benefit) => (
                <article key={benefit.title} className="benefit-card flex gap-3 rounded-2xl border border-border bg-white p-4 sm:flex-col sm:p-5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-strong">
                    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{benefit.icon}</svg>
                  </span>
                  <div>
                    <h3 className="text-sm font-bold tracking-tight text-foreground">{benefit.title}</h3>
                    <p className="mt-1.5 text-xs leading-5 text-muted sm:text-sm">{benefit.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="final-cta-title" className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="final-cta-panel flex flex-col gap-6 rounded-[28px] border border-white/20 bg-navy px-6 py-8 text-white sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:py-10">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-100">Help improve your campus</p>
              <h2 id="final-cta-title" className="mt-2 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">See something that needs attention?</h2>
              <p className="mt-2 text-sm leading-6 text-blue-100">Send a clear report and follow its progress with your campus team.</p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <Link href="#report" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-navy shadow-sm transition-colors hover:bg-blue-50">
                Report an issue
                <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M4 10h12m-5-5 5 5-5 5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </Link>
              <Link href="/activity" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/35 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/10">
                Track my reports
              </Link>
            </div>
          </div>
        </section>

        <SupportContact />
      </main>
      <footer className="border-t border-border bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span>FixIt · A clearer way to care for campus.</span>
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-5 gap-y-2 font-medium">
            <Link href="/activity" className="hover:text-foreground">My Activity</Link>
            <Link href="/admin/login" className="hover:text-foreground">Administrator sign in</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
