import { createSupportMailto, SUPPORT_EMAIL } from "@/lib/support/contact";

export function SupportContact() {
  const mailto = createSupportMailto(SUPPORT_EMAIL);
  if (!mailto) throw new Error("The configured FixIt support email is invalid.");

  return (
    <section aria-labelledby="support-contact-title" className="mx-auto max-w-7xl px-5 pb-12 sm:px-8 sm:pb-16">
      <div className="surface-panel flex flex-col gap-5 rounded-2xl border border-border bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:p-7">
        <div className="flex items-start gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-blue-100 bg-accent-soft text-accent-strong" aria-hidden="true">
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3.5" y="5" width="17" height="14" rx="2" />
              <path d="m4.5 7 7.5 5.5L19.5 7" />
            </svg>
          </span>
          <div className="min-w-0">
            <h2 id="support-contact-title" className="text-lg font-semibold tracking-tight text-foreground">Need a hand with something?</h2>
            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted">Having trouble reporting or tracking a campus issue? Get in touch with our support team.</p>
          </div>
        </div>
        <a href={mailto} className="support-contact-action group inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(37,99,235,0.18)] transition-colors hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
          Contact Support
          <svg viewBox="0 0 20 20" className="support-plane size-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m18 2-7.5 16-2.2-6.3L2 9.5 18 2Z" />
            <path d="m8.3 11.7 4.2-4.2" />
          </svg>
        </a>
      </div>
    </section>
  );
}
