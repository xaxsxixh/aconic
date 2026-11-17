import Link from "next/link";

export function SiteHeader({ active = "report" }: { active?: "report" | "activity" }) {
  return (
    <header className="border-b border-border bg-white shadow-[0_2px_12px_rgba(23,37,84,0.04)]">
      <div className="mx-auto flex h-[70px] max-w-7xl items-center justify-between gap-2 px-5 sm:h-[74px] sm:px-8">
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
        <nav aria-label="Main navigation" className="flex items-center gap-0.5 sm:gap-1">
          <Link href="/" aria-current={active === "report" ? "page" : undefined} className={`rounded-lg px-2 py-2 text-[0.7rem] font-semibold transition-colors sm:px-3 sm:text-sm ${active === "report" ? "bg-accent-soft text-accent-strong" : "text-muted hover:bg-background hover:text-foreground"}`}>Report an issue</Link>
          <Link href="/activity" aria-current={active === "activity" ? "page" : undefined} className={`rounded-lg px-2 py-2 text-[0.7rem] font-semibold transition-colors sm:px-3 sm:text-sm ${active === "activity" ? "bg-accent-soft text-accent-strong" : "text-muted hover:bg-background hover:text-foreground"}`}>My activity</Link>
        </nav>
      </div>
    </header>
  );
}
