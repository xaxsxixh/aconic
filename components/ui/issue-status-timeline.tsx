import type { IssueStatus } from "@/lib/validation/issues";

const steps: { status: IssueStatus; label: string }[] = [
  { status: "received", label: "Received" },
  { status: "in_progress", label: "In progress" },
  { status: "fixed", label: "Fixed" },
];

export function IssueStatusTimeline({ status }: { status: IssueStatus }) {
  const currentIndex = steps.findIndex((step) => step.status === status);

  return <ol aria-label={`Issue progress: ${steps[currentIndex].label}`} className="grid grid-cols-3">
    {steps.map((step, index) => {
      const completed = index < currentIndex;
      const current = index === currentIndex;
      const reached = index <= currentIndex;
      return <li key={step.status} aria-current={current ? "step" : undefined} className="relative flex flex-col items-center text-center">
        {index > 0 && <span className={`absolute left-[-50%] right-1/2 top-[11px] h-px ${index <= currentIndex ? "bg-accent" : "bg-border"}`} aria-hidden="true" />}
        <span className={`relative z-10 grid size-[22px] place-items-center rounded-full border text-[9px] font-bold ${reached ? "border-accent bg-accent text-white" : "border-border bg-white text-muted"}`}>
          {completed ? "✓" : index + 1}
        </span>
        <span className={`mt-2 text-[10px] font-medium sm:text-[11px] ${current ? "text-accent-strong" : "text-muted"}`}>{step.label}</span>
      </li>;
    })}
  </ol>;
}
