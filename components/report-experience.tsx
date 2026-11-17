"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { createIssueSchema, ISSUE_CATEGORIES, type IssueStatus } from "@/lib/validation/issues";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

type FormValues = { category: string; location: string; title: string; description: string };
type Match = { id: string; category: string; location: string; title: string; status: IssueStatus; affectedCount: number; isOwnIssue: boolean; supportedByMe: boolean };
type FieldName = keyof FormValues;

const initialValues: FormValues = { category: "", location: "", title: "", description: "" };

async function readResponse(response: Response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "We couldn’t complete that request. Please try again.");
  return payload;
}

export function ReportExperience() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [matchChecked, setMatchChecked] = useState(false);
  const [busy, setBusy] = useState<"matching" | "creating" | string | null>(null);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState<{ title: string; action: "created" | "supported"; affectedCount?: number } | null>(null);
  const [matchCheckFailed, setMatchCheckFailed] = useState(false);

  function updateField(name: FieldName, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setMatches(null);
    setMatchChecked(false);
    setMatchCheckFailed(false);
    setMessage("");
  }

  function validate(): FormValues | null {
    const parsed = createIssueSchema.safeParse(values);
    if (!parsed.success) {
      const nextErrors: Partial<Record<FieldName, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as FieldName;
        if (key && !nextErrors[key]) nextErrors[key] = issue.message;
      }
      setErrors(nextErrors);
      setMessage("A couple of details need your attention.");
      return null;
    }
    setErrors({});
    setMessage("");
    return parsed.data;
  }

  async function checkMatches(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const valid = validate();
    if (!valid) return;
    setBusy("matching");
    setMatches(null);
    setMatchChecked(false);
    setMatchCheckFailed(false);
    try {
      const params = new URLSearchParams({ category: valid.category, location: valid.location });
      const data = await readResponse(await fetch(`/api/issues/matches?${params}`, { cache: "no-store" }));
      setMatches(data.matches as Match[]);
      setMatchChecked(true);
      setMatchCheckFailed(false);
    } catch (error) {
      setMatchCheckFailed(true);
      setMessage(error instanceof Error ? error.message : "We couldn’t check for related reports. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  async function submitIssue() {
    const valid = validate();
    if (!valid) return;
    setBusy("creating");
    setMessage("");
    try {
      const data = await readResponse(await fetch("/api/issues", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(valid),
      }));
      setSuccess({ title: data.issue.title, action: "created" });
      setMatches(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Your report couldn’t be saved. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  async function supportIssue(match: Match) {
    setBusy(match.id);
    setMessage("");
    try {
      const data = await readResponse(await fetch(`/api/issues/${match.id}/support`, { method: "POST" }));
      setMatches((current) => current?.map((item) => item.id === match.id
        ? { ...item, supportedByMe: true, affectedCount: data.affectedCount }
        : item) ?? current);
      setSuccess({ title: match.title, action: "supported", affectedCount: data.affectedCount });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "We couldn’t add your support. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  if (success) {
    return (
      <Card className="feedback-in surface-card mx-auto w-full max-w-2xl p-7 sm:p-10">
        <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-accent-soft text-xl font-bold text-accent-strong shadow-sm" aria-hidden="true">✓</div>
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-accent-strong">{success.action === "created" ? "Report received" : "You’re counted in"}</p>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">{success.action === "created" ? "Thanks for letting us know." : "Thanks for adding your voice."}</h2>
        <p className="mt-3 max-w-pblue text-sm leading-6 text-muted">{success.action === "created" ? `“${success.title}” has been saved. You can follow its progress from your activity.` : `Your support for “${success.title}” has been saved. It now has ${success.affectedCount} ${success.affectedCount === 1 ? "student" : "students"} counted as affected.`}</p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link href="/activity" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-strong">View my activity</Link>
          <Button variant="secondary" onClick={() => { setValues(initialValues); setSuccess(null); setMatchChecked(false); setMatches(null); }}>Report another issue</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)] lg:items-start">
      <Card className="surface-card p-5 sm:p-8">
        <div className="mb-7">
          <p className="mb-2 text-sm font-semibold text-accent-strong">Tell us what needs attention</p>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Report a campus issue</h2>
          <p className="mt-2 text-sm leading-6 text-muted">Share a few details. We’ll check whether someone has already reported the same kind of problem nearby.</p>
        </div>
        <form onSubmit={checkMatches} noValidate className="space-y-5">
          <div>
            <label htmlFor="category" className="mb-2 block text-sm font-semibold text-foreground">Issue category</label>
            <select id="category" value={values.category} onChange={(event) => updateField("category", event.target.value)} aria-invalid={Boolean(errors.category)} aria-describedby={errors.category ? "category-error" : undefined} className="min-h-12 w-full rounded-xl border border-border bg-white px-3.5 text-sm text-foreground shadow-sm focus:border-accent">
              <option value="">Choose a category</option>
              {ISSUE_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
            {errors.category && <p id="category-error" className="mt-1.5 text-sm text-danger">{errors.category}</p>}
          </div>
          <div>
            <label htmlFor="location" className="mb-2 block text-sm font-semibold text-foreground">Where is the issue?</label>
            <input id="location" value={values.location} onChange={(event) => updateField("location", event.target.value)} placeholder="For example, Library, Block A, Lab 2, or Hostel" aria-invalid={Boolean(errors.location)} aria-describedby={errors.location ? "location-error location-hint" : "location-hint"} autoComplete="off" className="min-h-12 w-full rounded-xl border border-border bg-white px-3.5 text-sm text-foreground shadow-sm placeholder:text-muted focus:border-accent" />
            <p id="location-hint" className="mt-1.5 text-xs text-muted">Use a building, room, or nearby landmark.</p>
            {errors.location && <p id="location-error" className="mt-1.5 text-sm text-danger">{errors.location}</p>}
          </div>
          <div>
            <label htmlFor="title" className="mb-2 block text-sm font-semibold text-foreground">Short issue title</label>
            <input id="title" value={values.title} onChange={(event) => updateField("title", event.target.value)} placeholder="For example, Wi-Fi keeps disconnecting" aria-invalid={Boolean(errors.title)} aria-describedby={errors.title ? "title-error" : undefined} maxLength={120} className="min-h-12 w-full rounded-xl border border-border bg-white px-3.5 text-sm text-foreground shadow-sm placeholder:text-muted focus:border-accent" />
            {errors.title && <p id="title-error" className="mt-1.5 text-sm text-danger">{errors.title}</p>}
          </div>
          <div>
            <label htmlFor="description" className="mb-2 block text-sm font-semibold text-foreground">More detail <span className="font-normal text-muted">(optional)</span></label>
            <textarea id="description" value={values.description} onChange={(event) => updateField("description", event.target.value)} placeholder="When did it start? Is there anything else we should know?" rows={4} maxLength={2000} aria-invalid={Boolean(errors.description)} aria-describedby={errors.description ? "description-error description-hint" : "description-hint"} className="w-full resize-y rounded-xl border border-border bg-white px-3.5 py-3 text-sm leading-6 text-foreground shadow-sm placeholder:text-muted focus:border-accent" />
            <p id="description-hint" className="mt-1.5 text-right text-xs text-muted">{values.description.length}/2000</p>
            {errors.description && <p id="description-error" className="mt-1.5 text-sm text-danger">{errors.description}</p>}
          </div>
          {message && <p role="alert" className="rounded-xl bg-accent-soft px-4 py-3 text-sm leading-5 text-danger">{message}</p>}
          <Button type="submit" disabled={busy !== null} className="w-full sm:w-auto sm:min-w-52">
            {busy === "matching" ? <><span className="mr-2 inline-block size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />Checking for matches…</> : "Check for similar reports"}
          </Button>
          <p className="text-xs leading-5 text-muted">No student account needed. Your report is linked to this browser so you can follow it later.</p>
        </form>
      </Card>

      <div className="space-y-5">
        <Card className="surface-card p-5 sm:p-6">
          <div className="mb-4 flex items-start gap-3">
            <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-lg font-bold text-accent-strong">↗</span>
            <div><h3 className="font-bold text-foreground">One issue, shared effort</h3><p className="mt-1 text-sm leading-5 text-muted">If it’s already been reported, choose Me Too. Your support helps staff see how many students are affected.</p></div>
          </div>
          <div className="border-t border-border pt-4 text-sm leading-6 text-muted"><span className="font-semibold text-foreground">You stay in control.</span> Similar reports are suggestions only. You can always report a different issue.</div>
        </Card>

        {matchCheckFailed && <Card className="feedback-in surface-card p-5" aria-live="polite"><p className="font-semibold text-foreground">We couldn’t check for related reports</p><p className="mt-1 text-sm leading-5 text-muted">You can try again, or continue with a separate report. If a similar report exists, staff can review both.</p><Button className="mt-4 w-full" disabled={busy !== null} onClick={submitIssue}>{busy === "creating" ? "Submitting report…" : "Continue with a separate report"}</Button></Card>}

        {matchChecked && matches !== null && (
          <section aria-labelledby="matches-title" aria-live="polite" className="space-y-3">
            {matches.length > 0 ? <>
              <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent-strong">Before you submit</p><h3 id="matches-title" className="mt-1 text-lg font-bold text-foreground">These reports may be related</h3><p className="mt-1 text-sm leading-5 text-muted">Category and location are clues, not proof. Check the details and choose what fits.</p></div>
              {matches.map((match) => <Card key={match.id} className="feedback-in surface-card p-4">
                <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-medium text-muted">{match.category} · {match.location}</p><h4 className="mt-1 font-semibold text-foreground">{match.title}</h4></div><StatusBadge status={match.status} /></div>
                <p className="mt-3 text-sm text-muted"><strong className="font-semibold text-foreground">{match.affectedCount}</strong> {match.affectedCount === 1 ? "student affected" : "students affected"}</p>
                {match.isOwnIssue ? <p className="mt-3 rounded-lg bg-background px-3 py-2 text-xs leading-5 text-muted">You reported this issue. You’re already counted as affected.</p>
                  : match.supportedByMe ? <p className="mt-3 rounded-lg bg-accent-soft px-3 py-2 text-xs font-semibold text-accent-strong">You’ve already added your support.</p>
                  : <Button className="mt-3 w-full" disabled={busy !== null} onClick={() => supportIssue(match)}>{busy === match.id ? "Adding your support…" : "Me Too — I’m affected"}</Button>}
              </Card>)}
              <Button variant="secondary" className="w-full" disabled={busy !== null} onClick={submitIssue}>{busy === "creating" ? "Submitting report…" : "This is a different issue — report it"}</Button>
            </> : <Card className="p-5">
              <p className="text-sm font-semibold text-foreground">No similar open reports found</p><p className="mt-1 text-sm leading-5 text-muted">You can submit this as a new issue. If it’s different from another problem you know about, reporting it separately is the right choice.</p>
              <Button className="mt-4 w-full" disabled={busy !== null} onClick={submitIssue}>{busy === "creating" ? "Submitting report…" : "Submit this report"}</Button>
            </Card>}
          </section>
        )}
      </div>
    </div>
  );
}
