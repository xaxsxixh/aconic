import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLElement>) {
  return <section className={`ui-card rounded-[var(--radius-card)] border border-border bg-surface ${className}`} {...props} />;
}
