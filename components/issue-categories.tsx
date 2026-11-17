const categories = [
  {
    title: "Wi-Fi and Internet",
    description: "Network access, coverage, and connection issues.",
    label: "Wi-Fi router",
    illustration: (
      <>
        <path d="M121 55c20-18 50-18 70 0M132 68c14-12 34-12 48 0M144 80c7-6 17-6 24 0" fill="none" stroke="#2563eb" strokeLinecap="round" strokeWidth="5" />
        <rect x="104" y="83" width="104" height="31" rx="10" fill="#fff" stroke="#bfd2ec" strokeWidth="2" />
        <path d="M119 98h47" stroke="#d6e1f0" strokeLinecap="round" strokeWidth="3" />
        <circle cx="181" cy="98" r="3" fill="#2563eb" />
        <circle cx="192" cy="98" r="3" fill="#1d4ed8" />
      </>
    ),
  },
  {
    title: "Electrical problems",
    description: "Lighting, outlets, and campus power concerns.",
    label: "Light bulb and electrical bolt",
    illustration: (
      <>
        <path d="M119 57a29 29 0 1 1 52 17c-5 5-8 10-8 17h-36c0-7-3-12-8-17a28 28 0 0 1-8-17Z" fill="#fff" stroke="#2563eb" strokeWidth="3" />
        <path d="M136 97h19m-17 8h15m-11 7h7" stroke="#1d4ed8" strokeLinecap="round" strokeWidth="3" />
        <path d="m187 40-20 30h15l-9 24 31-37h-17l10-17Z" fill="#2563eb" />
      </>
    ),
  },
  {
    title: "Water and Plumbing",
    description: "Leaks, taps, drains, and water access.",
    label: "Water pipe and droplet",
    illustration: (
      <>
        <path d="M91 96h62V68h38v28h29" fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" />
        <path d="M91 96h62V68h38v28h29" fill="none" stroke="#2563eb" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
        <path d="M179 41c-9 13-17 21-17 31a17 17 0 1 0 34 0c0-10-8-18-17-31Z" fill="#2563eb" />
        <path d="M169 73c1-5 4-9 7-13" fill="none" stroke="#fff" strokeLinecap="round" strokeWidth="3" />
        <circle cx="114" cy="96" r="4" fill="#dbeafe" />
      </>
    ),
  },
  {
    title: "Cleaning and Maintenance",
    description: "Shared spaces, waste, and everyday upkeep.",
    label: "Cleaning bucket and mop",
    illustration: (
      <>
        <path d="m177 36-32 58m23-62 15 8-7 12-15-8Z" fill="#fff" stroke="#2563eb" strokeLinejoin="round" strokeWidth="3" />
        <path d="m131 82 30 14-12 20-34-16Z" fill="#dbeafe" stroke="#2563eb" strokeLinejoin="round" strokeWidth="3" />
        <path d="m120 100-8 12m18-6-4 13m17-10 1 11m14-18 6 12" stroke="#1d4ed8" strokeLinecap="round" strokeWidth="3" />
        <path d="M185 83h47l-6 34h-35Z" fill="#fff" stroke="#2563eb" strokeLinejoin="round" strokeWidth="3" />
        <path d="M191 89h35" stroke="#d6e1f0" strokeWidth="3" />
      </>
    ),
  },
  {
    title: "Classroom and Lab Equipment",
    description: "Room equipment, lab tools, and learning spaces.",
    label: "Laboratory microscope",
    illustration: (
      <>
        <path d="m134 43 14-10 22 28-14 11Z" fill="#fff" stroke="#2563eb" strokeLinejoin="round" strokeWidth="3" />
        <path d="m163 62 12-9 8 11-13 9m-29 5c20-4 35 8 35 25h-48c0-13 7-23 13-30Z" fill="#dbeafe" stroke="#2563eb" strokeLinejoin="round" strokeWidth="3" />
        <path d="M118 103h81m-53-4c0-9 7-16 16-16m-17-7 20 4" fill="none" stroke="#1d4ed8" strokeLinecap="round" strokeWidth="4" />
        <path d="M205 45h27v58h-27z" fill="#fff" stroke="#bfd2ec" strokeWidth="2" />
        <path d="M211 55h15m-15 8h15m-15 8h10" stroke="#2563eb" strokeLinecap="round" strokeWidth="2" />
      </>
    ),
  },
];

export function IssueCategories() {
  return (
    <section aria-labelledby="issue-categories-title" className="border-y border-border bg-white">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16">
        <div className="mb-8 flex flex-col gap-3 sm:mb-9 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent-strong">Made for campus life</p>
            <h2 id="issue-categories-title" className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">What needs fixing?</h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-muted sm:text-right">From a weak connection to a classroom tool that needs attention, report the issues that affect your day.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
          {categories.map((category) => (
            <article key={category.title} className="category-card group last:col-span-2 rounded-2xl border bg-white p-3 sm:p-4 lg:last:col-span-1">
              <div className="mb-3 overflow-hidden rounded-xl border border-border/70 bg-background">
                <svg viewBox="0 0 300 140" className="h-[88px] w-full sm:h-[100px]" role="img" aria-label={category.label}>
                  <rect width="300" height="140" rx="16" fill="#f3f7ff" />
                  <circle cx="220" cy="58" r="43" fill="#eaf2ff" />
                  <ellipse cx="153" cy="119" rx="82" ry="7" fill="#dbeafe" />
                  {category.illustration}
                </svg>
              </div>
              <h3 className="min-h-10 text-sm font-bold leading-5 tracking-tight text-foreground sm:min-h-0 sm:text-[0.95rem]">{category.title}</h3>
              <p className="mt-1.5 text-xs leading-5 text-muted sm:text-[0.8rem]">{category.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
