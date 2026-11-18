"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function AdminLoginForm() {
  const router = useRouter();
  const [accessCode, setAccessCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accessCode }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Sign in could not be completed.");
      router.replace("/admin");
      router.refresh();
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "Sign in could not be completed.");
    } finally { setBusy(false); }
  }

  return <form onSubmit={submit} className="mt-7 space-y-4">
    <div>
      <label htmlFor="admin-code" className="mb-2 block text-sm font-semibold text-foreground">Access code</label>
      <input id="admin-code" type="password" value={accessCode} onChange={(event) => setAccessCode(event.target.value)} autoComplete="current-password" required maxLength={256} className="min-h-12 w-full rounded-xl border border-border bg-white px-3.5 text-sm text-foreground shadow-sm focus:border-accent" />
    </div>
    <aside aria-labelledby="demo-access-title" className="rounded-xl border border-accent/20 bg-accent-soft p-4">
      <h3 id="demo-access-title" className="text-sm font-semibold text-accent-strong">Demo Access for Evaluators</h3>
      <p className="mt-1 text-sm leading-5 text-muted">Use the following demo access code to explore the administrator dashboard:</p>
      <p className="mt-2 font-mono text-sm font-semibold text-foreground">test@123</p>
    </aside>
    {error && <p role="alert" className="rounded-xl bg-accent-soft px-4 py-3 text-sm leading-5 text-danger">{error}</p>}
    <Button type="submit" disabled={busy || !accessCode} className="w-full">{busy ? "Verifying access…" : "Sign in securely"}</Button>
    <p className="text-xs leading-5 text-muted">Your access code is sent directly to the server and is never stored in browser storage.</p>
  </form>;
}
