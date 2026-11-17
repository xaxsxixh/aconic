import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "quiet" };
const variants = {
  primary: "bg-accent text-white hover:bg-accent-strong",
  secondary: "border border-border bg-white text-foreground hover:bg-background",
  quiet: "text-muted hover:bg-background hover:text-foreground",
};

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return <button className={`inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`} {...props} />;
}
