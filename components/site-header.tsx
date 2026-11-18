import Link from "next/link";

export function SiteHeader({ active = "report" }: { active?: "report" | "activity" }) {
  return (
    <header className="border-b border-border bg-white shadow-[0_2px_12px_rgba(23,37,84,0.04)]">
      <div className="mx-auto flex min-h-[70px] max-w-7xl flex-col items-stretch justify-center gap-1 px-5 py-2 sm:h-[74px] sm:flex-row sm:items-center sm:py-0 sm:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-offset-4" aria-label="FixIt home">
          <span aria-hidden="true" className="brand-lockup">
            <span className="brand-wordmark text-[1.875rem] font-black leading-[0.82] tracking-[-0.06em] sm:text-[2.5rem]">
              {"FIXIT".split("").map((letter, index) => (
                <span key={`${letter}-${index}`} className="brand-letter" style={{ animationDelay: `${index * 70}ms` }}>
                  {letter}
                </span>
              ))}
            </span>
            <span className="brand-tagline">CAMPUS SOLUTIONS</span>
            <span className="brand-underline" />
          </span>
        </Link>
        <nav aria-label="Main navigation" className="flex w-full items-center justify-between gap-0.5 sm:w-auto sm:justify-normal sm:gap-1">
          <Link href="/" aria-current={active === "report" ? "page" : undefined} className={`rounded-lg px-1.5 py-2 text-[0.7rem] font-semibold transition-colors sm:px-3 sm:text-sm ${active === "report" ? "bg-accent-soft text-accent-strong" : "text-muted hover:bg-background hover:text-foreground"}`}>Report an issue</Link>
          <Link href="/activity" aria-current={active === "activity" ? "page" : undefined} className={`rounded-lg px-1.5 py-2 text-[0.7rem] font-semibold transition-colors sm:px-3 sm:text-sm ${active === "activity" ? "bg-accent-soft text-accent-strong" : "text-muted hover:bg-background hover:text-foreground"}`}>My activity</Link>
          <Link href="/admin/login" className="rounded-lg border border-accent/20 bg-accent-soft px-1.5 py-2 text-center text-[0.7rem] font-semibold text-accent-strong transition-colors hover:bg-accent-soft sm:px-3 sm:text-sm">Administrator Sign In</Link>
        </nav>
      </div>
    </header>
  );
}
