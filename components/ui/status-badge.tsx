import type { IssueStatus } from "@/lib/validation/issues";

const labels: Record<IssueStatus, string> = { received: "Received", in_progress: "In progress", fixed: "Fixed" };
const styles: Record<IssueStatus, string> = {
  received: "bg-background text-muted",
  in_progress: "bg-accent-soft text-accent-strong",
  fixed: "bg-accent text-white",
};

export function StatusBadge({ status }: { status: IssueStatus }) {
  return <span className={`status-pill inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}><span className="size-1.5 rounded-full bg-current opacity-70" aria-hidden="true" />{labels[status]}</span>;
}
