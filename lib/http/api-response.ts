import { ZodError } from "zod";
import { IssueServiceError } from "@/lib/issues/types";

export function apiError(error: unknown): Response {
  if (error instanceof ZodError) {
    return Response.json({ error: "Please check the highlighted information.", code: "validation_error", details: error.flatten().fieldErrors }, { status: 400 });
  }
  if (error instanceof IssueServiceError) {
    const status = error.code === "not_found" ? 404 : 409;
    return Response.json({ error: error.message, code: error.code }, { status });
  }
  if (error instanceof Error && error.message.includes("not configured")) {
    return Response.json({ error: "The service is not configured yet. Please try again later.", code: "service_unavailable" }, { status: 503 });
  }
  // Avoid logging raw provider errors; they can contain SQL and request data.
  console.error("FixIt API request failed.");
  return Response.json({ error: "Something went wrong. Please try again.", code: "internal_error" }, { status: 500 });
}
