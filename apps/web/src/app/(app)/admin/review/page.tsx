"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Field,
  Select,
  StatusBadge,
  Textarea
} from "@/components/ui/primitives";
import { ProblemDetailView } from "@/components/problems/problem-detail-view";
import { apiRequest, ApiError } from "@/lib/api/client";
import type { Paginated, ProblemDetail } from "@/lib/types";

interface QueueItem {
  id: string;
  publicId: string;
  title: string;
  status: string;
  district: string | null;
  category: string | null;
  priorityScore: number | null;
  aiStatus: string;
  aiConfidence: number | null;
  duplicateCount: number;
}

interface AdminProblem extends ProblemDetail {
  ai?: ProblemDetail["ai"] & {
    categoryGuess?: string | null;
    severityGuess?: string | null;
    requiredExpertise?: string[];
  };
  duplicates?: Array<{
    similarProblemId: string;
    similarityScore: number;
    reviewStatus: string;
  }>;
}

const SEVERITY = ["", "low", "medium", "high", "critical"];

export default function AdminReviewPage() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminProblem | null>(null);
  const [note, setNote] = useState("");
  const [severity, setSeverity] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadQueue = useCallback(async () => {
    const page = await apiRequest<Paginated<QueueItem>>("/admin/review-queue", {
      query: { pageSize: 50 }
    });
    setQueue(page.data);
  }, []);

  useEffect(() => {
    loadQueue().catch(() => undefined);
  }, [loadQueue]);

  const loadDetail = useCallback(async (publicId: string) => {
    setSelected(publicId);
    setDetail(null);
    setError(null);
    setNote("");
    setSeverity("");
    const problem = await apiRequest<AdminProblem>(`/problems/${publicId}`);
    setDetail(problem);
  }, []);

  async function act(
    path: string,
    body: Record<string, unknown>,
    method: "POST" | "PATCH" = "POST"
  ) {
    if (!selected) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await apiRequest<AdminProblem>(path, { method, body });
      setDetail(updated);
      await loadQueue();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Action failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <div className="grid gap-2">
        <h1 className="text-lg font-black">Review queue ({queue.length})</h1>
        {queue.map((item) => (
          <button
            className={`rounded-lg border px-3 py-2 text-left text-sm ${
              selected === item.publicId
                ? "border-[var(--accent)] bg-[var(--panel-soft)]"
                : "border-[var(--border)] hover:bg-[var(--panel-soft)]"
            }`}
            key={item.id}
            onClick={() => loadDetail(item.publicId)}
            type="button"
          >
            <p className="font-semibold">{item.title}</p>
            <p className="text-xs text-[var(--muted)]">
              {item.publicId} - {item.category ?? "?"}
              {item.duplicateCount > 0
                ? ` - ${item.duplicateCount} similar`
                : ""}
              {item.priorityScore != null
                ? ` - priority ${item.priorityScore}`
                : ""}
            </p>
          </button>
        ))}
        {queue.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">Queue is clear.</p>
        ) : null}
      </div>

      <div className="grid gap-4">
        {!selected ? (
          <p className="text-sm text-[var(--muted)]">
            Select a report to review.
          </p>
        ) : !detail ? (
          <p className="text-sm text-[var(--muted)]">Loading...</p>
        ) : (
          <>
            {error ? <Alert tone="error">{error}</Alert> : null}
            <Card>
              <h2 className="font-bold">Decision</h2>
              <div className="mt-3 grid gap-3">
                <Field label="Note to citizen / internal note">
                  <Textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </Field>
                <Field label="Severity override">
                  <Select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                  >
                    {SEVERITY.map((value) => (
                      <option key={value} value={value}>
                        {value || "No change"}
                      </option>
                    ))}
                  </Select>
                </Field>
                <div className="flex flex-wrap gap-2">
                  <Button
                    disabled={busy}
                    onClick={() =>
                      act(`/admin/problems/${selected}/review`, {
                        decision: "verify",
                        note: note || undefined,
                        severity: severity || undefined
                      })
                    }
                  >
                    Verify
                  </Button>
                  <Button
                    disabled={busy}
                    variant="ghost"
                    onClick={() =>
                      act(`/admin/problems/${selected}/review`, {
                        decision: "request_info",
                        note: note || undefined
                      })
                    }
                  >
                    Request info
                  </Button>
                  <Button
                    disabled={busy || !note}
                    variant="danger"
                    onClick={() =>
                      act(`/admin/problems/${selected}/review`, {
                        decision: "reject",
                        note
                      })
                    }
                  >
                    Reject
                  </Button>
                  <Button
                    disabled={busy}
                    variant="ghost"
                    onClick={() =>
                      act(`/admin/problems/${selected}/priority`, {}, "PATCH")
                    }
                  >
                    Recompute priority
                  </Button>
                </div>
                <p className="text-xs text-[var(--muted)]">
                  AI suggestions are advisory. Your decision and its reason are
                  written to the audit log.
                </p>
              </div>
            </Card>

            {detail.duplicates && detail.duplicates.length > 0 ? (
              <Card>
                <h2 className="font-bold">
                  Possible duplicates ({detail.duplicates.length})
                </h2>
                <ul className="mt-2 grid gap-1 text-sm">
                  {detail.duplicates.map((duplicate) => (
                    <li
                      className="flex justify-between"
                      key={duplicate.similarProblemId}
                    >
                      <span>{duplicate.similarProblemId}</span>
                      <span className="font-semibold">
                        {duplicate.similarityScore}% - {duplicate.reviewStatus}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            ) : null}

            <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
              <StatusBadge status={detail.status} /> current status
            </div>
            <ProblemDetailView problem={detail} />
          </>
        )}
      </div>
    </div>
  );
}
